import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Admin route protection middleware
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the request is for admin routes (except login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // Check for admin authentication token in cookies
    const adminToken = request.cookies.get('admin_token')
    
    // If no token exists, redirect to admin login
    if (!adminToken) {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
    
    // In a real application, you would validate the token here
    // For now, we'll just check if it exists and has a valid format
    try {
      const tokenValue = adminToken.value
      
      // Basic token validation (in production, use proper JWT validation)
      if (!tokenValue || tokenValue.length < 10) {
        const loginUrl = new URL('/admin/login', request.url)
        return NextResponse.redirect(loginUrl)
      }
    } catch (error) {
      // Invalid token format, redirect to login
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  // If user is already logged in and tries to access login page, redirect to dashboard
  if (pathname === '/admin/login') {
    const adminToken = request.cookies.get('admin_token')
    
    if (adminToken && adminToken.value && adminToken.value.length >= 10) {
      const dashboardUrl = new URL('/admin/dashboard', request.url)
      return NextResponse.redirect(dashboardUrl)
    }
  }
  
  return NextResponse.next()
}

// Configure which routes this middleware should run on
export const config = {
  matcher: [
    '/admin/:path*',
  ],
}