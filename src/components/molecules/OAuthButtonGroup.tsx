import { Button, Stack, Text } from '@chakra-ui/react';
import { FacebookIcon, GitHubIcon, GoogleIcon, InstagramIcon } from '../atoms';
import { ReactNode, useState } from 'react';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';

interface OAuthButtonGroupProps {
  children?: ReactNode;
}

const OAuthButton = ({ name, icon }: { name: string; icon: JSX.Element }) => {
  const router = useRouter();
  const { callbackUrl } = router.query;
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (provider: string) => {
    setLoading(true);
    await signIn(provider, {
      callbackUrl: callbackUrl ? (callbackUrl as string) : undefined,
    }).finally(() => setLoading(false));
  };
  return (
    <Button
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
  );
};

export function OAuthButtonGroup({}: OAuthButtonGroupProps) {
  const providers = [
    { name: 'Google', icon: <GoogleIcon boxSize="5" /> },
    { name: 'Facebook', icon: <FacebookIcon /> },
    { name: 'Instagram', icon: <InstagramIcon /> },
    { name: 'GitHub', icon: <GitHubIcon boxSize="5" /> },
  ];

  return (
    <Stack spacing="4" width="full">
      {providers.map(({ name, icon }) => (
        <OAuthButton key={name} name={name} icon={icon} />
      ))}
    </Stack>
  );
}
