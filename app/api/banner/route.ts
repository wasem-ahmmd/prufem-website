import { NextResponse } from 'next/server'
import { getBanner, setBanner } from '@/lib/bannerStore'

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
      id: body.id || Date.now().toString(),
      image: body.image || '',
      color: body.color || '#50C878',
      title: body.title || '',
      isActive: body.isActive ?? true,
      createdAt: new Date().toISOString(),
    }
    await setBanner(payload)
    return NextResponse.json({ success: true, data: payload })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 })
  }
}