import { GetServerSideProps } from 'next';
import { Layout } from '@/components/templates';
import { authOptions } from './api/auth/[...nextauth]';
import { unstable_getServerSession } from 'next-auth';

export default function Home() {
  return <Layout title="Início">Teste</Layout>;
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
        destination: `/auth/login?callbackUrl=${ctx.resolvedUrl}`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
};
