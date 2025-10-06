import { NextRequest, NextResponse } from 'next/server'
import { adminMiddlewareGuard } from './lib/auth'

export async function middleware(req: NextRequest) {
  const result = await adminMiddlewareGuard(req)
  if (result) return result
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}