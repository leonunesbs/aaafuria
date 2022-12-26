import NextAuth, { NextAuthOptions } from 'next-auth';

import EmailProvider from 'next-auth/providers/email';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
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
  callbacks: {
    async session({ session, user }) {
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
        ...session,
        user: {
          ...session.user,
          id: user.id,
          isMember: await isMember(),
          isStaff: await isStaff(),
        },
      };
    },
  },
  debug: true,
};

export default NextAuth(authOptions);
