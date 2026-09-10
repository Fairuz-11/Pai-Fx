import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname

        // Public paths that don't require authentication
        const publicPaths = [
          '/',
          '/login',
          '/register',
          '/market',
          '/chart',
          '/analysis',
        ]

        // Check if current path is public
        const isPublicPath = publicPaths.some(publicPath => 
          path === publicPath || path.startsWith(publicPath + '/')
        )

        // API routes are public
        if (path.startsWith('/api/')) {
          return true
        }

        // Public paths are accessible to everyone
        if (isPublicPath) {
          return true
        }

        // Protected paths require authentication
        return !!token
      },
    },
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}
