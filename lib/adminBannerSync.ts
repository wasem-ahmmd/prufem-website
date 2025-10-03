// Admin Banner Synchronization Utility
// This file handles the dynamic application of admin-uploaded banners and colors to the homepage

export interface AdminBannerData {
  id: string
  image: string
  color: string
  title: string
  isActive: boolean
  createdAt: string
}

// Get active banner data from localStorage (admin changes)
export function getActiveBanner(): AdminBannerData | null {
  if (typeof window === 'undefined') return null
  try {
    const savedBanners = localStorage.getItem('admin_banners')
    if (!savedBanners) return null
    const banners: AdminBannerData[] = JSON.parse(savedBanners)
    return banners.find(banner => banner.isActive) || null
  } catch (error) {
    console.error('Error loading admin banner data:', error)
    return null
  }
}

// Fetch active banner from server API for global state
export async function fetchActiveBanner(): Promise<AdminBannerData | null> {
  if (typeof window === 'undefined') return null
  try {
    const url = `${window.location.origin}/api/banner`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    return data as AdminBannerData
  } catch (err) {
    console.warn('Banner API fetch failed, falling back to local storage:', err)
    return null
  }
}

// Apply dynamic colors to CSS custom properties
export function applyDynamicColors(color: string) {
  if (typeof document === 'undefined') return
  
  const root = document.documentElement
  
  // Convert hex to RGB for alpha variations
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }
  
  const rgb = hexToRgb(color)
  if (!rgb) return
  
  // Set CSS custom properties for dynamic theming
  root.style.setProperty('--admin-primary-color', color)
  root.style.setProperty('--admin-primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`)
  root.style.setProperty('--admin-primary-light', `${color}20`)
  root.style.setProperty('--admin-primary-hover', adjustBrightness(color, -10))
  
  // Update Tailwind CSS classes dynamically
  updateTailwindClasses(color)
}

// Adjust color brightness for hover effects
function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = (num >> 8 & 0x00FF) + amt
  const B = (num & 0x0000FF) + amt
  
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)
}

// Update Tailwind classes dynamically (for components that use admin colors)
function updateTailwindClasses(color: string) {
  // Create or update a style element with dynamic Tailwind overrides
  let styleElement = document.getElementById('admin-dynamic-styles')
  
  if (!styleElement) {
    styleElement = document.createElement('style')
    styleElement.id = 'admin-dynamic-styles'
    document.head.appendChild(styleElement)
  }
  
  const css = `
    /* Dynamic admin color overrides */
    .admin-dynamic-bg {
      background-color: ${color} !important;
    }
    
    .admin-dynamic-text {
      color: ${color} !important;
    }

  .admin-dynamic-text-hover:hover {
    color: ${color} !important;
  }
    
  .admin-dynamic-border {
      border-color: ${color} !important;
  }
  

  .admin-dynamic-border-hover:hover {
      border-color: ${color} !important;
  }
    
    .admin-dynamic-gradient {
      background: linear-gradient(135deg, ${color}, ${adjustBrightness(color, 20)}) !important;
    }
    
    .admin-dynamic-hover:hover {
      background-color: ${adjustBrightness(color, -10)} !important; 
    }
      
    
    /* Override existing brand colors when admin color is active */
    .text-brand-emerald,
    .text-brand-gold {
      color: ${color} !important;
    }
    
    .bg-brand-emerald,
    .bg-brand-gold {
      background-color: ${color} !important;
    }
    
    .border-brand-emerald,
    .border-brand-gold {
      border-color: ${color} !important;
    }
    
    .hover\\:bg-brand-emerald:hover,
    .hover\\:bg-brand-gold:hover {
      background-color: ${adjustBrightness(color, -10)} !important;
    }
    
    .text-gradient-emerald,
    .text-gradient-gold {
      background: linear-gradient(135deg, ${color}, ${adjustBrightness(color, 20)}) !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      background-clip: text !important;
    }
    
    .bg-gradient-emerald,
    .bg-gradient-gold {
      background: linear-gradient(135deg, ${color}, ${adjustBrightness(color, 20)}) !important;
    }
  `
  
  styleElement.textContent = css
}

// Initialize admin banner sync on page load
export function initializeAdminBannerSync() {
  if (typeof window === 'undefined') return
  
  // Try server API first for global state
  fetchActiveBanner().then((banner) => {
    if (banner) {
      applyDynamicColors(banner.color)
    } else {
      const localBanner = getActiveBanner()
      if (localBanner) applyDynamicColors(localBanner.color)
    }
  })
  
  // Listen for storage changes (when admin updates banner in another tab)
  window.addEventListener('storage', (e) => {
    if (e.key === 'admin_banners') {
      const activeBanner = getActiveBanner()
      if (activeBanner) {
        applyDynamicColors(activeBanner.color)
      }
    }
  })
}

// Hook for React components to use admin banner data
export function useAdminBanner() {
  if (typeof window === 'undefined') {
    return { activeBanner: null, isLoading: true }
  }
  
  const [activeBanner, setActiveBanner] = useState<AdminBannerData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const loadBanner = async () => {
      // Prefer server API (global), fallback to localStorage
      const serverBanner = await fetchActiveBanner()
      const banner = serverBanner || getActiveBanner()
      setActiveBanner(banner)
      setIsLoading(false)
      if (banner) applyDynamicColors(banner.color)
    }
    
    void loadBanner()
    
    // Listen for changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin_banners') {
        loadBanner()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])
  
  return { activeBanner, isLoading }
}

// React hook imports (add these if using in React components)
import { useState, useEffect } from 'react'