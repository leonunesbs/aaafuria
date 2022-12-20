import {
  Box,
  Button,
  Center,
  Container,
  Divider,
  FormControl,
  HStack,
  Heading,
  Input,
  Link,
  Stack,
  Text,
  chakra,
} from '@chakra-ui/react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { GetServerSideProps } from 'next';
import Image from 'next/image';
import NextLink from 'next/link';
import { OAuthButtonGroup } from '@/components/molecules';
import { authOptions } from './api/auth/[...nextauth]';
import { signIn } from 'next-auth/react';
import { unstable_getServerSession } from 'next-auth';
import { useState } from 'react';

function Login() {
  const { register, handleSubmit } = useForm<{ email: string }>();
  const ChakraNextImage = chakra(Image);
  const [isLoading, setIsLoading] = useState(false);
  const onSubmit: SubmitHandler<{ email: string }> = async ({ email }) => {
    setIsLoading(true);
    signIn('email', { email }).finally(() => setIsLoading(false));
  };
  return (
    <Container
      maxW="lg"
      py={{ base: '12', md: '24' }}
      px={{ base: '0', sm: '8' }}
    >
      <Stack spacing="8">
        <Stack spacing="6">
          <Center>
            <Box boxSize="3xs" position="relative" as={NextLink} href="/">
              <ChakraNextImage
                placeholder="blur"
                layout="fill"
                objectFit="cover"
                src={'/calango-verde.png'}
                blurDataURL={'/calango-verde.png'}
                quality={1}
                alt="logo"
                mx="auto"
                mb={{ base: '8', md: '12' }}
                draggable={false}
              />
            </Box>
          </Center>
          <Stack spacing={1} textAlign="center">
            <Heading size={{ base: 'md', md: 'lg' }}>
              Acesse a sua conta
            </Heading>
            <Text textColor={'gray.500'}>
              Você não precisa de uma senha. É mais seguro assim.
            </Text>
          </Stack>
        </Stack>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box
            py={{ base: '0', sm: '8' }}
            px={{ base: '4', sm: '10' }}
            bg={{ base: 'transparent', sm: 'bg-surface' }}
            borderWidth={{ base: '0', sm: 1 }}
            borderRadius={{ base: 'none', sm: 'xl' }}
          >
            <Stack spacing="4">
              <FormControl>
                <Input
                  type="email"
                  placeholder="Digite seu email"
                  {...register('email')}
                />
              </FormControl>
              <Stack spacing="6">
                <Button
                  colorScheme={'green'}
                  type="submit"
                  isLoading={isLoading}
                >
                  Entrar com Email
                </Button>
                <HStack>
                  <Divider />
                  <Text fontSize="sm" whiteSpace="nowrap" color="muted">
                    ou
                  </Text>
                  <Divider />
                </HStack>
                <OAuthButtonGroup />
              </Stack>
            </Stack>
          </Box>
        </form>
        <Text textAlign={'center'} fontSize="sm">
          Não consegue entrar?{' '}
          <Link as={NextLink} href="/contact">
            {' '}
            <Text as="span" color={'green.500'}>
              Fale conosco
            </Text>
          </Link>
        </Text>
      </Stack>
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await unstable_getServerSession(
    ctx.req,
    ctx.res,
    authOptions,
  );

  if (session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
};

export default Login;
