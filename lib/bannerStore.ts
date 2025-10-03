import { promises as fs } from 'fs'
import path from 'path'

export interface BannerPayload {
  id: string
  image: string
  color: string
  title: string
  isActive: boolean
  createdAt: string
}

const DATA_PATH = path.join(process.cwd(), 'data', 'admin-banner.json')
const REDIS_KEY = 'admin_banner'

async function readFileFallback(): Promise<BannerPayload | null> {
  try {
    const json = await fs.readFile(DATA_PATH, 'utf-8')
    return JSON.parse(json)
  } catch {
    return null
  }
}

async function writeFileFallback(data: BannerPayload): Promise<void> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true })
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

export async function getBanner(): Promise<BannerPayload | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  try {
    if (url && token) {
      const { Redis } = await import('@upstash/redis')
      const redis = new Redis({ url, token })
      const data = await redis.get<BannerPayload>(REDIS_KEY)
      if (data) return data
    }
  } catch (err) {
    console.error('Redis get error:', err)
  }
  return await readFileFallback()
}

export async function setBanner(payload: BannerPayload): Promise<void> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  try {
    if (url && token) {
      const { Redis } = await import('@upstash/redis')
      const redis = new Redis({ url, token })
      await redis.set(REDIS_KEY, payload)
      return
    }
  } catch (err) {
    console.error('Redis set error:', err)
  }
  await writeFileFallback(payload)
}