import { Box, Button, HStack, Text } from '@chakra-ui/react';
import { CustomInput, Loading } from '@/components/atoms';
import { Group, Profile, Schedule, User } from '@prisma/client';

import { ActivityGrid } from '@/components/organisms';
import { GroupCard } from '@/components/molecules';
import { Layout } from '@/components/templates';
import { trpc } from '@/utils/trpc';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

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

function Activities() {
  const [q, setQ] = useState<string>();
  const { data } = useSession();
  const isStaff = data?.user.isStaff;

  const {
    data: groups,
    isLoading,
    refetch,
  } = trpc.group.activityGroups.useQuery();

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
          <GroupCard
            key={group.id}
            group={group}
            isStaff={isStaff}
            refetch={refetch}
          />
        ))}
      </ActivityGrid>
      {filteredGroups?.length === 0 && (
        <Text textAlign={'center'}>Nenhum grupo encontrado.</Text>
      )}
    </Layout>
  );
}

export default Activities;
