import { authedProcedure, router, staffProcedure } from '../trpc';

import { TRPCError } from '@trpc/server';
import { prisma } from '../prisma';
import { z } from 'zod';

export const group = router({
  create: staffProcedure
    .input(
      z.object({
        name: z.string(),
        type: z.string(),
        usersId: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { name, type, usersId } = input;
      return prisma.group.create({
        data: {
          name: name.toUpperCase(),
          type: type.toUpperCase(),
          users: {
            connect: usersId?.map((id) => ({ id })),
          },
        },
      });
    }),
  delete: staffProcedure.input(z.string()).mutation(async ({ input }) => {
    const group = await prisma.group.findUnique({
      where: {
        id: input,
      },
    });
    if (group?.type === 'DEFAULT') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Não é possível deletar um grupo DEFAULT',
      });
    }
    return prisma.group.delete({
      where: {
        id: input,
      },
    });
  }),
  update: staffProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        type: z.string().optional(),
        usersId: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, name, type, usersId } = input;
      return prisma.group.update({
        where: {
          id,
        },
        data: {
          name,
          type,
          users: {
            connect: usersId?.map((id) => ({ id })),
          },
        },
      });
    }),
  addToGroup: staffProcedure
    .input(
      z.object({
        groupId: z.string(),
        usersId: z.array(z.string()),
      }),
    )
    .mutation(async ({ input }) => {
      const { groupId, usersId } = input;
      return prisma.group.update({
        where: {
          id: groupId,
        },
        data: {
          users: {
            connect: usersId.map((id) => ({ id })),
          },
        },
      });
    }),
  removeFromGroup: staffProcedure
    .input(
      z.object({
        groupId: z.string(),
        usersId: z.array(z.string()),
      }),
    )
    .mutation(async ({ input }) => {
      const { groupId, usersId } = input;
      return prisma.group.update({
        where: {
          id: groupId,
        },
        data: {
          users: {
            disconnect: usersId.map((id) => ({ id })),
          },
        },
      });
    }),
  activityGroups: authedProcedure.query(async () => {
    return await prisma.group.findMany({
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
  }),
});
