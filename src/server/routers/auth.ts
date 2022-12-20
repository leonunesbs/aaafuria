import { authedProcedure, router } from '../trpc';

import { prisma } from '../prisma';

export const auth = router({
  isMember: authedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: {
        email: ctx.user.email,
      },
      include: {
        groups: {
          where: {
            name: 'SÓCIOS',
          },
        },
      },
    });
    if (!user?.groups.length) {
      return false;
    }
    return true;
  }),
  isStaff: authedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: {
        email: ctx.user.email,
      },
      include: {
        groups: {
          where: {
            name: 'DIRETORIA',
          },
        },
      },
    });
    if (!user?.groups.length) {
      return false;
    }
    return true;
  }),
});
