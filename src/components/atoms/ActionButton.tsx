import { Button, ButtonProps } from '@chakra-ui/react';
import { ReactNode, forwardRef } from 'react';

interface ActionButtonProps extends ButtonProps {
  children?: ReactNode;
}

export const ActionButton = forwardRef<any, ActionButtonProps>(
  ({ ...rest }, ref) => {
    return (
      <Button
        ref={ref}
        colorScheme="green"
        size="lg"
        w="full"
        fontWeight="extrabold"
        py={{ md: '8' }}
        {...rest}
      />
    );
  },
);

ActionButton.displayName = 'ActionButton';
