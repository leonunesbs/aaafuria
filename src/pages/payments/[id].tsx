import { formatPrice, Loading } from '@/components/atoms';
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
  Skeleton,
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
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRef } from 'react';

import { Layout } from '@/components/templates';
import { trpc } from '@/utils/trpc';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { CgArrowsExchange } from 'react-icons/cg';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { MdDelete } from 'react-icons/md';

function Payment({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const toast = useToast({ position: 'top' });
  const drawer = useDisclosure();
  const { data } = useSession();

  const {
    data: payment,
    isLoading,
    refetch,
  } = trpc.payment.get.useQuery(paymentId);
  const handleRefresh = () => refetch();
  const updatePayment = trpc.payment.update.useMutation({
    onSuccess: () => handleRefresh(),
  });
  const handleSwitchMethod = async (method: string) => {
    await updatePayment.mutateAsync({ id: paymentId, method }).then(() => {
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
      handleRefresh();
    },
  });
  const checkoutPayment = trpc.payment.checkout.useMutation();
  const handleCheckout = async () => {
    await checkoutPayment.mutateAsync(paymentId).then((data) => {
      router.push(data.url as string);
    });
  };

  const cancelPayment = trpc.payment.cancel.useMutation({
    onSuccess: () => handleRefresh(),
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
    cancelPayment.mutate(paymentId);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const getSignedUrl = trpc.s3.getSignedUrl.useMutation();
  const handleOnFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await getSignedUrl
        .mutateAsync({
          name: file.name,
          type: file.type,
          path: `media/payments/${paymentId}`,
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
                id: paymentId,
                attachment: url.split('?')[0],
              });
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
        });
    }
  };

  const deleteFile = trpc.s3.deleteFile.useMutation({
    onSuccess: () => handleRefresh(),
  });
  const handleDeleteFile = async () => {
    const fileName = payment?.attachment?.split('.com/')[1];
    await deleteFile.mutateAsync(fileName as string).then(() => {
      updatePayment.mutate({
        id: paymentId,
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
                  <Td>{paymentId}</Td>
                </Tr>
                <Tr>
                  <Th>Ref ID</Th>
                  <Td>
                    <Skeleton isLoaded={!isLoading}>
                      {payment?.refId || '---'}
                    </Skeleton>
                  </Td>
                </Tr>
                <Tr>
                  <Th>Usuário</Th>
                  <Td>
                    <Skeleton isLoaded={!isLoading}>
                      {payment?.user.email || '---'}
                    </Skeleton>
                  </Td>
                </Tr>
                {payment?.order && (
                  <Tr>
                    <Th>Pedido</Th>
                    <Td>
                      <Skeleton isLoaded={!isLoading}>
                        {payment?.order.id || '---'}
                      </Skeleton>
                    </Td>
                  </Tr>
                )}
                {payment?.membership && (
                  <Tr>
                    <Th>Associação</Th>
                    <Td>
                      <Skeleton isLoaded={!isLoading}>
                        {payment?.membership.id || '---'}
                      </Skeleton>
                    </Td>
                  </Tr>
                )}

                <Tr>
                  <Th>Método</Th>
                  <Td>
                    <Skeleton isLoaded={!isLoading}>
                      <HStack>
                        <Text>{payment?.method}</Text>
                        {!payment?.canceled &&
                          !payment?.paid &&
                          !payment?.expired && (
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
                                defaultValue={payment?.method}
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
                    </Skeleton>
                  </Td>
                </Tr>
                <Tr>
                  <Th>Total</Th>
                  <Td>
                    <Skeleton isLoaded={!isLoading}>
                      {formatPrice(payment?.amount as number)}
                    </Skeleton>
                  </Td>
                </Tr>
                <Tr>
                  <Th>Status</Th>
                  <Td>
                    <Skeleton isLoaded={!isLoading}>
                      {payment?.paid ? (
                        <Badge colorScheme="green">PAGO</Badge>
                      ) : payment?.expired ? (
                        <Badge colorScheme="gray">EXPIRADO</Badge>
                      ) : payment?.canceled ? (
                        <Badge colorScheme="red">CANCELADO</Badge>
                      ) : (
                        <Badge colorScheme="orange">PENDENTE</Badge>
                      )}
                    </Skeleton>
                  </Td>
                </Tr>
                <Tr>
                  <Th>Pedido</Th>
                  <Td>
                    <Skeleton isLoaded={!isLoading}>
                      {payment?.order?.id || '---'}
                    </Skeleton>
                  </Td>
                </Tr>
                <Tr>
                  <Th>Associação</Th>
                  <Td>
                    <Skeleton isLoaded={!isLoading}>
                      {payment?.membership?.id || '---'}
                    </Skeleton>
                  </Td>
                </Tr>
                <Tr>
                  <Th>Criado em</Th>
                  <Td>
                    <Skeleton isLoaded={!isLoading}>
                      {payment?.createdAt.toLocaleString('pt-BR', {
                        timeZone: 'America/Sao_Paulo',
                        dateStyle: 'short',
                        timeStyle: 'short',
                      }) || '---'}
                    </Skeleton>
                  </Td>
                </Tr>
                <Tr>
                  <Th>Atualizado em</Th>
                  <Td>
                    <Skeleton isLoaded={!isLoading}>
                      {payment?.updatedAt.toLocaleString('pt-BR', {
                        timeZone: 'America/Sao_Paulo',
                        dateStyle: 'short',
                        timeStyle: 'short',
                      }) || '---'}
                    </Skeleton>
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
                    {payment?.attachment ? (
                      <HStack>
                        <Link
                          as={NextLink}
                          href={payment?.attachment as string}
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
                        {!payment?.canceled &&
                          !payment?.paid &&
                          !payment?.expired && (
                            <IconButton
                              icon={<MdDelete />}
                              aria-label="remove"
                              variant={'ghost'}
                              colorScheme="red"
                              size="sm"
                              onClick={handleDeleteFile}
                              isLoading={deleteFile.isLoading}
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
        {isLoading ? (
          <Loading />
        ) : (
          <CardFooter>
            {!payment?.canceled && !payment?.paid && (
              <Stack w="full">
                {payment?.method === 'PIX' ? (
                  <Button
                    onClick={handleButtonClick}
                    isDisabled={!!payment.attachment}
                    isLoading={updatePayment.isLoading}
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
                {data?.user.isStaff && (
                  <Stack>
                    {!payment?.paid && (
                      <Button
                        colorScheme={'green'}
                        onClick={() => {
                          confirmPayment.mutate(paymentId);
                        }}
                        isLoading={confirmPayment.isLoading}
                      >
                        Confirmar pagamento
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
              </Stack>
            )}
          </CardFooter>
        )}
      </Card>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  return {
    props: {
      paymentId: ctx.params?.id as string,
    },
    revalidate: 5,
  };
};

export default Payment;
