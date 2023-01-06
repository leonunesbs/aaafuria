import {
  Box,
  Button,
  ButtonProps,
  Center,
  Divider,
  Flex,
  HStack,
  Heading,
  IconButton,
  IconButtonProps,
  SimpleGrid,
  Stack,
  Text,
  Wrap,
  WrapItem,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaArrowRight, FaDrum } from 'react-icons/fa';
import {
  MdSportsBasketball,
  MdSportsEsports,
  MdSportsHandball,
  MdSportsSoccer,
  MdSportsVolleyball,
} from 'react-icons/md';

import { ColorContext } from '@/contexts';
import { GetStaticProps } from 'next';
import { GiPokerHand } from 'react-icons/gi';
import { ItemsWithFamily } from './store';
import { Layout } from '@/components/templates';
import NextImage from 'next/image';
import NextLink from 'next/link';
import { ProductCard } from '@/components/molecules';
import { prisma } from '@/server/prisma';
import { useContext } from 'react';

type ButtonNextLink = ButtonProps & {
  href: string;
};

const CTAButton = ({ href, children, ...rest }: ButtonNextLink) => (
  <Button as={NextLink} href={href} {...rest}>
    {children}
  </Button>
);

const CustomIconButton = ({ ...rest }: IconButtonProps) => (
  <IconButton
    as={NextLink}
    href="/activities"
    size="lg"
    colorScheme="green"
    variant="link"
    {...rest}
  />
);

const WrappedActivities = () => {
  const size = useBreakpointValue([40, 50]);
  const activities = [
    {
      name: 'Carabina',
      icon: <FaDrum size={size} />,
    },
    {
      name: 'Basquete',
      icon: <MdSportsBasketball size={size} />,
    },
    {
      name: 'Handebol',
      icon: <MdSportsHandball size={size} />,
    },
    {
      name: 'Futsal',
      icon: <MdSportsSoccer size={size} />,
    },
    {
      name: 'Vôlei',
      icon: <MdSportsVolleyball size={size} />,
    },
    {
      name: 'E-sports',
      icon: <MdSportsEsports size={size} />,
    },
    {
      name: 'Truco',
      icon: <GiPokerHand size={size} />,
    },
    {
      name: 'Poker',
      icon: <GiPokerHand size={size} />,
    },
  ];
  return (
    <Wrap spacing={10} justify="center">
      {activities.map((activity) => (
        <WrapItem key={activity.name}>
          <Stack>
            <CustomIconButton aria-label="basquete" icon={activity.icon} />
            <Heading as="h3" size="sm">
              {activity.name.toUpperCase()}
            </Heading>
          </Stack>
        </WrapItem>
      ))}
    </Wrap>
  );
};

