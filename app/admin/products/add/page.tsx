'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import FileUpload from '../../components/FileUpload'

type Category = { id: string; name: string }

const stockOptions = [
  { label: 'In Stock', value: 'in_stock' },
  { label: 'Out of Stock', value: 'out_of_stock' },
  { label: 'On Demand', value: 'on_demand' },
]

export default function AddProductPage() {
  const router = useRouter()

  // Images (2 slots)
  const [files, setFiles] = useState<(File | null)[]>([null, null])
  const [previews, setPreviews] = useState<(string | null)[]>([null, null])

  // Product fields
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [inspiredBy, setInspiredBy] = useState('')
  const [descriptionHtml, setDescriptionHtml] = useState('')
  const [sku, setSku] = useState('SKU-1')
  const [quantity, setQuantity] = useState<string>('')
  const [stockStatus, setStockStatus] = useState<'in_stock' | 'out_of_stock' | 'on_demand'>('in_stock')

  // Pricing
  const [price, setPrice] = useState<string>('')
  const [salePrice, setSalePrice] = useState<string>('')
  const discount = useMemo(() => {
    const p = parseFloat(price || '0')
    const sp = parseFloat(salePrice || '0')
    if (!price || !salePrice) return ''
    if (isNaN(p) || isNaN(sp)) return ''
    const d = p - sp
    return d >= 0 ? String(d) : ''
  }, [price, salePrice])

  // UX state
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Categories
  const [categories, setCategories] = useState<Category[]>([])

  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/admin/categories', { cache: 'no-store' })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || 'Failed to load categories')
        setCategories(json.categories || [])
      } catch (e: any) {
        console.warn('Categories fetch failed:', e?.message || e)
      }
    }
    loadCategories()
  }, [])

  // Fetch SKUs and set next available
  useEffect(() => {
    async function loadSkusAndSet() {
      try {
        const res = await fetch('/api/admin/products', { cache: 'no-store' })
        const json = await res.json()
        if (!res.ok) return
        const skus: string[] = (json.products || []).map((p: any) => p.sku).filter(Boolean)
        setSku(nextSku(skus))
      } catch {}
    }
    loadSkusAndSet()
  }, [])

  function nextSku(existing: string[]): string {
    const nums = existing
      .map((s) => {
        const m = /^SKU-(\d+)$/.exec(String(s))
        return m ? parseInt(m[1], 10) : 0
      })
      .filter((n) => n > 0)
    const max = nums.length ? Math.max(...nums) : 0
    return `SKU-${max + 1}`
  }

  function execCmd(cmd: string, value?: string) {
    document.execCommand(cmd, false, value)
  }

  const hasTwoImages = useMemo(() => files.filter(Boolean).length === 2, [files])
  const canSave = useMemo(() => {
    const p = parseFloat(price || '0')
    const sp = salePrice ? parseFloat(salePrice) : undefined
    const qty = quantity ? parseInt(quantity) : 0
    const validNumbers = !isNaN(p) && p > 0 && (!sp || (sp > 0 && sp <= p)) && (!quantity || (!isNaN(qty) && qty >= 0))
    return !!name.trim() && !!categoryId.trim() && validNumbers && hasTwoImages
  }, [name, categoryId, price, salePrice, quantity, hasTwoImages])

  const handleFileSelectAt = (idx: number) => (f: File) => {
    setFiles((prev) => prev.map((v, i) => (i === idx ? f : v)))
    setPreviews((prev) => prev.map((v, i) => (i === idx ? URL.createObjectURL(f) : v)))
    setError(null)
  }
  const handleFileRemoveAt = (idx: number) => () => {
    setFiles((prev) => prev.map((v, i) => (i === idx ? null : v)))
    setPreviews((prev) => prev.map((v, i) => (i === idx ? null : v)))
  }

  async function uploadOne(f: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', f)
    const csrf = getCookie('admin_csrf')
    const resp = await fetch('/api/admin/upload?folder=products', { method: 'POST', headers: { 'x-csrf-token': csrf || '' }, body: formData })
    const json = await resp.json()
    if (!resp.ok) throw new Error(json?.error || 'Upload failed')
    return json.secure_url as string
  }

  async function uploadImages(): Promise<string[]> {
    const tasks = files.filter(Boolean).map((f) => uploadOne(f as File))
    const urls = await Promise.all(tasks)
    if (urls.length !== 2) throw new Error('Please upload exactly 2 images')
    return urls
  }

  async function ensureUniqueSku(current: string): Promise<string> {
    try {
      const res = await fetch('/api/admin/products', { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) return current
      const skus: string[] = (json.products || []).map((p: any) => p.sku).filter(Boolean)
      if (!skus.includes(current)) return current
      return nextSku(skus)
    } catch {
      return current
    }
  }

  async function handleCreate() {
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const images = await uploadImages()
      const uniqueSku = await ensureUniqueSku(sku)

      const payload = {
        name: name.trim(),
        category_id: categoryId,
        inspired_by: inspiredBy.trim(),
        description_html: descriptionHtml,
        sku: uniqueSku,
        stock_quantity: quantity ? parseInt(quantity) : 0,
        stock_status: stockStatus,
        price: parseFloat(price),
        sale_price: salePrice ? parseFloat(salePrice) : null,
        discount: discount ? parseFloat(discount) : null,
        image_urls: images,
      }

      const csrf = getCookie('admin_csrf')
      const resp = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf || '' },
        body: JSON.stringify(payload),
      })
      const json = await resp.json()
      if (!resp.ok) throw new Error(json?.error || json?.message || 'Failed to create product')

      setSuccess('Product created successfully')
      // reset form
      setFiles([null, null])
      setPreviews([null, null])
      setName('')
      setCategoryId('')
      setInspiredBy('')
      setDescriptionHtml('')
      setSku(nextSku([(sku || 'SKU-0')]))
      setQuantity('')
      setStockStatus('in_stock')
      setPrice('')
      setSalePrice('')
    } catch (e: any) {
      setError(e?.message || 'Failed to save product')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add Product</h1>
      {error && <div className="admin-alert error mb-4">{error}</div>}
      {success && <div className="admin-alert success mb-4">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel: inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="admin-card">
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Images (2)</label>
            <div className="grid grid-cols-2 gap-4">
              {[0, 1].map((idx) => (
                <FileUpload
                  key={idx}
                  onFileSelect={handleFileSelectAt(idx)}
                  onFileRemove={handleFileRemoveAt(idx)}
                  currentFile={files[idx]}
                  preview={previews[idx]}
                  acceptedTypes={['image/jpeg', 'image/png']}
                  maxSize={5}
                  label={`Image ${idx + 1}`}
                  description="JPG/PNG up to 5MB"
                />
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="admin-card space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
              <input className="admin-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Velvet Oud" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Categories</label>
              <select className="admin-input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="" disabled>Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Inspired By</label>
              <input className="admin-input" value={inspiredBy} onChange={(e) => setInspiredBy(e.target.value)} placeholder="e.g., Dior Sauvage" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <div className="flex flex-wrap gap-2 mb-3">
                <button type="button" className="admin-button-secondary" onClick={() => execCmd('bold')}>Bold</button>
                <button type="button" className="admin-button-secondary" onClick={() => execCmd('italic')}>Italic</button>
                <button type="button" className="admin-button-secondary" onClick={() => execCmd('insertUnorderedList')}>Bullet</button>
                <button type="button" className="admin-button-secondary" onClick={() => execCmd('insertOrderedList')}>List</button>
                <button type="button" className="admin-button-secondary" onClick={() => execCmd('formatBlock','H2')}>Heading</button>
                <button type="button" className="admin-button-secondary" onClick={() => {
                  const url = prompt('Enter link URL')
                  if (url) execCmd('createLink', url)
                }}>Link</button>
              </div>
              <div
                ref={editorRef}
                className="admin-input min-h-[160px]"
                contentEditable
                onInput={(e) => setDescriptionHtml((e.target as HTMLDivElement).innerHTML)}
                suppressContentEditableWarning
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                <input className="admin-input" value={sku} onChange={(e) => setSku(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                <input type="number" className="admin-input" value={quantity} min={0} step={1} onChange={(e) => setQuantity(e.target.value)} placeholder="0" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Availability</label>
              <select className="admin-input" value={stockStatus} onChange={(e) => setStockStatus(e.target.value as any)}>
                {stockOptions.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing Details */}
          <div className="admin-card grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
              <input type="number" className="admin-input" value={price} min={0} step={0.01} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price</label>
              <input type="number" className="admin-input" value={salePrice} min={0} step={0.01} onChange={(e) => setSalePrice(e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount</label>
              <input type="number" className="admin-input" value={discount} readOnly placeholder="0.00" />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" className="admin-button-secondary" onClick={() => {
              setFiles([null, null]); setPreviews([null, null]); setName(''); setCategoryId(''); setInspiredBy(''); setDescriptionHtml(''); setSku('SKU-1'); setQuantity(''); setStockStatus('in_stock'); setPrice(''); setSalePrice(''); setSuccess(null); setError(null);
            }}>Cancel</button>
            <button type="button" className="admin-button" onClick={handleCreate} disabled={!canSave || isSaving}>
              {isSaving ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>

        {/* Right panel: live preview */}
        <div className="space-y-6">
          <div className="admin-card">
            <h2 className="text-lg font-semibold mb-2">Product Preview</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[0,1].map((idx) => (
                previews[idx] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={idx} src={previews[idx]!} alt={`Preview ${idx+1}`} className="w-full h-32 object-cover rounded" />
                ) : (
                  <div key={idx} className="w-full h-32 bg-gray-100 rounded" />
                )
              ))}
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-700">Name: <span className="font-medium">{name || '-'}</span></div>
              <div className="text-sm text-gray-700">Price: <span className="font-medium">{price ? `₹${parseFloat(price).toFixed(2)}` : '-'}</span></div>
              <div className="text-sm text-gray-700">Stock: <span className="font-medium capitalize">{stockStatus.replace('_',' ')}</span></div>
              <div className="text-xs text-gray-500">SKU: {sku || '-'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.split(';').map(s => s.trim()).find(s => s.startsWith(name + '='))
  return match ? decodeURIComponent(match.split('=')[1]) : null
}