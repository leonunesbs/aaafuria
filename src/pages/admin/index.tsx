import { Box, Card, Heading, Icon, Stack, Text } from '@chakra-ui/react';

import { BsBoxSeam } from 'react-icons/bs';
import { FaUsers } from 'react-icons/fa';
import { Layout } from '@/components/templates';
import { MdShoppingCart } from 'react-icons/md';
import NextLink from 'next/link';

function AdminDashboard() {
  const items = [
    {
      title: 'Pedidos',
      description: 'Ver e editar pedidos realizados na loja',
      icon: MdShoppingCart,
      href: '/admin/orders',
    },
    {
      title: 'Produtos',
      description: 'Adicionar, editar e remover produtos do estoque da loja',
      icon: BsBoxSeam,
      href: '/admin/items',
    },
    {
      title: 'Usuários',
      description: 'Ver e editar informações de usuários',
      icon: FaUsers,
      href: '/admin/users',
    },
  ];
  return (
    <Layout>
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

export default AdminDashboard;
