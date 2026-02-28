import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (!user && request.nextUrl.pathname.startsWith('/quotes')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (!user && request.nextUrl.pathname.startsWith('/invoices')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (!user && request.nextUrl.pathname.startsWith('/planning')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (!user && request.nextUrl.pathname.startsWith('/settings')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/quotes/:path*', '/invoices/:path*', '/planning/:path*', '/settings/:path*', '/login', '/signup'],
}
