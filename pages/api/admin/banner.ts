import type { NextApiRequest, NextApiResponse } from 'next'
import { handleAdminBannerUpload } from '@/routes/admin/banner'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }
  return handleAdminBannerUpload(req, res)
}