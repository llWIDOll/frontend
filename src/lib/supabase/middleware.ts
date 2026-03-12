import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // This will refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = new URL(request.url)

  // 1. If user is logged in and trying to access /login, redirect to their dashboard
  if (user && url.pathname === '/login') {
     // We need the role to redirect correctly
     const { data: profile } = await supabase
       .from('profiles')
       .select('role')
       .eq('id', user.id)
       .single()
     
     const redirectUrl = profile?.role === 'super_admin' ? '/admin/dashboard' : '/dashboard'
     return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  // 2. Protect private routes
  if (
    !user &&
    (url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/admin'))
  ) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 3. Admin routes protection
  if (user && url.pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'super_admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}
