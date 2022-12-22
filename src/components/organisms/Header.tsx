import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Link,
  Text,
} from '@chakra-ui/react';

import { AvatarMenu } from '../molecules';
import { HeaderAlert } from '../atoms';
import NextImage from 'next/image';
import NextLink from 'next/link';
import { ReactNode } from 'react';
import { trpc } from '@/utils/trpc';
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

export function Header({}: HeaderProps) {
  const menuItems = [
    { href: '/', label: 'Início' },
    { href: '/store', label: 'Loja' },
    { href: '/activities', label: 'Atividades' },
    { href: '/sejasocio', label: 'Seja Sócio', cta: true },
  ];

  const { status } = useSession();
  const isAuth = status === 'authenticated';

  const { data: hasPendingOrders } = trpc.store.hasPendingOrders.useQuery();

  return (
    <Box borderBottomWidth={1}>
      {hasPendingOrders && (
        <HeaderAlert>
          <Text>
            Você possui pedidos pendentes, para ver acesse{' '}
            <Link as={NextLink} href="/dashboard/my-orders">
              <Text as="span" fontWeight="bold">
                meus pedidos
              </Text>
            </Link>
            .
          </Text>
        </HeaderAlert>
      )}
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
        {isAuth ? (
          <AvatarMenu />
        ) : (
          <Button colorScheme={'green'} as={NextLink} href="/login">
            Entrar
          </Button>
        )}
      </Container>
    </Box>
  );
}
