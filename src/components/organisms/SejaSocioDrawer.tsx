import {
  Button,
  Card,
  CardBody,
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
  Heading,
  Radio,
  RadioGroup,
  Stack,
  Text,
} from '@chakra-ui/react';
import { ReactNode, useState } from 'react';

import { Plan } from '@prisma/client';
import { trpc } from '@/utils/trpc';
import { useRouter } from 'next/router';

interface SejaSocioDrawerProps extends Omit<DrawerProps, 'children'> {
  children?: ReactNode;
  plan?: Plan;
}

export function SejaSocioDrawer(props: SejaSocioDrawerProps) {
  const router = useRouter();
  const { isOpen, onClose, finalFocusRef, plan } = props;
  const [method, setMethod] = useState<string>('PIX');

  const checkoutPlan = trpc.plan.checkout.useMutation();
  const handleChekoutPlan = async () => {
    await checkoutPlan
      .mutateAsync({
        planId: plan?.id as string,
        method,
      })
      .then((data) => {
        router.push(`/payments/${data.paymentId}`);
      });
  };
  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      finalFocusRef={finalFocusRef}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Seja Sócio</DrawerHeader>

        <DrawerBody>
          <Stack spacing={4}>
            <Card>
              <CardBody>
                <Text textAlign="center">{plan?.name}</Text>
              </CardBody>
            </Card>
            <Stack>
              <FormControl>
                <FormLabel>
                  <Heading size="sm">Forma de pagamento</Heading>
                </FormLabel>

                <RadioGroup
                  value={method}
                  onChange={setMethod}
                  colorScheme="green"
                >
                  <Stack>
                    <Radio value="PIX" w="full">
                      PIX
                    </Radio>
                    <Radio value="STRIPE" w="full">
                      Cartão de crédito à vista
                    </Radio>
                    <Radio value="PAGSEGURO" w="full">
                      Cartão de crédito parcelado
                    </Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>
            </Stack>
          </Stack>
        </DrawerBody>

        <DrawerFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button colorScheme="green" onClick={handleChekoutPlan}>
            Pagar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
