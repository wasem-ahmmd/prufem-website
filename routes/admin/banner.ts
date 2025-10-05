import type { NextApiRequest, NextApiResponse } from 'next'
import multer from 'multer'
import path from 'path'
import { promises as fs } from 'fs'
import { uploadToCloudinary } from '@/utils/cloudinary'

// Storage: public/upload/banner (temporary)
const uploadsDir = path.join(process.cwd(), 'public', 'upload', 'banner')

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

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
})

function isAdminAuthenticated(req: NextApiRequest): boolean {
  // Allow either Bearer token matching ADMIN_TOKEN or a valid admin_token cookie
  const headerToken = (req.headers['authorization'] || '').toString().replace(/^Bearer\s+/i, '')
  const envToken = process.env.ADMIN_TOKEN

  if (envToken && headerToken === envToken) {
    return true
  }

  // Fallback: accept presence of a non-trivial admin_token cookie (dev-only mock auth)
  const cookieToken = req.cookies?.admin_token
  if (cookieToken && cookieToken.length >= 10) {
    return true
  }

  return false
}

export async function handleAdminBannerUpload(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!isAdminAuthenticated(req)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Run Multer to parse a single file
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

    // Upload to Cloudinary; on success local file is deleted inside util
    try {
      const result = await uploadToCloudinary(localFilePath, 'banners')
      return res.status(200).json({ secure_url: result.secure_url })
    } catch (e: any) {
      // Keep local file on error
      return res.status(500).json({ error: e?.message || 'Cloudinary upload failed' })
    }
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Upload failed' })
  }
}