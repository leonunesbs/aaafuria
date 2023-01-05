import {
  Card,
  CardBody,
  CardHeader,
  HStack,
  Heading,
  IconButton,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import {
  GroupWithSchedulesAndUsers,
  ScheduleWithGroupAndInterestedAndPresentUsers,
} from '@/pages/activities';

import { MdAdd } from 'react-icons/md';
import { ScheduleCard } from './ScheduleCard';
import { ScheduleDrawer } from '../organisms';
import { useState } from 'react';

interface GroupCardProps {
  group?: GroupWithSchedulesAndUsers;
  isStaff: boolean;
  refetch: () => void;
}

export function GroupCard({ group, isStaff, refetch }: GroupCardProps) {
  const scheduleDrawer = useDisclosure();
  const [activeSchedule, setActiveSchedule] = useState<
    ScheduleWithGroupAndInterestedAndPresentUsers | undefined
  >(undefined);

  const handleScheduleDrawer = async (
    schedule?: ScheduleWithGroupAndInterestedAndPresentUsers,
  ) => {
    setActiveSchedule(schedule);
    scheduleDrawer.onOpen();
  };

  if (group) {
    group.schedules = group.schedules.filter(
      (schedule) =>
        new Date(schedule.start) > new Date(Date.now() - 24 * 60 * 60 * 1000),
    );
  }

  return (
    <Card key={group?.id} maxW="xl">
      <CardHeader>
        <HStack w="full" justify="space-between">
          <Heading size="md">{group?.name}</Heading>
          <IconButton
            hidden={!isStaff}
            variant={'outline'}
            size="sm"
            colorScheme="green"
            aria-label="add schedule"
            icon={<MdAdd />}
            onClick={() => handleScheduleDrawer()}
          />
        </HStack>
        <ScheduleDrawer
          group={group}
          schedule={activeSchedule}
          refetch={refetch}
          {...scheduleDrawer}
        />
      </CardHeader>
      <CardBody>
        <Stack>
          {group?.schedules.map((schedule) => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              refetch={refetch}
            />
          ))}
          {!group?.schedules.length && (
            <Text as="i" textAlign={'center'}>
              Não há nenhuma atividade agendada para esse grupo.
            </Text>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
}
