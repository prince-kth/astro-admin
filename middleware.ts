import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Add paths that don't require authentication
const publicPaths = ['/login']

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.has('isAuthenticated')
  const { pathname } = request.nextUrl

  // Allow access to public paths without authentication
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    // If not authenticated, redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If authenticated and trying to access root, redirect to dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

// Configure which paths should be handled by middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/ (API routes)
     * 2. /_next/ (Next.js internals)
     * 3. /_static (inside /public)
     * 4. /_vercel (Vercel internals)
     * 5. /favicon.ico, /sitemap.xml (static files)
     */
    '/((?!api|_next|_static|_vercel|favicon.ico|sitemap.xml).*)',
  ],
}
