import React, { useState } from 'react'

export default function AdminJobsPage() {
  const [loading, setLoading] = useState(false)
  const [batch, setBatch] = useState(50)
  const [maxAttempts, setMaxAttempts] = useState(3)
  const [token, setToken] = useState('')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runProcessor = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const qs = new URLSearchParams({ batch: String(batch), maxAttempts: String(maxAttempts) })
      if (token) qs.set('token', token)
      const res = await fetch(`/api/admin/jobs/process?${qs.toString()}`, {
        method: 'POST',
        headers: token ? { 'x-cron-secret': token } : {},
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to process jobs')
      setResult(data)
    } catch (e: any) {
      setError(e?.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Admin: Process Cloudinary Delete Jobs</h1>
      <p>Runs the Cloudinary deletion job processor. Leave token empty to use admin session. Optionally paste CRON_SECRET to run without session.</p>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
        <label>
          Batch
          <input
            type="number"
            min={1}
            max={50}
            value={batch}
            onChange={(e) => setBatch(Number(e.target.value))}
            style={{ marginLeft: 8 }}
          />
        </label>
        <label>
          Max Attempts
          <input
            type="number"
            min={1}
            max={10}
            value={maxAttempts}
            onChange={(e) => setMaxAttempts(Number(e.target.value))}
            style={{ marginLeft: 8 }}
          />
        </label>
        <label style={{ flex: 1 }}>
          CRON Secret (optional)
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste CRON_SECRET if needed"
            style={{ marginLeft: 8, width: '100%' }}
          />
        </label>
        <button onClick={runProcessor} disabled={loading}>
          {loading ? 'Processing…' : 'Process Delete Jobs'}
        </button>
      </div>
      {error && (
        <div style={{ color: 'red', marginTop: 12 }}>Error: {error}</div>
      )}
      {result && (
        <div style={{ marginTop: 16 }}>
          <div>Processed: {result.processed}</div>
          <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 6 }}>
            {JSON.stringify(result.results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}