import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Container,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { isIOS } from 'react-device-detect';

function VerifyRequest() {
  const [emailDomain, setEmailDomain] = useState<string | null>(null);

  const provider = emailDomain?.split('.')[0];

  const schemaUrl: { [key: string]: string } = {
    gmail: 'googlegmail://',
    outlook: 'ms-outlook://',
    yahoo: 'ymail://',
  };

  useEffect(() => {
    if (localStorage) {
      setEmailDomain(localStorage.getItem('@aaafuria:emailDomain'));
    }
  }, []);

  return (
    <Container
      maxW="md"
      py={{ base: '12', md: '24' }}
      px={{ base: '0', sm: '8' }}
    >
      <Head>
        <title>Verifique seu email » A.A.A. Fúria</title>
      </Head>
      <Stack spacing="6">
        <Card>
          <CardHeader>
            <Heading size="md" textAlign={'center'}>
              VERIFIQUE SEU EMAIL
            </Heading>
          </CardHeader>
          <CardBody>
            <Heading size="sm" textAlign={'center'} fontFamily="Lato">
              Enviamos um email para você com um link de acesso, verifique sua
              caixa de entrada e clique no botão para acessar sua conta.
            </Heading>
          </CardBody>
          {emailDomain && (
            <CardFooter>
              <Stack>
                <Text textAlign={'center'} fontSize="sm">
                  Se preferir use o botão abaixo para acesso rápido ao seu
                  serviço de email.
                </Text>
                <Button
                  as={Link}
                  href={
                    isIOS
                      ? schemaUrl[provider as string]
                      : `https://${emailDomain}`
                  }
                  textAlign={'center'}
                  onClick={() => {
                    localStorage.removeItem('@aaafuria:emailDomain');
                  }}
                  variant="outline"
                  leftIcon={
                    <Image
                      src={`/${provider}.png`}
                      alt={provider as string}
                      width={30}
                      height={30}
                    />
                  }
                >
                  Ir para {provider?.toLocaleUpperCase()}
                </Button>
                <Button
                  as={Link}
                  href={'/auth/login'}
                  onClick={() => {
                    localStorage.removeItem('@aaafuria:emailDomain');
                  }}
                >
                  Voltar
                </Button>
              </Stack>
            </CardFooter>
          )}
        </Card>
      </Stack>
    </Container>
  );
}

export default VerifyRequest;
