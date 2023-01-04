import { Flex } from '@chakra-ui/react';
import NextImage from 'next/image';
import NextLink from 'next/link';
import { ReactNode } from 'react';

interface LogoProps {
  children?: ReactNode;
}

export function Logo({}: LogoProps) {
  return (
    <Flex
      as={NextLink}
      href="/"
      position={'relative'}
      h={'44px'}
      w={'76px'}
      mr={4}
    >
      <NextImage
        priority
        sizes="15vw"
        src={'/header-logo.webp'}
        alt={'headerLogo'}
        fill
        style={{
          position: 'absolute',
          objectFit: 'cover',
        }}
      />
    </Flex>
  );
}
