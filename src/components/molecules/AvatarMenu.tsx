import {
  Badge,
  Box,
  Button,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
} from '@chakra-ui/react';
import { signOut, useSession } from 'next-auth/react';

import { CgChevronDown } from 'react-icons/cg';
import { CustomAvatar } from '../atoms';
import NextLink from 'next/link';
import { ReactNode } from 'react';

interface AvatarMenuProps {
  children?: ReactNode;
}

export function AvatarMenu({}: AvatarMenuProps) {
  const { data: session } = useSession();
  const isMember = session?.user.isMember;

  return (
    <Menu>
      <MenuButton
        as={Button}
        display={'flex'}
        alignItems={'center'}
        variant={'unstyled'}
        rightIcon={<CgChevronDown />}
      >
        <CustomAvatar />
      </MenuButton>
      <MenuList fontSize={'sm'}>
        <MenuItem as={NextLink} href={'/dashboard/profile'}>
          <Text>
            Olá{'  '}
            <Text as="span" fontWeight={'semibold'}>
              {session?.user?.name?.split(' ')[0]}
            </Text>
            !
          </Text>
        </MenuItem>

        <MenuDivider />

        <MenuItem as={NextLink} href="/sejasocio">
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
        <MenuItem as={NextLink} href="/dashboard/orders">
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
  );
}
