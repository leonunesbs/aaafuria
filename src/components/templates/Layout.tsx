import {
  Box,
  BoxProps,
  Center,
  Container,
  ContainerProps,
  HStack,
  Heading,
  Link,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Footer, Header } from '@/components/organisms';
import { ReactNode, useContext } from 'react';

import { ColorContext } from '@/contexts';
import Head from 'next/head';
import { trpc } from '@/utils/trpc';

interface LayoutProps {
  children: ReactNode;
  title: string;
  subHeader?: ReactNode;
  headerProps?: BoxProps;
  containerProps?: ContainerProps;
  footerProps?: BoxProps;
  staffCheck?: boolean;
}

const StaffGate = ({ isLoading }: { isLoading: boolean }) => {
  const { green } = useContext(ColorContext);
  if (isLoading)
    return (
      <Center mt={20}>
        <HStack>
          <Spinner size="lg" color={green} />
          <Text>Checando permissões...</Text>
        </HStack>
      </Center>
    );
  return (
    <Box>
      <Stack textAlign={'center'} w="full" mt={10}>
        <Heading size="md">Área restrita</Heading>
        <Text as={Link} href="/" color={green}>
          Voltar ao início
        </Text>
      </Stack>
    </Box>
  );
};

export function Layout({
  title,
  children,
  subHeader,
  headerProps,
  containerProps,
  footerProps,
  staffCheck = false,
}: LayoutProps) {
  const { data: isStaff, isLoading } = trpc.auth.isStaff.useQuery(undefined, {
    enabled: staffCheck,
  });

  return (
    <>
      <Head>
        <title>{`${title} | @aaafuria`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Box minH="100vh">
        <Header {...headerProps} />
        {subHeader}
        <Container
          maxW="8xl"
          mx="auto"
          px={{ base: '4', md: '8', lg: '12' }}
          py={{ base: '6', md: '8', lg: '12' }}
          {...containerProps}
        >
          {staffCheck && !isStaff ? (
            <StaffGate isLoading={isLoading} />
          ) : (
            children
          )}
        </Container>
        <Footer {...footerProps} />
      </Box>
    </>
  );
}
