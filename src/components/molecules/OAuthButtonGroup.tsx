import { Button, Stack, Text } from '@chakra-ui/react';
import { GitHubIcon, GoogleIcon } from '../atoms';
import { ReactNode, useState } from 'react';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';

interface OAuthButtonGroupProps {
  children?: ReactNode;
}

export function OAuthButtonGroup({}: OAuthButtonGroupProps) {
  const router = useRouter();
  const { callbackUrl } = router.query;
  const providers = [
    { name: 'Google', icon: <GoogleIcon boxSize="5" /> },
    { name: 'GitHub', icon: <GitHubIcon boxSize="5" /> },
  ];
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (provider: string) => {
    setLoading(true);
    await signIn(provider, {
      callbackUrl: callbackUrl ? (callbackUrl as string) : undefined,
    }).then(() => setLoading(false));
  };

  return (
    <Stack spacing="4" width="full">
      {providers.map(({ name, icon }) => (
        <Button
          key={name}
          variant="outline"
          fontWeight={'normal'}
          width="full"
          onClick={() => handleSignIn(name.toLowerCase())}
          leftIcon={icon}
          isLoading={loading}
          loadingText={'Carregando...'}
        >
          <Text>Entrar com {name}</Text>
        </Button>
      ))}
    </Stack>
  );
}
