import {
  Alert,
  AlertIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
} from '@chakra-ui/react';
import { signOut, useSession } from 'next-auth/react';

import { CgChevronDown } from 'react-icons/cg';
import NextImage from 'next/image';
import NextLink from 'next/link';
import { ReactNode } from 'react';
import { trpc } from '@/utils/trpc';
import { useRouter } from 'next/router';

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
  const { data: session, status } = useSession();
  const menuItems = [
    { href: '/', label: 'Início' },
    { href: '/store', label: 'Loja' },
    { href: '/activities', label: 'Atividades' },
    { href: '/sejasocio', label: 'Seja Sócio', cta: true },
  ];

  const isAuth = status === 'authenticated';

  const { data: isMember } = trpc.auth.isMember.useQuery();
  const { data: hasPendingOrders } = trpc.store.hasPendingOrders.useQuery();

  return (
    <Box boxShadow="sm" borderBottomWidth={1}>
      {hasPendingOrders && (
        <Alert
          status="info"
          fontSize={'sm'}
          px={{ base: '4', md: '8', lg: '12' }}
        >
          <AlertIcon />
          <Text>
            Você possui pedidos pendentes, para ver acesse{' '}
            <Link as={NextLink} href="/dashboard/my-orders">
              <Text as="span" fontWeight="bold">
                meus pedidos
              </Text>
            </Link>
            .
          </Text>
        </Alert>
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
              sizes="20vw"
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
          <Menu>
            <MenuButton
              as={Button}
              display={'flex'}
              alignItems={'center'}
              variant={'unstyled'}
              rightIcon={<CgChevronDown />}
            >
              <Avatar
                borderColor={'gray.400'}
                size="sm"
                name={session?.user?.name as string}
                src={session?.user?.image as string}
              />
            </MenuButton>
            <MenuList fontSize={'sm'}>
              <MenuItem>
                <Text>
                  Olá{'  '}
                  <Text as="span" fontWeight={'semibold'}>
                    {session?.user?.name?.split(' ')[0]}
                  </Text>
                  !
                </Text>
              </MenuItem>
              <MenuDivider />
              <MenuItem>
                <Box w="full" textAlign="center">
                  {isMember ? (
                    <Badge colorScheme={'green'}>SÓCIO FÚRIA</Badge>
                  ) : (
                    <Badge colorScheme={'gray'}>NÃO SÓCIO</Badge>
                  )}
                </Box>
              </MenuItem>
              <MenuDivider />

              <MenuItem as={NextLink} href="/store">
                Loja
              </MenuItem>
              <MenuItem as={NextLink} href="/store/cart">
                Meu carrinho
              </MenuItem>
              <MenuItem as={NextLink} href="/dashboard/my-orders">
                Meus pedidos
              </MenuItem>
              <MenuDivider />
              <MenuItem as={NextLink} href="/activities">
                Atividades
              </MenuItem>
              <MenuDivider />
              <MenuItem as={NextLink} href="/dashboard">
                Área do Membro
              </MenuItem>
              <MenuItem as={NextLink} href="/admin">
                Área do Diretor
              </MenuItem>
              <MenuDivider />
              <MenuItem onClick={() => signOut()}>Sair</MenuItem>
            </MenuList>
          </Menu>
        ) : (
          <Button colorScheme={'green'} as={NextLink} href="/login">
            Entrar
          </Button>
        )}
      </Container>
    </Box>
  );
}
