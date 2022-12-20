import { Box, Container } from '@chakra-ui/react';

import { Header } from '../molecules';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <Box bgColor="white" minH="100vh">
      <Header />
      <Container
        maxW="8xl"
        mx="auto"
        px={{ base: '4', md: '8', lg: '12' }}
        py={{ base: '6', md: '8', lg: '12' }}
      >
        {children}
      </Container>
    </Box>
  );
}
