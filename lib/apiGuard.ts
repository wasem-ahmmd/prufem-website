import type { NextApiRequest, NextApiResponse } from 'next'

const rlStore = new Map<string, { count: number; resetAt: number }>()

function getClientKey(req: NextApiRequest): string {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || (req.socket as any)?.remoteAddress || 'unknown'
  const route = (req.url || '').split('?')[0]
  return `${ip}:${route}`
}

export function rateLimit(req: NextApiRequest, res: NextApiResponse, limit = 60, windowMs = 60_000): boolean {
  const key = getClientKey(req)
  const now = Date.now()
  const entry = rlStore.get(key)
  if (!entry || now > entry.resetAt) {
    rlStore.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (entry.count >= limit) {
    res.status(429).json({ error: 'Too Many Requests' })
    return false
  }
  entry.count += 1
  return true
}

export function verifyCsrf(req: NextApiRequest, res: NextApiResponse): boolean {
  const headerToken = (req.headers['x-csrf-token'] as string) || ''
  const cookieHeader = req.headers.cookie || ''
  const match = cookieHeader.split(';').map(s => s.trim()).find(s => s.startsWith('admin_csrf='))
  const cookieToken = match ? match.split('=')[1] : ''
  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    res.status(403).json({ error: 'Invalid CSRF token' })
    return false
  }
  return true
}

export function guardWriteOps(req: NextApiRequest, res: NextApiResponse): boolean {
  if (!rateLimit(req, res, 60, 60_000)) return false
  if (!verifyCsrf(req, res)) return false
  return true
}