import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  FormControl,
  HStack,
  Heading,
  Input,
  InputGroup,
  InputLeftAddon,
  Link,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { Membership, Plan, User } from '@prisma/client';
import { SubmitHandler, useForm } from 'react-hook-form';

import { GetServerSideProps } from 'next';
import { Layout } from '@/components/templates';
import NextLink from 'next/link';
import { authOptions } from '../api/auth/[...nextauth]';
import { formatPrice } from '@/components/atoms';
import { prisma } from '@/server/prisma';
import { trpc } from '@/utils/trpc';
import { unstable_getServerSession } from 'next-auth';
import { useRouter } from 'next/router';

interface AddPlanInput extends Omit<Plan, 'price' | 'periodInDays'> {
  price: string;
  periodInDays: string;
}

type PlanWithMemberships = Plan & {
  memberships: Membership[];
};

type MembershipWithPlanAndUser = Membership & {
  plan: Plan;
  user: User;
};

function Memberships({
  plans,
  memberships,
}: {
  plans: PlanWithMemberships[];
  memberships: MembershipWithPlanAndUser[];
}) {
  const router = useRouter();
  const { handleSubmit, register, reset } = useForm<AddPlanInput>();

  const addPlan = trpc.plan.create.useMutation({
    onSuccess: () => {
      router.replace(router.asPath, undefined, { scroll: false });
      reset();
    },
  });
  const onSubmit: SubmitHandler<AddPlanInput> = (data) => {
    addPlan.mutate({
      name: data.name.toUpperCase(),
      periodInDays: parseInt(data.periodInDays),
      price: parseInt(data.price),
    });
  };

  const updatePlan = trpc.plan.update.useMutation({
    onSuccess: () =>
      router.replace(router.asPath, undefined, { scroll: false }),
  });

  const deletePlan = trpc.plan.delete.useMutation({
    onSuccess: () =>
      router.replace(router.asPath, undefined, { scroll: false }),
  });

  return (
    <Layout title="Associações">
      <Stack spacing={6}>
        <Card variant={'responsive'}>
          <CardHeader>
            <Heading size="md">Planos</Heading>
          </CardHeader>
          <CardBody>
            <TableContainer>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Nome</Th>
                    <Th>Preço</Th>
                    <Th>Membros</Th>
                    <Th>Ativo</Th>
                    <Th>Ações</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {plans.map((plan) => (
                    <Tr key={plan.id}>
                      <Td>{plan.name}</Td>
                      <Td>{formatPrice(plan.price)}</Td>
                      <Td>{plan.memberships.length}</Td>
                      <Td>{plan.isActive ? 'Sim' : 'Não'}</Td>
                      <Td>
                        <HStack>
                          {plan.isActive ? (
                            <Button
                              size="sm"
                              colorScheme="gray"
                              onClick={() =>
                                updatePlan.mutate({
                                  id: plan.id,
                                  isActive: false,
                                })
                              }
                            >
                              Desativar
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              colorScheme="green"
                              onClick={() =>
                                updatePlan.mutate({
                                  id: plan.id,
                                  isActive: true,
                                })
                              }
                            >
                              Ativar
                            </Button>
                          )}
                          <Button
                            size="sm"
                            colorScheme="red"
                            onClick={() => deletePlan.mutate(plan.id)}
                          >
                            Excluir
                          </Button>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
          <CardFooter>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack maxW="xs" mx="auto" w="full">
                <Heading size="sm">Adicionar plano</Heading>
                <FormControl>
                  <Input placeholder="Nome do plano" {...register('name')} />
                </FormControl>
                <FormControl>
                  <InputGroup>
                    <Input
                      type={'number'}
                      placeholder="Duração em dias"
                      {...register('periodInDays')}
                    />
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <InputGroup>
                    <InputLeftAddon>R$</InputLeftAddon>
                    <Input
                      type={'number'}
                      placeholder="Preço do plano"
                      {...register('price')}
                    />
                  </InputGroup>
                </FormControl>
                <Button type="submit">Adicionar</Button>
              </Stack>
            </form>
          </CardFooter>
        </Card>
        <Card variant={'responsive'}>
          <CardHeader>
            <Heading size="md">Sócios ativos ({memberships.length})</Heading>
          </CardHeader>
          <CardBody>
            <TableContainer>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Nome</Th>
                    <Th>Turma</Th>
                    <Th>Plano</Th>
                    <Th>Expira em</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {memberships.map((membership) => (
                    <Tr key={membership.id}>
                      <Td>
                        <Link
                          as={NextLink}
                          href={`/admin/users/${membership.userId}`}
                          color="green.500"
                          fontWeight={'bold'}
                        >
                          <Text>{membership.user.name}</Text>
                        </Link>
                      </Td>
                      <Td>MED 28</Td>
                      <Td>{membership.plan?.name}</Td>
                      <Td>
                        {new Date(membership.endDate).toLocaleDateString()}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>
      </Stack>
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
        destination: `/login?after=${ctx.resolvedUrl}`,
        permanent: false,
      },
    };
  }

  const plans = await prisma.plan.findMany({
    include: {
      memberships: true,
    },
  });
  const memberships = await prisma.membership.findMany({
    orderBy: {
      user: {
        name: 'asc',
      },
    },
    include: {
      user: true,
      plan: true,
    },
  });

  const activeMemberships = memberships.filter(
    (membership) => membership.endDate > new Date(),
  );

  return {
    props: {
      plans: JSON.parse(JSON.stringify(plans)),
      memberships: JSON.parse(JSON.stringify(activeMemberships)),
    },
  };
};

export default Memberships;
