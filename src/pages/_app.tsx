import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { ColorProvider } from '@/contexts';
import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import theme from '@/styles/theme';
import { trpc } from '@/utils/trpc';

const ContextProviders = ({ children }: { children: ReactNode }) => {
  return <ColorProvider>{children}</ColorProvider>;
};

const MyApp = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) => {
  return (
    <SessionProvider session={session}>
      <ChakraProvider theme={theme}>
        <ContextProviders>
          <Component {...pageProps} />
        </ContextProviders>
      </ChakraProvider>
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
