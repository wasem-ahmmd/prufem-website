'use client'

import { useEffect } from 'react'
import { initializeAdminBannerSync } from '@/lib/adminBannerSync'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Initialize admin banner sync on app load
    initializeAdminBannerSync()
  }, [])

  return (
    <div className="antialiased">
      {children}
    </div>
  )
}