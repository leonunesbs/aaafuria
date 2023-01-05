import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(request) {
    if (request.nextUrl.pathname.startsWith('/admin')) {
      const token = request.nextauth.token;
      if (!token?.isStaff) {
        return NextResponse.redirect(new URL('/403', request.nextUrl.href));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/activities',
    '/payments/:path*',
    '/store/cart',
  ],
};
