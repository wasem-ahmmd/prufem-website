import type { NextApiRequest, NextApiResponse } from 'next'

// Sets httpOnly cookie with Supabase access token for server-side auth checks
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const isProd = process.env.NODE_ENV === 'production'
  if (req.method === 'POST') {
    const { access_token } = req.body || {}
    if (!access_token || typeof access_token !== 'string') {
      return res.status(400).json({ error: 'access_token is required' })
    }
    const csrf = (typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? (crypto as any).randomUUID() : String(Date.now() + Math.random())
    const cookie = [
      `admin_token=${access_token}`,
      'Path=/',
      `Max-Age=${60 * 60 * 24}`,
      isProd ? 'Secure' : '',
      'HttpOnly',
      'SameSite=Lax',
    ].filter(Boolean).join('; ')
    const csrfCookie = [
      `admin_csrf=${csrf}`,
      'Path=/',
      `Max-Age=${60 * 60 * 24}`,
      isProd ? 'Secure' : '',
      'SameSite=Lax',
    ].filter(Boolean).join('; ')
    res.setHeader('Set-Cookie', [cookie, csrfCookie])
    return res.status(200).json({ ok: true })
  }
  if (req.method === 'DELETE') {
    const cookie = [
      'admin_token=;',
      'Path=/',
      'Max-Age=0',
      isProd ? 'Secure' : '',
      'HttpOnly',
      'SameSite=Lax',
    ].filter(Boolean).join('; ')
    res.setHeader('Set-Cookie', cookie)
    return res.status(200).json({ ok: true })
  }
  return res.status(405).json({ error: 'Method Not Allowed' })
}