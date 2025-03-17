import { clerkMiddleware } from "@clerk/nextjs/server"

// Export the Clerk middleware as the default middleware
export default clerkMiddleware({
  publicRoutes: ["/api/webhooks/clerk", "/play/:path*"],
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)"],
}

