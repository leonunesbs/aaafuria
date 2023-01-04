import NextAuth, { NextAuthOptions } from 'next-auth';

import EmailProvider from 'next-auth/providers/email';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { appRouter } from '@/server/routers/_app';
import { prisma } from '@/server/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST as string,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER as string,
          pass: process.env.EMAIL_SERVER_PASSWORD as string,
        },
      },
      from: process.env.EMAIL_FROM as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
  ],
  pages: {
    signIn: '/auth/login',
    verifyRequest: '/auth/verify-request',
  },
  session: {
    strategy: 'jwt',
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET as string,
  callbacks: {
    async session({ token, session }) {
      const isMember = async () => {
        const user = await prisma.user.findUnique({
          where: {
            email: token.email as string,
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
            email: token.email as string,
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
        ...session,
        user: {
          ...session.user,
          isMember: await isMember(),
          isStaff: await isStaff(),
        },
      };
    },
    async jwt({ token }) {
      const caller = appRouter.createCaller({
        session: {
          user: {
            ...token,
          },
        },
      });
      const isStaff = await caller.auth.isStaff();
      const isMember = await caller.auth.isMember();
      return {
        ...token,
        isStaff,
        isMember,
      };
    },
  },
};

export default NextAuth(authOptions);
