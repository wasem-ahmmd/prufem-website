import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseServer } from '@/lib/supabaseClient'
import { requireAdminApi } from '@/lib/auth'
import { guardWriteOps } from '@/lib/apiGuard'
import { z } from 'zod'
import { logRequest, logError } from '@/lib/requestLogger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  logRequest(req)
  // Enforce admin auth for all methods on this route
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
            .from('categories')
            .select('*', { count: 'exact', head: true })
          if (error) {
            if (String(error.message || '').includes('relation "categories" does not exist')) {
              return res.status(500).json({ message: 'Database table "categories" not found. Please create it before using this API.' })
            }
            return res.status(400).json({ error: error.message })
          }
          return res.status(200).json({ count: count || 0 })
        }

        const { data, error } = await supabaseServer
          .from('categories')
          .select('id,name,created_at')
          .order('created_at', { ascending: true })
        if (error) throw error
        return res.status(200).json({ categories: data })
      }
      case 'POST': {
        if (!guardWriteOps(req, res)) return
        const schema = z.object({ name: z.string().min(1) })
        const parsed = schema.safeParse(req.body || {})
        if (!parsed.success) {
          return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() })
        }
        const name = parsed.data.name.trim()
        const { data, error } = await supabaseServer
          .from('categories')
          .insert({ name })
          .select('id,name,created_at')
          .maybeSingle()
        if (error) throw error
        return res.status(201).json({ category: data })
      }
      case 'DELETE': {
        if (!guardWriteOps(req, res)) return
        const id = (req.query.id as string) || (req.body?.id as string)
        if (!id) return res.status(400).json({ error: 'id is required' })
        const { error } = await supabaseServer
          .from('categories')
          .delete()
          .eq('id', id)
        if (error) throw error
        return res.status(200).json({ ok: true })
      }
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (e: any) {
    logError(res, e)
    return res.status(500).json({ error: e?.message || 'Server error' })
  }
}