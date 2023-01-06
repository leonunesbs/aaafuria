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
import { CustomInput, Loading } from '@/components/atoms';
import { SubmitHandler, useForm } from 'react-hook-form';

import { ColorContext } from '@/contexts';
import { GetStaticProps } from 'next';
import { Group } from '@prisma/client';
import { Layout } from '@/components/templates';
import NextLink from 'next/link';
import { cleanString } from '@/libs/functions';
import { trpc } from '@/utils/trpc';
import { useContext } from 'react';
import { useRouter } from 'next/router';

function Groups() {
  const router = useRouter();
  const toast = useToast({ position: 'top' });
  const { green } = useContext(ColorContext);
  const { handleSubmit, register, reset } = useForm<Group>();

  const { data: groups, isLoading } = trpc.admin.groups.useQuery();
  const refreshData = () => {
    router.replace(router.asPath);
  };

  const createGroup = trpc.group.create.useMutation({
    onSuccess: () => {
      reset();
      refreshData();
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
      refreshData();
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
            {isLoading && <Loading />}
            <TableContainer>
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Nome</Th>
                    <Th />
                  </Tr>
                </Thead>

                <Tbody>
                  {groups?.map((group) => (
                    <Tr key={group.id}>
                      <Td>
                        <Link
                          as={NextLink}
                          href={`/admin/groups/${group.id}`}
                          color={green}
                          fontWeight={'semibold'}
                        >
                          {group.name} ({group.type})
                        </Link>
                      </Td>
                      <Td isNumeric>
                        <Button
                          size={'sm'}
                          colorScheme="red"
                          onClick={() => deleteGroup.mutate(group.id)}
                          isLoading={deleteGroup.isLoading}
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
                <Button type="submit" isLoading={createGroup.isLoading}>
                  Adicionar
                </Button>
              </Stack>
            </form>
          </CardBody>
        </Card>
      </Stack>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};

export default Groups;
