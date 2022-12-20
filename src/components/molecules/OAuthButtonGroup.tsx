import { Button, Stack, Text } from '@chakra-ui/react';
import { GitHubIcon, GoogleIcon } from '../atoms';

import { ReactNode } from 'react';
import { signIn } from 'next-auth/react';

interface OAuthButtonGroupProps {
  children?: ReactNode;
}

export function OAuthButtonGroup({}: OAuthButtonGroupProps) {
  const providers = [
    { name: 'Google', icon: <GoogleIcon boxSize="5" /> },
    { name: 'GitHub', icon: <GitHubIcon boxSize="5" /> },
  ];

  return (
    <Stack spacing="4" width="full">
      {providers.map(({ name, icon }) => (
        <Button
          key={name}
          variant="outline"
          fontWeight={'normal'}
          width="full"
          onClick={() => signIn(name.toLocaleLowerCase())}
          leftIcon={icon}
        >
          <Text>Entrar com {name}</Text>
        </Button>
      ))}
    </Stack>
  );
}
