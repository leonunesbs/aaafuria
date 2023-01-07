import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogProps,
  Button,
  ButtonProps,
} from '@chakra-ui/react';

import { useRef } from 'react';

interface CustomAlertDialogProps
  extends Omit<AlertDialogProps, 'leastDestructiveRef' | 'children'> {
  title: string;
  description?: string;
  buttonText: string;
  actionButtonProps?: ButtonProps;
  enterAction?: 'left' | 'right';
}

export function CustomAlertDialog({
  enterAction = 'left',
  ...rest
}: CustomAlertDialogProps) {
  const leastDestructive = useRef<HTMLButtonElement>(null);

  const { onClose, isOpen, title, description, actionButtonProps, buttonText } =
    rest;
  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={onClose}
      leastDestructiveRef={leastDestructive}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {title}
          </AlertDialogHeader>
          <AlertDialogBody>{description}</AlertDialogBody>
          <AlertDialogFooter>
            {enterAction === 'left' ? (
              <>
                <Button ref={leastDestructive} onClick={onClose}>
                  Cancelar
                </Button>
                <Button ml={3} colorScheme="red" {...actionButtonProps}>
                  {buttonText}
                </Button>
              </>
            ) : (
              <>
                <Button onClick={onClose}>Cancelar</Button>
                <Button
                  ref={leastDestructive}
                  ml={3}
                  colorScheme="red"
                  {...actionButtonProps}
                >
                  {buttonText}
                </Button>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
