import {
  Box,
  Flex,
  HStack,
  Heading,
  Icon,
  Link,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';

import { ColorContext } from '@/contexts';
import { FaArrowRight } from 'react-icons/fa';
import { Layout } from '@/components/templates';
import NextImage from 'next/image';
import NextLink from 'next/link';
import { useContext } from 'react';

export default function Home() {
  const { green } = useContext(ColorContext);
  return (
    <Layout title="Início">
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
              <Heading size="xl" color={green}>
                A.A.A. FÚRIA
              </Heading>
              <Heading size="lg" fontWeight="normal" fontFamily={'Lato'}>
                Venha fazer parte da maior atlética universitária do Piauí!
              </Heading>
            </Stack>
            <HStack spacing="3">
              <Link
                as={NextLink}
                href="/sejasocio"
                color={green}
                fontWeight="bold"
                fontSize="lg"
              >
                Seja Sócio
              </Link>
              <Icon color={green} as={FaArrowRight} />
            </HStack>
          </Stack>
        </Box>
        <Flex flex="1" overflow="hidden" zIndex={-10}>
          <Flex position={'relative'} minW="300px" h="450px" w="full">
            <NextImage
              quality={50}
              sizes="(max-width: 768px) 70vw,
              (max-width: 1200px) 35vw,
              20vw"
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
              quality={50}
              sizes="(max-width: 768px) 70vw,
              (max-width: 1200px) 35vw,
              20vw"
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
          <Text>Sócios ativos</Text>
        </Box>
        <Box textAlign={'center'}>
          <Text fontFamily="AACHENN" fontSize={'4xl'}>
            10+
          </Text>
          <Text>Modalidades</Text>
        </Box>
        <Box textAlign={'center'}>
          <Text fontFamily="AACHENN" fontSize={'4xl'}>
            200+
          </Text>
          <Text>Atletas e ritmistas</Text>
        </Box>
      </Stack>
    </Layout>
  );
}

export const getServerSideProps = async () => {
  return {
    props: {},
  };
};
