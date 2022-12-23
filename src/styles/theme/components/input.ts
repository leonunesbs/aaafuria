import { ComponentStyleConfig } from '@chakra-ui/react';

const Input: ComponentStyleConfig = {
  defaultProps: {
    focusBorderColor: 'green.500',
    _dark: {
      focusBorderColor: 'green.200',
    },
  },
};

export default Input;
