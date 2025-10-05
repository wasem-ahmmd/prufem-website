import { NextResponse } from 'next/server'
import { getBanner, setBanner } from '@/lib/bannerStore'
import { deleteFromCloudinary, extractPublicIdFromUrl } from '@/utils/cloudinary'

export async function GET() {
  const data = await getBanner()
  if (data) return NextResponse.json(data)
  const fallback = {
    id: 'default',
    image: '/images/hero-perfume-bg.jpg',
    color: '#50C878',
    title: 'Luxury Emerald Collection',
    isActive: true,
    createdAt: new Date().toISOString(),
  }
  return NextResponse.json(fallback)
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
  const payload = {
    image: body.image || '',
    color: body.color || '#50C878',
    title: body.title || '',
    isActive: body.isActive ?? true,
  }
  // Before setting new banner, delete previous Cloudinary image if present
  try {
    const current = await getBanner()
    if (current && current.image && /^https?:\/\//.test(current.image)) {
      const publicId = extractPublicIdFromUrl(current.image)
      if (publicId) {
        await deleteFromCloudinary(publicId)
      }
    }
  } catch (e) {
    // Ignore deletion errors; continue updating banner
    console.warn('Failed to delete previous Cloudinary image:', e)
  }

  await setBanner(payload)
  return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 })
  }
}