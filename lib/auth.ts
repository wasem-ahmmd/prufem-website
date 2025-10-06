import type { NextApiRequest, NextApiResponse } from 'next'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from './supabaseClient'

export type AdminRole = 'admin' | 'super_admin'

export interface AuthUser {
  id: string
  email: string | null
  role: AdminRole | null
}

function getAdminEmails(): string[] {
  const str = process.env.ADMIN_EMAILS || ''
  return str.split(',').map(s => s.trim()).filter(Boolean)
}

export async function getUserFromToken(accessToken: string | undefined | null): Promise<AuthUser | null> {
  try {
    if (!accessToken || !supabaseServer) return null
    const { data, error } = await supabaseServer.auth.getUser(accessToken)
    if (error || !data?.user) return null
    const user = data.user
    const email = (user.email || (user.user_metadata as any)?.email || null) as string | null
    const appRole = (user.app_metadata as any)?.role || (user.user_metadata as any)?.role || null
    const emails = getAdminEmails()
    const role: AdminRole | null = appRole === 'super_admin' ? 'super_admin' : (appRole === 'admin' ? 'admin' : null)
    const isAdmin = role !== null || (email ? emails.includes(email) : false)
    if (!isAdmin) return null
    return { id: user.id, email, role: (role || 'admin') as AdminRole }
  } catch {
    return null
  }
}

// API helper: require admin, return null and send 401 if missing
export async function requireAdminApi(req: NextApiRequest, res: NextApiResponse): Promise<AuthUser | null> {
  const token = req.cookies['admin_token'] || (req.headers['authorization']?.toString().replace('Bearer ', '') || '')
  const user = await getUserFromToken(token)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return null
  }
  return user
}

// Middleware helper to guard pages under /admin except login
export async function adminMiddlewareGuard(req: NextRequest): Promise<NextResponse | null> {
  const { pathname } = req.nextUrl
  if (!pathname.startsWith('/admin') || pathname.startsWith('/admin/login')) return null
  const token = req.cookies.get('admin_token')?.value
  const user = await getUserFromToken(token)
  if (!user) {
    const url = req.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }
  return null
}