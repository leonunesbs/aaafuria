import { Layout } from '@/components/templates';
import { ColorContext } from '@/contexts';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/server/prisma';
import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  Link,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { Group, Profile, User } from '@prisma/client';
import { GetServerSideProps } from 'next';
import { getToken } from 'next-auth/jwt';
import NextLink from 'next/link';
import { useContext } from 'react';

type UserWithProfile = User & {
  profile?: Profile;
};

function Group({ group }: { group: Group & { users: UserWithProfile[] } }) {
  const { green } = useContext(ColorContext);
  return (
    <Layout title={group.name} staffCheck>
      <Card>
        <CardHeader>
          <Heading size="md">{group.name}</Heading>
        </CardHeader>
        <CardBody>
          <TableContainer>
            <Table>
              <Thead>
                <Tr>
                  <Th>Nome</Th>
                  <Th>Turma</Th>
                  <Th>Matrícula</Th>
                </Tr>
              </Thead>
              <Tbody>
                {group.users.map((user) => (
                  <Tr key={user.id}>
                    <Td>
                      <Link
                        as={NextLink}
                        href={`/admin/users/${user.id}`}
                        color={green}
                      >
                        {user.name}
                      </Link>
                    </Td>
                    <Td>{user.profile?.studyClass}</Td>
                    <Td>{user.profile?.registration}</Td>
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
  const user = await getToken({
    req: ctx.req,
    secret: authOptions.secret,
  });
  if (!user) {
    return {
      redirect: {
        destination: `/auth/login?callbackUrl${ctx.resolvedUrl}}`,
        permanent: false,
      },
    };
  }
  const group = await prisma.group.findUniqueOrThrow({
    where: {
      id: ctx.query.id as string,
    },
    include: {
      users: {
        include: {
          profile: true,
        },
      },
    },
  });
  return {
    props: {
      group: JSON.parse(JSON.stringify(group)),
    },
  };
};

export default Group;
