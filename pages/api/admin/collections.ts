import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseServer } from '@/lib/supabaseClient'

function isAdminAuthenticated(req: NextApiRequest): boolean {
  const headerToken = (req.headers['authorization'] || '').toString().replace(/^Bearer\s+/i, '')
  const envToken = process.env.ADMIN_TOKEN
  if (envToken && headerToken === envToken) return true
  const cookieToken = req.cookies?.admin_token
  if (cookieToken && cookieToken.length >= 10) return true
  return false
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdminAuthenticated(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!supabaseServer) {
    return res.status(500).json({ error: 'Supabase not configured' })
  }

  try {
    switch (req.method) {
      case 'GET': {
        const { data, error } = await supabaseServer
          .from('collections')
          .select('id,name,category_id,created_at')
          .order('created_at', { ascending: true })
        if (error) throw error
        return res.status(200).json({ collections: data })
      }
      case 'POST': {
        const { name, categoryId } = req.body || {}
        if (!name || typeof name !== 'string' || !name.trim()) {
          return res.status(400).json({ error: 'Name is required' })
        }
        if (!categoryId || typeof categoryId !== 'string') {
          return res.status(400).json({ error: 'categoryId is required' })
        }
        const { data, error } = await supabaseServer
          .from('collections')
          .insert({ name: name.trim(), category_id: categoryId })
          .select('id,name,category_id,created_at')
          .maybeSingle()
        if (error) throw error
        return res.status(201).json({ collection: data })
      }
      case 'DELETE': {
        const id = (req.query.id as string) || req.body?.id
        if (!id) return res.status(400).json({ error: 'id is required' })
        const { error } = await supabaseServer
          .from('collections')
          .delete()
          .eq('id', id)
        if (error) throw error
        return res.status(200).json({ ok: true })
      }
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Server error' })
  }
}