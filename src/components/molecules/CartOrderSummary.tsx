import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Radio,
  RadioGroup,
  Stack,
  Text,
  useColorModeValue as mode,
} from '@chakra-ui/react';

import { FaArrowRight } from 'react-icons/fa';
import { formatPrice } from '../atoms';
import { trpc } from '@/utils/trpc';
import { useRouter } from 'next/router';
import { useState } from 'react';

interface CartOrderSummaryProps {
  orderId: string;
  subTotal: number;
  total: number;
}

const OrderSummaryItem = (props: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) => {
  const { label, value, children } = props;
  return (
    <Flex justify="space-between" fontSize="sm">
      <Text fontWeight="medium" color={mode('gray.600', 'gray.400')}>
        {label}
      </Text>
      {value ? <Text fontWeight="medium">{value}</Text> : children}
    </Flex>
  );
};

export function CartOrderSummary({
  orderId,
  subTotal,
  total,
}: CartOrderSummaryProps) {
  const router = useRouter();
  const [method, setMethod] = useState('');
  const checkout = trpc.store.cart.checkout.useMutation();
  const { data: isMember } = trpc.isMember.useQuery();
  const handleCheckout = async () => {
    await checkout.mutateAsync({ orderId, method }).then((data) => {
      router.push(`/payments/${data?.paymentId}`);
    });
  };
  return (
    <Stack spacing="10" borderWidth="1px" rounded="lg" padding="6" width="full">
      <Heading size="md">Resumo do pedido</Heading>

      <Stack spacing="6">
        <OrderSummaryItem label="Subtotal" value={formatPrice(subTotal)} />
        {isMember && (
          <OrderSummaryItem
            label="Sócio Fúria"
            value={formatPrice(total - subTotal)}
          />
        )}

        <Flex justify="space-between">
          <Text fontSize="lg" fontWeight="semibold">
            Total
          </Text>
          <Text fontSize="xl" fontWeight="extrabold">
            {formatPrice(total)}
          </Text>
        </Flex>
      </Stack>
      <FormControl>
        <FormLabel>
          <Heading size="sm">Forma de pagamento</Heading>
        </FormLabel>

        <RadioGroup value={method} onChange={setMethod}>
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
      <Button
        colorScheme="blue"
        size="lg"
        fontSize="md"
        rightIcon={<FaArrowRight />}
        isLoading={checkout.isLoading}
        onClick={handleCheckout}
        isDisabled={!method}
      >
        Pagar
      </Button>
    </Stack>
  );
}
