import { Alert, AlertIcon, AlertProps } from '@chakra-ui/react';

import { ReactNode } from 'react';

interface HeaderAlertProps extends AlertProps {
  children: ReactNode;
}

export function HeaderAlert({ children, ...rest }: HeaderAlertProps) {
  const { status } = rest;
  return (
    <Alert
      status={status}
      fontSize={'sm'}
      px={{ base: '4', md: '8', lg: '12' }}
    >
      <AlertIcon />
      {children}
    </Alert>
  );
}
