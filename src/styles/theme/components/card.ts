import { ComponentStyleConfig } from '@chakra-ui/react';

const Card: ComponentStyleConfig = {
  defaultProps: {
    variant: 'outline',
  },
  parts: ['container', 'header', 'body', 'footer'],
  variants: {
    responsive: {
      container: {
        bg: { base: 'transparent', sm: 'bg-surface' },
        borderWidth: { base: '0', sm: 1 },
        borderRadius: { base: 'none', sm: 'xl' },
        py: [0, 6, 8],
        px: [0, 6, 8],
      },
      header: { px: 0 },
      body: { px: 0, pt: 0 },
      footer: { px: 0, pb: 0 },
    },
  },
};
export default Card;
