import { Button, ButtonProps } from '@chakra-ui/react';
import { ReactNode, forwardRef } from 'react';

import { useSession } from 'next-auth/react';

interface ActionButtonProps extends ButtonProps {
  children?: ReactNode;
}

export const ActionButton = forwardRef<any, ActionButtonProps>(
  ({ ...rest }, ref) => {
    const { data: session } = useSession();
    return (
      <Button
        ref={ref}
        colorScheme="green"
        size="lg"
        w="full"
        fontWeight="extrabold"
        py={{ md: '8' }}
        isDisabled={session?.user?.isMember}
        {...rest}
      />
    );
  },
);

ActionButton.displayName = 'ActionButton';
