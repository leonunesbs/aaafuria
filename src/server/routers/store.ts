import { authedProcedure, procedure, router } from '../trpc';

import { User } from '@prisma/client';
import { prisma } from '@/server/prisma';
import { z } from 'zod';

const getOrCreateOrder = async (user: User) => {
  const order = await prisma.order.findFirst({
    where: {
      user: {
        id: user.id,
      },
      ordered: false,
      checkedOut: false,
    },
  });

  if (order) {
    return order;
  }

  return await prisma.order.create({
    data: {
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  });
};

export const getPrice = (
  isMember: boolean,
  price: number,
  memberPrice?: number,
) => {
  return isMember && memberPrice ? memberPrice : price;
};

export const store = router({
  orderItems: procedure
    .input(z.string().email().optional())
    .query(async ({ input }) => {
      if (!input) return null;

      const user = await prisma.user.findUniqueOrThrow({
        where: {
          email: input,
        },
      });

      return await prisma.orderItem.findMany({
        where: {
          order: {
            user: {
              id: user.id,
            },
          },
          ordered: false,
          checkedOut: false,
        },
        include: {
          item: {
            include: {
              parent: true,
              childrens: true,
            },
          },
          order: true,
        },
      });
    }),
  hasPendingOrders: authedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        email: ctx.user.email,
      },
    });

    const order = await prisma.order.findFirst({
      where: {
        user: {
          id: user.id,
        },
        ordered: false,
        checkedOut: true,
        payment: {
          is: {
            paid: false,
            canceled: false,
            expired: false,
          },
        },
      },
    });

    return !!order;
  }),

  cart: router({
    add: authedProcedure
      .input(
        z.object({
          itemId: z.string(),
          quantity: z.number(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const { itemId, quantity } = input;

        const user = await prisma.user.findUniqueOrThrow({
          where: {
            email: ctx.user.email,
          },
          include: {
            groups: true,
          },
        });

        const isMember = user.groups.some((group) => group.name === 'SÓCIOS');

        const item = await prisma.item.findUniqueOrThrow({
          where: {
            id: itemId,
          },
        });
        const order = await getOrCreateOrder(user);

        const orderItem = await prisma.orderItem.findFirst({
          where: {
            orderId: order.id,
            itemId: itemId,
          },
        });

        if (item.stock < quantity) {
          throw new Error('Não há estoque suficiente');
        }

        if (orderItem) {
          if (item.stock < orderItem.quantity + quantity) {
            throw new Error('Não há estoque suficiente');
          }
          return prisma.orderItem.update({
            where: {
              id: orderItem.id,
            },
            data: {
              quantity: {
                increment: quantity,
              },
              price:
                getPrice(isMember, item.price, item.memberPrice || undefined) +
                orderItem.quantity * item.price,
            },
          });
        }

        return prisma.orderItem.create({
          data: {
            orderId: order.id,
            itemId,
            quantity,
            currency: item.currency,

            price:
              getPrice(isMember, item.price, item.memberPrice || undefined) *
              quantity,
          },
        });
      }),
    remove: authedProcedure
      .input(
        z.object({
          orderItemId: z.string(),
          quantity: z.number(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const { orderItemId, quantity } = input;

        const user = await prisma.user.findUniqueOrThrow({
          where: {
            email: ctx.user.email,
          },
          include: {
            groups: true,
          },
        });

        const isMember = user.groups.some((group) => group.name === 'SÓCIOS');

        const orderItem = await prisma.orderItem.findUniqueOrThrow({
          where: {
            id: orderItemId,
          },
          include: {
            item: true,
          },
        });

        const updatedOrderItem = await prisma.orderItem.update({
          where: {
            id: orderItemId,
          },
          data: {
            quantity: {
              decrement: quantity,
            },
            price:
              getPrice(
                isMember,
                orderItem.item.price,
                orderItem.item.memberPrice || undefined,
              ) +
              (quantity - 1) * orderItem.item.price,
          },
        });

        if (updatedOrderItem.quantity <= 0) {
          await prisma.orderItem.delete({
            where: {
              id: updatedOrderItem.id,
            },
          });
          return;
        }

        return;
      }),
    checkout: procedure
      .input(
        z.object({
          method: z.string(),
          orderId: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        const { orderId } = input;

        const order = await prisma.order.findUniqueOrThrow({
          where: {
            id: orderId,
          },
          include: {
            items: {
              include: {
                item: true,
              },
            },
          },
        });

        const user = await prisma.user.findUniqueOrThrow({
          where: {
            id: order.userId,
          },
          include: {
            groups: true,
          },
        });

        if (order.checkedOut) {
          throw new Error('Pedido já foi finalizado');
        }

        if (order.items.length === 0) {
          throw new Error('Pedido está vazio');
        }

        const orderItems = order.items.map((orderItem) => {
          return {
            ...orderItem,
          };
        });

        const total = orderItems.reduce((acc, orderItem) => {
          return acc + orderItem.price;
        }, 0);

        const payment = await prisma.payment.create({
          data: {
            userId: user.id,
            order: {
              connect: {
                id: order.id,
              },
            },
            amount: total,
            currency: orderItems[0].currency,
            method: input.method,
          },
        });

        return prisma.order.update({
          where: {
            id: order.id,
          },
          data: {
            checkedOut: true,
            paymentId: payment.id,
            items: {
              updateMany: {
                where: {
                  orderId: order.id,
                },
                data: {
                  ordered: true,
                },
              },
            },
          },
        });
      }),
  }),
  item: router({
    create: procedure
      .input(
        z.object({
          parentId: z.string().nullable(),
          name: z.string(),
          description: z.string(),
          price: z.number(),
          memberPrice: z.number().nullable(),
          staffPrice: z.number().nullable(),
          athletePrice: z.number().nullable(),
          coordinatorPrice: z.number().nullable(),
          stock: z.number(),
          currency: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        return prisma.item.create({
          data: {
            ...input,
          },
        });
      }),
  }),
});
