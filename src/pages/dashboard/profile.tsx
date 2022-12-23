import { CustomAvatar } from '@/components/atoms';
import { Layout } from '@/components/templates';
import { prisma } from '@/server/prisma';
import { trpc } from '@/utils/trpc';
import {
  Alert,
  AlertIcon,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Center,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { Profile, User } from '@prisma/client';
import { GetServerSideProps } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { useRouter } from 'next/router';
import { SubmitHandler, useForm } from 'react-hook-form';
import { authOptions } from '../api/auth/[...nextauth]';

function Profile({ user }: { user: User & { profile?: Profile } }) {
  const toast = useToast();
  const router = useRouter();
  const { register, handleSubmit } = useForm({
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
      router.replace(router.asPath);
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
            <Center>
              <Stack spacing={4}>
                <CustomAvatar size="2xl" />
                <Heading size="sm" textAlign={'center'}>
                  {user.name}
                </Heading>
              </Stack>
            </Center>
          </CardHeader>
          <CardBody>
            <Stack>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input isRequired isDisabled {...register('email')} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Nome</FormLabel>
                <Input isRequired {...register('name')} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Data de nascimento</FormLabel>
                <Input isRequired type={'date'} {...register('birth')} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Matrícula</FormLabel>
                <Input isRequired {...register('registration')} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Turma</FormLabel>
                <Input isRequired {...register('studyClass')} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Telefone</FormLabel>
                <Input isRequired {...register('phone')} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>RG</FormLabel>
                <Input isRequired {...register('rg')} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>CPF</FormLabel>
                <Input isRequired {...register('cpf')} />
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
  const session = await unstable_getServerSession(
    ctx.req,
    ctx.res,
    authOptions,
  );
  if (!session) {
    return {
      redirect: {
        destination: `/auth/login?after=${ctx.resolvedUrl}`,
        permanent: false,
      },
    };
  }
  const user = await prisma.user.findUnique({
    where: {
      email: session.user?.email as string,
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
