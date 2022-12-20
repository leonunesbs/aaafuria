import { authedProcedure, router } from '../trpc';

import Stripe from 'stripe';
import { TRPCError } from '@trpc/server';
import { auth } from './auth';
import { prisma } from '@/server/prisma';
import { store } from './store';
import { z } from 'zod';

export const appRouter = router({
  store,
  auth,
  payment: router({
    update: authedProcedure
      .input(
        z.object({
          id: z.string(),
          method: z.string().optional(),
          attachment: z.string().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const { id, method, attachment } = input;
        return prisma.payment.update({
          where: {
            id,
          },
          data: {
            method,
            attachment,
          },
        });
      }),
    checkout: authedProcedure
      .input(z.string())
      .mutation(async ({ input: id, ctx }) => {
        const payment = await prisma.payment.findUnique({
          where: {
            id,
          },
          include: {
            user: true,
          },
        });
        if (!payment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Pagamento não encontrado',
          });
        }
        if (payment.user.email !== ctx.user.email) {
          throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        async function stripeCheckout() {
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
            apiVersion: '2022-11-15',
          });

          const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
              {
                price_data: {
                  currency: 'brl',
                  product_data: {
                    name: 'Sócio',
                  },
                  unit_amount: 10000,
                },
                quantity: 1,
              },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_URL}/app`,
            cancel_url: `${process.env.NEXT_PUBLIC_URL}/payments/${id}`,
          });

          await prisma.payment.update({
            where: {
              id,
            },
            data: {
              refId: session.id,
            },
          });

          return {
            url: session.url,
          };
        }

        switch (payment.method) {
          case 'STRIPE':
            return stripeCheckout();
          default:
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Método de pagamento não suportado',
            });
        }
      }),
    cancel: authedProcedure
      .input(z.string())
      .mutation(async ({ input: id }) => {
        const payment = await prisma.payment.findUnique({
          where: {
            id,
          },
        });
        if (!payment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Pagamento não encontrado',
          });
        }
        if (
          payment.paid === true ||
          payment.canceled === true ||
          payment.expired === true
        ) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Pagamento não pode ser cancelado',
          });
        }
        await prisma.payment.update({
          where: {
            id,
          },
          data: {
            canceled: true,
          },
        });
      }),
  }),
});
export type AppRouter = typeof appRouter;
