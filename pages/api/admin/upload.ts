import type { NextApiRequest, NextApiResponse } from 'next'
import multer from 'multer'
import path from 'path'
import { promises as fs } from 'fs'
import { uploadToCloudinary } from '@/utils/cloudinary'
import { verifyCsrf } from '@/lib/apiGuard'
import { logRequest, logError } from '@/lib/requestLogger'

export const config = {
  api: {
    bodyParser: false,
  },
}

function isAdminAuthenticated(req: NextApiRequest): boolean {
  const headerToken = (req.headers['authorization'] || '').toString().replace(/^Bearer\s+/i, '')
  const envToken = process.env.ADMIN_TOKEN
  if (envToken && headerToken === envToken) return true
  const cookieToken = req.cookies?.admin_token
  return !!(cookieToken && cookieToken.length >= 10)
}

function sanitizeFolder(input: string | undefined): string {
  const fallback = 'products'
  if (!input) return fallback
  const clean = input.toLowerCase()
  return /^[a-z0-9_-]+$/.test(clean) ? clean : fallback
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  logRequest(req)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }
  try {
    if (!isAdminAuthenticated(req)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    // CSRF verification for write operation
    const ok = verifyCsrf(req, res)
    if (!ok) return

    const folder = sanitizeFolder((req.query.folder as string) || (req.body?.folder as string))

    const baseUploadDir = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'public')
    const uploadsDir = path.join(baseUploadDir, 'upload', folder)

    const storage = multer.diskStorage({
      destination: async (_req, _file, cb) => {
        try {
          await fs.mkdir(uploadsDir, { recursive: true })
          cb(null, uploadsDir)
        } catch (e) {
          cb(e as Error, uploadsDir)
        }
      },
      filename: (_req, file, cb) => {
        const clean = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
        cb(null, `${Date.now()}_${clean}`)
      },
    })

    const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

    await new Promise<void>((resolve, reject) => {
      upload.single('file')(req as any, res as any, (err: any) => {
        if (err) reject(err)
        else resolve()
      })
    })

    const file = (req as any).file as Express.Multer.File | undefined
    if (!file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    const localFilePath = path.join(uploadsDir, file.filename)
    try {
      const result = await uploadToCloudinary(localFilePath, folder)
      return res.status(200).json({ secure_url: result.secure_url, public_id: result.public_id })
    } catch (e: any) {
      logError(res, e)
      return res.status(500).json({ error: e?.message || 'Cloudinary upload failed' })
    }
  } catch (e: any) {
    logError(res, e)
    return res.status(500).json({ error: e?.message || 'Upload failed' })
  }
}