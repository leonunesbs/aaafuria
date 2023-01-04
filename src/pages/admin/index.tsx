import { Box, Card, Heading, Icon, Stack, Text } from '@chakra-ui/react';
import {
  MdCardMembership,
  MdShoppingCart,
  MdSportsHandball,
} from 'react-icons/md';

import { BsBoxSeam } from 'react-icons/bs';
import { FaUsers } from 'react-icons/fa';
import { GetServerSideProps } from 'next';
import { Layout } from '@/components/templates';
import NextLink from 'next/link';
import { authOptions } from '../api/auth/[...nextauth]';
import { getToken } from 'next-auth/jwt';

function AdminDashboard() {
  const items = [
    {
      title: 'Associações',
      description: 'Gerenciar planos de associação e usuários associados',
      icon: MdCardMembership,
      href: '/admin/memberships',
    },
    {
      title: 'Grupos',
      description: 'Gerenciar grupos de usuários',
      icon: MdSportsHandball,
      href: '/admin/groups',
    },
    {
      title: 'Pedidos',
      description: 'Gerenciar pedidos realizados na loja',
      icon: MdShoppingCart,
      href: '/admin/orders',
    },
    {
      title: 'Produtos',
      description: 'Gerenciar produtos do estoque da loja',
      icon: BsBoxSeam,
      href: '/admin/items',
    },
    {
      title: 'Usuários',
      description: 'Gerenciar informações de usuários',
      icon: FaUsers,
      href: '/admin/users',
    },
  ];
  return (
    <Layout title="Área do Diretor" staffCheck>
      <Box maxW="xl" mx="auto">
        <Heading as="h1" size="md" mb={8}>
          Área do Diretor
        </Heading>

        <Stack spacing={8} shouldWrapChildren>
          {items.map((item) => (
            <Card
              key={item.title}
              as={NextLink}
              href={item.href}
              p={4}
              align="center"
              textAlign={'center'}
            >
              <Icon as={item.icon} w={6} h={6} mb={4} />
              <Text fontSize="lg" fontWeight="bold">
                {item.title}
              </Text>
              <Text fontSize="md">{item.description}</Text>
            </Card>
          ))}
        </Stack>
      </Box>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const users = await getToken({
    req: ctx.req,
    secret: authOptions.secret,
  });
  if (!users) {
    return {
      redirect: {
        destination: `/auth/login?callbackUrl=${ctx.resolvedUrl}`,
        permanent: false,
      },
    };
  }
  return { props: {} };
};

export default AdminDashboard;
