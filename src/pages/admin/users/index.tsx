import { GetServerSideProps } from 'next';
import { User } from '@prisma/client';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/server/prisma';
import { unstable_getServerSession } from 'next-auth';

function Users({ users }: { users: User[] }) {
  return (
    <>
      <h1>Users</h1>
    </>
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
        destination: `/login?after=${ctx.resolvedUrl}`,
        permanent: false,
      },
    };
  }

  const users = await prisma.user.findMany();

  return { props: { session, users: JSON.parse(JSON.stringify(users)) } };
};

export default Users;
