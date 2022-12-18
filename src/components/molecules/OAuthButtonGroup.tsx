import { Button, ButtonGroup, VisuallyHidden } from '@chakra-ui/react';
import { GitHubIcon, GoogleIcon, TwitterIcon } from '../atoms';

import { ReactNode } from 'react';
import { signIn } from 'next-auth/react';

interface OAuthButtonGroupProps {
  children?: ReactNode;
}

export function OAuthButtonGroup({}: OAuthButtonGroupProps) {
  const providers = [
    { name: 'Google', icon: <GoogleIcon boxSize="5" /> },
    { name: 'Twitter', icon: <TwitterIcon boxSize="5" /> },
    { name: 'GitHub', icon: <GitHubIcon boxSize="5" /> },
  ];

  return (
    <ButtonGroup variant="outline" spacing="4" width="full">
      {providers.map(({ name, icon }) => (
        <Button
          key={name}
          width="full"
          onClick={() => signIn(name.toLocaleLowerCase())}
        >
          <VisuallyHidden>Sign in with {name}</VisuallyHidden>
          {icon}
        </Button>
      ))}
    </ButtonGroup>
  );
}
