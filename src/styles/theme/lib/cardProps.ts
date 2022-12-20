export const cardProps = (colorMode: string, z = 0) => {
  const baseProps = {
    px: [2, 4],
    py: [4, 6],
    boxShadow: colorMode == 'light' ? ['sm', 'base'] : 'none',
    bgColor: colorMode == 'light' ? 'white' : 'whiteAlpha.50',
    rounded: ['none', 'md'],
  };

  if (z !== 0) {
    return {
      ...baseProps,
      bgColor: colorMode == 'light' ? 'gray.50' : `whiteAlpha.${z * 100}`,
    };
  }

  return baseProps;
};
