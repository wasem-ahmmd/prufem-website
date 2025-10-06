'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '../components/AdminSidebar'
import { useAdmin } from '../components/AdminProvider'

interface Category { id: string; name: string }
interface Collection { id: string; name: string; category_id: string; created_at: string }

export default function AdminCollectionsPage() {
  const { isAuthenticated } = useAdmin()
  const router = useRouter()
  const [collections, setCollections] = useState<Collection[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const adminHeaders: HeadersInit = {}
  if (process.env.NEXT_PUBLIC_ADMIN_TOKEN) {
    adminHeaders['Authorization'] = `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN}`
  }

  const categoryMap = useMemo(() => Object.fromEntries(categories.map(c => [c.id, c.name])), [categories])

  const loadData = async () => {
    setError(null)
    try {
      const [catRes, colRes] = await Promise.all([
        fetch('/api/admin/categories', { headers: adminHeaders }),
        fetch('/api/admin/collections', { headers: adminHeaders })
      ])
      const catJson = await catRes.json()
      const colJson = await colRes.json()
      if (!catRes.ok) throw new Error(catJson?.error || 'Failed to load categories')
      if (!colRes.ok) throw new Error(colJson?.error || 'Failed to load collections')
      setCategories(catJson.categories || [])
      setCollections(colJson.collections || [])
    } catch (e: any) {
      setError(e?.message || 'Failed to load data')
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return
    void loadData()
  }, [isAuthenticated])

  const addCollection = async () => {
    const n = name.trim()
    if (!n || !categoryId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminHeaders },
        body: JSON.stringify({ name: n, categoryId })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to add collection')
      setCollections(prev => [...prev, json.collection])
      setName('')
      setCategoryId('')
    } catch (e: any) {
      setError(e?.message || 'Failed to add collection')
    } finally {
      setLoading(false)
    }
  }

  const deleteCollection = async (id: string) => {
    if (!confirm('Delete this collection?')) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/collections?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: adminHeaders,
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to delete collection')
      setCollections(prev => prev.filter(c => c.id !== id))
    } catch (e: any) {
      setError(e?.message || 'Failed to delete collection')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
              <p className="text-sm text-gray-600">Create collections and assign them to categories</p>
            </div>
            <button onClick={() => router.push('/admin/dashboard')} className="admin-button-secondary">
              Back to Dashboard
            </button>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {error && (
              <div className="admin-card border-red-300 bg-red-50 text-red-700">{error}</div>
            )}

            {/* Add Collection */}
            <div className="admin-card">
              <label className="block text-sm font-medium text-gray-700 mb-2">New Collection</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  className="admin-input col-span-1 sm:col-span-2"
                  placeholder="e.g., Winter Specials"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <select
                  className="admin-input"
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                >
                  <option value="" disabled>Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="mt-3 flex justify-end">
                <button className="admin-button" onClick={addCollection} disabled={loading || !name.trim() || !categoryId}>
                  {loading ? 'Saving...' : 'Add'}
                </button>
              </div>
            </div>

            {/* Collections List */}
            <div className="admin-card">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Existing Collections</h2>
              {collections.length === 0 ? (
                <p className="text-sm text-gray-600">No collections added yet.</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {collections.map((c) => (
                    <li key={c.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{c.name}</p>
                        <p className="text-xs text-gray-500">Category: {categoryMap[c.category_id] || 'Unknown'}</p>
                      </div>
                      <button className="admin-button-secondary text-red-600 hover:bg-red-50" onClick={() => deleteCollection(c.id)}>
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}