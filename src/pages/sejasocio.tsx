import { SimpleGrid, useDisclosure } from '@chakra-ui/react';

import { ActionButton } from '@/components/atoms';
import { GetServerSideProps } from 'next';
import { Layout } from '@/components/templates';
import { Plan } from '@prisma/client';
import { PlanCard } from '@/components/molecules';
import { SejaSocioDrawer } from '@/components/organisms';
import { authOptions } from './api/auth/[...nextauth]';
import { prisma } from '@/server/prisma';
import { unstable_getServerSession } from 'next-auth';
import { useState } from 'react';

function Subscribe({ plans }: { plans: Plan[] }) {
  const sejaSocioDrawer = useDisclosure();
  const [plan, setPlan] = useState<Plan>();
  const mensal = plans.find((plan) => plan.periodInDays === 30);
  const semestral = plans.find((plan) => plan.periodInDays === 180);
  const anual = plans.find((plan) => plan.periodInDays === 365);

  const handlePlan = (plan?: Plan) => {
    if (plan) {
      setPlan(plan);
      sejaSocioDrawer.onOpen();
    }
  };

  return (
    <Layout title="Seja Sócio">
      <SejaSocioDrawer plan={plan} {...sejaSocioDrawer} />
      <SimpleGrid
        columns={{ base: 1, lg: 3 }}
        spacing={{ base: '8', lg: '0' }}
        maxW="8xl"
        mx="auto"
        justifyItems="center"
        alignItems="center"
      >
        <PlanCard
          data={{
            price: 'R$' + mensal?.price.toString() || 'R$29',
            name: 'Plano MENSAL',
            features: [
              'Participação em atividades',
              'Desconto em produtos da loja',
              'Desconto em eventos realizados pela Fúria',
            ],
          }}
          button={
            <ActionButton
              variant="outline"
              borderWidth="2px"
              onClick={() => handlePlan(mensal)}
            >
              Seja Sócio
            </ActionButton>
          }
        />
        <PlanCard
          zIndex={1}
          isPopular
          transform={{ lg: 'scale(1.05)' }}
          data={{
            price: 'R$' + semestral?.price.toString() || 'R$49',
            name: 'Plano SEMESTRAL',
            features: [
              'TODOS OS BENEFÍCIOS DO SÓCIO FÚRIA',
              'Participação em atividades',
              'Desconto em produtos da loja',
              'Desconto em eventos',
              'Desconto no INTERMED',
            ],
          }}
          button={
            <ActionButton onClick={() => handlePlan(semestral)}>
              Seja Sócio
            </ActionButton>
          }
        />
        <PlanCard
          data={{
            price: 'R$' + anual?.price.toString() || 'R$49',
            name: 'Plano ANUAL',
            features: [
              'All application UI components',
              'Lifetime access',
              'Use on unlimited projects',
              'Free Updates',
            ],
          }}
          button={
            <ActionButton
              variant="outline"
              borderWidth="2px"
              onClick={() => handlePlan(anual)}
            >
              Seja Sócio
            </ActionButton>
          }
        />
      </SimpleGrid>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await unstable_getServerSession(
    ctx.req,
    ctx.res,
    authOptions,
  );
  if (!session) {
    return {
      redirect: {
        destination: `/login?callbackUrl=${ctx.resolvedUrl}`,
        permanent: false,
      },
    };
  }

  const plans = await prisma.plan.findMany({
    orderBy: {
      periodInDays: 'asc',
    },
  });

  return {
    props: {
      plans,
    },
  };
};

export default Subscribe;
