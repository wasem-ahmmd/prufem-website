"use client"
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

type Product = {
  id: string
  name: string
  sku: string
  price: number | null
  stock_status: 'in_stock' | 'out_of_stock' | 'on_demand'
  image_urls: string[]
}

export default function AllProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [stock, setStock] = useState<string>('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.set('page', String(page))
        params.set('pageSize', String(pageSize))
        if (query) params.set('q', query)
        if (stock) params.set('stock_status', stock)
        const res = await fetch(`/api/admin/products?${params.toString()}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || json?.message || 'Failed to load products')
        if (!cancelled) {
          setProducts(Array.isArray(json.products) ? json.products : [])
          setTotal(typeof json.count === 'number' ? json.count : null)
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Unexpected error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [page, pageSize, query, stock])

  async function handleDelete(id: string) {
    if (!id) return
    const ok = typeof window !== 'undefined' ? window.confirm('Delete this product? This will also delete its Cloudinary images.') : true
    if (!ok) return
    setDeletingId(id)
    setError(null)
    try {
      const csrf = getCookie('admin_csrf')
      const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers: { 'x-csrf-token': csrf || '' } })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || json?.message || 'Delete failed')
      setProducts((prev) => prev.filter(p => p.id !== id))
    } catch (e: any) {
      setError(e?.message || 'Unexpected error while deleting')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">All Products</h1>
        <Link href="/admin/products/add" className="px-4 py-2 rounded-md bg-black text-white hover:bg-gray-800">Add Product</Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <input
          value={query}
          onChange={(e) => { setPage(1); setQuery(e.target.value) }}
          placeholder="Search name or SKU"
          className="border rounded px-3 py-2"
        />
        <select value={stock} onChange={(e) => { setPage(1); setStock(e.target.value) }} className="border rounded px-3 py-2">
          <option value="">All stock</option>
          <option value="in_stock">In stock</option>
          <option value="out_of_stock">Out of stock</option>
          <option value="on_demand">On demand</option>
        </select>
        <select value={pageSize} onChange={(e) => { setPage(1); setPageSize(Number(e.target.value)) }} className="border rounded px-3 py-2">
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      {loading && <div className="text-gray-500">Loading products…</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && !error && products.length === 0 && (
        <div className="text-gray-600">No products found.</div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="overflow-x-auto bg-white border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Image</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Stock</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    {p.image_urls?.[0] ? (
                      <Image
                        src={p.image_urls[0]}
                        alt={p.name}
                        width={100}
                        height={100}
                        className="rounded object-cover"
                      />
                    ) : (
                      <div className="w-[100px] h-[100px] flex items-center justify-center bg-gray-100 text-gray-400 rounded">No image</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.name}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.sku}</td>
                  <td className="px-4 py-3">
                    {p.price != null ? (
                      <span className="font-semibold">${p.price.toFixed(2)}</span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={
                      p.stock_status === 'in_stock'
                        ? 'inline-block px-2 py-1 text-xs rounded bg-green-100 text-green-700'
                        : p.stock_status === 'on_demand'
                          ? 'inline-block px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700'
                          : 'inline-block px-2 py-1 text-xs rounded bg-red-100 text-red-700'
                    }>
                      {p.stock_status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="px-3 py-1.5 rounded border border-gray-600 text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                        className={`px-3 py-1.5 rounded border ${deletingId === p.id ? 'bg-gray-200 text-gray-500' : 'border-red-600 text-red-600 hover:bg-red-50'}`}
                      >
                        {deletingId === p.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between p-4">
            <div className="text-sm text-gray-600">Page {page}{total != null ? ` of ${Math.max(1, Math.ceil(total / pageSize))}` : ''}</div>
            <div className="flex gap-2">
              <button
                className="px-3 py-1.5 rounded border"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >Prev</button>
              <button
                className="px-3 py-1.5 rounded border"
                onClick={() => setPage(p => (total != null ? (p < Math.ceil(total / pageSize) ? p + 1 : p) : p + 1))}
                disabled={total != null ? page >= Math.ceil(total / pageSize) : false}
              >Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.split(';').map(s => s.trim()).find(s => s.startsWith(name + '='))
  return match ? decodeURIComponent(match.split('=')[1]) : null
}