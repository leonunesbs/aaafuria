import { Avatar, AvatarProps } from '@chakra-ui/react';

import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface CustomAvatarProps extends AvatarProps {
  children?: ReactNode;
}

export function CustomAvatar({ size = 'sm', ...rest }: CustomAvatarProps) {
  const { data: session } = useSession();
  return (
    <Avatar
      borderColor={'gray.400'}
      size={size}
      name={session?.user?.name as string}
      src={session?.user?.image as string}
      {...rest}
    />
  );
}
