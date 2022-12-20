import { formatPrice } from '@/components/atoms';
import { Layout } from '@/components/templates';
import { prisma } from '@/server/prisma';
import { trpc } from '@/utils/trpc';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Heading,
  HStack,
  IconButton,
  Input,
  Link,
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
  const drawer = useDisclosure();
  const updatePayment = trpc.payment.update.useMutation({
    onSuccess: () => router.replace(router.asPath),
  });
  const handleSwitchMethod = async (method: string) => {
    await updatePayment.mutateAsync({ id: payment.id, method }).then(() => {
      drawer.onClose();
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
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <Layout title="Pagamento">
      <Card maxW="md" mx="auto" variant={'responsive'}>
        <CardHeader>
          <Heading size="md">Pagamento</Heading>
        </CardHeader>
        <CardBody>
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
                      {!payment.canceled &&
                        !payment.paid &&
                        !payment.expired && (
                          <Button
                            ref={btnRef}
                            size="xs"
                            leftIcon={<CgArrowsExchange size="1rem" />}
                            onClick={drawer.onOpen}
                          >
                            Alterar
                          </Button>
                        )}
                      <Drawer
                        isOpen={drawer.isOpen}
                        placement="bottom"
                        onClose={drawer.onClose}
                        finalFocusRef={btnRef}
                      >
                        <DrawerOverlay />
                        <DrawerContent>
                          <DrawerCloseButton />
                          <DrawerHeader>
                            Alterar forma de pagamento
                          </DrawerHeader>

                          <DrawerBody>
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
                          </DrawerBody>
                          <DrawerFooter>
                            <Button mr={3} onClick={drawer.onClose}>
                              Cancelar
                            </Button>
                            <Button
                              colorScheme="green"
                              onClick={drawer.onClose}
                            >
                              Alterar
                            </Button>
                          </DrawerFooter>
                        </DrawerContent>
                      </Drawer>
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
                            colorScheme="green"
                            variant={'outline'}
                            size="sm"
                            rightIcon={<HiOutlineExternalLink />}
                          >
                            Abrir
                          </Button>
                        </Link>
                        {!payment.canceled &&
                          !payment.paid &&
                          !payment.expired && (
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
                          )}
                      </HStack>
                    ) : (
                      <Text>---</Text>
                    )}
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
        <CardFooter>
          {!payment.canceled && (
            <Stack w="full">
              {payment.method === 'PIX' ? (
                <Button
                  colorScheme={'green'}
                  onClick={handleButtonClick}
                  isDisabled={!!payment.attachment}
                >
                  Anexar comprovante
                </Button>
              ) : (
                <Button
                  colorScheme={'green'}
                  onClick={handleCheckout}
                  isLoading={checkoutPayment.isLoading}
                >
                  Pagar
                </Button>
              )}
              <Button colorScheme={'red'} onClick={handleCancel}>
                Cancelar pagamento
              </Button>
            </Stack>
          )}
        </CardFooter>
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
