import Document, { Head, Html, Main, NextScript } from 'next/document';

import { ColorModeScript } from '@chakra-ui/react';
// Default document nextjs
import theme from '@/styles/theme';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="pt-br">
        <Head>
          <meta charSet="utf-8" />

          <meta name="apple-mobile-web-app-title" content="@aaafuria" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href={'/favicon/apple-touch-icon.png'}
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href={'/favicon/favicon-32x32.png'}
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href={'/favicon/favicon-16x16.png'}
          />
          <link rel="manifest" href={'/favicon/site.webmanifest'} />
          <link
            rel="mask-icon"
            href={'/favicon/safari-pinned-tab.svg'}
            color="#2f855a"
          />
          <link rel="shortcut icon" href={'/favicon/favicon.ico'} />
          <meta name="application-name" content="@aaafuria" />
          <meta name="msapplication-TileColor" content="#ffffff" />
          <meta
            name="msapplication-config"
            content={'/favicon/browserconfig.xml'}
          />
          <meta name="theme-color" content="#2F855A"></meta>
          <link
            rel="preload"
            href="/fonts/woff2/AACHENN.woff2"
            as="font"
            crossOrigin=""
          />
          <link
            rel="preload"
            href="/fonts/woff2/Lato-Regular.woff2"
            as="font"
            crossOrigin=""
          />
          <link
            rel="preload"
            href="/fonts/woff2/Lato-Bold.woff2"
            as="font"
            crossOrigin=""
          />
        </Head>
        <body>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
