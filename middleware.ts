import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const publicPaths = [
    "/",
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
    "/play",
    "/api/auth",
  ]

  const isPublicPath = publicPaths.some(
    (p) => path === p || path.startsWith(`${p}/`)
  )

  // Get the token using the same secret as NextAuth
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // If trying to access sign-in/sign-up while logged in, redirect to dashboard
  if (token && (path === '/sign-in' || path === '/sign-up')) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  // If trying to access protected route without token
  if (!token && !isPublicPath) {
    const url = new URL('/sign-in', request.url)
    url.searchParams.set('callbackUrl', encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)"],
}

