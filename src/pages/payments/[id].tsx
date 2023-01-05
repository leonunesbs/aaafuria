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
  useToast,
  VisuallyHiddenInput,
} from '@chakra-ui/react';
import { Membership, Order, Payment } from '@prisma/client';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import { User } from 'next-auth';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import { CgArrowsExchange } from 'react-icons/cg';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { MdDelete } from 'react-icons/md';

function Payment({
  payment,
}: {
  payment: Payment & { user: User; membership: Membership; order: Order };
}) {
  const router = useRouter();
  const toast = useToast({ position: 'top' });
  const drawer = useDisclosure();
  const updatePayment = trpc.payment.update.useMutation({
    onSuccess: () =>
      router.replace(router.asPath, undefined, { scroll: false }),
  });
  const handleSwitchMethod = async (method: string) => {
    await updatePayment.mutateAsync({ id: payment.id, method }).then(() => {
      drawer.onClose();
    });
  };

  const confirmPayment = trpc.payment.confirm.useMutation({
    onSuccess: () => {
      toast({
        title: 'Pagamento confirmado',
        status: 'success',
        isClosable: true,
      });
      router.replace(router.asPath, undefined, { scroll: false });
    },
  });
  const checkoutPayment = trpc.payment.checkout.useMutation();
  const handleCheckout = async () => {
    await checkoutPayment.mutateAsync(payment.id).then((data) => {
      router.push(data.url as string);
    });
  };

  const cancelPayment = trpc.payment.cancel.useMutation({
    onSuccess: () =>
      router.replace(router.asPath, undefined, { scroll: false }),
    onError: (err) => {
      toast({
        title: 'Erro ao cancelar pagamento',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });
  const handleCancel = () => {
    cancelPayment.mutate(payment.id);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const getSignedUrl = trpc.s3.getSignedUrl.useMutation();
  const [uploading, setUploading] = useState(false);
  const handleOnFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploading(true);
    const file = e.target.files?.[0];
    if (file) {
      await getSignedUrl
        .mutateAsync({
          name: file.name,
          type: file.type,
          path: `media/payments/${payment.id}`,
          size: file.size,
        })
        .then(async (data) => {
          const url = data.url;
          await axios
            .put(url, file, {
              headers: {
                'Content-Type': file.type,
                'Access-Control-Allow-Origin': '*',
                'Content-Disposition': 'inline',
              },
            })
            .then(() => {
              updatePayment.mutate({
                id: payment.id,
                attachment: url.split('?')[0],
              });
              setUploading(false);
            });
        })
        .catch((err) => {
          toast({
            title: 'Erro ao enviar arquivo',
            description: err.message,
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
          setUploading(false);
        });
    }
  };

  const deleteFile = trpc.s3.deleteFile.useMutation();
  const handleDeleteFile = async () => {
    const fileName = payment.attachment?.split('.com/')[1];
    await deleteFile.mutateAsync(fileName as string).then(() => {
      updatePayment.mutate({
        id: payment.id,
        attachment: null,
      });
    });
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
                {payment.order && (
                  <Tr>
                    <Th>Pedido</Th>
                    <Td>{payment.order.id}</Td>
                  </Tr>
                )}
                {payment.membership && (
                  <Tr>
                    <Th>Associação</Th>
                    <Td>{payment.membership.id}</Td>
                  </Tr>
                )}

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
                            onClick={drawer.onOpen}
                            size="xs"
                            leftIcon={<CgArrowsExchange size="1rem" />}
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
                  <Td>
                    {new Date(payment.createdAt).toLocaleString('pt-BR', {
                      timeZone: 'America/Sao_Paulo',
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </Td>
                </Tr>
                <Tr>
                  <Th>Atualizado em</Th>
                  <Td>
                    {new Date(payment.updatedAt).toLocaleString('pt-BR', {
                      timeZone: 'America/Sao_Paulo',
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </Td>
                </Tr>
                <Tr>
                  <Th>Anexo</Th>
                  <Td>
                    <VisuallyHiddenInput
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
                              onClick={handleDeleteFile}
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
              {!payment.paid && (
                <Button
                  colorScheme={'green'}
                  onClick={() => {
                    confirmPayment.mutate(payment.id);
                  }}
                  isLoading={confirmPayment.isLoading}
                >
                  Confirmar pagamento
                </Button>
              )}
              {payment.method === 'PIX' ? (
                <Button
                  onClick={handleButtonClick}
                  isDisabled={!!payment.attachment}
                  isLoading={uploading}
                  loadingText="Enviando..."
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
              <Button
                colorScheme={'red'}
                onClick={handleCancel}
                isLoading={cancelPayment.isLoading}
              >
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
  const payment = await prisma.payment.findUnique({
    where: {
      id: ctx.query.id as string,
    },
    include: {
      user: true,
      membership: true,
      order: true,
    },
  });

  if (!payment) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      payment: JSON.parse(JSON.stringify(payment)),
    },
  };
};

export default Payment;
