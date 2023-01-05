import { SimpleGrid, useDisclosure } from '@chakra-ui/react';

import { ActionButton } from '@/components/atoms';
import { GetStaticProps } from 'next';
import { Layout } from '@/components/templates';
import { Plan } from '@prisma/client';
import { PlanCard } from '@/components/molecules';
import { SejaSocioDrawer } from '@/components/organisms';
import { prisma } from '@/server/prisma';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

function Subscribe({ plans }: { plans?: Plan[] }) {
  const { status } = useSession();
  const isAuth = status === 'authenticated';
  const sejaSocioDrawer = useDisclosure();
  const [plan, setPlan] = useState<Plan>();
  const mensal = plans?.find((plan) => plan.name.includes('MENSAL'));
  const semestral = plans?.find((plan) => plan.name.includes('SEMESTRAL'));
  const anual = plans?.find((plan) => plan.name.includes('ANUAL'));

  const router = useRouter();
  const handlePlan = (plan?: Plan) => {
    if (!isAuth) {
      router.push(`/auth/login?callbackUrl=${router.asPath}`);
    } else {
      if (plan) {
        setPlan(plan);
        sejaSocioDrawer.onOpen();
      }
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

export const getStaticProps: GetStaticProps = async () => {
  const plans = await prisma.plan.findMany({
    orderBy: {
      periodInDays: 'asc',
    },
  });

  return {
    props: {
      plans,
    },
    revalidate: 60,
  };
};

export default Subscribe;
