import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // For development purposes, bypass authentication
  // DEVELOPMENT ONLY: Skip authentication checks
  return NextResponse.next()

  // COMMENTED OUT FOR DEVELOPMENT
  /*
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is not signed in and the current path is not / or /auth,
  // redirect the user to /auth
  if (!session && req.nextUrl.pathname !== '/auth') {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  return res
  */
}

// Specify which routes should be protected
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /auth (auth page)
     * - /api/auth (auth API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|auth|api/auth).*)',
  ],
} 