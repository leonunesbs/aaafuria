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
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

interface ScheduleCardProps {
  schedule: ScheduleWithGroupAndInterestedAndPresentUsers;
}

export function ScheduleCard({ schedule }: ScheduleCardProps) {
  const router = useRouter();
  const toast = useToast();
  const { data: session } = useSession();
  const scheduleDrawer = useDisclosure();
  const { green } = useContext(ColorContext);

  const [defaultChecked, setDefaultChecked] = useState<boolean>();

  const toggleInterest = trpc.schedule.toggleInterest.useMutation({
    onSuccess: () => {
      toast({
        title: 'Participação atualizada!',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
      router.replace(router.asPath, undefined, {
        scroll: false,
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
