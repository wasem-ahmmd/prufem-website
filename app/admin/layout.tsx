import { Inter } from 'next/font/google'
import AdminProvider from './components/AdminProvider'
import './admin.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Admin Panel - Waseem Jatt & Co.',
  description: 'Admin dashboard for managing perfume e-commerce website',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminProvider>
      <div className={`min-h-screen bg-gray-50 ${inter.className}`}>
        {children}
      </div>
    </AdminProvider>
  )
}