import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl
  
  // Get auth data from cookies (you might need to adjust this based on your auth setup)
  const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true'
  const userRole = request.cookies.get('userRole')?.value
  
  // For demo purposes, assume some users are logged in
  // In a real app, this would come from your authentication system
  const mockLoggedIn = false // Change this to test different scenarios
  const mockUserRole = 'user' // 'user' or 'admin'
  
  // Routes that require authentication
  const protectedRoutes = [
    '/bookmarks',
    '/search-history', 
    '/subscription',
    '/support'
  ]
  
  // Routes that require admin role
  const adminRoutes = [
    '/admin-dashboard'
  ]
  
  // Routes that redirect to news-intelligence if already logged in
  const guestOnlyRoutes = [
    '/login'
  ]
  
  // Check if the current path is a news detail page (partial access allowed)
  const isNewsDetailPage = /^\/news-intelligence\/newsid\/[^\/]+$/.test(pathname)
  
  // Handle guest-only routes (redirect if logged in)
  if (guestOnlyRoutes.includes(pathname)) {
    if (isLoggedIn || mockLoggedIn) {
      return NextResponse.redirect(new URL('/news-intelligence', request.url))
    }
    return NextResponse.next()
  }
  
  // Handle admin routes
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (!isLoggedIn && !mockLoggedIn) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if ((userRole || mockUserRole) !== 'admin') {
      return NextResponse.redirect(new URL('/news-intelligence', request.url))
    }
    return NextResponse.next()
  }
  
  // Handle news detail pages with partial access
  if (isNewsDetailPage) {
    // Allow access regardless of login status
    // The component will handle showing limited features for non-logged-in users
    return NextResponse.next()
  }
  
  // Handle general protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isLoggedIn && !mockLoggedIn) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }
  
  // Handle news-intelligence base route
  if (pathname === '/news-intelligence' || pathname.startsWith('/news-intelligence/')) {
    // Allow access but component will show partial features if not logged in
    return NextResponse.next()
  }
  
  // Allow all other routes
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 