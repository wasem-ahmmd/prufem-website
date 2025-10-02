'use client'

import { useState, useRef, useCallback } from 'react'
import { CloudArrowUpIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  onFileRemove: () => void
  acceptedTypes?: string[]
  maxSize?: number // in MB
  currentFile?: File | null
  preview?: string | null
  className?: string
  label?: string
  description?: string
}

export default function FileUpload({
  onFileSelect,
  onFileRemove,
  acceptedTypes = ['image/png', 'image/jpeg', 'image/jpg'],
  maxSize = 2,
  currentFile,
  preview,
  className = '',
  label = 'Upload Image',
  description = 'PNG, JPG up to 2MB'
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return `File type not supported. Please upload: ${acceptedTypes.join(', ')}`
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSize) {
      return `File size too large. Maximum size is ${maxSize}MB`
    }

    return null
  }, [acceptedTypes, maxSize])

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    onFileSelect(file)
  }, [validateFile, onFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleRemoveFile = useCallback(() => {
    setError(null)
    onFileRemove()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onFileRemove])

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        
        {/* Upload Area */}
        <div
          className={`file-upload-area ${isDragOver ? 'dragover' : ''} ${error ? 'border-red-300' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleInputChange}
            className="hidden"
            aria-label={label}
          />

          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="max-h-48 mx-auto rounded-lg shadow-md"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveFile()
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Remove image"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                    Click to upload
                  </span>{' '}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">{description}</p>
              </div>
            </div>
          )}
        </div>

        {/* Current File Info */}
        {currentFile && !preview && (
          <div className="mt-2 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <PhotoIcon className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-900">{currentFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(currentFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="text-red-500 hover:text-red-700 focus:outline-none"
              aria-label="Remove file"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}