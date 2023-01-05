import { authedProcedure, router, staffProcedure } from '../trpc';

import { prisma } from '../prisma';
import { z } from 'zod';

export const schedule = router({
  create: staffProcedure
    .input(
      z.object({
        groupId: z.string(),
        location: z.string(),
        description: z.string().optional(),
        start: z.date(),
        end: z.date().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { groupId, ...rest } = input;
      return prisma.schedule.create({
        data: {
          group: {
            connect: {
              id: groupId,
            },
          },
          ...rest,
        },
      });
    }),
  delete: staffProcedure.input(z.string()).mutation(async ({ input }) => {
    return prisma.schedule.delete({
      where: {
        id: input,
      },
    });
  }),
  toggleInterest: authedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          email: ctx.user.email as string,
        },
      });
      const schedule = await prisma.schedule.findUniqueOrThrow({
        where: {
          id: input,
        },
        include: {
          interestedUsers: true,
        },
      });

      const alternate = () => {
        const isInterested = schedule.interestedUsers.some(
          (interestedUser) => interestedUser.id === user.id,
        );
        if (isInterested)
          return {
            interestedUsers: {
              disconnect: {
                id: user.id,
              },
            },
            presentUsers: {
              disconnect: {
                id: user.id,
              },
            },
          };
        else
          return {
            interestedUsers: {
              connect: {
                id: user.id,
              },
            },
          };
      };
      return prisma.schedule.update({
        where: {
          id: input,
        },
        data: {
          ...alternate(),
        },
      });
    }),
  togglePresent: staffProcedure
    .input(
      z.object({
        scheduleId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { scheduleId, userId } = input;
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          id: userId,
        },
      });
      const schedule = await prisma.schedule.findUniqueOrThrow({
        where: {
          id: scheduleId,
        },
        include: {
          presentUsers: true,
        },
      });

      const alternate = () => {
        const isPresent = schedule.presentUsers.some(
          (presentUser) => presentUser.id === user.id,
        );
        if (isPresent) {
          return {
            disconnect: {
              id: user.id,
            },
          };
        } else {
          return {
            connect: {
              id: user.id,
            },
          };
        }
      };

      return prisma.schedule.update({
        where: {
          id: schedule.id,
        },
        data: {
          presentUsers: alternate(),
        },
      });
    }),
});