export default function Home({ items }: { items: ItemsWithFamily[] }) {
  const { green } = useContext(ColorContext);
  return (
    <Layout title="A maior do Piauí">
      <Stack
        direction={{ base: 'column-reverse', lg: 'row' }}
        spacing={{ base: '0', lg: '20' }}
      >
        <Box
          width={{ lg: 'sm' }}
          transform={{ base: 'translateY(-50%)', lg: 'none' }}
          bg={{
            base: useColorModeValue('green.50', 'gray.700'),
            lg: 'transparent',
          }}
          mx={{ base: '6', md: '8', lg: '0' }}
          mb={{ base: '-20', lg: 'none' }}
          px={{ base: '6', md: '8', lg: '0' }}
          py={{ base: '6', md: '8', lg: '12' }}
        >
          <Stack spacing={{ base: '8', lg: '10' }}>
            <Stack spacing={{ base: '2', lg: '4' }}>
              <Heading size="xl" as="h2" color={green}>
                A.A.A. FÚRIA
              </Heading>
              <Heading
                size="lg"
                as="h1"
                fontWeight="normal"
                fontFamily={'Lato'}
              >
                Venha fazer parte da maior atlética universitária do Piauí!
              </Heading>
            </Stack>
            <HStack spacing="3">
              <CTAButton
                href="/sejasocio"
                rightIcon={<FaArrowRight />}
                colorScheme="green"
                variant={'solid'}
                size="lg"
              >
                Seja Sócio
              </CTAButton>
            </HStack>
          </Stack>
        </Box>
        <Flex flex="1" overflow="hidden" zIndex={-10}>
          <Flex position={'relative'} minW="300px" h="450px" w="full">
            <NextImage
              priority
              sizes="(max-width: 768px) 100vw,
              (max-width: 1200px) 80vw,
              40vw"
              src="/image01.webp"
              placeholder="blur"
              blurDataURL="/image02.webp"
              alt={'image01'}
              fill
              style={{
                position: 'absolute',
                objectFit: 'cover',
              }}
            />
          </Flex>
          <Flex
            position={'relative'}
            minW="300px"
            h="450px"
            w="full"
            display={{ base: 'none', sm: 'initial' }}
          >
            <NextImage
              sizes="(max-width: 768px) 100vw,
              (max-width: 1200px) 80vw,
              40vw"
              src="/image02.webp"
              placeholder="blur"
              blurDataURL="/image02.webp"
              alt={'image02'}
              fill
              style={{
                position: 'absolute',
                objectFit: 'cover',
              }}
            />
          </Flex>
        </Flex>
      </Stack>
      <Stack
        direction={{ base: 'column', sm: 'row' }}
        spacing={6}
        my={4}
        py={6}
        bg={green}
        color={useColorModeValue('white', 'gray.800')}
        w="full"
        justify={'space-around'}
        textTransform="uppercase"
        fontWeight={'bold'}
      >
        <Box textAlign={'center'}>
          <Text fontFamily="AACHENN" fontSize={'4xl'}>
            150+
          </Text>
          <Text as="h3">Sócios ativos</Text>
        </Box>
        <Box textAlign={'center'}>
          <Text fontFamily="AACHENN" fontSize={'4xl'}>
            10+
          </Text>
          <Text as="h3">Modalidades</Text>
        </Box>
        <Box textAlign={'center'}>
          <Text fontFamily="AACHENN" fontSize={'4xl'}>
            200+
          </Text>
          <Text as="h3">Atletas e ritmistas</Text>
        </Box>
      </Stack>
      <Divider my={6} />
      <SimpleGrid columns={[1, 2]} gap={4}>
        <Stack spacing={4}>
          <Heading as="h2" size="xl">
            Loja
          </Heading>
          <Stack direction={'row'} overflowX="auto" spacing={4} pb={2}>
            <ProductCard item={items[0]} />
            <ProductCard item={items[0]} />
            <ProductCard item={items[0]} />
            <ProductCard item={items[0]} />
            <ProductCard item={items[0]} />
            <ProductCard item={items[0]} />
            <ProductCard item={items[0]} />
            <ProductCard item={items[0]} />
            <ProductCard item={items[0]} />
            <ProductCard item={items[0]} />
            <ProductCard item={items[0]} />
            <ProductCard item={items[0]} />
            <ProductCard item={items[0]} />
          </Stack>
          <HStack w="full" justify={'flex-end'}>
            <CTAButton
              href="/store"
              colorScheme="green"
              variant={'link'}
              rightIcon={<FaArrowRight />}
            >
              Ver tudo
            </CTAButton>
          </HStack>
        </Stack>
        <Divider display={['flex', 'none']} my={4} />
        <Stack spacing={4}>
          <Heading as="h2" size="xl">
            Atividades
          </Heading>
          <Center h="100%" py={6}>
            <WrappedActivities />
          </Center>
          <HStack w="full" justify={'flex-end'}>
            <CTAButton
              href="/activities"
              colorScheme="green"
              variant={'link'}
              rightIcon={<FaArrowRight />}
            >
              Ver tudo
            </CTAButton>
          </HStack>
        </Stack>
      </SimpleGrid>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const items = await prisma.item.findMany({});
  return {
    props: {
      items: JSON.parse(JSON.stringify(items)),
    },
  };
};
