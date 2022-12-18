import {
  AspectRatio,
  Box,
  Button,
  HStack,
  Image,
  Skeleton,
  Stack,
  StackProps,
  Text,
  useBreakpointValue,
  useToast,
} from '@chakra-ui/react';

import { ItemsWithParentAndChildrens } from '@/pages/store';
import NextLink from 'next/link';
import { PriceTag } from './PriceTag';
import { Rating } from './Rating';
import { trpc } from '@/utils/trpc';
import { useRouter } from 'next/router';

interface ProductCardProps {
  item: ItemsWithParentAndChildrens;
  rootProps?: StackProps;
}

export function ProductCard({ item, rootProps }: ProductCardProps) {
  const router = useRouter();
  const toast = useToast();
  const { id, name, price, memberPrice, childrens } = item;

  const addToCart = trpc.store.cart.add.useMutation({
    onSuccess: () => {
      toast({
        title: 'Adicionado ao carrinho',
        description: 'O item foi adicionado ao seu carrinho',
        status: 'success',
        isClosable: true,
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao adicionar ao carrinho',
        description: error.message,
        status: 'error',
        isClosable: true,
      });
    },
  });

  return (
    <Stack spacing={useBreakpointValue({ base: '4', md: '5' })} {...rootProps}>
      <Box position="relative" as={NextLink} href={`/store/${id}`}>
        <AspectRatio ratio={4 / 3}>
          <Image
            src={'#'}
            alt={name}
            draggable="false"
            fallback={<Skeleton />}
            borderRadius={useBreakpointValue({ base: 'md', md: 'xl' })}
          />
        </AspectRatio>
      </Box>
      <Stack>
        <Stack spacing="1">
          <Text
            as={NextLink}
            href={`/store/${id}`}
            fontWeight="medium"
            color={'gray.700'}
          >
            {name}
          </Text>
          <PriceTag
            price={price}
            salePrice={memberPrice || undefined}
            currency="BRL"
          />
        </Stack>
        <HStack>
          <Rating defaultValue={4} size="sm" />
          <Text fontSize="sm" color={'gray.600'}>
            12 Reviews
          </Text>
        </HStack>
      </Stack>
      <Stack align="center">
        <Button
          colorScheme="blue"
          width="full"
          isLoading={addToCart.isLoading}
          onClick={async () =>
            childrens.length > 0
              ? router.push(`/store/${id}`)
              : await addToCart.mutateAsync({
                  itemId: item.id,
                  quantity: 1,
                })
          }
        >
          Adicionar ao carrinho
        </Button>
        <Button
          variant={'link'}
          textDecoration="underline"
          fontWeight="medium"
          color={'gray.600'}
          onClick={async () =>
            childrens.length > 0
              ? router.push(`/store/${id}`)
              : await addToCart
                  .mutateAsync({
                    itemId: item.id,
                    quantity: 1,
                  })
                  .then(() => router.push('/store/cart'))
          }
        >
          Comprar agora
        </Button>
      </Stack>
    </Stack>
  );
}
