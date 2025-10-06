import type { NextApiRequest, NextApiResponse } from 'next'
import { getUserFromToken } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' })
  const token = req.cookies['admin_token'] || (req.headers['authorization']?.toString().replace('Bearer ', '') || '')
  const user = await getUserFromToken(token)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  return res.status(200).json({ user })
}