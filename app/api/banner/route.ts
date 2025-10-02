import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_PATH = path.join(process.cwd(), 'data', 'admin-banner.json')

export async function GET() {
  try {
    const json = await fs.readFile(DATA_PATH, 'utf-8')
    const data = JSON.parse(json)
    return NextResponse.json(data)
  } catch (err) {
    // Fallback to default if file missing
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
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    // Basic validation
    const payload = {
      id: body.id || Date.now().toString(),
      image: body.image || '',
      color: body.color || '#50C878',
      title: body.title || '',
      isActive: body.isActive ?? true,
      createdAt: new Date().toISOString(),
    }

    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true })
    await fs.writeFile(DATA_PATH, JSON.stringify(payload, null, 2), 'utf-8')
    return NextResponse.json({ success: true, data: payload })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 })
  }
}