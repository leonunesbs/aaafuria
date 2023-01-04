import {
  Box,
  BoxProps,
  ButtonGroup,
  Container,
  IconButton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { FaFacebook, FaInstagram, FaTiktok, FaTwitter } from 'react-icons/fa';

import { Logo } from '../atoms';
import { ReactNode } from 'react';

interface FooterProps extends BoxProps {
  children?: ReactNode;
}

export function Footer({ ...rest }: FooterProps) {
  return (
    <Box borderTopWidth={1} {...rest}>
      <Container
        as="footer"
        role="contentinfo"
        maxW="8xl"
        px={{ base: '3', md: '7', lg: '10' }}
        py={2}
      >
        <Stack spacing={{ base: '4', md: '5' }}>
          <Stack justify="space-between" direction="row" align="center">
            <Logo />
            <ButtonGroup variant="ghost">
              <IconButton
                as="a"
                href="https://instagram.com/aaafuria"
                aria-label="Instagram"
                icon={<FaInstagram fontSize="1.25rem" />}
              />
              <IconButton
                as="a"
                href="https://facebook.com/aaafuria"
                aria-label="Facebook"
                icon={<FaFacebook fontSize="1.25rem" />}
              />
              <IconButton
                as="a"
                href="https://twitter.com/aaafuria"
                aria-label="Twitter"
                icon={<FaTwitter fontSize="1.25rem" />}
              />
              <IconButton
                as="a"
                href="https://ticktock.com/@aaafuria"
                aria-label="TikTok"
                icon={<FaTiktok fontSize="1.25rem" />}
              />
            </ButtonGroup>
          </Stack>
          <Text fontSize="sm" color="subtle">
            &copy; {new Date().getFullYear()} A.A.A. Fúria | All rights
            reserved.
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}
