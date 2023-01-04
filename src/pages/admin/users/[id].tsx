import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Center,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Link,
  Select,
  Skeleton,
  Stack,
  Switch,
  Table,
  TableCaption,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
  VisuallyHiddenInput,
} from '@chakra-ui/react';

import { CustomAvatar, CustomInput } from '@/components/atoms';
import { Layout } from '@/components/templates';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/server/prisma';
import { trpc } from '@/utils/trpc';
import { Group, Membership, Profile, User } from '@prisma/client';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import { getToken } from 'next-auth/jwt';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useRef } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { MdAdd, MdClose } from 'react-icons/md';

type UserWithMembershipsGroupsAndProfile = User & {
  memberships: Membership[];
  groups: Group[];
  profile?: Omit<Profile, 'birth'> & { birth: string };
};

type InputType = Omit<User & Profile, 'birth'> & { birth: string };

function User({
  user,
  groups,
}: {
  user: UserWithMembershipsGroupsAndProfile;
  groups: Group[];
}) {
  const router = useRouter();
  const toast = useToast();
  const btnRef = useRef<HTMLButtonElement>(null);
  const drawer = useDisclosure();
  const addToGroup = trpc.group.addToGroup.useMutation({
    onSuccess: () => {
      router.replace(router.asPath, undefined, { scroll: false });
      drawer.onClose();
    },
  });
  const removeFromGroup = trpc.group.removeFromGroup.useMutation({
    onSuccess: () => {
      router.replace(router.asPath, undefined, { scroll: false });
    },
  });

  const { handleSubmit, register } = useForm<InputType>({
    defaultValues: {
      email: user.email,
      name: user.name,
      editable: user.profile?.editable,
      studyClass: user.profile?.studyClass,
      registration: user.profile?.registration,
      phone: user.profile?.phone,
      cpf: user.profile?.cpf,
      rg: user.profile?.rg,
    },
  });
  const updateUser = trpc.user.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Usuário atualizado',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      router.reload();
    },
  });
  const onSubmit: SubmitHandler<InputType> = ({
    editable,
    name,
    birth,
    registration,
    studyClass,
    phone,
    cpf,
    rg,
  }) => {
    updateUser.mutate({
      id: user.id,
      editable,
      name: name || '',
      birth: birth ? new Date(birth) : undefined,
      registration: registration || '',
      studyClass: studyClass || '',
      phone: phone || '',
      cpf: cpf || '',
      rg: rg || '',
    });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleButtonClick = () => {
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

  return (
    <Layout title="Editar usuário">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card variant={'responsive'} w="full" maxW="md" mx="auto">
          <CardHeader>
            <Heading size="md">Editar usuário</Heading>
          </CardHeader>
          <CardBody>
            <Stack spacing={6}>
              <Center flexDir={'column'}>
                <VisuallyHiddenInput
                  type={'file'}
                  ref={fileInputRef}
                  onChange={handleOnFileChange}
                />
                <Skeleton isLoaded={!updateUser.isLoading}>
                  <CustomAvatar
                    size="2xl"
                    mb={6}
                    onClick={handleButtonClick}
                    cursor="pointer"
                  />
                </Skeleton>
                <Heading size="md" textAlign={'center'}>
                  {user.name}
                </Heading>
              </Center>

              <Stack spacing={4}>
                <FormControl isDisabled>
                  <FormLabel>Email</FormLabel>
                  <CustomInput {...register('email')} />
                </FormControl>
                <FormControl>
                  <FormLabel>Nome</FormLabel>
                  <CustomInput {...register('name')} />
                </FormControl>
                <FormControl>
                  <FormLabel>Data de nascimento</FormLabel>
                  <CustomInput
                    type={'date'}
                    {...register('birth')}
                    defaultValue={
                      user.profile?.birth
                        ? new Date(user.profile?.birth as string)
                            ?.toISOString()
                            .slice(0, 10)
                        : ''
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Matrícula</FormLabel>
                  <CustomInput {...register('registration')} />
                </FormControl>
                <FormControl>
                  <FormLabel>Turma</FormLabel>
                  <CustomInput {...register('studyClass')} />
                </FormControl>
                <FormControl>
                  <FormLabel>Telefone</FormLabel>
                  <CustomInput type={'tel'} {...register('phone')} />
                </FormControl>
                <FormControl>
                  <FormLabel>CPF</FormLabel>
                  <CustomInput {...register('cpf')} />
                </FormControl>
                <FormControl>
                  <FormLabel>RG</FormLabel>
                  <CustomInput {...register('rg')} />
                </FormControl>
                <Stack w="full" align={'center'}>
                  <FormLabel>Edição pelo usuário</FormLabel>
                  <Switch
                    size="lg"
                    colorScheme={'green'}
                    onChange={(e) => {
                      updateUser.mutate({
                        id: user.id,
                        editable: e.target.checked,
                      });
                    }}
                  />
                </Stack>
              </Stack>
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>
                      <Link as={NextLink} href="/admin/groups">
                        Grupos
                      </Link>
                    </Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {user.groups.map((group) => (
                    <Tr key={group.id}>
                      <Td>
                        <Link as={NextLink} href={`/admin/groups/${group.id}`}>
                          {group.name}
                        </Link>
                      </Td>
                      <Td isNumeric>
                        <IconButton
                          aria-label="remove from group"
                          icon={<MdClose />}
                          variant="ghost"
                          onClick={() => {
                            removeFromGroup.mutate({
                              usersId: [user.id],
                              groupId: group.id,
                            });
                          }}
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
                <TableCaption mt={2}>
                  <Button
                    ref={btnRef}
                    onClick={drawer.onOpen}
                    variant={'link'}
                    leftIcon={<MdAdd />}
                    size="xs"
                  >
                    Novo grupo
                  </Button>
                  <Drawer
                    isOpen={drawer.isOpen}
                    placement="bottom"
                    onClose={drawer.onClose}
                    finalFocusRef={btnRef}
                  >
                    <DrawerOverlay />
                    <DrawerContent>
                      <DrawerCloseButton />
                      <DrawerHeader>Novo grupo</DrawerHeader>

                      <DrawerBody>
                        <Select
                          placeholder="Selecione uma opção..."
                          onChange={(e) => {
                            addToGroup.mutate({
                              usersId: [user.id],
                              groupId: e.target.value,
                            });
                          }}
                        >
                          {groups.map((group) => (
                            <option key={group.id} value={group.id}>
                              {`${group.name} (${group.type})`}
                            </option>
                          ))}
                        </Select>
                      </DrawerBody>
                      <DrawerFooter>
                        <Button mr={3} onClick={drawer.onClose}>
                          Cancelar
                        </Button>
                        <Button colorScheme="green" onClick={drawer.onClose}>
                          Alterar
                        </Button>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>
                </TableCaption>
              </Table>
            </Stack>
          </CardBody>
          <CardFooter>
            <Stack w="full">
              <Button colorScheme={'green'} type="submit">
                Salvar
              </Button>
              <Button as={NextLink} href="/admin">
                Painel do Diretor
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
        destination: `/auth/login?callbackUrl=${ctx.resolvedUrl}`,
        permanent: false,
      },
    };
  }

  const groups = await prisma.group.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  const user = await prisma.user.findUnique({
    where: {
      id: ctx.query.id as string,
    },
    include: {
      profile: true,
      memberships: {
        orderBy: {
          startDate: 'desc',
        },
        take: 3,
      },
      groups: {
        orderBy: {
          name: 'asc',
        },
      },
    },
  });

  return {
    props: {
      groups,
      user: JSON.parse(JSON.stringify(user)),
    },
  };
};

export default User;
