import type { NextApiRequest, NextApiResponse } from 'next'

export function logRequest(req: NextApiRequest) {
  const path = req.url || ''
  const method = req.method || 'GET'
  const ua = (req.headers['user-agent'] || '').toString()
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString()
  // Lightweight console logging; swap to a proper logger in prod
  // Avoid logging bodies to prevent leaking secrets; only log meta
  console.log(`[admin-api] ${method} ${path} ip=${ip} ua=${ua}`)
}

export function logError(res: NextApiResponse, err: any) {
  const status = res.statusCode
  const msg = err?.message || String(err)
  console.error(`[admin-api] status=${status} error=${msg}`)
}