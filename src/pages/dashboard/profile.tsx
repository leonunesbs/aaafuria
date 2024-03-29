import { CustomInput } from '@/components/atoms';
import { Layout } from '@/components/templates';
import { ColorContext } from '@/contexts';
import { formatCPF, validateCPF } from '@/libs/functions';
import prisma from '@/server/prisma';
import { trpc } from '@/utils/trpc';
import {
  Alert,
  AlertIcon,
  Avatar,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Center,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Skeleton,
  Stack,
  Text,
  useToast,
  VisuallyHiddenInput,
} from '@chakra-ui/react';
import { Profile, User } from '@prisma/client';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import { getToken } from 'next-auth/jwt';
import { useRouter } from 'next/router';
import { useContext, useRef } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { authOptions } from '../api/auth/[...nextauth]';

function Profile({ user }: { user: User & { profile?: Profile } }) {
  const toast = useToast({ position: 'top' });
  const router = useRouter();
  const { green } = useContext(ColorContext);
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: user.email,
      name: user.name,
      birth:
        user.profile?.birth &&
        new Date(user.profile?.birth as any).toISOString().split('T')[0],
      registration: user.profile?.registration,
      studyClass: user.profile?.studyClass,
      phone: user.profile?.phone,
      rg: user.profile?.rg,
      cpf: user.profile?.cpf,
    },
  });
  const updateUser = trpc.user.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Perfil atualizado',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.reload();
    },
  });
  const onSubmit: SubmitHandler<any> = (formValues) => {
    const { birth, ...rest } = formValues;
    updateUser.mutate({
      id: user.id,
      birth: new Date(birth),
      ...rest,
    });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleButtonClick = () => {
    if (!user.profile?.editable) return;
    fileInputRef.current?.click();
  };

  const getSignedUrl = trpc.s3.getSignedUrl.useMutation();
  const handleOnFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await getSignedUrl
        .mutateAsync({
          name: file.name,
          type: file.type,
          path: `media/users/${user.id}`,
          size: file.size,
        })
        .then(async (data) => {
          const url = data.url;
          await axios.put(url, file, {
            headers: {
              'Content-Type': file.type,
              'Access-Control-Allow-Origin': '*',
              'Content-Disposition': 'inline',
            },
          });
          updateUser.mutate({
            id: user.id,
            image: url.split('?')[0],
          });
        });
    }
  };

  const handleCPF = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearErrors('cpf');
    const cpf = e.target.value;
    if (cpf.length >= 11) {
      setValue('cpf', formatCPF(cpf));
      if (!validateCPF(cpf)) {
        setError('cpf', { message: 'CPF inválido' });
      }
    }
  };

  return (
    <Layout
      title="Perfil"
      subHeader={
        !user.profile && (
          <Alert
            status="info"
            fontSize={'sm'}
            px={{ base: '4', md: '8', lg: '12' }}
          >
            <AlertIcon />
            <Text>
              Complete o seu perfil para acessar a todas as funcionalidades da
              plataforma
            </Text>
          </Alert>
        )
      }
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card variant={'responsive'} maxW="xl" mx="auto">
          <CardHeader>
            <Heading mb={4} size="md">
              Meu perfil
            </Heading>
            <Center flexDir={'column'}>
              <VisuallyHiddenInput
                type={'file'}
                ref={fileInputRef}
                onChange={handleOnFileChange}
              />
              <Skeleton isLoaded={!updateUser.isLoading}>
                <Avatar
                  cursor="pointer"
                  size="2xl"
                  mb={6}
                  name={user?.name as string}
                  src={user?.image || undefined}
                  onClick={handleButtonClick}
                />
              </Skeleton>
              <Heading size="md" textAlign={'center'}>
                {user.name}
              </Heading>
            </Center>
          </CardHeader>
          <CardBody>
            <Stack>
              {!user.profile?.editable && (
                <Text
                  textAlign={'center'}
                  fontSize="xs"
                  fontStyle="italic"
                  color={green}
                >
                  Edição desabilitada, entre em contato com um diretor para
                  habilitar a edição.
                </Text>
              )}
              <FormControl isRequired isDisabled={!user.profile?.editable}>
                <FormLabel>Email</FormLabel>
                <CustomInput isRequired isDisabled {...register('email')} />
              </FormControl>
              <FormControl isRequired isDisabled={!user.profile?.editable}>
                <FormLabel>Nome</FormLabel>
                <CustomInput isRequired {...register('name')} />
              </FormControl>
              <FormControl isRequired isDisabled={!user.profile?.editable}>
                <FormLabel>Data de nascimento</FormLabel>
                <CustomInput isRequired type={'date'} {...register('birth')} />
              </FormControl>
              <FormControl isRequired isDisabled={!user.profile?.editable}>
                <FormLabel>Matrícula</FormLabel>
                <CustomInput isRequired {...register('registration')} />
              </FormControl>
              <FormControl isRequired isDisabled={!user.profile?.editable}>
                <FormLabel>Turma</FormLabel>
                <CustomInput isRequired {...register('studyClass')} />
              </FormControl>
              <FormControl isRequired isDisabled={!user.profile?.editable}>
                <FormLabel>Telefone</FormLabel>
                <CustomInput isRequired {...register('phone')} />
              </FormControl>
              <FormControl isRequired isDisabled={!user.profile?.editable}>
                <FormLabel>RG</FormLabel>
                <CustomInput isRequired {...register('rg')} />
              </FormControl>
              <FormControl
                isRequired
                isDisabled={!user.profile?.editable}
                isInvalid={!!errors.cpf}
              >
                <FormLabel>CPF</FormLabel>
                <CustomInput
                  isRequired
                  {...register('cpf', { onChange: handleCPF })}
                />
                <FormErrorMessage>
                  {errors.cpf && errors.cpf.message}
                </FormErrorMessage>
              </FormControl>
            </Stack>
          </CardBody>
          <CardFooter>
            <Stack w="full">
              <Button type="submit" colorScheme={'green'}>
                Salvar
              </Button>
            </Stack>
          </CardFooter>
        </Card>
      </form>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const sessionUser = await getToken({
    req: ctx.req,
    secret: authOptions.secret,
  });
  if (!sessionUser) {
    return {
      redirect: {
        destination: `/auth/login?after=${ctx.resolvedUrl}`,
        permanent: false,
      },
    };
  }
  const user = await prisma.user.findUnique({
    where: {
      email: sessionUser.email as string,
    },
    include: {
      profile: true,
    },
  });

  return {
    props: {
      user: JSON.parse(JSON.stringify(user)),
    },
  };
};

export default Profile;
