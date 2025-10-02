'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'

export default function NewProductPage() {
  const [name, setName] = useState('')
  const [price, setPrice] = useState<string>('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  const onFileSelect = (file: File) => {
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileSelect(file)
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dropRef.current?.classList.remove('dragover')
    const file = e.dataTransfer.files?.[0]
    if (file) onFileSelect(file)
  }

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dropRef.current?.classList.add('dragover')
  }

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dropRef.current?.classList.remove('dragover')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    // Basic validation
    if (!name.trim()) { setMessage('Please enter product name'); return }
    const priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum <= 0) { setMessage('Please enter a valid price'); return }
    if (!imageFile || !imagePreview) { setMessage('Please upload a product image'); return }

    setSaving(true)
    try {
      // Persist to localStorage as a placeholder
      const existing = typeof window !== 'undefined' ? localStorage.getItem('admin_products') : null
      const products = existing ? JSON.parse(existing) : []
      const newProduct = {
        id: Date.now().toString(),
        name: name.trim(),
        price: priceNum,
        image: imagePreview, // store base64 preview as placeholder
        createdAt: new Date().toISOString(),
      }
      products.push(newProduct)
      localStorage.setItem('admin_products', JSON.stringify(products))
      setMessage('Product created successfully!')
      setName('')
      setPrice('')
      setImageFile(null)
      setImagePreview(null)
    } catch (err) {
      setMessage('Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Product</h1>
        <Link href="/admin/dashboard" className="admin-button-secondary">Back to Dashboard</Link>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        <div className="admin-card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="admin-input"
                placeholder="e.g., Velvet Oud"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="admin-input"
                placeholder="e.g., 199.99"
              />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Image</h2>
          <div
            ref={dropRef}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className="file-upload-area"
          >
            <p className="text-gray-700">Drag & drop image here, or click to select</p>
            <input type="file" accept="image/*" onChange={handleFileInput} className="mt-3" />
          </div>

          {imagePreview && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Preview</p>
              <div className="relative w-full max-w-sm pb-[100%] rounded overflow-hidden border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
              </div>
            </div>
          )}
        </div>

        {message && (
          <div className="text-sm text-gray-700">{message}</div>
        )}

        <button type="submit" className="admin-button" disabled={saving}>
          {saving ? 'Saving...' : 'Create Product'}
        </button>
      </form>
    </div>
  )
}