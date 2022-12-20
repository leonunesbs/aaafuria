import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftAddon,
  Select,
  Stack,
  useToast,
} from '@chakra-ui/react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { Layout } from '@/components/templates';
import { cleanString } from '@/libs/functions';
import { prisma } from '@/server/prisma';
import { trpc } from '@/utils/trpc';
import { Item } from '@prisma/client';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ItemInput } from './add';

function Item({ item, items }: { item: Item; items: Item[] }) {
  const router = useRouter();
  const toast = useToast();
  const { register, handleSubmit } = useForm<ItemInput>({
    defaultValues: {
      ...item,
      parentId: item.parentId,
      price: item.price.toString(),
      rating: item.rating.toString(),
      memberPrice: item.memberPrice?.toString() || '',
      athletePrice: item.athletePrice?.toString() || '',
      coordinatorPrice: item.coordinatorPrice?.toString() || '',
      staffPrice: item.staffPrice?.toString() || '',
      stock: item.stock.toString(),
    },
  });
  const deleteItem = trpc.store.item.delete.useMutation({
    onSuccess: () => {
      toast({
        title: 'Produto excluído',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.push('/admin/items');
    },
  });
  const updateItem = trpc.store.item.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Produto atualizado',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.push('/admin/items');
    },
  });
  const onSubmit: SubmitHandler<ItemInput> = async (data) => {
    data.name = cleanString(data.name);
    data.description = cleanString(data.description);
    await updateItem.mutateAsync({
      ...data,
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

  const orphanItems = items.filter(
    (orphanItem) => !orphanItem.parentId && item.id !== orphanItem.id,
  );

  return (
    <Layout title="Editar produto">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card rounded="lg" maxW="xl" mx="auto">
          <CardHeader>
            <Heading size="md">Editar produto</Heading>
          </CardHeader>
          <CardBody>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Produto principal</FormLabel>
                <Select
                  {...register('parentId')}
                  placeholder="Selecione uma opção"
                >
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
                <InputGroup>
                  <InputLeftAddon>R$</InputLeftAddon>
                  <Input isRequired type="number" {...register('price')} />
                </InputGroup>
              </FormControl>
              <HStack>
                <FormControl>
                  <FormLabel>Sócios</FormLabel>
                  <InputGroup>
                    <InputLeftAddon>R$</InputLeftAddon>
                    <Input type="number" {...register('memberPrice')} />
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>Atletas</FormLabel>
                  <InputGroup>
                    <InputLeftAddon>R$</InputLeftAddon>
                    <Input type="number" {...register('athletePrice')} />
                  </InputGroup>
                </FormControl>
              </HStack>
              <HStack>
                <FormControl>
                  <FormLabel>Coord.</FormLabel>
                  <InputGroup>
                    <InputLeftAddon>R$</InputLeftAddon>
                    <Input type="number" {...register('coordinatorPrice')} />
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>Diretoria</FormLabel>
                  <InputGroup>
                    <InputLeftAddon>R$</InputLeftAddon>
                    <Input type="number" {...register('staffPrice')} />
                  </InputGroup>
                </FormControl>
              </HStack>
              <HStack>
                <FormControl isRequired>
                  <FormLabel>Estoque</FormLabel>
                  <Input isRequired type="number" {...register('stock')} />
                </FormControl>
                <FormControl>
                  <FormLabel>Estrelas</FormLabel>
                  <Select defaultValue={'0'} {...register('rating')}>
                    <option value={'0'}>0</option>
                    <option value={'1'}>1</option>
                    <option value={'2'}>2</option>
                    <option value={'3'}>3</option>
                    <option value={'4'}>4</option>
                    <option value={'5'}>5</option>
                  </Select>
                </FormControl>
              </HStack>
            </Stack>
          </CardBody>
          <CardFooter>
            <Stack w="full">
              <Button colorScheme={'green'} type="submit">
                Salvar
              </Button>
              <Button
                colorScheme={'red'}
                onClick={() => deleteItem.mutate(item.id)}
              >
                Excluir
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
  const { id } = ctx.query;
  const item = await prisma.item.findUnique({
    where: {
      id: id as string,
    },
    include: {
      parent: true,
    },
  });

  const items = await prisma.item.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  return {
    props: {
      item,
      items,
    },
  };
};

export default Item;
