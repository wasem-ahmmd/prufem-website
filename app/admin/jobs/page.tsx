'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { supabasePublic } from '@/lib/supabaseClient'
import { QueueListIcon, CheckCircleIcon, SparklesIcon, TrashIcon, DocumentIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

type ProcessResult = {
  processed: number
  results: Array<{ id: number; public_id: string; result: string; error?: string }>
}

export default function AdminJobsPage() {
  const [loading, setLoading] = useState(false)
  const [batch, setBatch] = useState(50)
  const [maxAttempts, setMaxAttempts] = useState(3)
  const [token, setToken] = useState('')
  const [result, setResult] = useState<ProcessResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendingCount, setPendingCount] = useState<number | null>(null)
  const [countError, setCountError] = useState<string | null>(null)

  // Animation states
  const [animActive, setAnimActive] = useState(false)
  const [animStage, setAnimStage] = useState<'idle' | 'loader' | 'queued' | 'bin' | 'drop' | 'done'>('idle')
  const [showSuccess, setShowSuccess] = useState(false)
  const [uiVisible, setUiVisible] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function loadPending() {
      try {
        setCountError(null)
        const { error, count } = await supabasePublic
          .from('cloudinary_delete_jobs')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending')
        if (error) throw error
        if (!cancelled) setPendingCount(typeof count === 'number' ? count : 0)
      } catch (e: any) {
        if (!cancelled) setCountError(e?.message || 'Failed to load pending jobs')
      }
    }
    loadPending()
    return () => { cancelled = true }
  }, [])

  const stats = useMemo(() => {
    const r = result?.results || []
    const ok = r.filter(x => x.result === 'ok').length
    const failed = r.filter(x => x.result === 'failed').length
    const pending = r.filter(x => x.result === 'pending').length
    return { ok, failed, pending }
  }, [result])

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
      // refresh pending count
      try {
        const { error, count } = await supabasePublic
          .from('cloudinary_delete_jobs')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending')
        if (!error) setPendingCount(typeof count === 'number' ? count : 0)
      } catch {}
    } catch (e: any) {
      setError(e?.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const playAnimation = async () => {
    setAnimActive(true)
    setAnimStage('loader')
    await delay(800)
    setAnimStage('queued')
    await delay(600)
    setAnimStage('bin')
    await delay(600)
    setAnimStage('drop')
    await delay(1200)
    setAnimStage('done')
    await delay(300)
  }

  const handleProcessClick = async () => {
    setShowSuccess(false)
    setUiVisible(true)
    const animationPromise = playAnimation()
    await Promise.all([animationPromise, runProcessor()])
    setAnimActive(false)
    setAnimStage('idle')
    setShowSuccess(true)
    // Auto-hide success and panel after short delay
    await delay(1800)
    setShowSuccess(false)
    setUiVisible(false)
  }

  const allOk = result && result.processed > 0 && stats.ok === result.processed && stats.failed === 0

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <QueueListIcon className="h-8 w-8 text-gray-700" />
          <h1 className="text-2xl sm:text-3xl font-bold">Process Delete Jobs</h1>
        </div>
        <div className="text-xs sm:text-sm text-gray-600">Delete Cloudinary images queued by product actions</div>
      </div>

      {/* Main Card */}
      <div className="admin-card">
        {/* Top row: Pending + CTA */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-sm text-gray-600">Pending jobs</div>
              <div className="text-3xl sm:text-4xl font-bold text-gray-900">{pendingCount != null ? pendingCount : '—'}</div>
            </div>
            <SparklesIcon className="h-8 w-8 text-blue-600" />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleProcessClick}
              disabled={loading || pendingCount === 0}
              className={`admin-button ${loading ? 'opacity-60' : ''}`}
            >
              {loading ? 'Processing…' : 'Process Now'}
            </button>
            {pendingCount === 0 && (
              <span className="text-sm text-gray-600">No pending jobs</span>
            )}
          </div>
        </div>

        {countError && <div className="admin-alert error mt-4">{countError}</div>}

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Batch size</label>
            <input
              type="number"
              min={1}
              max={50}
              className="admin-input w-full"
              value={batch}
              onChange={(e) => setBatch(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max attempts</label>
            <input
              type="number"
              min={1}
              max={10}
              className="admin-input w-full"
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CRON Secret (optional)</label>
            <input
              type="password"
              className="admin-input w-full"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste CRON_SECRET to run without session"
            />
          </div>
        </div>

        {/* Animated container */}
        {uiVisible && (
          <div className="mt-6 flex justify-center">
            <div className="w-full max-w-md rounded-xl border border-gray-800 bg-[#0a0a0a] p-6 shadow-xl">
              <div className="flex flex-col items-center justify-center text-center">
                {/* Loader */}
                <AnimatePresence>
                  {animActive && animStage === 'loader' && (
                    <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, rotate: 360 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' }}
                    className="h-16 w-16"
                  >
                    <svg viewBox="0 0 48 48" className="h-16 w-16">
                      <circle cx="24" cy="24" r="20" stroke="#00ffb3" strokeWidth="4" fill="none" strokeDasharray="100" strokeDashoffset="60"></circle>
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Queued badge */}
              <AnimatePresence>
                {animActive && animStage === 'queued' && (
                  <motion.div
                    key="queued"
                    initial={{ x: -60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 250, damping: 22 }}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-900/30 px-3 py-2 ring-1 ring-blue-500/40 text-white"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                  >
                    <SparklesIcon className="h-5 w-5 text-blue-400" />
                    Queued
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Recycle bin */}
              <AnimatePresence>
                {animActive && animStage === 'bin' && (
                  <motion.div
                    key="bin"
                    initial={{ y: -20, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 12 }}
                    className="mt-6"
                  >
                    <TrashIcon className="h-16 w-16 text-gray-100" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Paper dropping */}
              <AnimatePresence>
                {animActive && animStage === 'drop' && (
                  <motion.div
                    key="paper"
                    initial={{ y: -40, rotateX: 0, opacity: 0 }}
                    animate={{ y: 20, rotateX: 60, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="-mt-4"
                  >
                    <DocumentIcon className="h-10 w-10 text-gray-200" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success message */}
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 text-sm text-white"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
                >
                  Jobs Processed Successfully ✅
                </motion.div>
              )}
              </div>
            </div>
          </div>
        )}

        {/* Status / Alerts */}
        {error && (
          <div className="admin-alert error mt-6">{error}</div>
        )}

        {allOk && (
          <div className="admin-alert success mt-6 flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5" />
            All processed jobs completed successfully
          </div>
        )}

        {result && !allOk && (
          <div className="mt-6">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-700 text-xs">Completed: {stats.ok}</span>
              <span className="inline-flex items-center px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs">Pending: {stats.pending}</span>
              <span className="inline-flex items-center px-2 py-1 rounded bg-red-100 text-red-700 text-xs">Failed: {stats.failed}</span>
              <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">Processed: {result.processed}</span>
            </div>
          </div>
        )}
      </div>

      {/* Results table */}
      {result && (
        <div className="admin-card mt-6">
          <h2 className="text-base sm:text-lg font-semibold mb-3">Run Details</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500">Job ID</th>
                  <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500">Public ID</th>
                  <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {result.results.map((r) => (
                  <tr key={r.id}>
                    <td className="px-3 sm:px-4 py-2 text-gray-700">{r.id}</td>
                    <td className="px-3 sm:px-4 py-2 text-gray-700 break-all">{r.public_id || '—'}</td>
                    <td className="px-3 sm:px-4 py-2">
                      <span className={
                        r.result === 'ok'
                          ? 'inline-block px-2 py-1 text-xs rounded bg-green-100 text-green-700'
                          : r.result === 'failed'
                            ? 'inline-block px-2 py-1 text-xs rounded bg-red-100 text-red-700'
                            : 'inline-block px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700'
                      }>
                        {r.result}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-2 text-red-600 text-xs sm:text-sm break-all">{r.error || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}