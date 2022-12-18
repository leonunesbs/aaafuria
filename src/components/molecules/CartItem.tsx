import {
  Box,
  Button,
  CloseButton,
  Flex,
  HStack,
  IconButton,
  Input,
  useToast,
} from '@chakra-ui/react';
import { MdAdd, MdRemove } from 'react-icons/md';
import { Order, OrderItem } from '@prisma/client';

import { CartProductMeta } from '../atoms/CartProductMeta';
import { ItemsWithParentAndChildrens } from '@/pages/store';
import { PriceTag } from '../atoms/PriceTag';
import { trpc } from '@/utils/trpc';
import { useSession } from 'next-auth/react';

type CartItemProps = OrderItem & {
  order: Order;
  item: ItemsWithParentAndChildrens;
  refetch: () => void;
};

type QuantitySelectProps = CartItemProps & {
  order: Order;
  item: ItemsWithParentAndChildrens;
  refetch: () => void;
};

const QuantitySelect = ({
  quantity,
  id,
  itemId,
  refetch,
}: QuantitySelectProps) => {
  const toast = useToast();
  const { data: session } = useSession();

  const addToCart = trpc.store.cart.add.useMutation({
    onSuccess: () => {
      toast({
        isClosable: true,
        title: 'Adicionado ao carrinho',
        description: 'Produto adicionado ao carrinho',
        status: 'success',
      }),
        refetch();
    },
    onError: (err) => {
      toast({
        isClosable: true,
        title: err.message,
        status: 'error',
      });
      refetch();
    },
  });
  const removeFromCart = trpc.store.cart.remove.useMutation({
    onSuccess: () => {
      toast({
        isClosable: true,
        title: 'Removido do carrinho',
        description: 'Produto removido do carrinho',
        status: 'info',
      }),
        refetch();
    },
    onError: (err) => {
      toast({
        isClosable: true,
        title: err.message,
        status: 'error',
      });
      refetch();
    },
  });

  return (
    <HStack spacing={[1, 2]} justify="center">
      <Box>
        <IconButton
          size={['xs', 'sm']}
          aria-label="remove from cart"
          icon={<MdRemove />}
          onClick={() => {
            removeFromCart.mutate({
              orderItemId: id,
              quantity: 1,
              userEmail: session?.user?.email as string,
            });
          }}
        />
      </Box>
      <Input
        value={quantity}
        size={['xs', 'sm']}
        maxW={12}
        minW={8}
        isReadOnly
        textAlign={'center'}
        focusBorderColor={'blue.500'}
      />
      <Box>
        <IconButton
          size={['xs', 'sm']}
          aria-label="add to cart"
          icon={<MdAdd />}
          onClick={() =>
            addToCart.mutate({
              itemId,
              quantity: 1,
              userEmail: session?.user?.email as string,
            })
          }
        />
      </Box>
    </HStack>
  );
};

export function CartItem({ ...rest }: CartItemProps) {
  const { id, item, quantity, price, currency, refetch } = rest;
  const { data: session } = useSession();

  const removeFromCart = trpc.store.cart.remove.useMutation({
    onSuccess: refetch,
  });

  return (
    <Flex
      direction={{ base: 'column', md: 'row' }}
      justify="space-between"
      align="center"
    >
      <CartProductMeta
        id={item.id}
        name={item.parentId ? `${item.parent?.name} - ${item.name}` : item.name}
        description={item.description}
        image={'#'}
      />

      {/* Desktop */}
      <Flex
        width="full"
        justify="space-between"
        display={{ base: 'none', md: 'flex' }}
      >
        <QuantitySelect {...rest} />
        <PriceTag
          price={item.price * quantity}
          currency={currency}
          salePrice={price * quantity}
        />
        <CloseButton
          aria-label={`Delete ${item.name} from cart`}
          onClick={() => {
            removeFromCart.mutateAsync({
              userEmail: session?.user?.email as string,
              orderItemId: id,
              quantity: quantity,
            });
          }}
        />
      </Flex>

      {/* Mobile */}
      <Flex
        mt="4"
        align="center"
        width="full"
        justify="space-between"
        display={{ base: 'flex', md: 'none' }}
      >
        <Button
          fontSize={['sm', 'md']}
          textDecor="underline"
          variant={'link'}
          onClick={() => {
            removeFromCart.mutateAsync({
              userEmail: session?.user?.email as string,
              orderItemId: id,
              quantity: quantity,
            });
          }}
        >
          Remover
        </Button>
        <QuantitySelect {...rest} />
        <PriceTag
          price={item.price * quantity}
          currency={currency}
          salePrice={price}
        />
      </Flex>
    </Flex>
  );
}