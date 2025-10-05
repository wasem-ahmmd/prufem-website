import { v2 as cloudinary } from 'cloudinary'
import { promises as fs } from 'fs'

export type CloudinaryUploadResult = {
  secure_url: string
  public_id: string
}

export function initCloudinary() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME
  const api_key = process.env.CLOUDINARY_API_KEY
  const api_secret = process.env.CLOUDINARY_API_SECRET
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error('Cloudinary env missing')
  }
  cloudinary.config({ cloud_name, api_key, api_secret })
}

export async function uploadToCloudinary(localFilePath: string, folder = 'banners'): Promise<CloudinaryUploadResult> {
  initCloudinary()
  try {
    const res = await cloudinary.uploader.upload(localFilePath, {
      folder,
      use_filename: true,
      unique_filename: true,
      resource_type: 'image',
    })
    // cleanup local file on success
    try { await fs.unlink(localFilePath) } catch {}
    return { secure_url: res.secure_url, public_id: res.public_id }
  } catch (e: any) {
    // keep local file on error
    throw new Error(e?.message || 'Cloudinary upload failed')
  }
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  initCloudinary()
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
  } catch (e: any) {
    // swallow errors to avoid blocking banner update
    console.error('Cloudinary delete failed:', e?.message || e)
  }
}

export function extractPublicIdFromUrl(url: string): string | null {
  try {
    // Example: https://res.cloudinary.com/<cloud>/image/upload/v169.../banners/filename.jpg
    const u = new URL(url)
    const parts = u.pathname.split('/')
    // Find index of 'upload' segment; public id is everything after it without extension
    const uploadIdx = parts.findIndex(p => p === 'upload')
    if (uploadIdx === -1) return null
    const after = parts.slice(uploadIdx + 2) // skip 'upload' and version 'v123456'
    if (after.length === 0) return null
    const last = after[after.length - 1]
    const withoutExt = last.replace(/\.[a-zA-Z0-9]+$/, '')
    const prefix = after.slice(0, -1).join('/')
    const publicId = prefix ? `${prefix}/${withoutExt}` : withoutExt
    return publicId
  } catch {
    return null
  }
}