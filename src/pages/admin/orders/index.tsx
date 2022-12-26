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
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { CustomInput, formatPrice } from '@/components/atoms';
import { Item, Order, OrderItem, Payment, User } from '@prisma/client';
import { useContext, useState } from 'react';

import { ColorContext } from '@/contexts';
import { GetServerSideProps } from 'next';
import { Layout } from '@/components/templates';
import NextLink from 'next/link';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/server/prisma';
import { unstable_getServerSession } from 'next-auth';

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
}: {
  orders: OrderWithUserPaymentAndItems[];
}) {
  const { green } = useContext(ColorContext);

  const orders = initalOrders.map((order) => {
    const total = order.items.reduce((acc, item) => {
      return acc + item.price * item.quantity;
    }, 0);

    const status = order.payment.canceled
      ? 'CANCELADO'
      : order.payment.paid
      ? 'PAGO'
      : order.payment.expired
      ? 'EXPIRADO'
      : order.payment.attachment
      ? 'AGUARDANDO CONFIRMAÇÃO'
      : 'AGUARDANDO PAGAMENTO';

    return {
      ...order,
      total,
      status,
    };
  });

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

  const handleExportFilteredData = () => {
    const data = filteredOrders.map((order) => {
      const items = order.items.map((item) => {
        return `${item.item.name} (${item.quantity}x)`;
      });

      return {
        id: order.id,
        usuario: order.user.name,
        itens: items.join(', '),
        valor: formatPrice(order.total),
        status: order.status,
      };
    });

    const csv = data
      .map((row) => {
        return Object.values(row).join(';');
      })
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'pedidos.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Layout title="Gerenciar pedidos">
      <Card>
        <CardHeader>
          <Heading size="md">Pedidos</Heading>
        </CardHeader>
        <CardBody>
          <Stack>
            <HStack>
              <CustomInput
                placeholder="Buscar pedido (ID, usuário, itens, valor, status)"
                onChange={(e) => setQ(e.target.value)}
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
                      <Text>ID</Text>
                    </Th>
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
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredOrders.map((order) => (
                    <Tr key={order.id}>
                      <Td>
                        <Text
                          maxW={24}
                          whiteSpace="nowrap"
                          overflow={'hidden'}
                          textOverflow={'ellipsis'}
                        >
                          {order.id}
                        </Text>
                      </Td>
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
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Stack>
        </CardBody>
        <CardFooter>
          <Button onClick={handleExportFilteredData}>Exportar</Button>
        </CardFooter>
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
  });

  return {
    props: {
      session,
      orders: JSON.parse(JSON.stringify(orders)),
    },
  };
};

export default Orders;
