import { Box, Button, HStack, Text } from '@chakra-ui/react';
import { Group, Profile, Schedule, User } from '@prisma/client';

import { ActivityGrid } from '@/components/organisms';
import { CustomInput } from '@/components/atoms';
import { GetServerSideProps } from 'next';
import { GroupCard } from '@/components/molecules';
import { Layout } from '@/components/templates';
import { authOptions } from './api/auth/[...nextauth]';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/server/prisma';
import { useState } from 'react';

type UserWithProfile = User & {
  profile: Profile;
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

function Activities({
  groups,
  isStaff,
}: {
  groups: GroupWithSchedulesAndUsers[];
  isStaff: boolean;
}) {
  const [q, setQ] = useState<string>();

  const filteredGroups = groups.filter((group) => {
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
        {filteredGroups.map((group) => (
          <GroupCard key={group.id} group={group} isStaff={isStaff} />
        ))}
      </ActivityGrid>
      {filteredGroups.length === 0 && (
        <Text textAlign={'center'}>Nenhum grupo encontrado.</Text>
      )}
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const token = await getToken({
    req: ctx.req,
    secret: authOptions.secret,
  });

  const groups = await prisma.group.findMany({
    where: {
      OR: [
        { type: { contains: 'ESPORTE' } },
        { type: { contains: 'BATERIA' } },
      ],
    },
    include: {
      users: true,
      schedules: {
        orderBy: {
          start: 'asc',
        },
        include: {
          interestedUsers: {
            include: {
              profile: true,
            },
            orderBy: {
              name: 'asc',
            },
          },
          presentUsers: true,
          group: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });
  return {
    props: {
      groups: JSON.parse(JSON.stringify(groups)),
      isStaff: token?.isStaff,
    },
  };
};

export default Activities;
