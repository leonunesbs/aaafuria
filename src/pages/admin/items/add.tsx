import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Input,
  Select,
  Stack,
} from '@chakra-ui/react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { GetServerSideProps } from 'next';
import { Item } from '@prisma/client';
import { ItemsWithParentAndChilds } from '.';
import { Layout } from '@/components/templates';
import Link from 'next/link';
import { prisma } from '@/server/prisma';
import { trpc } from '@/utils/trpc';

interface ItemInput
  extends Omit<
    Item,
    | 'price'
    | 'memberPrice'
    | 'athletePrice'
    | 'coordinatorPrice'
    | 'staffPrice'
    | 'stock'
  > {
  price: string;
  memberPrice: string;
  athletePrice: string;
  coordinatorPrice: string;
  staffPrice: string;
  stock: string;
}

function Add({ items }: { items: ItemsWithParentAndChilds[] }) {
  const { register, handleSubmit, reset } = useForm<ItemInput>();
  const createItem = trpc.store.item.create.useMutation();
  const onSubmit: SubmitHandler<ItemInput> = (data) => {
    createItem.mutate({
      ...data,
      currency: 'BRL',
      price: parseFloat(data.price),
      stock: parseInt(data.stock),
      memberPrice: data.memberPrice ? parseFloat(data.memberPrice) : null,
      athletePrice: data.athletePrice ? parseFloat(data.athletePrice) : null,
      coordinatorPrice: data.coordinatorPrice
        ? parseFloat(data.coordinatorPrice)
        : null,
      staffPrice: data.staffPrice ? parseFloat(data.staffPrice) : null,
    });
    reset();
  };
  const orphanItems = items.filter((item) => !item.parentId);

  return (
    <Layout>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={4}>
          <Heading size="md">Adicionar produto</Heading>
          <FormControl>
            <FormLabel>Produto principal</FormLabel>
            <Select {...register('parentId')} placeholder="Selecione uma opção">
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

          <FormControl isRequired>
            <FormLabel>Estoque</FormLabel>
            <Input isRequired type="number" {...register('stock')} />
          </FormControl>
          <Stack>
            <Button colorScheme={'blue'} type="submit">
              Adicionar
            </Button>
            <Button as={Link} href="/admin/items">
              Lista de produtos
            </Button>
          </Stack>
        </Stack>
      </form>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
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
