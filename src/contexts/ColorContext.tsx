import { createContext } from 'react';
import { useColorModeValue } from '@chakra-ui/react';

interface ColorContextProps {
  green: string;
}

interface ColorProviderProps {
  children: React.ReactNode;
}

export const ColorContext = createContext({} as ColorContextProps);

export function ColorProvider({ children }: ColorProviderProps) {
  const green = useColorModeValue('green.500', 'green.200');

  return (
    <ColorContext.Provider
      value={{
        green,
      }}
    >
      {children}
    </ColorContext.Provider>
  );
}
