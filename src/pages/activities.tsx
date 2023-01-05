import { Box, Button, HStack, Text } from '@chakra-ui/react';
import { CustomInput, Loading } from '@/components/atoms';
import { Group, Profile, Schedule, User } from '@prisma/client';
import { useContext, useState } from 'react';

import { ActivityGrid } from '@/components/organisms';
import { ColorContext } from '@/contexts';
import { GetServerSideProps } from 'next';
import { GroupCard } from '@/components/molecules';
import { Layout } from '@/components/templates';
import { authOptions } from './api/auth/[...nextauth]';
import { getToken } from 'next-auth/jwt';
import { trpc } from '@/utils/trpc';

export type UserWithProfile = User & {
  profile: Profile | null;
};

export type ScheduleWithGroupAndInterestedAndPresentUsers = Schedule & {
  interestedUsers: UserWithProfile[];
  presentUsers: User[];
  group: Group;
};

export type GroupWithSchedulesAndUsers = Group & {
  users: User[];
  schedules: ScheduleWithGroupAndInterestedAndPresentUsers[];
};

function Activities({ isStaff }: { isStaff: boolean }) {
  const [q, setQ] = useState<string>();
  const { green } = useContext(ColorContext);
  const { data: groups, isLoading } = trpc.group.activityGroups.useQuery();

  const filteredGroups = groups?.filter((group) => {
    if (!q) return group;
    const query = (q as string).toLowerCase();

    if (
      group.name.toLowerCase().includes(query) ||
      group.type.toLowerCase().includes(query)
    ) {
      return group;
    }
  });

  return (
    <Layout title="Atividades">
      <Box mb={4}>
        <HStack>
          <CustomInput
            placeholder="Buscar atividade"
            onChange={(e) => setQ(e.target.value)}
          />
          <Button colorScheme="green">Buscar</Button>
        </HStack>
      </Box>
      <ActivityGrid>
        {isLoading && <Loading />}
        {filteredGroups?.map((group) => (
          <GroupCard key={group.id} group={group} isStaff={isStaff} />
        ))}
      </ActivityGrid>
      {filteredGroups?.length === 0 && (
        <Text textAlign={'center'}>Nenhum grupo encontrado.</Text>
      )}
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  ctx.res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59',
  );

  const token = await getToken({
    req: ctx.req,
    secret: authOptions.secret,
  });

  return {
    props: {
      isStaff: token?.isStaff,
    },
  };
};

export default Activities;
