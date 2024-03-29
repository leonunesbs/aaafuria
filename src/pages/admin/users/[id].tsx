import {
  Avatar,
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
  FormErrorMessage,
  FormLabel,
  Heading,
  IconButton,
  InputGroup,
  InputLeftAddon,
  Link,
  Select,
  Skeleton,
  Stack,
  Switch,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
  VisuallyHiddenInput,
} from '@chakra-ui/react';

import { CustomInput } from '@/components/atoms';
import { Layout } from '@/components/templates';
import { formatCPF, formatPhone, validateCPF } from '@/libs/functions';
import prisma from '@/server/prisma';
import { trpc } from '@/utils/trpc';
import { Group, Profile, User } from '@prisma/client';
import axios from 'axios';
import { GetStaticPaths, GetStaticProps } from 'next';
import NextLink from 'next/link';
import { useEffect, useRef } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { MdAdd, MdClose } from 'react-icons/md';

type InputType = Omit<User & Profile, 'birth'> & { birth: string };

function User({ groups, id }: { id: string; groups: Group[] }) {
  const toast = useToast({ position: 'top' });
  const btnRef = useRef<HTMLButtonElement>(null);
  const drawer = useDisclosure();
  const {
    data: user,
    refetch,
    isLoading,
  } = trpc.admin.user.useQuery((id as string) || '');
  const refreshData = () => {
    refetch();
  };

  const addToGroup = trpc.group.addToGroup.useMutation({
    onSuccess: () => {
      refreshData();
      drawer.onClose();
    },
  });
  const removeFromGroup = trpc.group.removeFromGroup.useMutation({
    onSuccess: () => {
      refreshData();
    },
  });
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<InputType>();

  useEffect(() => {
    if (user) {
      reset({
        ...user,
        birth: user?.profile?.birth?.toISOString().split('T')[0] || '',
        editable: user?.profile?.editable,
        studyClass: user?.profile?.studyClass,
        registration: user?.profile?.registration,
        phone: user?.profile?.phone,
        cpf: user?.profile?.cpf,
        rg: user?.profile?.rg,
      });
    }
  }, [reset, user]);
  const updateUser = trpc.user.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Usuário atualizado',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      refreshData();
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
      id: user?.id as string,
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
          path: `media/users/${user?.id}`,
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
            id: user?.id as string,
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
  const handlePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearErrors('phone');
    const phone = e.target.value;
    setValue('phone', formatPhone(phone));
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
                <Skeleton rounded={'full'} isLoaded={!updateUser.isLoading}>
                  <Avatar
                    cursor="pointer"
                    size="2xl"
                    mb={6}
                    name={user?.name as string}
                    src={user?.image || undefined}
                    onClick={handleButtonClick}
                  />
                </Skeleton>
                <Skeleton isLoaded={!isLoading}>
                  <Heading size="md" textAlign={'center'}>
                    {user?.name || 'Carregando...'}
                  </Heading>
                </Skeleton>
              </Center>

              <Stack spacing={4}>
                <FormControl isDisabled size="sm">
                  <FormLabel>Email</FormLabel>
                  <Skeleton isLoaded={!isLoading}>
                    <CustomInput {...register('email')} />
                  </Skeleton>
                </FormControl>
                <FormControl>
                  <FormLabel>Nome</FormLabel>
                  <Skeleton isLoaded={!isLoading}>
                    <CustomInput {...register('name')} />
                  </Skeleton>
                </FormControl>
                <FormControl>
                  <FormLabel>Data de nascimento</FormLabel>
                  <Skeleton isLoaded={!isLoading}>
                    <CustomInput type={'date'} {...register('birth')} />
                  </Skeleton>
                </FormControl>
                <FormControl>
                  <FormLabel>Matrícula</FormLabel>
                  <Skeleton isLoaded={!isLoading}>
                    <CustomInput {...register('registration')} type="number" />
                  </Skeleton>
                </FormControl>
                <FormControl>
                  <FormLabel>Turma</FormLabel>
                  <Skeleton isLoaded={!isLoading}>
                    <InputGroup>
                      <InputLeftAddon>MED:</InputLeftAddon>
                      <CustomInput
                        type={'number'}
                        min={10}
                        max={99}
                        {...register('studyClass')}
                      />
                    </InputGroup>
                  </Skeleton>
                </FormControl>
                <FormControl>
                  <FormLabel>Telefone</FormLabel>
                  <Skeleton isLoaded={!isLoading}>
                    <CustomInput
                      type={'tel'}
                      {...register('phone', { onChange: handlePhone })}
                    />
                  </Skeleton>
                </FormControl>
                <FormControl isInvalid={!!errors.cpf}>
                  <FormLabel>CPF</FormLabel>
                  <Skeleton isLoaded={!isLoading}>
                    <CustomInput
                      {...register('cpf', {
                        onChange: handleCPF,
                      })}
                    />
                  </Skeleton>
                  <FormErrorMessage>
                    {errors.cpf && errors.cpf.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel>RG</FormLabel>
                  <Skeleton isLoaded={!isLoading}>
                    <CustomInput {...register('rg')} />
                  </Skeleton>
                </FormControl>
                <Stack w="full" align={'center'}>
                  <FormLabel>Edição pelo usuário</FormLabel>
                  <Skeleton isLoaded={!isLoading}>
                    <Switch
                      size="lg"
                      colorScheme={'green'}
                      defaultChecked={user?.profile?.editable}
                      onChange={(e) => {
                        updateUser.mutate({
                          id: user?.id as string,
                          editable: e.target.checked,
                        });
                      }}
                    />
                  </Skeleton>
                </Stack>
              </Stack>
              <TableContainer>
                <Skeleton isLoaded={!removeFromGroup.isLoading}>
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
                      {user?.groups.map((group) => (
                        <Tr key={group.id}>
                          <Td>
                            <Link
                              as={NextLink}
                              href={`/admin/groups/${group.id}`}
                            >
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
                                  usersId: [user?.id],
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
                        onClose={drawer.onClose}
                        finalFocusRef={btnRef}
                      >
                        <DrawerOverlay />
                        <DrawerContent>
                          <DrawerCloseButton />
                          <DrawerHeader>Adicionar ao grupo</DrawerHeader>

                          <DrawerBody>
                            <Select
                              placeholder="Selecione uma opção..."
                              onChange={(e) => {
                                addToGroup.mutate({
                                  usersId: [user?.id as string],
                                  groupId: e.target.value,
                                });
                              }}
                            >
                              {groups?.map((group) => (
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
                            <Button
                              colorScheme="green"
                              onClick={drawer.onClose}
                              isLoading={addToGroup.isLoading}
                            >
                              Alterar
                            </Button>
                          </DrawerFooter>
                        </DrawerContent>
                      </Drawer>
                    </TableCaption>
                  </Table>
                </Skeleton>
              </TableContainer>
            </Stack>
          </CardBody>
          <CardFooter>
            <Stack w="full">
              <Button
                colorScheme={'green'}
                type="submit"
                isLoading={updateUser.isLoading}
                loadingText="Salvando"
              >
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

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const id = ctx.params?.id;
  const groups = await prisma.group.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  return {
    props: {
      groups,
      id,
    },
    revalidate: 60,
  };
};

export default User;
