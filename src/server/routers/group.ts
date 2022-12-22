import { router, staffProcedure } from '../trpc';

import { prisma } from '../prisma';
import { z } from 'zod';

export const group = router({
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
});
