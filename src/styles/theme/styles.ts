import { ThemeOverride } from '@chakra-ui/react';

const override: ThemeOverride = {
  styles: {
    global: ({}) => ({
      html: {
        height: '100%',
        scrollBehavior: 'smooth',
      },
    }),
  },
};

export default override.styles;
