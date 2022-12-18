import {
  Box,
  Image,
  Link,
  Stack,
  Text,
  useColorModeValue as mode,
} from '@chakra-ui/react';

import NextLink from 'next/link';

interface CartProductMetaProps {
  id: string;
  name: string;
  description: string;
  image: string;
}

export function CartProductMeta({
  id,
  image,
  name,
  description,
}: CartProductMetaProps) {
  return (
    <Stack direction="row" spacing="5" width="full">
      <Image
        rounded="lg"
        width="120px"
        height="120px"
        fit="cover"
        src={image}
        alt={name}
        draggable="false"
        loading="lazy"
      />
      <Box pt="4">
        <Stack spacing="0.5">
          <Link as={NextLink} href={`/store/${id}`}>
            <Text fontWeight="medium">{name}</Text>
          </Link>
          <Text color={mode('gray.600', 'gray.400')} fontSize="sm">
            {description}
          </Text>
        </Stack>
      </Box>
    </Stack>
  );
}
