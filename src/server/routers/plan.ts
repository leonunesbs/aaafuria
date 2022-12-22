import { authedProcedure, router, staffProcedure } from '../trpc';

import { prisma } from '../prisma';
import { z } from 'zod';

export const plan = router({
  create: staffProcedure
    .input(
      z.object({
        name: z.string(),
        price: z.number(),
        periodInDays: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const { name, price, periodInDays } = input;
      return prisma.plan.create({
        data: {
          name,
          price,
          periodInDays,
        },
      });
    }),
  update: staffProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        price: z.number().optional(),
        periodInDays: z.number().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, name, price, periodInDays, isActive } = input;
      return prisma.plan.update({
        where: {
          id,
        },
        data: {
          name,
          price,
          periodInDays,
          isActive,
        },
      });
    }),
  delete: staffProcedure.input(z.string()).mutation(async ({ input }) => {
    const id = input;
    return prisma.plan.delete({
      where: {
        id,
      },
    });
  }),
  checkout: authedProcedure
    .input(
      z.object({
        planId: z.string(),
        method: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { planId, method } = input;
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          email: ctx.user.email as string,
        },
      });
      const plan = await prisma.plan.findUniqueOrThrow({
        where: {
          id: planId,
        },
      });

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.periodInDays);

      return await prisma.membership.create({
        data: {
          plan: {
            connect: {
              id: plan.id,
            },
          },
          user: {
            connect: {
              id: user.id,
            },
          },
          startDate: new Date(),
          endDate,
          payment: {
            create: {
              user: {
                connect: {
                  id: user.id,
                },
              },
              method,
              amount: plan.price,
              currency: 'BRL',
            },
          },
        },
      });
    }),
});
