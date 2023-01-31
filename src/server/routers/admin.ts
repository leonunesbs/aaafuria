import { router, staffProcedure } from '../trpc';

import prisma from '../prisma';
import { z } from 'zod';

export const admin = router({
  user: staffProcedure.input(z.string()).query(async ({ input: id }) => {
    return await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        profile: true,
        memberships: {
          orderBy: {
            startDate: 'desc',
          },
          take: 3,
        },
        groups: {
          orderBy: {
            name: 'asc',
          },
        },
      },
    });
  }),
  orders: staffProcedure
    .input(
      z.object({
        page: z.number().min(1).optional().default(1),
        pageSize: z.number().min(1).optional().default(20),
      }),
    )
    .query(async ({ input }) => {
      const { page, pageSize } = input;
      return await prisma.order.findMany({
        where: {
          payment: {
            canceled: false,
          },
        },
        include: {
          user: true,
          items: {
            include: {
              item: {
                include: {
                  parent: true,
                },
              },
            },
          },
          payment: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: pageSize,
        skip: (page - 1) * pageSize,
      });
    }),
  groups: staffProcedure.query(async () => {
    return await prisma.group.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }),
});
