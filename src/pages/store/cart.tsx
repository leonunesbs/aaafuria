import {
  Box,
  Flex,
  HStack,
  Heading,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react';

import { CartItem } from '@/components/molecules';
import { CartOrderSummary } from '@/components/organisms';
import { ColorContext } from '@/contexts';
import { Layout } from '@/components/templates';
import { Loading } from '@/components/atoms';
import NextLink from 'next/link';
import { trpc } from '@/utils/trpc';
import { useContext } from 'react';
import { useSession } from 'next-auth/react';

function Cart() {
  const { data: session } = useSession();
  const {
    data: orderItems,
    isLoading,
    refetch,
  } = trpc.store.orderItems.useQuery(session?.user?.email as string, {});
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
            Meu carrinho{' '}
            {orderItems?.length && (
              <Text>
                ({orderItems?.length} ite
                {orderItems && orderItems.length > 1 ? 'ns' : 'm'})
              </Text>
            )}
          </Heading>
          {isLoading && <Loading />}
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
                refetch={refetch}
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

export default Cart;
