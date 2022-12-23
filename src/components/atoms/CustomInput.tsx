import { Input, InputProps } from '@chakra-ui/react';
import { forwardRef, useContext } from 'react';

import { ColorContext } from '@/contexts';

export const CustomInput = forwardRef<HTMLInputElement, InputProps>(
  ({ ...rest }, ref) => {
    const { green } = useContext(ColorContext);
    return <Input ref={ref} focusBorderColor={green} {...rest} />;
  },
);

CustomInput.displayName = 'CustomInput';
