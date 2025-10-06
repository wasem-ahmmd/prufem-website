"use client"
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

type Product = {
  id: string
  name: string
  sku: string
  price: number | null
  sale_price: number | null
  discount: number | null
  stock_quantity: number
  stock_status: 'in_stock' | 'out_of_stock' | 'on_demand'
  category_id: string
  inspired_by: string | null
  description_html: string | null
  image_urls: string[]
}

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const id = String(params?.id || '')

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [price, setPrice] = useState<number | ''>('')
  const [salePrice, setSalePrice] = useState<number | ''>('')
  const [stockQuantity, setStockQuantity] = useState<number | ''>('')
  const [stockStatus, setStockStatus] = useState<'in_stock'|'out_of_stock'|'on_demand'>('in_stock')
  const [descriptionHtml, setDescriptionHtml] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || json?.message || 'Failed to load product')
        const p: Product = json.product
        if (!cancelled) {
          setProduct(p)
          setName(p.name)
          setPrice(p.price ?? '')
          setSalePrice(p.sale_price ?? '')
          setStockQuantity(p.stock_quantity ?? 0)
          setStockStatus(p.stock_status)
          setDescriptionHtml(p.description_html || '')
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Unexpected error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (id) load()
    return () => { cancelled = true }
  }, [id])

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const payload: any = {
        name,
        price: typeof price === 'number' ? price : null,
        sale_price: typeof salePrice === 'number' ? salePrice : null,
        stock_quantity: typeof stockQuantity === 'number' ? stockQuantity : 0,
        stock_status: stockStatus,
        description_html: descriptionHtml || null,
      }
      const csrf = getCookie('admin_csrf')
      const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf || '' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || json?.message || 'Update failed')
      router.push('/admin/products')
    } catch (e: any) {
      setError(e?.message || 'Unexpected error while saving')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Edit Product</h1>
      </div>
      {loading && <div className="text-gray-500">Loading…</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && product && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full border rounded-md px-3 py-2"
                placeholder="Product name"
              />
            </div>

            <div className="bg-white border rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700">Description (HTML)</label>
              <textarea
                value={descriptionHtml}
                onChange={(e) => setDescriptionHtml(e.target.value)}
                className="mt-1 w-full border rounded-md px-3 py-2 h-32"
                placeholder="<p>...</p>"
              />
            </div>

            <div className="bg-white border rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  value={price === '' ? '' : String(price)}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="mt-1 w-full border rounded-md px-3 py-2"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sale Price</label>
                <input
                  type="number"
                  value={salePrice === '' ? '' : String(salePrice)}
                  onChange={(e) => setSalePrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="mt-1 w-full border rounded-md px-3 py-2"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                <input
                  type="number"
                  value={stockQuantity === '' ? '' : String(stockQuantity)}
                  onChange={(e) => setStockQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                  className="mt-1 w-full border rounded-md px-3 py-2"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Stock Status</label>
                <select
                  value={stockStatus}
                  onChange={(e) => setStockStatus(e.target.value as any)}
                  className="mt-1 w-full border rounded-md px-3 py-2"
                >
                  <option value="in_stock">In stock</option>
                  <option value="out_of_stock">Out of stock</option>
                  <option value="on_demand">On demand</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border rounded-lg p-4">
              <div className="text-sm text-gray-700 mb-2">Images</div>
              <div className="grid grid-cols-2 gap-2">
                {(product.image_urls || []).slice(0,2).map((url, idx) => (
                  <img key={idx} src={url} alt="" className="w-full h-24 object-cover rounded" />
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-2">Image changes not supported here yet.</div>
            </div>

            <div className="bg-white border rounded-lg p-4 space-y-3">
              <button
                onClick={() => router.push('/admin/products')}
                className="w-full px-4 py-2 rounded-md border text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`w-full px-4 py-2 rounded-md ${saving ? 'bg-gray-200 text-gray-500' : 'bg-black text-white hover:bg-gray-800'}`}
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
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