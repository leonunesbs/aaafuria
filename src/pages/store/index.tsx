import { Box, Button } from '@chakra-ui/react';

import { GetServerSideProps } from 'next';
import { Item } from '@prisma/client';
import { Layout } from '@/components/templates';
import { MdShoppingCart } from 'react-icons/md';
import NextLink from 'next/link';
import { ProductCard } from '@/components/atoms';
import { ProductGrid } from '@/components/molecules';
import { prisma } from '@/server/prisma';

export type ItemsWithParentAndChildrens = Item & {
  childrens: Item[];
  parent: Item | null;
};

function Store({ items }: { items: ItemsWithParentAndChildrens[] }) {
  return (
    <Layout title="Loja">
      <Box textAlign={'right'} mb={4}>
        <Button
          as={NextLink}
          size="sm"
          href="/store/cart"
          leftIcon={<MdShoppingCart />}
        >
          Meu carrinho
        </Button>
      </Box>
      <ProductGrid>
        {items.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </ProductGrid>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const items = await prisma.item.findMany({
    where: {
      parentId: null,
    },
    include: {
      childrens: true,
      parent: true,
    },
  });

  return {
    props: {
      items: JSON.parse(JSON.stringify(items)),
    },
  };
};

export default Store;
