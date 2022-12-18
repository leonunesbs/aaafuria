import { Button, Heading, Stack } from '@chakra-ui/react';

import { GetServerSideProps } from 'next';
import { Item } from '@prisma/client';
import { Layout } from '@/components/templates';
import Link from 'next/link';
import { prisma } from '@/server/prisma';

export type ItemsWithParentAndChilds = Item & {
  parent: Item;
  childrens: Item[];
};

function Items() {
  return (
    <Layout>
      <Heading>Itens</Heading>
      <Stack>
        <Button colorScheme={'blue'} as={Link} href="/admin/items/add">
          Adicionar item
        </Button>
        <Button as={Link} href="/">
          Início
        </Button>
      </Stack>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const items = await prisma.item.findMany({
    include: {
      parent: true,
      childrens: true,
    },
  });
  return {
    props: {
      items,
    },
  };
};

export default Items;
