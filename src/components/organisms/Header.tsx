import {
  Box,
  BoxProps,
  Button,
  Container,
  Flex,
  HStack,
} from '@chakra-ui/react';

import { AvatarMenu } from '../molecules';
import { ColorModeButton } from '../atoms';
import NextImage from 'next/image';
import NextLink from 'next/link';
import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

interface HeaderProps {
  children?: ReactNode;
}

const CustomMenuItem = ({
  href,
  children,
  cta,
}: {
  href: string;
  children: ReactNode;
  cta?: boolean;
}) => {
  const router = useRouter();

  const isActive = router.pathname === href;
  return (
    <Button
      variant={'ghost'}
      as={NextLink}
      href={href}
      size="sm"
      mr={1}
      colorScheme={cta ? 'green' : 'gray'}
      isActive={isActive}
    >
      {children}
    </Button>
  );
};

export function Header({ ...rest }: BoxProps) {
  const menuItems = [
    { href: '/', label: 'Início' },
    { href: '/store', label: 'Loja' },
    { href: '/activities', label: 'Atividades' },
    { href: '/sejasocio', label: 'Seja Sócio', cta: true },
  ];

  const { status } = useSession();
  const isAuth = status === 'authenticated';

  return (
    <Box borderBottomWidth={1} {...rest}>
      <Container
        as="nav"
        display={'flex'}
        flexDir="row"
        justifyContent={'space-between'}
        alignItems="center"
        flexWrap={'wrap'}
        maxW="8xl"
        px={{ base: '3', md: '7', lg: '10' }}
        py={2}
      >
        <HStack>
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
          <HStack display={['none', 'none', 'flex']}>
            {menuItems.map((item) => (
              <CustomMenuItem
                key={item.href.split('/').join('')}
                href={item.href}
                cta={item.cta}
              >
                {item.label}
              </CustomMenuItem>
            ))}
          </HStack>
        </HStack>
        <HStack>
          <ColorModeButton />
          {isAuth ? (
            <AvatarMenu />
          ) : (
            <Button colorScheme={'green'} as={NextLink} href="/auth/login">
              Entrar
            </Button>
          )}
        </HStack>
      </Container>
    </Box>
  );
}
