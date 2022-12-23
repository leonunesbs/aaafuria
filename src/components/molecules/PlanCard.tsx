import {
  BoxProps,
  Card,
  CardProps,
  Flex,
  FlexProps,
  Heading,
  List,
  ListIcon,
  ListItem,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { ReactElement, useContext } from 'react';

import { ColorContext } from '@/contexts';
import { HiCheckCircle } from 'react-icons/hi';

export interface PricingCardData {
  features: string[];
  name: string;
  price: string;
}

interface PricingCardProps extends CardProps {
  data: PricingCardData;
  button: ReactElement;
  isPopular?: boolean;
}

const CardBadge = (props: FlexProps) => {
  const { children, ...flexProps } = props;
  const { green } = useContext(ColorContext);
  return (
    <Flex
      bg={green}
      position="absolute"
      right={-20}
      top={6}
      width="240px"
      transform="rotate(45deg)"
      py={2}
      justifyContent="center"
      alignItems="center"
      {...flexProps}
    >
      <Text
        fontSize="xs"
        textTransform="uppercase"
        fontWeight="bold"
        letterSpacing="wider"
        color={useColorModeValue('white', 'gray.800')}
      >
        {children}
      </Text>
    </Flex>
  );
};

const CustomCard = (
  props: BoxProps & {
    isPopular?: boolean;
  },
) => {
  const { children, isPopular, ...rest } = props;
  return (
    <Card
      bg={useColorModeValue('white', 'gray.700')}
      position="relative"
      px="6"
      pb="6"
      pt="16"
      overflow="hidden"
      maxW="md"
      width="100%"
      {...rest}
    >
      {isPopular && <CardBadge>Popular</CardBadge>}
      {children}
    </Card>
  );
};

export function PlanCard(props: PricingCardProps) {
  const { data, button, ...rest } = props;
  const { features, price, name } = data;
  const accentColor = useColorModeValue('green.500', 'green.200');
  return (
    <CustomCard rounded={{ sm: 'xl' }} {...rest}>
      <Stack spacing={6}>
        <Heading size="md" fontWeight="extrabold">
          {name}
        </Heading>
      </Stack>
      <Flex
        align="flex-end"
        justify="center"
        fontWeight="extrabold"
        color={accentColor}
        my="8"
      >
        <Heading size="3xl" fontWeight="inherit" lineHeight="0.9em">
          {price}
        </Heading>
        <Text fontWeight="inherit" fontSize="2xl"></Text>
      </Flex>
      <List spacing="4" mb="8" maxW="40ch" mx="auto">
        {features.map((feature, index) => (
          <ListItem fontWeight="medium" key={index}>
            <ListIcon
              fontSize="xl"
              as={HiCheckCircle}
              marginEnd={2}
              color={accentColor}
            />
            {feature}
          </ListItem>
        ))}
      </List>
      {button}
    </CustomCard>
  );
}
