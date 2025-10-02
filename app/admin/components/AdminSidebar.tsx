'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAdmin } from './AdminProvider'
import {
  HomeIcon,
  PhotoIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Banner & Colors', href: '/admin/dashboard/banner', icon: PhotoIcon },
  { name: 'Analytics', href: '/admin/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/admin/dashboard/settings', icon: CogIcon },
  { name: 'New Product', href: '/admin/products/new', icon: PhotoIcon },
]

export default function AdminSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAdmin()

  const handleLogout = () => {
    logout()
    window.location.href = '/admin/login'
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white p-2 rounded-md shadow-md text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 admin-sidebar transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-blue-600 to-indigo-600">
            <h1 className="text-white text-xl font-bold">Admin Panel</h1>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">
                    {user?.name?.charAt(0) || 'A'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`admin-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="admin-nav-item w-full text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 flex-shrink-0" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </>
  )
}