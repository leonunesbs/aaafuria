import { TRPCError, initTRPC } from '@trpc/server';

import { Context } from './context';
import { prisma } from './prisma';
import superjson from 'superjson';

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/v10/data-transformers
   */
  transformer: superjson,
  /**
   * @see https://trpc.io/docs/v10/error-formatting
   */
  errorFormatter({ shape }) {
    return shape;
  },
});

const isAuthed = t.middleware(({ next, ctx }) => {
  const user = ctx.session?.user;

  if (!user?.email) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      session: ctx.session,
      user: {
        ...user,
      },
    },
  });
});

const isStaff = t.middleware(async ({ next, ctx }) => {
  const userEmail = ctx.session?.user?.email;
  if (!userEmail) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const user = await prisma.user.findUnique({
    where: {
      email: userEmail,
    },
    include: {
      groups: {
        where: {
          name: 'DIRETORIA',
        },
      },
    },
  });

  if (!user?.groups?.length) {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }

  return next({
    ctx: {
      session: ctx.session,
      user: {
        ...user,
        email: userEmail,
        isStaff: true,
      },
    },
  });
});

// Base router and procedure helpers
export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;
export const authedProcedure = t.procedure.use(isAuthed);
export const staffProcedure = t.procedure.use(isStaff);
