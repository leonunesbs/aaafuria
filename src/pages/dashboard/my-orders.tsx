import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Link,
  List,
  ListItem,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { Item, Order, OrderItem, Payment } from '@prisma/client';

import { GetServerSideProps } from 'next';
import { Layout } from '@/components/templates';
import NextLink from 'next/link';
import { authOptions } from '../api/auth/[...nextauth]';
import { formatPrice } from '@/components/atoms';
import { prisma } from '@/server/prisma';
import { unstable_getServerSession } from 'next-auth';

type OrderItemWithItem = OrderItem & {
  item: Item & {
    parent?: Item;
  };
};

type OrderWithPaymentAndItems = Order & {
  payment: Payment;
  items: OrderItemWithItem[];
};

export const status = (order: OrderWithPaymentAndItems) => {
  if (order.payment.canceled) {
    return 'CANCELADO';
  }
  if (order.payment.paid) {
    return 'PAGO';
  }
  if (order.payment.expired) {
    return 'EXPIRADO';
  }
  return 'AGUARDANDO PAGAMENTO';
};

function MyOrders({ orders }: { orders: OrderWithPaymentAndItems[] }) {
  return (
    <Layout title="Meus pedidos">
      <Card variant={'responsive'}>
        <CardHeader>
          <Heading as="h1" size="md">
            Meus pedidos
          </Heading>
        </CardHeader>
        <CardBody>
          <TableContainer>
            <Table>
              <Thead>
                <Tr>
                  <Th>
                    <Text>Pagamento</Text>
                  </Th>
                  <Th>
                    <Text>Status</Text>
                  </Th>
                  <Th>
                    <Text>Total</Text>
                  </Th>
                  <Th>
                    <Text>Data</Text>
                  </Th>
                  <Th>
                    <Text>Items</Text>
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {orders.map((order) => (
                  <Tr key={order.id}>
                    <Td>
                      <Link
                        as={NextLink}
                        href={`/payments/${order.paymentId}`}
                        color="green.500"
                        fontWeight={'bold'}
                      >
                        <Text
                          maxW={28}
                          whiteSpace="nowrap"
                          overflow={'hidden'}
                          textOverflow={'ellipsis'}
                        >
                          {order.paymentId}
                        </Text>
                      </Link>
                    </Td>
                    <Td>
                      <Badge>{status(order)}</Badge>
                    </Td>
                    <Td>
                      <Text>{formatPrice(order.payment?.amount)}</Text>
                    </Td>
                    <Td>
                      <Text>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Text>
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
                  </Tr>
                ))}
                {!orders.length && (
                  <Tr>
                    <Td colSpan={5} textAlign="center">
                      <Text as={'i'}>
                        Nenhum pedido encontrado, ir para a{' '}
                        <Link href="/store" as={NextLink}>
                          <Text as="span" color="green.500" fontWeight={'bold'}>
                            loja
                          </Text>
                        </Link>
                        .
                      </Text>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions,
  );
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const orders = await prisma.order.findMany({
    where: {
      user: {
        email: session?.user?.email,
      },
    },
    include: {
      payment: true,
      items: {
        include: {
          item: {
            include: {
              parent: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const filteredOrders = orders.filter((order) => order.checkedOut);

  return {
    props: {
      orders: JSON.parse(JSON.stringify(filteredOrders)),
    },
  };
};

export default MyOrders;
