import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Input,
  Stack,
  Text,
  chakra,
  useNumberInput,
  useRadio,
  useRadioGroup,
  useToast,
} from '@chakra-ui/react';
import { PriceTag, Rating } from '@/components/atoms';

import { GetServerSideProps } from 'next';
import { ItemsWithParentAndChildrens } from '.';
import { Layout } from '@/components/templates';
import { prisma } from '@/server/prisma';
import { trpc } from '@/utils/trpc';
import { useSession } from 'next-auth/react';

function Item({ item }: { item: ItemsWithParentAndChildrens }) {
  const { price, memberPrice, description, childrens } = item;

  function CustomRadio(props: any) {
    const { name, ...radioProps } = props;
    const { state, getInputProps, getCheckboxProps, htmlProps } =
      useRadio(radioProps);

    const checkedProps = () => {
      if (state.isChecked) {
        return {
          bg: 'blue.50',
          color: 'blue.500',
          borderColor: 'blue.500',
          borderWidth: '2px',
        };
      }
    };

    return (
      <chakra.label {...htmlProps} cursor="pointer">
        <input {...getInputProps({})} hidden />
        <Box
          {...getCheckboxProps()}
          px={4}
          py={2}
          rounded="md"
          textColor="gray.600"
          fontWeight="bold"
          borderWidth="1px"
          borderColor="gray.200"
          {...checkedProps()}
        >
          {name}
        </Box>
      </chakra.label>
    );
  }
  const {
    value: itemVariationId,
    getRadioProps,
    getRootProps,
  } = useRadioGroup({
    defaultValue: childrens[0]?.id || item.id,
  });

  const { getInputProps, getIncrementButtonProps, getDecrementButtonProps } =
    useNumberInput({
      step: 1,
      defaultValue: 1,
      min: 1,
      max: 10,
    });

  const inc = getIncrementButtonProps();
  const dec = getDecrementButtonProps();
  const input = getInputProps();

  const toast = useToast();
  const addToCart = trpc.store.cart.add.useMutation({
    onSuccess: () =>
      toast({
        title: 'Adicionado ao carrinho',
        description: 'O item foi adicionado ao seu carrinho',
        status: 'success',
        isClosable: true,
      }),
    onError: (err) =>
      toast({
        title: err.message,
        status: 'error',
        isClosable: true,
      }),
  });
  const { data: session } = useSession();
  const handleAddToCart = () => {
    addToCart.mutate({
      itemId: itemVariationId as string,
      quantity: input['aria-valuenow'] as number,
      userEmail: session?.user?.email as string,
    });
  };

  return (
    <Layout>
      <Stack direction={['column', 'column', 'row']} spacing={10}>
        <Stack spacing={10} w="full" maxW="md">
          <Stack spacing={4}>
            <Heading color={'gray.700'}>
              {item.parentId
                ? `${item.parent?.name} - ${item.name}`
                : item.name}
            </Heading>
            <Stack>
              <PriceTag
                price={price}
                salePrice={memberPrice || undefined}
                currency="BRL"
              />
              <HStack>
                <Rating defaultValue={4} size="sm" />
                <Text fontSize="sm" color={'gray.600'}>
                  12 Reviews
                </Text>
              </HStack>
            </Stack>
            <Text color={'gray.600'}>{description}</Text>
          </Stack>
          <Stack spacing={6}>
            {childrens.length > 0 && (
              <FormControl>
                <FormLabel>
                  <Text color={'gray.600'}>Selecione uma variação</Text>
                </FormLabel>
                <HStack {...getRootProps()}>
                  {childrens.map((child) => {
                    const radio = getRadioProps({ value: child.id });
                    return (
                      <CustomRadio
                        key={child.id}
                        {...radio}
                        name={child.name}
                      />
                    );
                  })}
                </HStack>
              </FormControl>
            )}
            <FormControl>
              <FormLabel>
                <Text color={'gray.600'}>Quantidade</Text>
              </FormLabel>
              <HStack maxW="3xs">
                <Button {...dec}>-</Button>
                <Input textAlign={'center'} {...input} />
                <Button {...inc}>+</Button>
              </HStack>
            </FormControl>
            <Button
              colorScheme={'blue'}
              onClick={handleAddToCart}
              isLoading={addToCart.isLoading}
            >
              Adicionar ao carrinho
            </Button>
          </Stack>
        </Stack>
        <Stack w="full" h={'50vh'} bgColor="red.500">
          Images
        </Stack>
      </Stack>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const item = await prisma.item.findUnique({
    where: {
      id: ctx.query.id as string,
    },
    include: {
      childrens: true,
      parent: true,
    },
  });

  if (!item) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      item: JSON.parse(JSON.stringify(item)),
    },
  };
};

export default Item;
