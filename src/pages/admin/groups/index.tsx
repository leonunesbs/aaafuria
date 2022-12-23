import {
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormHelperText,
  Heading,
  Link,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { ColorContext } from '@/contexts';
import { CustomInput } from '@/components/atoms';
import { GetServerSideProps } from 'next';
import { Group } from '@prisma/client';
import { Layout } from '@/components/templates';
import NextLink from 'next/link';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { cleanString } from '@/libs/functions';
import { prisma } from '@/server/prisma';
import { trpc } from '@/utils/trpc';
import { unstable_getServerSession } from 'next-auth';
import { useContext } from 'react';
import { useRouter } from 'next/router';

function Groups({ groups }: { groups: Group[] }) {
  const router = useRouter();
  const toast = useToast();
  const { green } = useContext(ColorContext);
  const { handleSubmit, register, reset } = useForm<Group>();
  const createGroup = trpc.group.create.useMutation({
    onSuccess: () => {
      reset();
      router.replace(router.asPath);
    },
  });
  const onSubmit: SubmitHandler<Group> = (data) => {
    data.name = cleanString(data.name);
    data.type = cleanString(data.type);
    createGroup.mutate({ ...data });
  };

  const deleteGroup = trpc.group.delete.useMutation({
    onSuccess: () => {
      reset();
      router.replace(router.asPath);
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir grupo',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });
  return (
    <Layout title="Lista de grupos">
      <Stack spacing={6}>
        <Card>
          <CardHeader>
            <Heading as="h1" size="md">
              Lista de grupos
            </Heading>
          </CardHeader>
          <CardBody>
            <TableContainer>
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Nome</Th>
                    <Th />
                  </Tr>
                </Thead>

                <Tbody>
                  {groups.map((group) => (
                    <Tr key={group.id}>
                      <Td>
                        <Link
                          as={NextLink}
                          href={`/admin/groups/${group.id}`}
                          color={green}
                          fontWeight={'semibold'}
                        >
                          {group.name}
                        </Link>
                      </Td>
                      <Td isNumeric>
                        <Button
                          size={'sm'}
                          colorScheme="red"
                          onClick={() => deleteGroup.mutate(group.id)}
                        >
                          Excluir
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>
        <Card alignSelf="center" w="full" maxW="md" mx="auto">
          <CardHeader>
            <Heading size="md">Adicionar grupo</Heading>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack>
                <CustomInput
                  isRequired
                  placeholder="Nome do grupo"
                  {...register('name')}
                />
                <FormControl>
                  <CustomInput
                    isRequired
                    placeholder="Tipo do grupo"
                    {...register('type')}
                  />
                  <FormHelperText>
                    Ex.: Administrativo, Esportes, Bateria
                  </FormHelperText>
                </FormControl>
                <Button type="submit">Adicionar</Button>
              </Stack>
            </form>
          </CardBody>
        </Card>
      </Stack>
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
        destination: `/auth/login?callbackUrl${ctx.resolvedUrl}}`,
        permanent: false,
      },
    };
  }
  const groups = await prisma.group.findMany({
    orderBy: {
      name: 'asc',
    },
  });
  return {
    props: {
      groups,
    },
  };
};

export default Groups;
