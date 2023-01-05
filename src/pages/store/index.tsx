import { Box, Button } from '@chakra-ui/react';

import { GetStaticProps } from 'next';
import { Item } from '@prisma/client';
import { Layout } from '@/components/templates';
import { MdShoppingCart } from 'react-icons/md';
import NextLink from 'next/link';
import { ProductCard } from '@/components/molecules';
import { ProductGrid } from '@/components/organisms';
import { prisma } from '@/server/prisma';

export type ItemsWithParentAndChildrens = Item & {
  childrens: Item[];
  parent: Item | null;
};

function Store({ items }: { items: ItemsWithParentAndChildrens[] }) {
  return (
    <Layout
      title="Loja"
      description="
      A loja da Fúria é um espaço para você adquirir produtos oficiais da Atlética.
    "
    >
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

export const getStaticProps: GetStaticProps = async () => {
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
    revalidate: 60,
  };
};

export default Store;
