import { Children, ReactNode, isValidElement, useMemo } from 'react';

import { SimpleGrid } from '@chakra-ui/react';

interface ActivityGridProps {
  children: ReactNode;
}

export function ActivityGrid({ children, ...rest }: ActivityGridProps) {
  const columns = useMemo(() => {
    const count = Children.toArray(children).filter(isValidElement).length;
    return {
      base: Math.min(1, count),
      md: Math.min(2, count),
      lg: Math.min(3, count),
      xl: Math.min(4, count),
    };
  }, [children]);
  return (
    <SimpleGrid
      columns={columns}
      columnGap={{ base: '4', md: '6' }}
      rowGap={{ base: '8', md: '10' }}
      {...rest}
    >
      {children}
    </SimpleGrid>
  );
}
