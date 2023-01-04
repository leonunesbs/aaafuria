import { Box, Flex, HStack, Heading, Link, Stack } from '@chakra-ui/react';
import { Item, Order, OrderItem } from '@prisma/client';

import { CartItem } from '@/components/molecules';
import { CartOrderSummary } from '@/components/organisms';
import { ColorContext } from '@/contexts';
import { GetServerSideProps } from 'next';
import { Layout } from '@/components/templates';
import NextLink from 'next/link';
import { authOptions } from '../api/auth/[...nextauth]';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/server/prisma';
import { useContext } from 'react';

type ItemWithFamily = Item & {
  parent: Item;
  childrens: Item[];
};
type OrderItemWithItem = OrderItem & {
  order: Order;
  item: ItemWithFamily;
};

function Cart({ orderItems }: { orderItems: OrderItemWithItem[] }) {
  const subTotal = orderItems?.reduce(
    (acc, orderItem) => acc + orderItem.item.price * orderItem.quantity,
    0,
  );
  const total = orderItems?.reduce(
    (acc, orderItem) => acc + orderItem.price,
    0,
  );
  const { green } = useContext(ColorContext);

  return (
    <Layout title="Meu carrinho">
      <Stack
        direction={{ base: 'column', lg: 'row' }}
        align={{ lg: 'flex-start' }}
        spacing={{ base: '8', md: '16' }}
        borderWidth="1px"
        rounded="lg"
        padding="6"
      >
        <Stack spacing={{ base: '8', md: '10' }} flex="2">
          <Heading fontSize="2xl" fontWeight="extrabold">
            Meu carrinho ({orderItems?.length} ite
            {orderItems && orderItems.length > 1 ? 'ns' : 'm'})
          </Heading>
          <Stack spacing="6">
            {orderItems?.map((orderItem) => (
              <CartItem
                key={orderItem.id}
                {...orderItem}
                order={{
                  ...orderItem.order,
                  createdAt: new Date(orderItem.order.createdAt),
                  updatedAt: new Date(orderItem.order.updatedAt),
                }}
              />
            ))}
            {orderItems && orderItems.length === 0 && (
              <Box textAlign="center">
                <p>Seu carrinho está vazio.</p>
                <Link as={NextLink} color={green} href="/store">
                  Ir para a Loja
                </Link>
              </Box>
            )}
          </Stack>
        </Stack>

        {orderItems && orderItems.length > 0 && (
          <Flex direction="column" align="center" flex="1">
            <CartOrderSummary
              orderId={orderItems[0].order.id}
              subTotal={subTotal || 0}
              total={total || 0}
            />
            <HStack mt="6" fontWeight="semibold">
              <p>ou</p>
              <Link as={NextLink} color={green} href="/store">
                continuar comprando
              </Link>
            </HStack>
          </Flex>
        )}
      </Stack>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const token = await getToken({
    req: ctx.req,
    secret: authOptions.secret,
  });

  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        user: {
          email: token?.email,
        },
      },
      ordered: false,
      checkedOut: false,
    },
    include: {
      item: {
        include: {
          parent: true,
          childrens: true,
        },
      },
      order: true,
    },
  });

  return {
    props: {
      orderItems: JSON.parse(JSON.stringify(orderItems)),
    },
  };
};

export default Cart;
