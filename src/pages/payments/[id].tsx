import { formatPrice } from '@/components/atoms';
import { Layout } from '@/components/templates';
import { prisma } from '@/server/prisma';
import { trpc } from '@/utils/trpc';
import {
  Badge,
  Button,
  Card,
  Heading,
  HStack,
  IconButton,
  Input,
  Link,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Select,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Tr,
  useDisclosure,
} from '@chakra-ui/react';
import { Payment } from '@prisma/client';
import { GetServerSideProps } from 'next';
import { unstable_getServerSession, User } from 'next-auth';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useRef } from 'react';
import { CgArrowsExchange } from 'react-icons/cg';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { MdDelete } from 'react-icons/md';
import { authOptions } from '../api/auth/[...nextauth]';

function Payment({ payment }: { payment: Payment & { user: User } }) {
  const router = useRouter();
  const popover = useDisclosure();
  const updatePayment = trpc.payment.update.useMutation({
    onSuccess: () => router.replace(router.asPath),
  });
  const handleSwitchMethod = async (method: string) => {
    await updatePayment.mutateAsync({ id: payment.id, method }).then(() => {
      popover.onClose();
    });
  };

  const checkoutPayment = trpc.payment.checkout.useMutation();
  const handleCheckout = async () => {
    await checkoutPayment.mutateAsync(payment.id).then((data) => {
      router.push(data.url as string);
    });
  };

  const cancelPayment = trpc.payment.cancel.useMutation({
    onSuccess: () => router.replace(router.asPath),
  });
  const handleCancel = async () => {
    await cancelPayment.mutateAsync(payment.id);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleOnFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await updatePayment.mutateAsync({
        id: payment.id,
        attachment: file.name,
      });
    }
  };

  return (
    <Layout>
      <Card rounded="lg" p={8} maxW="md" mx="auto">
        <Stack spacing={4}>
          <Heading size="md">Pagamento</Heading>
          <TableContainer>
            <Table size="sm">
              <Tbody>
                <Tr>
                  <Th>ID</Th>
                  <Td>{payment.id}</Td>
                </Tr>
                <Tr>
                  <Th>Ref ID</Th>
                  <Td>{payment.refId || '---'}</Td>
                </Tr>
                <Tr>
                  <Th>Usuário</Th>
                  <Td>{payment.user.email}</Td>
                </Tr>
                <Tr>
                  <Th>Método</Th>
                  <Td>
                    <HStack>
                      <Text>{payment.method}</Text>
                      <Popover
                        isOpen={popover.isOpen}
                        onClose={popover.onClose}
                        onOpen={popover.onOpen}
                      >
                        <PopoverTrigger>
                          <IconButton
                            aria-label="switch"
                            size="sm"
                            colorScheme="blue"
                            variant={'outline'}
                            icon={<CgArrowsExchange size="1rem" />}
                          />
                        </PopoverTrigger>
                        <PopoverContent
                          color="white"
                          bg="blue.800"
                          borderColor="blue.800"
                        >
                          <PopoverArrow />
                          <PopoverCloseButton />
                          <PopoverHeader>
                            <Text fontWeight={'bold'}>
                              Alterar forma de pagamento
                            </Text>
                          </PopoverHeader>
                          <PopoverBody>
                            <Select
                              placeholder="Selecione uma opção..."
                              defaultValue={payment.method}
                              onChange={(e) =>
                                handleSwitchMethod(e.target.value)
                              }
                            >
                              <option value="PIX">PIX</option>
                              <option value="STRIPE">
                                Cartão de crédito (à vista)
                              </option>
                              <option value="PAGSEGURO">
                                Cartão de crédito (parcelado)
                              </option>
                            </Select>
                          </PopoverBody>
                        </PopoverContent>
                      </Popover>
                    </HStack>
                  </Td>
                </Tr>
                <Tr>
                  <Th>Total</Th>
                  <Td>{formatPrice(payment.amount)}</Td>
                </Tr>
                <Tr>
                  <Th>Status</Th>
                  <Td>
                    {payment.paid ? (
                      <Badge colorScheme="green">PAGO</Badge>
                    ) : payment.expired ? (
                      <Badge colorScheme="gray">EXPIRADO</Badge>
                    ) : payment.canceled ? (
                      <Badge colorScheme="red">CANCELADO</Badge>
                    ) : (
                      <Badge colorScheme="orange">PENDENTE</Badge>
                    )}
                  </Td>
                </Tr>
                <Tr>
                  <Th>Criado em</Th>
                  <Td>{new Date(payment.createdAt).toISOString()}</Td>
                </Tr>
                <Tr>
                  <Th>Atualizado em</Th>
                  <Td>{new Date(payment.updatedAt).toISOString()}</Td>
                </Tr>
                <Tr>
                  <Th>Anexo</Th>
                  <Td>
                    <Input
                      hidden
                      ref={fileInputRef}
                      type="file"
                      onChange={handleOnFileChange}
                    />
                    {payment.attachment ? (
                      <HStack>
                        <Link
                          as={NextLink}
                          href={payment.attachment as string}
                          isExternal
                        >
                          <Button
                            colorScheme="blue"
                            variant={'outline'}
                            size="sm"
                            rightIcon={<HiOutlineExternalLink />}
                          >
                            Abrir
                          </Button>
                        </Link>
                        <IconButton
                          icon={<MdDelete />}
                          aria-label="remove"
                          variant={'ghost'}
                          colorScheme="red"
                          size="sm"
                          onClick={() => {
                            updatePayment.mutateAsync({
                              id: payment.id,
                              attachment: '',
                            });
                          }}
                        />
                      </HStack>
                    ) : (
                      <Text>---</Text>
                    )}
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
          {!payment.canceled && (
            <Stack>
              {payment.method === 'PIX' ? (
                <Button
                  colorScheme={'blue'}
                  onClick={handleButtonClick}
                  isDisabled={!!payment.attachment}
                >
                  Anexar comprovante
                </Button>
              ) : (
                <Button
                  colorScheme={'blue'}
                  onClick={handleCheckout}
                  isLoading={checkoutPayment.isLoading}
                >
                  Pagar
                </Button>
              )}
              <Button colorScheme={'red'} onClick={handleCancel}>
                Cancelar
              </Button>
            </Stack>
          )}
        </Stack>
      </Card>
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
        destination: '/login',
        permanent: false,
      },
    };
  }

  const payment = await prisma.payment.findUnique({
    where: {
      id: ctx.query.id as string,
    },
    include: {
      user: true,
    },
  });

  if (!payment) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      session,
      payment: JSON.parse(JSON.stringify(payment)),
    },
  };
};

export default Payment;
