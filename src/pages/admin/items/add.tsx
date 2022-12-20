import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Input,
  Select,
  Stack,
  useToast,
} from '@chakra-ui/react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { GetServerSideProps } from 'next';
import { Item } from '@prisma/client';
import { ItemsWithParentAndChilds } from '.';
import { Layout } from '@/components/templates';
import Link from 'next/link';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { cleanString } from '@/libs/functions';
import { prisma } from '@/server/prisma';
import { trpc } from '@/utils/trpc';
import { unstable_getServerSession } from 'next-auth';
import { useRouter } from 'next/router';

export interface ItemInput
  extends Omit<
    Item,
    | 'rating'
    | 'price'
    | 'memberPrice'
    | 'athletePrice'
    | 'coordinatorPrice'
    | 'staffPrice'
    | 'stock'
  > {
  rating: string;
  price: string;
  memberPrice: string;
  athletePrice: string;
  coordinatorPrice: string;
  staffPrice: string;
  stock: string;
}

function Add({ items }: { items: ItemsWithParentAndChilds[] }) {
  const router = useRouter();
  const toast = useToast();
  const { register, handleSubmit } = useForm<ItemInput>();
  const createItem = trpc.store.item.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Produto adicionado com sucesso',
        status: 'success',
        isClosable: true,
      });
      router.reload();
    },
  });
  const onSubmit: SubmitHandler<ItemInput> = async (data) => {
    data.name = cleanString(data.name);
    data.description = cleanString(data.description);

    await createItem.mutateAsync({
      ...data,
      parentId: data.parentId ? data.parentId : null,
      currency: 'BRL',
      rating: parseInt(data.rating),
      price: parseFloat(data.price),
      stock: parseInt(data.stock),
      memberPrice: data.memberPrice ? parseFloat(data.memberPrice) : null,
      athletePrice: data.athletePrice ? parseFloat(data.athletePrice) : null,
      coordinatorPrice: data.coordinatorPrice
        ? parseFloat(data.coordinatorPrice)
        : null,
      staffPrice: data.staffPrice ? parseFloat(data.staffPrice) : null,
    });
  };
  const orphanItems = items.filter((item) => !item.parentId);

  return (
    <Layout>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card maxW="xl" mx="auto" variant={'responsive'}>
          <CardHeader>
            <Heading size="md">Adicionar produto</Heading>
          </CardHeader>
          <CardBody>
            <Stack spacing={2}>
              <FormControl>
                <FormLabel>Produto principal</FormLabel>
                <Select {...register('parentId')}>
                  {orphanItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Nome</FormLabel>
                <Input isRequired {...register('name')} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Descrição</FormLabel>
                <Input isRequired {...register('description')} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Preço</FormLabel>
                <Input isRequired type="number" {...register('price')} />
              </FormControl>
              <HStack>
                <FormControl>
                  <FormLabel>Sócios</FormLabel>
                  <Input type="number" {...register('memberPrice')} />
                </FormControl>
                <FormControl>
                  <FormLabel>Atletas</FormLabel>
                  <Input type="number" {...register('athletePrice')} />
                </FormControl>
              </HStack>
              <HStack>
                <FormControl>
                  <FormLabel>Coord.</FormLabel>
                  <Input type="number" {...register('coordinatorPrice')} />
                </FormControl>
                <FormControl>
                  <FormLabel>Diretoria</FormLabel>
                  <Input type="number" {...register('staffPrice')} />
                </FormControl>
              </HStack>
              <Stack>
                <FormControl isRequired>
                  <FormLabel>Estoque</FormLabel>
                  <Input isRequired type="number" {...register('stock')} />
                </FormControl>
                <FormControl>
                  <FormLabel>Rating</FormLabel>
                  <Select defaultValue="0" {...register('rating')}>
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </Select>
                </FormControl>
              </Stack>
            </Stack>
          </CardBody>
          <CardFooter>
            <Stack w="full">
              <Button colorScheme={'green'} type="submit">
                Adicionar
              </Button>
              <Button as={Link} href="/admin/items">
                Lista de produtos
              </Button>
            </Stack>
          </CardFooter>
        </Card>
      </form>
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
        destination: '/',
        permanent: false,
      },
    };
  }

  const items = await prisma.item.findMany({
    include: {
      parent: true,
      childrens: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
  return {
    props: {
      items,
    },
  };
};

export default Add;
