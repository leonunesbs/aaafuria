import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerProps,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Link,
  Stack,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import {
  GroupWithSchedulesAndUsers,
  ScheduleWithGroupAndInterestedAndPresentUsers,
} from '@/pages/activities';
import { MdCheck, MdClose } from 'react-icons/md';
import { Profile, User } from '@prisma/client';
import { SubmitHandler, useForm } from 'react-hook-form';

import NextLink from 'next/link';
import { trpc } from '@/utils/trpc';
import { useRouter } from 'next/router';

interface ScheduleDrawerProps extends Omit<DrawerProps, 'children'> {
  group: GroupWithSchedulesAndUsers;
  schedule?: ScheduleWithGroupAndInterestedAndPresentUsers;
}

type FormInputs = {
  group: {
    name: string;
  };
  description: string;
  location: string;
  start: any;
  end?: any;
};

const InterestedUserRow = ({
  user,
  schedule,
}: {
  user: User & {
    profile?: Profile;
  };
  schedule?: ScheduleWithGroupAndInterestedAndPresentUsers;
}) => {
  const router = useRouter();
  const togglePresent = trpc.schedule.togglePresent.useMutation({
    onSuccess: () => {
      router.replace(router.asPath);
    },
  });
  const isPresent = schedule?.presentUsers.some(
    (presentUser) => presentUser.id === user.id,
  );
  return (
    <Tr key={user.id} bgColor={isPresent ? 'green.50' : 'initial'}>
      <Td>
        <Link as={NextLink} href={`/admin/users/${user.id}`} color="green.500">
          {user.name}
        </Link>
      </Td>
      <Td>{user.profile?.studyClass}</Td>
      <Td isNumeric>
        <IconButton
          size="sm"
          variant={'outline'}
          colorScheme={isPresent ? 'red' : 'green'}
          icon={isPresent ? <MdClose /> : <MdCheck />}
          aria-label="confirm user"
          onClick={() => {
            togglePresent.mutate({
              scheduleId: schedule?.id as string,
              userId: user.id,
            });
          }}
        />
      </Td>
    </Tr>
  );
};

export function ScheduleDrawer({
  group,
  schedule,
  ...rest
}: ScheduleDrawerProps) {
  const router = useRouter();
  const { onClose } = rest;

  const { handleSubmit, register, reset } = useForm<FormInputs>({
    defaultValues: {
      group: {
        name: schedule?.group.name || group.name,
      },
      description: schedule?.description || '',
      location: schedule?.location || '',
    },
  });
  const createSchedule = trpc.schedule.create.useMutation({
    onSuccess: () => {
      router.replace(router.asPath);
    },
  });
  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    createSchedule.mutate({
      ...data,
      groupId: group.id,
      start: new Date(data.start),
      end: data.end ? new Date(data.end) : undefined,
    });
    onClose();
    reset();
  };

  const deleteSchedule = trpc.schedule.delete.useMutation({
    onSuccess: () => {
      router.replace(router.asPath);
    },
  });

  return (
    <Drawer placement="right" size="md" {...rest}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Programação de atividade</DrawerHeader>
          <DrawerBody>
            <Stack>
              <FormControl isRequired isDisabled>
                <FormLabel>Nome da atividade</FormLabel>
                <Input isRequired {...register('group.name')} />
              </FormControl>
              <FormControl isRequired isDisabled={!!schedule}>
                <FormLabel>Descrição</FormLabel>
                <Input isRequired {...register('description')} />
              </FormControl>
              <FormControl isRequired isDisabled={!!schedule}>
                <FormLabel>Local</FormLabel>
                <Input isRequired {...register('location')} />
              </FormControl>
              <Stack direction={['column', 'row', 'row']}>
                <FormControl isRequired isDisabled={!!schedule}>
                  <FormLabel>Início</FormLabel>
                  <Input
                    isRequired
                    type={schedule ? 'text' : 'datetime-local'}
                    defaultValue={
                      schedule &&
                      new Date(schedule?.start as any).toLocaleString('pt-BR', {
                        timeZone: 'America/Sao_Paulo',
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })
                    }
                    {...register('start')}
                  />
                </FormControl>
                <FormControl isDisabled={!!schedule}>
                  <FormLabel>Fim</FormLabel>
                  <Input
                    {...register('end')}
                    type={schedule ? 'text' : 'datetime-local'}
                    defaultValue={
                      schedule?.end
                        ? new Date(schedule?.end as any).toLocaleString(
                            'pt-BR',
                            {
                              timeZone: 'America/Sao_Paulo',
                              dateStyle: 'short',
                              timeStyle: 'short',
                            },
                          )
                        : ''
                    }
                  />
                </FormControl>
              </Stack>
              <TableContainer>
                <Table size="sm">
                  <TableCaption placement="top">
                    Usuários confirmados
                  </TableCaption>
                  <Thead>
                    <Tr>
                      <Th>Nome</Th>
                      <Th>Turma</Th>
                      <Th isNumeric>Ações</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {schedule?.interestedUsers.map((user) => (
                      <InterestedUserRow
                        key={user.id}
                        user={user}
                        schedule={schedule}
                      />
                    ))}
                    {schedule?.interestedUsers.length === 0 && (
                      <Tr>
                        <Td colSpan={3} textAlign="center">
                          Nenhum usuário confirmado
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            </Stack>
          </DrawerBody>
          <DrawerFooter>
            <HStack>
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              {schedule ? (
                <Button
                  colorScheme="red"
                  onClick={() => deleteSchedule.mutate(schedule?.id as string)}
                >
                  Excluir
                </Button>
              ) : (
                <Button colorScheme="green" type="submit">
                  Adicionar
                </Button>
              )}
            </HStack>
          </DrawerFooter>
        </DrawerContent>
      </form>
    </Drawer>
  );
}
