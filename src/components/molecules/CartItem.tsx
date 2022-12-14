import {
  Box,
  Button,
  CloseButton,
  Flex,
  HStack,
  IconButton,
  Text,
  useToast,
} from '@chakra-ui/react';
import { MdAdd, MdRemove } from 'react-icons/md';
import { Order, OrderItem } from '@prisma/client';

import { CartProductMeta } from '../atoms/CartProductMeta';
import { ItemsWithFamily } from '@/pages/store';
import { PriceTag } from '../atoms/PriceTag';
import { trpc } from '@/utils/trpc';

type CartItemProps = OrderItem & {
  order: Order;
  item: ItemsWithFamily;
  refetch: () => void;
};

type QuantitySelectProps = CartItemProps & {
  order: Order;
  item: ItemsWithFamily;
  refetch: () => void;
};

const QuantitySelect = ({
  quantity,
  id,
  itemId,
  refetch,
}: QuantitySelectProps) => {
  const toast = useToast({ position: 'top' });
  const refreshData = () => {
    refetch();
  };

  const addToCart = trpc.store.cart.add.useMutation({
    onSuccess: () => {
      toast({
        isClosable: true,
        title: 'Adicionado ao carrinho',
        description: 'Produto adicionado ao carrinho',
        status: 'success',
      });
      refreshData();
    },
    onError: (err) => {
      toast({
        isClosable: true,
        title: err.message,
        status: 'error',
      });
      refreshData();
    },
  });
  const removeFromCart = trpc.store.cart.remove.useMutation({
    onSuccess: () => {
      toast({
        isClosable: true,
        title: 'Removido do carrinho',
        description: 'Produto removido do carrinho',
        status: 'info',
      });
      refreshData();
    },
    onError: (err) => {
      toast({
        isClosable: true,
        title: err.message,
        status: 'error',
      });
      refreshData();
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
            });
          }}
          isLoading={removeFromCart.isLoading}
          isDisabled={addToCart.isLoading || removeFromCart.isLoading}
        />
      </Box>
      <Box>
        <IconButton
          variant={'unstyled'}
          size={['xs', 'sm']}
          aria-label="quantity"
          icon={<Text>{quantity}</Text>}
          cursor="auto"
          borderWidth={1}
        />
      </Box>

      <Box>
        <IconButton
          size={['xs', 'sm']}
          aria-label="add to cart"
          icon={<MdAdd />}
          onClick={() => {
            addToCart.mutate({
              itemId,
              quantity: 1,
            });
          }}
          isLoading={addToCart.isLoading}
          isDisabled={addToCart.isLoading || removeFromCart.isLoading}
        />
      </Box>
    </HStack>
  );
};

export function CartItem({ ...rest }: CartItemProps) {
  const { id, item, quantity, price, currency, refetch } = rest;

  const refreshData = () => {
    refetch();
  };

  const removeFromCart = trpc.store.cart.remove.useMutation({
    onSuccess: () => {
      refreshData();
    },
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
          salePrice={price}
        />
        <CloseButton
          aria-label={`Delete ${item.name} from cart`}
          onClick={() => {
            removeFromCart.mutate({
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
            removeFromCart.mutate({
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
