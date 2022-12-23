import { authedProcedure, router } from '../trpc';

import { z } from 'zod';
import { prisma } from '../prisma';

export const user = router({
  update: authedProcedure
    .input(
      z.object({
        id: z.string(),
        editable: z.boolean().optional(),
        name: z.string().optional(),
        birth: z.date().optional(),
        registration: z.string().optional(),
        studyClass: z.string().optional(),
        phone: z.string().optional(),
        cpf: z.string().optional(),
        rg: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const {
        id,
        editable,
        name,
        birth,
        phone,
        cpf,
        rg,
        studyClass,
        registration,
      } = input;

      const loggedUser = await prisma.user.findUniqueOrThrow({
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

      const profile = await prisma.profile.findUnique({
        where: {
          userId: id,
        },
      });
      if (!profile) {
        await prisma.profile.create({
          data: {
            userId: id,
          },
        });
      }

      if (loggedUser.id === id || loggedUser.groups.length) {
        return await prisma.user.update({
          where: {
            id,
          },
          data: {
            name,
            profile: {
              update: {
                editable,
                registration,
                studyClass,
                birth,
                phone,
                cpf,
                rg,
              },
            },
          },
        });
      }

      return false;
    }),
});
