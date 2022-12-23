import { FaMoon, FaSun } from 'react-icons/fa';
import { IconButton, useColorMode } from '@chakra-ui/react';

import { ReactNode } from 'react';

interface ColorModeButtonProps {
  children?: ReactNode;
}

export function ColorModeButton({ ...rest }: ColorModeButtonProps) {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <IconButton
      variant={'ghost'}
      aria-label={'Toggle color mode'}
      icon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
      onClick={toggleColorMode}
      {...rest}
    />
  );
}
