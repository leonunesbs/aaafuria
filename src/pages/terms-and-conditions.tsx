import { Heading, ListItem, OrderedList, Stack, Text } from '@chakra-ui/react';

import { Layout } from '@/components/templates';

function TermsAndConditions() {
  return (
    <Layout title="Termos e condições">
      <Stack spacing={4}>
        <Stack>
          <Heading size="md" as="h2">
            1. Termos
          </Heading>
          <Text>
            Ao acessar ao site A.A.A. FÚRIA, concorda em cumprir estes termos de
            serviço, todas as leis e regulamentos aplicáveis ​​e concorda que é
            responsável pelo cumprimento de todas as leis locais aplicáveis. Se
            você não concordar com algum desses termos, está proibido de usar ou
            acessar este site. Os materiais contidos neste site são protegidos
            pelas leis de direitos autorais e marcas comerciais aplicáveis.
          </Text>
        </Stack>
        <Stack>
          <Heading size="md" as="h2">
            2. Uso de Licença
          </Heading>
          <Text>
            É concedida permissão para baixar temporariamente uma cópia dos
            materiais (informações ou software) no site A.A.A. FÚRIA , apenas
            para visualização transitória pessoal e não comercial. Esta é a
            concessão de uma licença, não uma transferência de título e, sob
            esta licença, você não pode:
          </Text>
          <OrderedList pl={4}>
            <ListItem>modificar ou copiar os materiais;</ListItem>
            <ListItem>
              usar os materiais para qualquer finalidade comercial ou para
              exibição pública (comercial ou não comercial);
            </ListItem>
            <ListItem>
              tentar descompilar ou fazer engenharia reversa de qualquer
              software contido no site A.A.A. FÚRIA;
            </ListItem>
            <ListItem>
              remover quaisquer direitos autorais ou outras notações de
              propriedade dos materiais; ou
            </ListItem>
            <ListItem>
              transferir os materiais para outra pessoa ou espelhe os materiais
              em qualquer outro servidor.
            </ListItem>
          </OrderedList>
          <Text>
            Esta licença será automaticamente rescindida se você violar alguma
            dessas restrições e poderá ser rescindida por A.A.A. FÚRIA a
            qualquer momento. Ao encerrar a visualização desses materiais ou
            após o término desta licença, você deve apagar todos os materiais
            baixados em sua posse, seja em formato eletrónico ou impresso.
          </Text>
        </Stack>
        <Stack>
          <Heading size="md" as="h2">
            3. Isenção de responsabilidade
          </Heading>
          <OrderedList pl={4}>
            <ListItem>
              Os materiais no site da A.A.A. FÚRIA são fornecidos como estão.
              A.A.A. FÚRIA não oferece garantias, expressas ou implícitas, e,
              por este meio, isenta e nega todas as outras garantias, incluindo,
              sem limitação, garantias implícitas ou condições de
              comercialização, adequação a um fim específico ou não violação de
              propriedade intelectual ou outra violação de direitos.
            </ListItem>
            <ListItem>
              Além disso, o A.A.A. FÚRIA não garante ou faz qualquer
              representação relativa à precisão, aos resultados prováveis ​​ou à
              confiabilidade do uso dos materiais em seu site ou de outra forma
              relacionado a esses materiais ou em sites vinculados a este site.
            </ListItem>
          </OrderedList>
        </Stack>
        <Stack>
          <Heading size="md" as="h2">
            4. Limitações
          </Heading>
          <Text>
            Em nenhum caso o A.A.A. FÚRIA ou seus fornecedores serão
            responsáveis ​​por quaisquer danos (incluindo, sem limitação, danos
            por perda de dados ou lucro ou devido a interrupção dos negócios)
            decorrentes do uso ou da incapacidade de usar os materiais em A.A.A.
            FÚRIA, mesmo que A.A.A. FÚRIA ou um representante autorizado da
            A.A.A. FÚRIA tenha sido notificado oralmente ou por escrito da
            possibilidade de tais danos. Como algumas jurisdições não permitem
            limitações em garantias implícitas, ou limitações de
            responsabilidade por danos conseqüentes ou incidentais, essas
            limitações podem não se aplicar a você.
          </Text>
        </Stack>
        <Stack>
          <Heading size="md" as="h2">
            5. Precisão dos materiais
          </Heading>
          <Text>
            Os materiais exibidos no site da A.A.A. FÚRIA podem incluir erros
            técnicos, tipográficos ou fotográficos. A.A.A. FÚRIA não garante que
            qualquer material em seu site seja preciso, completo ou atual.
            A.A.A. FÚRIA pode fazer alterações nos materiais contidos em seu
            site a qualquer momento, sem aviso prévio. No entanto, A.A.A. FÚRIA
            não se compromete a atualizar os materiais.
          </Text>
        </Stack>
        <Stack>
          <Heading size="md" as="h2">
            5. Links
          </Heading>
          <Text>
            O A.A.A. FÚRIA não analisou todos os sites vinculados ao seu site e
            não é responsável pelo conteúdo de nenhum site vinculado. A inclusão
            de qualquer link não implica endosso por A.A.A. FÚRIA do site. O uso
            de qualquer site vinculado é por conta e risco do usuário.
          </Text>
        </Stack>
        <Stack>
          <Text>Modificações</Text>
          <Text>
            O A.A.A. FÚRIA pode revisar estes termos de serviço do site a
            qualquer momento, sem aviso prévio. Ao usar este site, você concorda
            em ficar vinculado à versão atual desses termos de serviço.
          </Text>
          <Text>Lei aplicável</Text>
          <Text>
            Estes termos e condições são regidos e interpretados de acordo com
            as leis do A.A.A. FÚRIA e você se submete irrevogavelmente à
            jurisdição exclusiva dos tribunais naquele estado ou localidade.
          </Text>
        </Stack>
      </Stack>
    </Layout>
  );
}

export default TermsAndConditions;
