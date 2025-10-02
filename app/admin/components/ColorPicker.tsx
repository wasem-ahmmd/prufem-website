'use client'

import { useState, useCallback } from 'react'
import { CheckIcon } from '@heroicons/react/24/outline'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
  className?: string
  presetColors?: string[]
}

const DEFAULT_PRESET_COLORS = [
  '#50C878', // Emerald Green (current)
  '#FF6B6B', // Coral Red
  '#4ECDC4', // Turquoise
  '#45B7D1', // Sky Blue
  '#96CEB4', // Mint Green
  '#FFEAA7', // Warm Yellow
  '#DDA0DD', // Plum
  '#F39C12', // Orange
  '#E74C3C', // Red
  '#9B59B6', // Purple
  '#3498DB', // Blue
  '#1ABC9C', // Teal
  '#F1C40F', // Yellow
  '#E67E22', // Carrot
  '#95A5A6', // Gray
  '#34495E'  // Dark Gray
]

export default function ColorPicker({
  value,
  onChange,
  label = 'Select Color',
  className = '',
  presetColors = DEFAULT_PRESET_COLORS
}: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(value)
  const [isValidHex, setIsValidHex] = useState(true)

  const validateHexColor = useCallback((hex: string): boolean => {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    return hexRegex.test(hex)
  }, [])

  const handlePresetColorSelect = useCallback((color: string) => {
    setCustomColor(color)
    onChange(color)
    setIsValidHex(true)
  }, [onChange])

  const handleCustomColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setCustomColor(newColor)
    
    if (validateHexColor(newColor)) {
      setIsValidHex(true)
      onChange(newColor)
    } else {
      setIsValidHex(false)
    }
  }, [onChange, validateHexColor])

  const handleColorInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setCustomColor(newColor)
    onChange(newColor)
    setIsValidHex(validateHexColor(newColor))
  }, [onChange, validateHexColor])

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {label}
        </label>

        {/* Current Color Preview */}
        <div className="flex items-center space-x-3 mb-4">
          <div
            className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm"
            style={{ backgroundColor: value }}
            title={`Current color: ${value}`}
          />
          <div>
            <p className="text-sm font-medium text-gray-900">Current Color</p>
            <p className="text-xs text-gray-500">{value}</p>
          </div>
        </div>

        {/* Preset Colors Grid */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Preset Colors</p>
          <div className="grid grid-cols-8 gap-2">
            {presetColors.map((color) => (
              <button
                key={color}
                onClick={() => handlePresetColorSelect(color)}
                className="relative w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                style={{ backgroundColor: color }}
                title={color}
                aria-label={`Select color ${color}`}
              >
                {value === color && (
                  <CheckIcon className="absolute inset-0 w-4 h-4 m-auto text-white drop-shadow-sm" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Color Input */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Custom Color</p>
          
          <div className="flex space-x-3">
            {/* HTML Color Input */}
            <div className="flex-shrink-0">
              <input
                type="color"
                value={value}
                onChange={handleColorInputChange}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Color picker"
              />
            </div>

            {/* Hex Input */}
            <div className="flex-1">
              <input
                type="text"
                value={customColor}
                onChange={handleCustomColorChange}
                placeholder="#50C878"
                className={`admin-input ${!isValidHex ? 'border-red-300 focus:ring-red-500' : ''}`}
                aria-label="Hex color code"
              />
              {!isValidHex && (
                <p className="mt-1 text-sm text-red-600">
                  Please enter a valid hex color (e.g., #50C878)
                </p>
              )}
            </div>
          </div>

          {/* Color Name Helper */}
          <div className="text-xs text-gray-500">
            <p>Enter a hex color code (e.g., #50C878 for Emerald Green)</p>
          </div>
        </div>
      </div>
    </div>
  )
}