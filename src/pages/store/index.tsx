import { Box, Link } from '@chakra-ui/react';

import { GetServerSideProps } from 'next';
import { Item } from '@prisma/client';
import { Layout } from '@/components/templates';
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
    <Layout>
      <Box textAlign={'right'}>
        <Link as={NextLink} href="/store/cart">
          Ir para o carrinho
        </Link>
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