import { Box, BoxProps, Container, ContainerProps } from '@chakra-ui/react';
import { Footer, Header } from '@/components/organisms';

import Head from 'next/head';
import { ReactNode } from 'react';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  keywords?: string;
  subHeader?: ReactNode;
  headerProps?: BoxProps;
  containerProps?: ContainerProps;
  footerProps?: BoxProps;
}

export function Layout({
  title,
  description,
  keywords,
  children,
  subHeader,
  headerProps,
  containerProps,
  footerProps,
}: LayoutProps) {
  const router = useRouter();

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>{`${title} | @aaafuria`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta
          name="description"
          content={
            description
              ? `${description}`
              : 'Plataforma de sócios e loja da Associação Atlética de Medicina Fúria Uniniovafapi. Seja sócio da Maior do Piauí e aproveite dos nossos produtos, treinos, ensaios, eventos e mais...'
          }
        />
        <meta
          name="keywords"
          content={`aaafuria, site, atlética, fúria, medicina, loja, eventos, intermed, ${keywords}`}
        />
        <link rel="canonical" href={`https://aaafuria.site${router.asPath}`} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={`https://aaafuria.site${router.asPath}`}
        />
        <meta
          property="og:title"
          content={title ? `@aaafuria | ${title}` : '@aaafuria'}
        />
        <meta
          property="og:description"
          content={
            description
              ? `${description}`
              : 'Plataforma de sócios e loja da Associação Atlética de Medicina Fúria Uniniovafapi. Seja sócio da Maior do Piauí e aproveite dos nossos produtos, treinos, ensaios, eventos e mais...'
          }
        />
        <meta property="og:image" content={'/logo-aaafuria.png'} />
        <meta property="og:image:alt" content="logo" />
        <meta property="og:locale" content="pt_BR" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:url"
          content={`https://aaafuria.site${router.asPath}`}
        />
        <meta
          property="twitter:title"
          content={title ? `@aaafuria | ${title}` : '@aaafuria'}
        />
        <meta
          property="twitter:description"
          content={
            description
              ? `${description}`
              : 'Plataforma de sócios e loja da Associação Atlética de Medicina Fúria Uniniovafapi. Seja sócio da Maior do Piauí e aproveite dos nossos produtos, treinos, ensaios, eventos e mais...'
          }
        />
        <meta property="twitter:image" content={'/logo-aaafuria.png'} />
        <meta name="twitter:image:alt" content="logo" />
      </Head>
      <Box minH="100vh">
        <Header {...headerProps} />
        {subHeader}
        <Container
          maxW="8xl"
          minH="50vh"
          mx="auto"
          px={{ base: '4', md: '8', lg: '12' }}
          py={{ base: '6', md: '8', lg: '12' }}
          {...containerProps}
        >
          {children}
        </Container>
        <Footer {...footerProps} />
      </Box>
    </>
  );
}
