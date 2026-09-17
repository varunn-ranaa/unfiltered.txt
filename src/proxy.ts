import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
export { default } from "next-auth"
import { getToken } from 'next-auth/jwt'
 

export async function proxy(request: NextRequest) {
    const token = await getToken({req : request, secret: process.env.NEXTAUTH_SECRET})
    const { pathname } = request.nextUrl;

  const isAuthOnlyPath =
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/verify');

  if (token && isAuthOnlyPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
 
export const config = {
  matcher: [
    '/login',
    '/signup',
    '/',
    '/dashboard/:path*',
    '/verify/:path*',
    '/anonymous/:path*'
  ]
}