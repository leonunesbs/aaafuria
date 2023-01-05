import { Layout } from '@/components/templates';
import { ColorContext } from '@/contexts';
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
import { GetStaticProps } from 'next';
import NextLink from 'next/link';
import { useContext } from 'react';

type UserWithProfile = User & {
  profile?: Profile;
};

function Group({ group }: { group: Group & { users: UserWithProfile[] } }) {
  const { green } = useContext(ColorContext);
  return (
    <Layout title={group.name}>
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

export const getStaticPaths = async () => {
  const groups = await prisma.group.findMany();
  return {
    paths: groups.map((group) => ({
      params: {
        id: group.id,
      },
    })),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const group = await prisma.group.findUniqueOrThrow({
    where: {
      id: ctx.params?.id as string,
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
    revalidate: 10,
  };
};

export default Group;
