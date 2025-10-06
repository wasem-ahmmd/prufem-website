import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseServer } from '../../../lib/supabaseClient'
import { requireAdminApi } from '../../../lib/auth'
import { guardWriteOps } from '../../../lib/apiGuard'
import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'
import { v2 as cloudinary } from 'cloudinary'
import { logRequest, logError } from '@/lib/requestLogger'

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
    // Drop version segment like v1698236400 if present
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
  logRequest(req)
  // Enforce admin auth for all methods on this route
  const admin = await requireAdminApi(req, res)
  if (!admin) return
  if (req.method === 'GET') {
    try {
      const id = (req.query.id as string) || null
      const countOnly = String(req.query.count || '') === 'true'
      const page = Math.max(1, parseInt(String(req.query.page || '1'), 10))
      const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize || '20'), 10)))
      const q = String(req.query.q || '').trim()
      const stock = String(req.query.stock_status || '').trim()
      const category = String(req.query.category_id || '').trim()
      if (countOnly && !id) {
        const { count, error } = await supabaseServer
          .from('products')
          .select('*', { count: 'exact', head: true })
        if (error) {
          if (String(error.message || '').includes('relation "products" does not exist')) {
            return res.status(500).json({ message: 'Database table "products" not found. Please create it before using this API.' })
          }
          return res.status(400).json({ error: error.message })
        }
        return res.status(200).json({ count: count || 0 })
      }

      const query = supabaseServer
        .from('products')
        .select('id, name, sku, price, sale_price, discount, stock_quantity, stock_status, category_id, inspired_by, description_html, image_urls, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (q) {
        // ilike on name or sku
        query.or(`name.ilike.%${q}%,sku.ilike.%${q}%`)
      }
      if (stock) {
        query.eq('stock_status', stock)
      }
      if (category) {
        query.eq('category_id', category)
      }

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      const { data, count, error } = id
        ? await query.eq('id', id).limit(1)
        : await query.range(from, to)

      if (error) {
        if (String(error.message || '').includes('relation "products" does not exist')) {
          return res.status(500).json({ message: 'Database table "products" not found. Please create it before using this API.' })
        }
        return res.status(400).json({ error: error.message })
      }
      if (id) {
        const product = Array.isArray(data) ? data[0] : data
        if (!product) return res.status(404).json({ error: 'Product not found' })
        return res.status(200).json({ product })
      }
      return res.status(200).json({ products: data, count: count ?? null, page, pageSize })
    } catch (err: any) {
      logError(res, err)
      return res.status(500).json({ error: err?.message || 'Unexpected error' })
    }
  }

  if (req.method === 'POST') {
    try {
      if (!guardWriteOps(req, res)) return
      const body = req.body || {}
      const schema = z.object({
        name: z.string().min(1),
        category_id: z.string().min(1),
        inspired_by: z.string().trim().max(200).nullable().optional(),
        description_html: z.string().max(10000).nullable().optional(),
        sku: z.string().min(1),
        stock_quantity: z.number().int().min(0).default(0),
        stock_status: z.enum(['in_stock','out_of_stock','on_demand']).default('in_stock'),
        price: z.number().nonnegative().nullable().optional(),
        sale_price: z.number().nonnegative().nullable().optional(),
        discount: z.number().nonnegative().nullable().optional(),
        image_urls: z.array(z.string().url()).length(2),
      })
      const parsed = schema.safeParse(body)
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() })
      }
      const {
        name,
        category_id,
        inspired_by,
        description_html,
        sku,
        stock_quantity,
        stock_status,
        price,
        sale_price,
        discount,
        image_urls,
      } = parsed.data

      const priceNum = typeof price === 'number' ? price : null
      const saleNum = typeof sale_price === 'number' ? sale_price : null
      const discountNum = typeof discount === 'number' ? discount : (priceNum && saleNum ? Math.max(0, priceNum - saleNum) : null)
      const sanitizedHtml = description_html ? DOMPurify.sanitize(description_html) : null

      const { data, error } = await supabaseServer
        .from('products')
        .insert({
          name,
          category_id,
          inspired_by: inspired_by || null,
          description_html: sanitizedHtml,
          sku,
          stock_quantity,
          stock_status,
          price: priceNum,
          sale_price: saleNum,
          discount: discountNum,
          image_urls,
        })
        .select('id')
        .single()
      if (error) {
        if (String(error.message || '').includes('relation "products" does not exist')) {
          return res.status(500).json({ message: 'Database table "products" not found. Please create it before using this API.' })
        }
        return res.status(400).json({ error: error.message })
      }
      return res.status(201).json({ product: data })
    } catch (err: any) {
      logError(res, err)
      return res.status(500).json({ error: err?.message || 'Unexpected error' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      if (!guardWriteOps(req, res)) return
      const id = (req.query.id as string) || (req.body?.id as string)
      const sku = (req.query.sku as string) || (req.body?.sku as string)
      if (!id && !sku) return res.status(400).json({ error: 'Provide id or sku to delete' })

      const sel = supabaseServer
        .from('products')
        .select('id, sku, image_urls')
        .limit(1)
      const { data: found, error: findErr } = id
        ? await sel.eq('id', id)
        : await sel.eq('sku', sku!)
      if (findErr) return res.status(400).json({ error: findErr.message })
      const product = Array.isArray(found) ? found[0] : found
      if (!product) return res.status(404).json({ error: 'Product not found' })

      const urls: string[] = Array.isArray(product.image_urls) ? product.image_urls : []
      const publicIds = urls.map(cloudinaryPublicIdFromUrl).filter(Boolean) as string[]

      // Try to enqueue Cloudinary deletions into a job table for resilience.
      let queued = false
      let jobCount = 0
      if (publicIds.length > 0) {
        try {
          const { error: jobErr } = await supabaseServer
            .from('cloudinary_delete_jobs')
            .insert(publicIds.map((pid) => ({ public_id: pid, product_id: product.id })))
          if (!jobErr) {
            queued = true
            jobCount = publicIds.length
          } else if (!String(jobErr.message || '').includes('relation "cloudinary_delete_jobs" does not exist')) {
            // If there is an error other than table missing, surface it
            return res.status(400).json({ error: jobErr.message })
          }
        } catch (e: any) {
          // Fall through to direct deletion
        }
      }

      const deleteResults: Array<{ public_id: string; result: string; error?: string }> = []
      if (!queued) {
        for (const pid of publicIds) {
          try {
            const result = await cloudinary.uploader.destroy(pid)
            deleteResults.push({ public_id: pid, result: String(result?.result || 'ok') })
          } catch (e: any) {
            deleteResults.push({ public_id: pid, result: 'error', error: e?.message })
          }
        }
      }

      const { error: delErr } = await supabaseServer
        .from('products')
        .delete()
        .eq('id', product.id)
      if (delErr) return res.status(400).json({ error: delErr.message, cloudinary: deleteResults })

      return res.status(200).json({ deleted: product.id, queued, job_count: jobCount, cloudinary: queued ? undefined : deleteResults })
    } catch (err: any) {
      logError(res, err)
      return res.status(500).json({ error: err?.message || 'Unexpected error' })
    }
  }

  if (req.method === 'PATCH') {
    try {
      if (!guardWriteOps(req, res)) return
      const id = (req.query.id as string) || (req.body?.id as string)
      if (!id) return res.status(400).json({ error: 'id is required to update a product' })

      const schema = z.object({
        name: z.string().min(1).optional(),
        category_id: z.string().min(1).optional(),
        inspired_by: z.string().trim().max(200).nullable().optional(),
        description_html: z.string().max(10000).nullable().optional(),
        sku: z.string().min(1).optional(),
        stock_quantity: z.number().int().min(0).optional(),
        stock_status: z.enum(['in_stock','out_of_stock','on_demand']).optional(),
        price: z.number().nonnegative().optional(),
        sale_price: z.number().nonnegative().optional(),
        discount: z.number().nonnegative().optional(),
      })
      const parsed = schema.safeParse(req.body || {})
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() })
      }
      const body = parsed.data

      const updates: any = {}
      if (typeof body.name === 'string') updates.name = body.name
      if (typeof body.category_id === 'string') updates.category_id = body.category_id
      if (typeof body.inspired_by === 'string' || body.inspired_by === null) updates.inspired_by = body.inspired_by ?? null
      if (typeof body.description_html === 'string' || body.description_html === null) updates.description_html = body.description_html ? DOMPurify.sanitize(body.description_html) : null
      if (typeof body.sku === 'string') updates.sku = body.sku
      if (typeof body.stock_quantity === 'number') updates.stock_quantity = body.stock_quantity
      if (typeof body.stock_status === 'string') updates.stock_status = body.stock_status
      if (typeof body.price === 'number') updates.price = body.price
      if (typeof body.sale_price === 'number') updates.sale_price = body.sale_price
      if (typeof body.discount === 'number') {
        updates.discount = body.discount
      } else if (typeof body.price === 'number' && typeof body.sale_price === 'number') {
        updates.discount = Math.max(0, body.price - body.sale_price)
      }

      const { data, error } = await supabaseServer
        .from('products')
        .update(updates)
        .eq('id', id)
        .select('id, name, sku, price, sale_price, discount, stock_quantity, stock_status, category_id, inspired_by, description_html, image_urls, created_at')
        .single()
      if (error) return res.status(400).json({ error: error.message })
      return res.status(200).json({ product: data })
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Unexpected error' })
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' })
}