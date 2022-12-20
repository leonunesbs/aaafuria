import { GetServerSideProps } from 'next';
import { Layout } from '@/components/templates';
import { authOptions } from './api/auth/[...nextauth]';
import { prisma } from '@/server/prisma';
import { unstable_getServerSession } from 'next-auth';

function Subscribe() {
  return (
    <Layout title="Seja Sócio">
      <h1>Subscribe</h1>
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

  const user = await prisma.user.findUnique({
    where: {
      email: session?.user?.email as string,
    },
    include: {
      profile: true,
    },
  });

  return {
    props: {
      user,
    },
  };
};

export default Subscribe;
