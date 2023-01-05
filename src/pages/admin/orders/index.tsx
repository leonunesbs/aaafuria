import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  HStack,
  Heading,
  Link,
  List,
  ListItem,
  Stack,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { CustomInput, Pagination, formatPrice } from '@/components/atoms';
import { Item, Order, OrderItem, Payment, User } from '@prisma/client';
import { useContext, useState } from 'react';

import { ColorContext } from '@/contexts';
import { GetServerSideProps } from 'next';
import { Layout } from '@/components/templates';
import NextLink from 'next/link';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getToken } from 'next-auth/jwt';
import { paymentStatus } from '@/pages/dashboard/orders';
import { prisma } from '@/server/prisma';
import { useRouter } from 'next/router';

type OrderItemWithItem = OrderItem & {
  item: Item & {
    parent: Item;
  };
};

type OrderWithUserPaymentAndItems = Order & {
  user: User;
  payment: Payment;
  items: OrderItemWithItem[];
};

function Orders({
  orders: initalOrders,
  page,
  totalPages,
}: {
  orders: OrderWithUserPaymentAndItems[];
  page: number;
  totalPages: number;
}) {
  const { green } = useContext(ColorContext);

  const orders = initalOrders.map((order) => {
    const total = order.items.reduce((acc, item) => {
      return acc + item.price * item.quantity;
    }, 0);

    const status = paymentStatus(order.payment);

    return {
      ...order,
      total,
      status,
    };
  });
  const router = useRouter();
  const [q, setQ] = useState<string>();
  const filteredOrders = orders.filter((order) => {
    if (!q) {
      return order;
    }

    const query = (q as string).toLowerCase();

    if (
      order.id.toString().includes(query) ||
      order.user.name?.toLowerCase().includes(query) ||
      order.items
        .map((item) => item.item.name.toLowerCase())
        .join(' ')
        .includes(query) ||
      order.total.toString().includes(query) ||
      order.status.toLowerCase().includes(query)
    ) {
      return order;
    }
  });

  return (
    <Layout
      title="Gerenciar pedidos"
      headerProps={{
        sx: {
          '@media print': {
            display: 'none',
          },
        },
      }}
      footerProps={{
        sx: {
          '@media print': {
            display: 'none',
          },
        },
      }}
    >
      <Card>
        <CardHeader>
          <Heading size="md">Pedidos</Heading>
        </CardHeader>
        <CardBody>
          <Stack>
            <HStack
              sx={{
                '@media print': {
                  display: 'none',
                },
              }}
            >
              <CustomInput
                placeholder="Buscar pedido (ID, usuário, itens, valor, status)"
                onChange={(e) => {
                  if (e.target.value === '') {
                    setQ(undefined);
                  }

                  if (e.target.value.length === 0) {
                    router.replace({
                      query: {},
                    });
                    setQ(undefined);
                  } else {
                    router.replace({
                      query: {
                        full: true,
                      },
                    });
                    setQ(e.target.value);
                  }
                }}
              />
              <HStack>
                <Button colorScheme="green">Buscar</Button>
              </HStack>
            </HStack>

            <TableContainer>
              <Table>
                <Thead>
                  <Tr>
                    <Th>
                      <Text>Usuário</Text>
                    </Th>
                    <Th>
                      <Text>Itens</Text>
                    </Th>
                    <Th>
                      <Text>Valor</Text>
                    </Th>
                    <Th>
                      <Text>Status de pagamento</Text>
                    </Th>
                    <Th>
                      <Text>Data do pedido</Text>
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredOrders.map((order) => (
                    <Tr key={order.id}>
                      <Td>
                        <Text>{order.user.name}</Text>
                      </Td>
                      <Td>
                        <List>
                          {order.items.map((orderItem) => (
                            <ListItem key={orderItem.item.id}>
                              <Text as={'i'} fontSize="sm">
                                {orderItem.quantity}x
                              </Text>{' '}
                              <Link
                                href={`/store/${
                                  orderItem.item.parentId || orderItem.item.id
                                }`}
                              >
                                {orderItem.item.parentId
                                  ? `${orderItem.item.parent?.name} - ${orderItem.item.name}`
                                  : orderItem.item.name}
                              </Link>
                            </ListItem>
                          ))}
                        </List>
                      </Td>
                      <Td>
                        <Text>{formatPrice(order.total)}</Text>
                      </Td>
                      <Td>
                        <Link
                          as={NextLink}
                          href={`/payments/${order.paymentId}`}
                          color={green}
                        >
                          {order.status}
                        </Link>
                      </Td>
                      <Td>
                        <Text>
                          {new Date(order.createdAt).toLocaleString('pt-BR', {
                            timeZone: 'America/Sao_Paulo',
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </Text>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
                <TableCaption>
                  <Pagination
                    sx={{
                      '@media print': {
                        display: 'none',
                      },
                    }}
                    page={page}
                    totalPages={totalPages}
                  />
                </TableCaption>
              </Table>
            </TableContainer>
          </Stack>
        </CardBody>
        <CardFooter
          sx={{
            '@media print': {
              display: 'none',
            },
          }}
        >
          <HStack justify={'end'} w="full">
            <Button onClick={() => window.print()} colorScheme="green">
              Imprimir
            </Button>
            <Button onClick={() => router.push('/admin')}>
              Área do Diretor
            </Button>
          </HStack>
        </CardFooter>
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
        destination: `/auth/login?callbackUrl=${ctx.resolvedUrl}`,
        permanent: false,
      },
    };
  }

  const totalOrders = await prisma.order.count();
  const pageSize = ctx.query.full ? totalOrders : 20;
  const page = ctx.query.page ? Number(ctx.query.page) : 1;

  const orders = await prisma.order.findMany({
    where: {
      payment: {
        canceled: false,
      },
    },
    include: {
      user: true,
      items: {
        include: {
          item: {
            include: {
              parent: true,
            },
          },
        },
      },
      payment: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: pageSize,
    skip: (page - 1) * pageSize,
  });

  return {
    props: {
      orders: JSON.parse(JSON.stringify(orders)),
      page,
      totalPages: Math.ceil((await prisma.order.count()) / pageSize),
    },
  };
};

export default Orders;
