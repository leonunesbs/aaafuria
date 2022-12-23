import { Box, Button, HStack, Input, Text } from '@chakra-ui/react';
import { Group, Profile, Schedule, User } from '@prisma/client';
import { SubmitHandler, useForm } from 'react-hook-form';

import { ActivityGrid } from '@/components/organisms';
import { GetServerSideProps } from 'next';
import { GroupCard } from '@/components/molecules';
import { Layout } from '@/components/templates';
import { authOptions } from './api/auth/[...nextauth]';
import { prisma } from '@/server/prisma';
import { unstable_getServerSession } from 'next-auth';
import { useRouter } from 'next/router';

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

function Activities({ groups }: { groups: GroupWithSchedulesAndUsers[] }) {
  const router = useRouter();

  const { handleSubmit, register } = useForm<{ q: string }>();
  const onSubmit: SubmitHandler<{ q: string }> = ({ q }) => {
    router.replace({
      href: router.asPath,
      query: { q },
    });
  };

  return (
    <Layout title="Atividades">
      <Box mb={4}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <HStack>
            <Input
              placeholder="Buscar atividade"
              {...register('q', {
                onChange: (e) => {
                  router.replace({
                    href: router.asPath,
                    query: { q: e.target.value },
                  });
                },
              })}
            />
            <Button colorScheme="green" type="submit">
              Buscar
            </Button>
          </HStack>
        </form>
      </Box>
      <ActivityGrid>
        {groups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </ActivityGrid>
      {groups.length === 0 && (
        <Text textAlign={'center'}>Nenhum grupo encontrado.</Text>
      )}
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await unstable_getServerSession(
    ctx.req,
    ctx.res,
    authOptions,
  );
  if (!session) {
    return {
      redirect: {
        destination: `/auth/login?callbackUrl=${ctx.resolvedUrl}`,
        permanent: false,
      },
    };
  }

  const getWhere = () => {
    const { q } = ctx.query;
    if (q)
      return {
        AND: [
          {
            OR: [
              { name: { contains: q as string } },
              { type: { contains: q as string } },
            ],
          },
          {
            OR: [
              { type: { contains: 'Esporte' } },
              { type: { contains: 'Bateria' } },
            ],
          },
        ],
      };
    else {
      return {
        OR: [
          { type: { contains: 'Esporte' } },
          { type: { contains: 'Bateria' } },
        ],
      };
    }
  };

  const groups = await prisma.group.findMany({
    where: getWhere(),
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
    },
  };
};

export default Activities;
