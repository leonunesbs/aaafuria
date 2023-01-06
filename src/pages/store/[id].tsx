import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  IconButton,
  Stack,
  Text,
  chakra,
  useNumberInput,
  useRadio,
  useRadioGroup,
  useToast,
} from '@chakra-ui/react';
import { CustomInput, PriceTag, Rating } from '@/components/atoms';
import { GetStaticPaths, GetStaticProps } from 'next';

import { ColorContext } from '@/contexts';
import { ItemsWithFamily } from '.';
import { Layout } from '@/components/templates';
import Link from 'next/link';
import { MdEdit } from 'react-icons/md';
import { prisma } from '@/server/prisma';
import { trpc } from '@/utils/trpc';
import { useContext } from 'react';
import { useSession } from 'next-auth/react';

function Item({ item }: { item: ItemsWithFamily }) {
  const { price, memberPrice, description, rating, childrens } = item;

  function CustomRadio(props: any) {
    const { name, ...radioProps } = props;
    const { state, getInputProps, getCheckboxProps, htmlProps } =
      useRadio(radioProps);
    const { green } = useContext(ColorContext);

    const checkedProps = () => {
      if (state.isChecked) {
        return {
          color: { green },
          borderColor: { green },
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
          fontWeight="semibold"
          borderWidth={1}
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

  const toast = useToast({ position: 'top' });
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
  const handleAddToCart = () => {
    addToCart.mutate({
      itemId: itemVariationId as string,
      quantity: input['aria-valuenow'] as number,
    });
  };

  const { data: session } = useSession();
  const isStaff = session?.user.isStaff;

  return (
    <Layout
      title={item.parentId ? `${item.parent?.name} - ${item.name}` : item.name}
    >
      <Stack direction={['column', 'column', 'row']} spacing={10}>
        <Stack spacing={10} w="full" maxW="lg">
          <Stack spacing={4}>
            <HStack>
              {isStaff && (
                <IconButton
                  as={Link}
                  href={`/admin/items/${item.id}`}
                  aria-label="edit"
                  icon={<MdEdit />}
                  variant="outline"
                  colorScheme={'green'}
                  size="xs"
                />
              )}
              <Heading>
                {item.parentId
                  ? `${item.parent?.name} - ${item.name}`
                  : item.name}
              </Heading>
            </HStack>
            <Stack>
              <PriceTag
                price={price}
                salePrice={memberPrice || undefined}
                currency="BRL"
              />
              <HStack>
                <Rating defaultValue={rating} size="sm" />
              </HStack>
            </Stack>
            <Text>{description}</Text>
          </Stack>
          <Card>
            <CardBody>
              <Stack>
                {childrens.length > 0 && (
                  <FormControl>
                    <FormLabel>
                      <Text>Selecione uma variação</Text>
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
                    <Text>Quantidade</Text>
                  </FormLabel>
                  <HStack maxW="3xs">
                    <Button {...dec}>-</Button>
                    <CustomInput textAlign={'center'} {...input} />
                    <Button {...inc}>+</Button>
                  </HStack>
                </FormControl>
              </Stack>
            </CardBody>
            <CardFooter>
              <Stack w="full">
                <Button
                  colorScheme={'green'}
                  onClick={handleAddToCart}
                  isLoading={addToCart.isLoading}
                >
                  Adicionar ao carrinho
                </Button>
                <Button as={Link} href="/store">
                  Voltar à loja
                </Button>
              </Stack>
            </CardFooter>
          </Card>
        </Stack>
        <Stack w="full" h={'50vh'} bgColor="red.500">
          Images
        </Stack>
      </Stack>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const items = await prisma.item.findMany({
    select: {
      id: true,
    },
  });

  const paths = items.map((item) => ({
    params: {
      id: item.id,
    },
  }));

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const item = await prisma.item.findUnique({
    where: {
      id: ctx.params?.id as string,
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
    revalidate: 60,
  };
};

export default Item;
