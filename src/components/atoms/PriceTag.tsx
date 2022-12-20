import {
  HStack,
  StackProps,
  Text,
  TextProps,
  useColorModeValue as mode,
} from '@chakra-ui/react';

import { trpc } from '@/utils/trpc';

interface PriceTagProps {
  currency: string;
  price: number;
  salePrice?: number;
  rootProps?: StackProps;
  priceProps?: TextProps;
  salePriceProps?: TextProps;
}

interface PriceProps {
  children?: React.ReactNode;
  isOnSale?: boolean;
  textProps?: TextProps;
}

const Price = (props: PriceProps) => {
  const { isOnSale, children, textProps } = props;
  const defaultColor = mode('gray.700', 'gray.400');
  const onSaleColor = mode('gray.400', 'gray.700');
  const color = isOnSale ? onSaleColor : defaultColor;
  return (
    <Text
      as="span"
      fontWeight="medium"
      color={color}
      textDecoration={isOnSale ? 'line-through' : 'none'}
      {...textProps}
    >
      {children}
    </Text>
  );
};

const SalePrice = (props: TextProps) => (
  <Text
    as="span"
    fontWeight="semibold"
    color={mode('gray.800', 'gray.100')}
    {...props}
  />
);

export type FormatPriceOptions = { locale?: string; currency?: string };

export function formatPrice(
  value: number,
  opts: { locale?: string; currency?: string } = {},
) {
  const { locale = 'pt-BR', currency = 'BRL' } = opts;
  const formatter = new Intl.NumberFormat(locale, {
    currency,
    style: 'currency',
    maximumFractionDigits: 2,
  });
  return formatter.format(value);
}

export function PriceTag(props: PriceTagProps) {
  const { price, currency, salePrice, rootProps, priceProps, salePriceProps } =
    props;

  const { data: isMember } = trpc.auth.isMember.useQuery();

  return (
    <HStack spacing="1" {...rootProps}>
      <Price isOnSale={!!salePrice && isMember} textProps={priceProps}>
        {formatPrice(price, { currency })}
      </Price>
      {salePrice && isMember && (
        <SalePrice {...salePriceProps}>
          {formatPrice(salePrice, { currency })}
        </SalePrice>
      )}
    </HStack>
  );
}
