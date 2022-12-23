import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  HStack,
  Heading,
  Input,
  Link,
  List,
  ListItem,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { Group, Membership, Profile, User } from '@prisma/client';
import { SubmitHandler, useForm } from 'react-hook-form';

import { GetServerSideProps } from 'next';
import { Layout } from '@/components/templates';
import NextLink from 'next/link';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/server/prisma';
import { unstable_getServerSession } from 'next-auth';
import { useRouter } from 'next/router';

type UserWithProfileMembershipsAndGroups = User & {
  profile: Profile;
  memberships: Membership[];
  groups: Group[];
};

function Users({ users }: { users: UserWithProfileMembershipsAndGroups[] }) {
  const router = useRouter();
  const { handleSubmit, register } = useForm<{ q: string }>();
  const onSubmit: SubmitHandler<{ q: string }> = (data) => {
    router.replace(`/admin/users?q=${data.q}`);
  };
  return (
    <Layout title="Lista de usuários">
      <Card variant={'responsive'}>
        <CardHeader>
          <Heading as="h1" size="md">
            Lista de Usuários
          </Heading>
        </CardHeader>
        <CardBody>
          <Box mb={4}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <HStack>
                <FormControl>
                  <Input
                    placeholder="Buscar usuário (nome, rg, cpf, email, turma, telefone etc.)"
                    {...register('q')}
                  />
                </FormControl>
                <Button colorScheme="green" type="submit">
                  Buscar
                </Button>
              </HStack>
            </form>
          </Box>
          <TableContainer>
            <Table>
              <Thead>
                <Tr>
                  <Th>Nome</Th>
                  <Th>Email</Th>
                  <Th>Turma</Th>
                  <Th>Telefone</Th>
                  <Th>RG</Th>
                  <Th>CPF</Th>
                  <Th>Associações</Th>
                  <Th>Grupos</Th>
                </Tr>
              </Thead>
              <Tbody>
                {users.map((user) => (
                  <Tr key={user.id}>
                    <Td>
                      <Link
                        as={NextLink}
                        href={`/admin/users/${user.id}`}
                        color="green.500"
                        fontWeight={'semibold'}
                      >
                        {user.name}
                      </Link>
                    </Td>
                    <Td>{user.email}</Td>
                    <Td>{user.profile?.studyClass}</Td>
                    <Td>{user.profile?.phone}</Td>
                    <Td>{user.profile?.rg}</Td>
                    <Td>{user.profile?.cpf}</Td>
                    <Td>
                      <List>
                        {user.memberships.map((membership) => (
                          <ListItem key={membership.id}>
                            {membership.id}
                          </ListItem>
                        ))}
                      </List>
                    </Td>
                    <Td>
                      <List>
                        {user.groups.map((group) => (
                          <ListItem key={group.id}>{group.name}</ListItem>
                        ))}
                      </List>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>
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
        destination: `/auth/login?callbackUrl=${ctx.resolvedUrl}`,
        permanent: false,
      },
    };
  }

  const { q } = ctx.query;

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q as string } },
            { email: { contains: q as string } },
            {
              profile: {
                OR: [
                  { cpf: { contains: q as string } },
                  { rg: { contains: q as string } },
                  { phone: { contains: q as string } },
                  { studyClass: { contains: q as string } },
                ],
              },
            },
          ],
        }
      : undefined,
    include: {
      memberships: true,
      groups: true,
      profile: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return { props: { session, users: JSON.parse(JSON.stringify(users)) } };
};

export default Users;
