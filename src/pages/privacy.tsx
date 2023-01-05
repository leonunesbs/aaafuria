import { Heading, List, ListItem, Stack, Text } from '@chakra-ui/react';

import { ColorContext } from '@/contexts';
import { Layout } from '@/components/templates';
import { useContext } from 'react';

function PrivacyPolicy() {
  const { green } = useContext(ColorContext);
  return (
    <Layout title="Política de privacidade">
      <Stack>
        <Heading as="h2">
          <Text color="gray.800">Política Privacidade</Text>
        </Heading>

        <Text color="gray.800">
          A sua privacidade é importante para nós. É política do A.A.A. FÚRIA
          respeitar a sua privacidade em relação a qualquer informação sua que
          possamos coletar no site <Text color={green}>A.A.A. FÚRIA</Text>, e
          outros sites que possuímos e operamos.
        </Text>

        <Text color="gray.800">
          Solicitamos informações pessoais apenas quando realmente precisamos
          delas para lhe fornecer um serviço. Fazemo-lo por meios justos e
          legais, com o seu conhecimento e consentimento. Também informamos por
          que estamos coletando e como será usado.
        </Text>

        <Text color="gray.800">
          Apenas retemos as informações coletadas pelo tempo necessário para
          fornecer o serviço solicitado. Quando armazenamos dados, protegemos
          dentro de meios comercialmente aceitáveis ​​para evitar perdas e
          roubos, bem como acesso, divulgação, cópia, uso ou modificação não
          autorizados.
        </Text>

        <Text color="gray.800">
          Não compartilhamos informações de identificação pessoal publicamente
          ou com terceiros, exceto quando exigido por lei.
        </Text>

        <Text color="gray.800">
          O nosso site pode ter links para sites externos que não são operados
          por nós. Esteja ciente de que não temos controle sobre o conteúdo e
          práticas desses sites e não podemos aceitar responsabilidade por suas
          respectivas políticas de privacidade.
        </Text>

        <Text color="gray.800">
          Você é livre para recusar a nossa solicitação de informações pessoais,
          entendendo que talvez não possamos fornecer alguns dos serviços
          desejados.
        </Text>

        <Text color="gray.800">
          O uso continuado de nosso site será considerado como aceitação de
          nossas práticas em torno de privacidade e informações pessoais. Se
          você tiver alguma dúvida sobre como lidamos com dados do usuário e
          informações pessoais, entre em contacto connosco.
        </Text>

        <Text color="gray.800"></Text>
        <Heading as="h3" size={'md'}>
          <Text color="gray.800">Compromisso do Usuário</Text>
        </Heading>

        <Text color="gray.800">
          O usuário se compromete a fazer uso adequado dos conteúdos e da
          informação que o A.A.A. FÚRIA oferece no site e com caráter
          enunciativo, mas não limitativo:
        </Text>
        <List>
          <ListItem>
            <Text color="gray.800">
              A- Não se envolver em atividades que sejam ilegais ou contrárias à
              boa fé a à ordem pública;
            </Text>
          </ListItem>
          <ListItem>
            <Text color="gray.800">
              B- Não difundir propaganda ou conteúdo de natureza racista,
              xenofóbica, qualquer tipo de pornografia, de apologia ao
              terrorismo ou contra os direitos humanos;
            </Text>
          </ListItem>
          <ListItem>
            <Text color="gray.800">
              C- Não causar danos aos sistemas físicos (hardwares) e lógicos
              (softwares) do A.A.A. FÚRIA, de seus fornecedores ou terceiros,
              para introduzir ou disseminar vírus informáticos ou quaisquer
              outros sistemas de hardware ou software que sejam capazes de
              causar danos anteriormente mencionados.
            </Text>
          </ListItem>
        </List>
        <Heading as="h3" size={'md'}>
          <Text color="gray.800">Mais informações</Text>
        </Heading>

        <Text color="gray.800">
          Esperemos que esteja esclarecido e, como mencionado anteriormente, se
          houver algo que você não tem certeza se precisa ou não, geralmente é
          mais seguro deixar os cookies ativados, caso interaja com um dos
          recursos que você usa em nosso site.
        </Text>

        <Text color="gray.800">
          Esta política é efetiva a partir de&nbsp;4 January 2023 17:35
        </Text>
      </Stack>
    </Layout>
  );
}

export default PrivacyPolicy;
