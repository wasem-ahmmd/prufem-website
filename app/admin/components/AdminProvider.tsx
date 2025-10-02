'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface AdminUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'super_admin'
}

interface BannerData {
  id: string
  image: string
  color: string
  title: string
  isActive: boolean
  createdAt: string
}

interface AdminContextType {
  user: AdminUser | null
  isAuthenticated: boolean
  banners: BannerData[]
  activeBanner: BannerData | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  updateBanner: (banner: Omit<BannerData, 'id' | 'createdAt'>) => void
  setActiveBanner: (bannerId: string) => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

// Mock admin users for demonstration
const MOCK_ADMIN_USERS = [
  {
    id: '1',
    email: 'admin@waseemjatt.com',
    name: 'Admin User',
    role: 'admin' as const,
    password: 'admin123'
  },
  {
    id: '2',
    email: 'super@waseemjatt.com',
    name: 'Super Admin',
    role: 'super_admin' as const,
    password: 'super123'
  }
]

// Mock banner data
const INITIAL_BANNERS: BannerData[] = [
  {
    id: '1',
    image: '/images/hero-perfume.jpg',
    color: '#50C878',
    title: 'Luxury Emerald Collection',
    isActive: true,
    createdAt: new Date().toISOString()
  }
]

export default function AdminProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [banners, setBanners] = useState<BannerData[]>(INITIAL_BANNERS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('admin_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        localStorage.removeItem('admin_user')
      }
    }

    // Load saved banners
    const savedBanners = localStorage.getItem('admin_banners')
    if (savedBanners) {
      try {
        setBanners(JSON.parse(savedBanners))
      } catch (error) {
        setBanners(INITIAL_BANNERS)
      }
    }

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock authentication - replace with real API call
      const mockUser = MOCK_ADMIN_USERS.find(
        u => u.email === email && u.password === password
      )

      if (mockUser) {
        const { password: _, ...userWithoutPassword } = mockUser
        setUser(userWithoutPassword)
        localStorage.setItem('admin_user', JSON.stringify(userWithoutPassword))
        
        // Set authentication cookie (in production, use secure httpOnly cookies)
        if (typeof document !== 'undefined') {
          document.cookie = `admin_token=mock_admin_token_${Date.now()}; path=/; max-age=86400; SameSite=Strict`
        }
        
        return true
      }

      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('admin_user')
    
    // Clear authentication cookie
    if (typeof document !== 'undefined') {
      document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
  }

  const updateBanner = (bannerData: Omit<BannerData, 'id' | 'createdAt'>) => {
    const newBanner: BannerData = {
      ...bannerData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }

    const updatedBanners = banners.map(b => ({ ...b, isActive: false }))
    updatedBanners.push({ ...newBanner, isActive: true })

    setBanners(updatedBanners)
    localStorage.setItem('admin_banners', JSON.stringify(updatedBanners))

    // Update CSS custom properties for dynamic color
    document.documentElement.style.setProperty('--admin-primary-color', bannerData.color)
    document.documentElement.style.setProperty('--admin-primary-rgb', hexToRgb(bannerData.color))
  }

  const setActiveBanner = (bannerId: string) => {
    const updatedBanners = banners.map(b => ({
      ...b,
      isActive: b.id === bannerId
    }))

    setBanners(updatedBanners)
    localStorage.setItem('admin_banners', JSON.stringify(updatedBanners))

    const activeBanner = updatedBanners.find(b => b.isActive)
    if (activeBanner) {
      document.documentElement.style.setProperty('--admin-primary-color', activeBanner.color)
      document.documentElement.style.setProperty('--admin-primary-rgb', hexToRgb(activeBanner.color))
    }
  }

  const activeBanner = banners.find(b => b.isActive) || null

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <AdminContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        banners,
        activeBanner,
        login,
        logout,
        updateBanner,
        setActiveBanner
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (result) {
    const r = parseInt(result[1], 16)
    const g = parseInt(result[2], 16)
    const b = parseInt(result[3], 16)
    return `${r}, ${g}, ${b}`
  }
  return '0, 0, 0'
}