import { Box, Heading, Stack, Text } from '@chakra-ui/react';

import { ColorContext } from '@/contexts';
import { Layout } from '@/components/templates';
import Link from 'next/link';
import { useContext } from 'react';

function Forbidden() {
  const { green } = useContext(ColorContext);
  return (
    <Layout title="403 - Forbidden">
      <Box>
        <Stack textAlign={'center'} w="full">
          <Heading size="md">ÁREA RESTRITA</Heading>
          <Text as={Link} href="/" color={green}>
            Voltar ao início
          </Text>
        </Stack>
      </Box>
    </Layout>
  );
}

export default Forbidden;
