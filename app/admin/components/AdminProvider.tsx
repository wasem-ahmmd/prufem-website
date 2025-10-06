'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabasePublic } from '../../../lib/supabaseClient'

interface AdminUser {
  id: string
  email: string | null
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

// Initial banner data (persisted per admin actions)
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
    // Load saved banners
    const savedBanners = localStorage.getItem('admin_banners')
    if (savedBanners) {
      try {
        setBanners(JSON.parse(savedBanners))
      } catch (error) {
        setBanners(INITIAL_BANNERS)
      }
    }

    // Fetch current admin user from server
    const fetchMe = async () => {
      try {
        const resp = await fetch('/api/admin/me')
        if (resp.ok) {
          const json = await resp.json()
          setUser(json.user)
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    void fetchMe()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      if (!supabasePublic) throw new Error('Supabase not configured')
      const { data, error } = await supabasePublic.auth.signInWithPassword({ email, password })
      if (error) throw error
      const accessToken = data.session?.access_token
      if (!accessToken) throw new Error('No access token')
      const resp = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: accessToken }),
      })
      if (!resp.ok) throw new Error('Failed to set session')
      // Refresh user state
      const me = await fetch('/api/admin/me')
      if (me.ok) {
        const json = await me.json()
        setUser(json.user)
      }
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      if (supabasePublic) await supabasePublic.auth.signOut()
      await fetch('/api/admin/session', { method: 'DELETE' })
    } catch {}
    setUser(null)
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

    // Persist globally via API so all users receive the update
    try {
      void fetch('/api/banner', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: bannerData.image,
          color: bannerData.color,
          title: bannerData.title,
          isActive: true,
        }),
      })
    } catch (err) {
      console.error('Failed to persist banner globally:', err)
    }
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