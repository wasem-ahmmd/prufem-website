import type { NextApiRequest, NextApiResponse } from 'next'
import { v2 as cloudinary } from 'cloudinary'
import { supabaseServer } from '../../../../lib/supabaseClient'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

function cloudinaryPublicIdFromUrl(url: string): string | null {
  try {
    if (!url || !url.includes('/upload/')) return null
    const afterUpload = url.split('/upload/')[1]
    if (!afterUpload) return null
    const segments = afterUpload.split('/')
    if (segments.length === 0) return null
    if (/^v\d+$/.test(segments[0])) segments.shift()
    const last = segments.pop() || ''
    const basename = last.replace(/\.[^/.]+$/, '')
    const publicId = [...segments, basename].join('/')
    return publicId || null
  } catch {
    return null
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' })

  const limit = Number(req.query.limit || 25)
  try {
    const { data: jobs, error } = await supabaseServer
      .from('cloudinary_delete_jobs')
      .select('id, product_id, image_urls, created_at')
      .order('created_at', { ascending: true })
      .limit(limit)
    if (error) return res.status(400).json({ error: error.message })

    const results: Array<{ job_id: string; product_id: string; images: any[] }> = []
    for (const job of jobs || []) {
      const urls: string[] = Array.isArray(job.image_urls) ? job.image_urls : []
      const publicIds = urls.map(cloudinaryPublicIdFromUrl).filter(Boolean) as string[]
      const imageResults: any[] = []
      for (const pid of publicIds) {
        try {
          const r = await cloudinary.uploader.destroy(pid)
          imageResults.push({ public_id: pid, result: String(r?.result || 'ok') })
        } catch (e: any) {
          imageResults.push({ public_id: pid, result: 'error', error: e?.message })
        }
      }
      results.push({ job_id: job.id, product_id: job.product_id, images: imageResults })
      await supabaseServer.from('cloudinary_delete_jobs').delete().eq('id', job.id)
    }

    return res.status(200).json({ processed: results.length, results })
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Unexpected error' })
  }
}