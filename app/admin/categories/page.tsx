'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '../components/AdminSidebar'
import { useAdmin } from '../components/AdminProvider'

interface Category {
  id: string
  name: string
  created_at: string
}

export default function AdminCategoriesPage() {
  const { isAuthenticated } = useAdmin()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const adminHeaders: HeadersInit = {}
  if (process.env.NEXT_PUBLIC_ADMIN_TOKEN) {
    adminHeaders['Authorization'] = `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN}`
  }

  const loadCategories = async () => {
    setError(null)
    try {
      const res = await fetch('/api/admin/categories', { headers: adminHeaders })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to load categories')
      setCategories(json.categories || [])
    } catch (e: any) {
      setError(e?.message || 'Failed to load categories')
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return
    void loadCategories()
  }, [isAuthenticated])

  const addCategory = async () => {
    const n = name.trim()
    if (!n) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminHeaders },
        body: JSON.stringify({ name: n })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to add category')
      setCategories(prev => [...prev, json.category])
      setName('')
    } catch (e: any) {
      setError(e?.message || 'Failed to add category')
    } finally {
      setLoading(false)
    }
  }

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/categories?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: adminHeaders,
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to delete category')
      setCategories(prev => prev.filter(c => c.id !== id))
    } catch (e: any) {
      setError(e?.message || 'Failed to delete category')
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
              <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
              <p className="text-sm text-gray-600">Add and remove product categories</p>
            </div>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="admin-button-secondary"
            >
              Back to Dashboard
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {error && (
              <div className="admin-card border-red-300 bg-red-50 text-red-700">{error}</div>
            )}

            {/* Add Category */}
            <div className="admin-card">
              <label className="block text-sm font-medium text-gray-700 mb-2">New Category</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  className="admin-input flex-1"
                  placeholder="e.g., Attar"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <button
                  className="admin-button"
                  onClick={addCategory}
                  disabled={loading || !name.trim()}
                >
                  {loading ? 'Saving...' : 'Add'}
                </button>
              </div>
            </div>

            {/* Categories List */}
            <div className="admin-card">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Existing Categories</h2>
              {categories.length === 0 ? (
                <p className="text-sm text-gray-600">No categories added yet.</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {categories.map((c) => (
                    <li key={c.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{c.name}</p>
                        <p className="text-xs text-gray-500">{new Date(c.created_at).toLocaleString()}</p>
                      </div>
                      <button
                        className="admin-button-secondary text-red-600 hover:bg-red-50"
                        onClick={() => deleteCategory(c.id)}
                      >
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