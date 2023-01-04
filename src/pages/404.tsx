import { Box, Heading, Stack, Text } from '@chakra-ui/react';

import { ColorContext } from '@/contexts';
import { Layout } from '@/components/templates';
import Link from 'next/link';
import { useContext } from 'react';

function NotFound() {
  const { green } = useContext(ColorContext);
  return (
    <Layout title="404 - Não encontrado">
      <Box>
        <Stack textAlign={'center'} w="full">
          <Heading size="md">NÃO HÁ NADA AQUI</Heading>
          <Text as={Link} href="/" color={green}>
            Voltar ao início
          </Text>
        </Stack>
      </Box>
    </Layout>
  );
}

export default NotFound;
