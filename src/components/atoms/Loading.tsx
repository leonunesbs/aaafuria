import { HStack, Spinner, SpinnerProps, Text } from '@chakra-ui/react';

import { ColorContext } from '@/contexts';
import { useContext } from 'react';

interface LoadingProps extends SpinnerProps {
  loadingText?: string;
}

export function Loading({
  loadingText = 'Carregando...',
  ...rest
}: LoadingProps) {
  const { green } = useContext(ColorContext);
  return (
    <HStack w="full" justify={'center'} py={2}>
      <Spinner color={green} {...rest} />
      <Text textAlign={'center'}>{loadingText}</Text>
    </HStack>
  );
}
