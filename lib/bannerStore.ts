import { supabaseServer } from '@/lib/supabaseClient'

export interface BannerPayload {
  id?: string
  image: string
  color: string
  title: string
  isActive: boolean
  createdAt?: string
}

export async function getBanner(): Promise<BannerPayload | null> {
  // Prefer Supabase Postgres for banner storage
  if (supabaseServer) {
    try {
      const { data, error } = await supabaseServer
        .from('admin_banners')
        .select('id,image,color,title,isActive,createdAt')
        .eq('isActive', true)
        .order('createdAt', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      if (data) return data as BannerPayload
    } catch (err) {
      console.error('Supabase get error:', err)
    }
  }
  // No local file fallback; return null when not available
  return null
}

export async function setBanner(payload: BannerPayload): Promise<void> {
  // Prefer Supabase Postgres upsert
  if (supabaseServer) {
    try {
      // Keep storage minimal: delete all previous banners before inserting the new one
      await supabaseServer.from('admin_banners').delete().neq('id', '00000000-0000-0000-0000-000000000000')

      // Insert new active banner; let DB generate id and createdAt
      const row = {
        image: payload.image,
        color: payload.color,
        title: payload.title,
        isActive: true,
      }
      const { error } = await supabaseServer.from('admin_banners').insert(row)
      if (error) throw error
      return
    } catch (err) {
      console.error('Supabase set error:', err)
      throw err
    }
  }
  // No local file fallback in localhost; surface error by throwing
  throw new Error('Supabase not configured; cannot persist banner')
}