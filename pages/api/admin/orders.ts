import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseServer } from '@/lib/supabaseClient'
import { requireAdminApi } from '@/lib/auth'
import { logRequest, logError } from '@/lib/requestLogger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  logRequest(req)
  const admin = await requireAdminApi(req, res)
  if (!admin) return

  if (!supabaseServer) {
    return res.status(500).json({ error: 'Supabase not configured' })
  }

  try {
    switch (req.method) {
      case 'GET': {
        const countOnly = String(req.query.count || '') === 'true'
        if (countOnly) {
          const { count, error } = await supabaseServer
            .from('orders')
            .select('*', { count: 'exact', head: true })
          if (error) {
            if (String(error.message || '').includes('relation "orders" does not exist')) {
              return res.status(500).json({ message: 'Database table "orders" not found. Please create it before using this API.' })
            }
            return res.status(400).json({ error: error.message })
          }
          return res.status(200).json({ count: count || 0 })
        }
        return res.status(405).json({ error: 'Only count is supported for now' })
      }
      default:
        return res.status(405).json({ error: 'Method Not Allowed' })
    }
  } catch (e: any) {
    logError(res, e)
    return res.status(500).json({ error: e?.message || 'Server error' })
  }
}