import { authedProcedure, router, staffProcedure } from '../trpc';

import Stripe from 'stripe';
import { TRPCError } from '@trpc/server';
import axios from 'axios';
import prisma from '../prisma';
import { z } from 'zod';

export const payment = router({
  confirm: staffProcedure.input(z.string()).mutation(async ({ input: id }) => {
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
    if (payment.paid === true) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Pagamento já confirmado',
      });
    }
    await prisma.payment.update({
      where: {
        id,
      },
      data: {
        paid: true,
      },
    });
  }),
  update: authedProcedure
    .input(
      z.object({
        id: z.string(),
        method: z.string().optional(),
        attachment: z.string().optional().nullable(),
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
        const getStripeSession = async () => {
          if (payment?.refId) {
            return await stripe.checkout.sessions.retrieve(payment.refId);
          } else {
            return await stripe.checkout.sessions.create({
              payment_method_types: ['card'],
              line_items: [
                {
                  price_data: {
                    currency: 'brl',
                    product_data: {
                      name: 'Compra online em @aaafuria',
                    },
                    unit_amount: (payment?.amount as number) * 100,
                  },
                  quantity: 1,
                },
              ],
              mode: 'payment',
              success_url: `${process.env.NEXT_PUBLIC_URL}/payments/${id}`,
              cancel_url: `${process.env.NEXT_PUBLIC_URL}/payments/${id}`,
            });
          }
        };

        const session = await getStripeSession();
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
      async function pagseguroCheckout() {
        const options = {
          method: 'POST',
          url: 'https://ws.pagseguro.uol.com.br/v2/checkout',
          params: {
            email: process.env.PAGSEGURO_EMAIL,
            token: process.env.PAGSEGURO_TOKEN,
          },
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
        };

        return await axios
          .request({
            ...options,
            params: {
              ...options.params,
              currency: payment?.currency,
              itemId1: '0001',
              itemDescription1: 'Compra online em @aaafuria',
              itemAmount1: payment?.amount.toFixed(2).toString(),
              itemQuantity1: '1',
              itemWeight1: '1000',
              reference: payment?.id,
              senderEmail: payment?.user.email,
              redirectURL: 'https://aaafuria.site',
              notificationURL: 'https://aaafuria.site/api/wh/pagseguro',
              maxUses: '1',
              maxAge: '3000',
            },
          })
          .then(function (response) {
            const convert = require('xml-js');
            const xml = response.data;
            const result = convert.xml2js(xml, { compact: true, spaces: 4 });
            const code = result.checkout.code._text;

            return {
              url: `https://pagseguro.uol.com.br/v2/checkout/payment.html?code=${code}`,
            };
          })
          .catch(function (error) {
            return {
              url: null,
              error: error,
            };
          });
      }

      switch (payment.method) {
        case 'STRIPE':
          return stripeCheckout();
        case 'PAGSEGURO':
          return pagseguroCheckout();
        default:
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Método de pagamento não suportado',
          });
      }
    }),
  cancel: authedProcedure.input(z.string()).mutation(async ({ input: id }) => {
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
  get: authedProcedure.input(z.string()).query(async ({ input: id, ctx }) => {
    const payment = await prisma.payment.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        user: true,
        membership: true,
        order: true,
      },
    });

    if (ctx.user.isStaff) {
      return payment;
    }

    if (payment.user.email !== ctx.user.email) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    return payment;
  }),
});
