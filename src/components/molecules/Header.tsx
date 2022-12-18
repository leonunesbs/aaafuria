import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Container,
  Flex,
  Link,
  Text,
  useDisclosure,
} from '@chakra-ui/react';

import NextLink from 'next/link';
import { ReactNode } from 'react';
import { trpc } from '@/utils/trpc';
import { useRouter } from 'next/router';

interface HeaderProps {
  children?: ReactNode;
}

const MenuItem = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => {
  const router = useRouter();
  return (
    <Button variant={'link'} mr={1} onClick={() => router.push(href)}>
      {children}
    </Button>
  );
};

export function Header({}: HeaderProps) {
  const { isOpen, onToggle } = useDisclosure();

  const menuItems = [
    { href: '/', label: 'Início' },
    { href: '/store', label: 'Loja' },
    { href: '/contact', label: 'Contact' },
  ];

  const { data: hasPendingOrders } = trpc.store.hasPendingOrders.useQuery();

  return (
    <Box>
      {hasPendingOrders && (
        <Alert status="info" fontSize={'sm'}>
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
        py={6}
        display={'flex'}
        flexDir="row"
        justifyContent={'space-between'}
        alignItems="center"
        flexWrap={'wrap'}
        maxW="8xl"
      >
        <Flex align="center" mr={5}>
          <Text fontSize="xl" fontWeight="bold">
            AAAFURIA
          </Text>
        </Flex>

        <Box display={{ base: 'block', md: 'none' }} onClick={() => onToggle()}>
          <svg
            fill="black"
            width="12px"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Menu</title>
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
          </svg>
        </Box>

        <Box
          display={{ base: isOpen ? 'block' : 'none', md: 'flex' }}
          width={{ base: 'full', md: 'auto' }}
          alignItems="center"
          flexGrow={1}
        >
          {menuItems.map((item) => (
            <MenuItem key={item.href.split('/').join('')} href={item.href}>
              {item.label}
            </MenuItem>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
