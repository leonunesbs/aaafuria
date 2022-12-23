import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Heading,
  Link,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';

import { ColorContext } from '@/contexts';
import { GetServerSideProps } from 'next';
import { Item } from '@prisma/client';
import { Layout } from '@/components/templates';
import NextLink from 'next/link';
import { formatPrice } from '@/components/atoms';
import { prisma } from '@/server/prisma';
import { useContext } from 'react';

export type ItemsWithParentAndChilds = Item & {
  parent: Item;
  childrens: Item[];
};

function Items({ items }: { items: ItemsWithParentAndChilds[] }) {
  const { green } = useContext(ColorContext);
  return (
    <Layout title="Lista de itens">
      <Card>
        <CardHeader>
          <Heading size="md">Lista de itens</Heading>
        </CardHeader>
        <CardBody>
          <TableContainer>
            <Table>
              <Thead>
                <Tr>
                  <Th>Nome</Th>
                  <Th>Variações</Th>
                  <Th>Estoque</Th>
                  <Th>Preços</Th>
                </Tr>
              </Thead>
              <Tbody>
                {items.map((item) => (
                  <Tr key={item.id}>
                    <Td>
                      <Link
                        color={green}
                        fontWeight="bold"
                        as={NextLink}
                        href={`/admin/items/${item.id}`}
                      >
                        {item.parentId
                          ? `[${item.parent?.name}] ${item.name}`
                          : item.name}
                      </Link>
                    </Td>
                    <Td>
                      <Stack>
                        {item.childrens.map((children) => (
                          <Box key={children.id}>
                            <Link
                              as={NextLink}
                              color={green}
                              href={`/admin/items/${children.id}`}
                            >
                              {children.name}
                            </Link>
                          </Box>
                        ))}
                      </Stack>
                    </Td>
                    <Td>{item.stock} unid</Td>
                    <Td>
                      <Stack spacing={1} fontSize="sm">
                        <Text>Comum: {formatPrice(item.price)}</Text>
                        {item.memberPrice && (
                          <Text>Sócio: {formatPrice(item.memberPrice)}</Text>
                        )}
                        {item.athletePrice && (
                          <Text>Atleta: {formatPrice(item.athletePrice)}</Text>
                        )}
                        {item.coordinatorPrice && (
                          <Text>
                            Coordenador: {formatPrice(item.coordinatorPrice)}
                          </Text>
                        )}
                        {item.staffPrice && (
                          <Text>Diretor: {formatPrice(item.staffPrice)}</Text>
                        )}
                      </Stack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
        <CardFooter>
          <Stack w="full" maxW="lg" mx="auto">
            <Button
              colorScheme={'green'}
              as={Link}
              href="/admin/items/add"
              _hover={{
                textDecoration: 'none',
              }}
            >
              Adicionar item
            </Button>
            <Button
              as={Link}
              href="/admin"
              _hover={{
                textDecoration: 'none',
              }}
            >
              Área do Diretor
            </Button>
          </Stack>
        </CardFooter>
      </Card>
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
