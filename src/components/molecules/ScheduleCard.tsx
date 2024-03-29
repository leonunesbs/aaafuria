import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  Divider,
  HStack,
  Spinner,
  Stack,
  Switch,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import {
  GroupWithSchedulesAndUsers,
  ScheduleWithGroupAndInterestedAndPresentUsers,
} from '@/pages/activities';
import { useContext, useEffect, useState } from 'react';

import { ColorContext } from '@/contexts';
import { ScheduleDrawer } from '../organisms';
import { trpc } from '@/utils/trpc';
import { useSession } from 'next-auth/react';

interface ScheduleCardProps {
  schedule: ScheduleWithGroupAndInterestedAndPresentUsers;
  refetch: () => void;
}

export function ScheduleCard({ schedule, refetch }: ScheduleCardProps) {
  const { data: session } = useSession();
  const scheduleDrawer = useDisclosure();
  const { green } = useContext(ColorContext);
  const toast = useToast({
    position: 'top',
  });

  const [defaultChecked, setDefaultChecked] = useState<boolean>();

  const refreshData = () => {
    refetch();
  };

  const toggleInterest = trpc.schedule.toggleInterest.useMutation({
    onSuccess: () => refreshData(),
    onError: (error) => {
      toast({
        title: 'Erro ao adicionar ao carrinho',
        description: error.message,
        status: 'error',
        isClosable: true,
      });
    },
  });

  const handleSwitch = async () => {
    setDefaultChecked(!defaultChecked);
    await toggleInterest.mutateAsync(schedule.id);
  };

  useEffect(() => {
    if (
      schedule.interestedUsers.some(
        (interestUser) => interestUser.email === session?.user?.email,
      )
    ) {
      setDefaultChecked(true);
    } else {
      setDefaultChecked(false);
    }
  }, [schedule, session?.user?.email]);
  return (
    <Card key={schedule.id} variant={'responsive'}>
      <ScheduleDrawer
        group={schedule.group as GroupWithSchedulesAndUsers}
        schedule={schedule}
        refetch={refetch}
        {...scheduleDrawer}
      />
      <CardBody>
        <HStack justify={'space-between'} w="full">
          <Stack>
            <Text fontWeight={'bold'}>{schedule.description}</Text>
            <Text>Local: {schedule.location}</Text>
            <Text>
              Início:{' '}
              {new Date(schedule.start).toLocaleString('pt-BR', {
                timeZone: 'America/Sao_Paulo',
                dateStyle: 'short',
                timeStyle: 'short',
              })}
            </Text>
          </Stack>
          <Box>
            <Stack align={'center'}>
              {toggleInterest.isLoading ? (
                <Spinner color={green} />
              ) : (
                <Badge
                  colorScheme="green"
                  visibility={
                    schedule.interestedUsers.some(
                      (interestUser) =>
                        interestUser.email === session?.user?.email,
                    )
                      ? 'visible'
                      : 'hidden'
                  }
                >
                  Eu vou!
                </Badge>
              )}
              <Switch
                colorScheme={'green'}
                size="lg"
                isChecked={defaultChecked}
                onChange={handleSwitch}
                isDisabled={toggleInterest.isLoading}
              />
            </Stack>
          </Box>
        </HStack>
      </CardBody>
      <CardFooter pt={0}>
        <Stack w="full">
          <Button
            variant={'link'}
            colorScheme="green"
            size="xs"
            onClick={scheduleDrawer.onOpen}
          >
            Ver detalhes
          </Button>
          <Divider />
        </Stack>
      </CardFooter>
    </Card>
  );
}
