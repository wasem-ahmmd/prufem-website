'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdmin } from '../../components/AdminProvider'
import AdminSidebar from '../../components/AdminSidebar'
import FileUpload from '../../components/FileUpload'
import ColorPicker from '../../components/ColorPicker'
import {
  EyeIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'

export default function BannerManagement() {
  const { isAuthenticated, updateBanner, activeBanner } = useAdmin()
  const router = useRouter()
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState('#50C878')
  const [bannerTitle, setBannerTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login')
      return
    }

    // Initialize with current active banner data
    if (activeBanner) {
      setSelectedColor(activeBanner.color)
      setBannerTitle(activeBanner.title)
    }
  }, [isAuthenticated, router, activeBanner])

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setError(null)
    
    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleFileRemove = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  const handleColorChange = (color: string) => {
    setSelectedColor(color)
    setError(null)
  }

  const handleSave = async () => {
    if (!selectedFile && !activeBanner?.image) {
      setError('Please upload a banner image')
      return
    }

    if (!bannerTitle.trim()) {
      setError('Please enter a banner title')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      // In a real app, you would upload the file to your server/cloud storage
      // For now, we'll use the preview URL or existing image
      const imageUrl = previewUrl || activeBanner?.image || ''

      updateBanner({
        image: imageUrl,
        color: selectedColor,
        title: bannerTitle.trim(),
        isActive: true
      })

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)

      // Clean up preview URL if we created one
      if (previewUrl && selectedFile) {
        // In production, keep the URL until the image is properly uploaded
        // URL.revokeObjectURL(previewUrl)
      }

    } catch (err) {
      setError('Failed to save banner. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreview = () => {
    // Open homepage in new tab to preview changes
    window.open('/', '_blank')
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
            <div className="flex items-center">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                aria-label="Back to dashboard"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Banner & Color Management</h1>
                <p className="text-sm text-gray-600">Upload banner images and customize your website colors</p>
              </div>
            </div>
            <button
              onClick={handlePreview}
              className="admin-button-secondary flex items-center"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              Preview Site
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Success Message */}
            {showSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
                <p className="text-green-800">Banner and color updated successfully!</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-3" />
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column - Upload & Settings */}
              <div className="space-y-6">
                
                {/* Banner Title */}
                <div className="admin-card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Banner Title</h3>
                  <input
                    type="text"
                    value={bannerTitle}
                    onChange={(e) => setBannerTitle(e.target.value)}
                    placeholder="Enter banner title (e.g., Luxury Emerald Collection)"
                    className="admin-input"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {bannerTitle.length}/100 characters
                  </p>
                </div>

                {/* File Upload */}
                <div className="admin-card">
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    onFileRemove={handleFileRemove}
                    currentFile={selectedFile}
                    preview={previewUrl}
                    label="Banner Image"
                    description="PNG, JPG up to 2MB (Recommended: 1920x800px)"
                    acceptedTypes={['image/png', 'image/jpeg', 'image/jpg']}
                  />
                </div>

                {/* Color Picker */}
                <div className="admin-card">
                  <ColorPicker
                    value={selectedColor}
                    onChange={handleColorChange}
                    label="Brand Color"
                  />
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="w-full admin-button disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving Changes...
                    </>
                  ) : (
                    'Save Banner & Color'
                  )}
                </button>
              </div>

              {/* Right Column - Preview */}
              <div className="space-y-6">
                <div className="admin-card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h3>
                  
                  {/* Banner Preview */}
                  <div className="space-y-4">
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                      {(previewUrl || activeBanner?.image) ? (
                        <img
                          src={previewUrl || activeBanner?.image}
                          alt="Banner preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <div className="text-center">
                            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm">No banner image selected</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Overlay with title and color */}
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <div className="text-center text-white">
                          <h2 className="text-2xl font-bold mb-2">
                            {bannerTitle || 'Your Banner Title'}
                          </h2>
                          <div 
                            className="inline-block px-6 py-2 rounded-full text-white font-medium"
                            style={{ backgroundColor: selectedColor }}
                          >
                            Shop Now
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Color Application Preview */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Color Applications:</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 border rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Button</p>
                          <button 
                            className="px-4 py-2 rounded text-white text-sm font-medium"
                            style={{ backgroundColor: selectedColor }}
                          >
                            Add to Cart
                          </button>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Text Accent</p>
                          <p className="text-sm font-medium" style={{ color: selectedColor }}>
                            Featured Product
                          </p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Border</p>
                          <div 
                            className="w-full h-8 border-2 rounded"
                            style={{ borderColor: selectedColor }}
                          />
                        </div>
                        <div className="p-3 border rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Gradient</p>
                          <div 
                            className="w-full h-8 rounded"
                            style={{ 
                              background: `linear-gradient(135deg, ${selectedColor}, ${selectedColor}80)` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Active Banner Info */}
                {activeBanner && (
                  <div className="admin-card">
                    <h4 className="font-medium text-gray-900 mb-3">Current Active Banner</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Title:</span>
                        <span className="font-medium">{activeBanner.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Color:</span>
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded border mr-2"
                            style={{ backgroundColor: activeBanner.color }}
                          />
                          <span className="font-medium">{activeBanner.color}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium">
                          {new Date(activeBanner.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}