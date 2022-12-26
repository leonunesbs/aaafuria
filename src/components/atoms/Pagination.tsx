import { HStack, IconButton, StackProps, Text } from '@chakra-ui/react';
import {
  MdNavigateBefore,
  MdNavigateNext,
  MdSkipNext,
  MdSkipPrevious,
} from 'react-icons/md';

import { useRouter } from 'next/router';

interface PaginationProps extends StackProps {
  page: number;
  totalPages: number;
}

export function Pagination({ page, totalPages, ...rest }: PaginationProps) {
  const router = useRouter();
  return (
    <HStack {...rest}>
      <IconButton
        aria-label="first"
        icon={<MdSkipPrevious />}
        onClick={() => router.push('?page=1')}
        disabled={page === 1}
      />
      <IconButton
        aria-label="before"
        icon={<MdNavigateBefore />}
        onClick={() => router.push(`?page=${page - 1}`)}
        disabled={page === 1}
      />
      <IconButton
        variant={'unstyled'}
        aria-label="page"
        icon={<Text>{page}</Text>}
        cursor="auto"
        borderWidth={1}
      />
      <IconButton
        aria-label="next"
        icon={<MdNavigateNext />}
        onClick={() => router.push(`?page=${page + 1}`)}
        disabled={page === totalPages}
      />
      <IconButton
        aria-label="last"
        icon={<MdSkipNext />}
        onClick={() => router.push(`?page=${totalPages}`)}
        disabled={page === totalPages}
      />
    </HStack>
  );
}
