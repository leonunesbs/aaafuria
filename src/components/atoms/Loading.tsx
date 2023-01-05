import { HStack, Spinner, Text } from '@chakra-ui/react';
import { ReactNode, useContext } from 'react';

import { ColorContext } from '@/contexts';

interface LoadingProps {
  children?: ReactNode;
}

export function Loading({}: LoadingProps) {
  const { green } = useContext(ColorContext);
  return (
    <HStack w="full" justify={'center'}>
      <Spinner color={green} />
      <Text textAlign={'center'}>Carregando...</Text>
    </HStack>
  );
}
