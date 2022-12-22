import { Box, Container } from '@chakra-ui/react';

import Head from 'next/head';
import { Header } from '../organisms';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  title: string;
  subHeader?: ReactNode;
}

export function Layout({ title, children, subHeader }: LayoutProps) {
  return (
    <>
      <Head>
        <title>{`${title} | @aaafuria`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Box minH="100vh">
        <Header />
        {subHeader}
        <Container
          maxW="8xl"
          mx="auto"
          px={{ base: '4', md: '8', lg: '12' }}
          py={{ base: '6', md: '8', lg: '12' }}
        >
          {children}
        </Container>
      </Box>
    </>
  );
}
