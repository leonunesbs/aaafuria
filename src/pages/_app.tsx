import type { AppProps } from 'next/app';
import { Chakra } from '@/components/templates';
import { ColorProvider } from '@/contexts';
import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
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
      <Chakra cookies={pageProps.cookies}>
        <ContextProviders>
          <Component {...pageProps} />
        </ContextProviders>
      </Chakra>
    </SessionProvider>
  );
};

export { getServerSideProps } from '@/components/templates';
export default trpc.withTRPC(MyApp);
