import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseServer } from '@/lib/supabaseClient'
import { requireAdminApi } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'
import { logRequest, logError } from '@/lib/requestLogger'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  logRequest(req)
  // Allow cron/scheduler to call this endpoint without admin auth using a secret header
  const cronSecret = process.env.CRON_SECRET
  const headerSecret = (req.headers['x-cron-secret'] || '').toString()
  // Also allow secret via query param (?token=...), useful for schedulers that can't send custom headers
  const querySecret = String(req.query.token || '')
  const isCron = !!cronSecret && (headerSecret === cronSecret || querySecret === cronSecret)

  if (!isCron) {
    const admin = await requireAdminApi(req, res)
    if (!admin) return
  }

  if (!supabaseServer) {
    return res.status(500).json({ error: 'Supabase not configured' })
  }

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' })
    }

    const batchSize = Math.max(1, Math.min(50, parseInt(String(req.query.batch || '25'), 10)))
    const maxAttempts = Math.max(1, Math.min(10, parseInt(String(req.query.maxAttempts || '3'), 10)))

    const { data: jobs, error: selErr } = await supabaseServer
      .from('cloudinary_delete_jobs')
      .select('id, public_id, image_urls, status, attempts')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(batchSize)

    if (selErr) {
      if (String(selErr.message || '').includes('relation "cloudinary_delete_jobs" does not exist')) {
        return res.status(500).json({ message: 'Table cloudinary_delete_jobs not found. Please run the SQL migration.' })
      }
      return res.status(400).json({ error: selErr.message })
    }

    const results: Array<{ id: number; public_id: string; result: string; error?: string }> = []

    for (const job of jobs || []) {
      try {
        const publicIds: string[] = []
        if (job.public_id) {
          publicIds.push(job.public_id)
        } else if (Array.isArray(job.image_urls)) {
          // Try to derive public IDs from stored URLs
          for (const url of job.image_urls) {
            const pid = derivePublicId(url)
            if (pid) publicIds.push(pid)
          }
        }

        if (publicIds.length === 0) {
          throw new Error('No deletable public_id or image_urls found')
        }

        for (const pid of publicIds) {
          // Use explicit options to ensure correct resource type and cache invalidation
          await cloudinary.uploader.destroy(pid, { resource_type: 'image', invalidate: true })
        }

        await supabaseServer
          .from('cloudinary_delete_jobs')
          .update({ status: 'completed' })
          .eq('id', job.id)

        results.push({ id: job.id, public_id: publicIds[0], result: 'ok' })
      } catch (e: any) {
        const attempts = (job.attempts || 0) + 1
        const status = attempts >= maxAttempts ? 'failed' : 'pending'
        await supabaseServer
          .from('cloudinary_delete_jobs')
          .update({ attempts, status, last_error: e?.message || 'Unknown error' })
          .eq('id', job.id)
        results.push({ id: job.id, public_id: job.public_id, result: status, error: e?.message })
      }
    }

    return res.status(200).json({ processed: results.length, results })
  } catch (e: any) {
    logError(res, e)
    return res.status(500).json({ error: e?.message || 'Server error' })
  }
}

function derivePublicId(url: string): string | null {
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