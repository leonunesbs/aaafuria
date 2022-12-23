import * as trpc from '@trpc/server';
import * as trpcNext from '@trpc/server/adapters/next';

import { getSession } from 'next-auth/react';
import { prisma } from './prisma';

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export const createContext = async (
  opts: trpcNext.CreateNextContextOptions,
) => {
  const session = await getSession(opts);
  const isMember = async () => {
    const user = await prisma.user.findUnique({
      where: {
        email: session?.user?.email as string,
      },
      include: {
        memberships: {
          where: {
            endDate: {
              gte: new Date(),
            },
            payment: {
              paid: true,
              canceled: false,
              expired: false,
            },
          },
        },
      },
    });
    if (!user?.memberships.length) {
      return false;
    }
    return true;
  };

  const isStaff = async () => {
    const user = await prisma.user.findUnique({
      where: {
        email: session?.user?.email as string,
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
  };

  return {
    session: {
      ...session,
      isMember: await isMember(),
      isStaff: await isStaff(),
    },
  };
};

export type Context = trpc.inferAsyncReturnType<typeof createContext>;
