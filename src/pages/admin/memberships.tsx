import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  FormControl,
  HStack,
  Heading,
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
  useDisclosure,
} from '@chakra-ui/react';
import { CustomInput, formatPrice } from '@/components/atoms';
import { Membership, Plan, Profile, User } from '@prisma/client';
import { SubmitHandler, useForm } from 'react-hook-form';

import { ColorContext } from '@/contexts';
import { CustomAlertDialog } from '@/components/molecules';
import { GetServerSideProps } from 'next';
import { Layout } from '@/components/templates';
import NextLink from 'next/link';
import { prisma } from '@/server/prisma';
import { trpc } from '@/utils/trpc';
import { useContext } from 'react';
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
  user: User & {
    profile?: Profile;
  };
};

function Memberships({
  plans,
  memberships,
}: {
  plans: PlanWithMemberships[];
  memberships: MembershipWithPlanAndUser[];
}) {
  const router = useRouter();
  const { green } = useContext(ColorContext);
  const { handleSubmit, register, reset } = useForm<AddPlanInput>();

  const refreshData = () => {
    router.replace(router.asPath);
  };

  const addPlan = trpc.plan.create.useMutation({
    onSuccess: () => {
      refreshData();
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
    onSuccess: () => refreshData(),
  });

  const deletePlanAlert = useDisclosure();
  const deletePlan = trpc.plan.delete.useMutation({
    onSuccess: () => {
      refreshData();
      deletePlanAlert.onClose();
    },
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
                            isLoading={deletePlan.isLoading}
                          >
                            Excluir
                          </Button>
                          <CustomAlertDialog
                            {...deletePlanAlert}
                            title="Excluir plano"
                            description="Tem certeza que deseja excluir esse plano?"
                            actionButtonProps={{
                              onClick: () => {
                                deletePlan.mutate(plan.id);
                              },
                              isLoading: deletePlan.isLoading,
                            }}
                            buttonText="Excluir plano"
                          />
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
                  <CustomInput
                    placeholder="Nome do plano"
                    {...register('name')}
                  />
                </FormControl>
                <FormControl>
                  <InputGroup>
                    <CustomInput
                      type={'number'}
                      placeholder="Duração em dias"
                      {...register('periodInDays')}
                    />
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <InputGroup>
                    <InputLeftAddon>R$</InputLeftAddon>
                    <CustomInput
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
                          color={green}
                          fontWeight={'bold'}
                        >
                          <Text>{membership.user.name}</Text>
                        </Link>
                      </Td>
                      <Td>{membership.user.profile?.studyClass}</Td>
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

export const getServerSideProps: GetServerSideProps = async () => {
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
