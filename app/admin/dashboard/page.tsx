'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdmin } from '../components/AdminProvider'
import AdminSidebar from '../components/AdminSidebar'
import {
  ShoppingBagIcon,
  StarIcon,
  TagIcon,
  UsersIcon,
  ChartBarIcon,
  EyeIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'

interface DashboardStats {
  totalProducts: number
  totalCategories: number
  totalOrders: number
  totalCustomers: number
  revenue: number
  conversionRate: number
}

interface BestsellerProduct {
  id: string
  name: string
  sales: number
  revenue: number
  image: string
}

export default function AdminDashboard() {
  const { isAuthenticated, activeBanner } = useAdmin()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalCustomers: 0,
    revenue: 0,
    conversionRate: 0
  })
  const [bestsellers, setBestsellers] = useState<BestsellerProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login')
      return
    }

    // Mock data loading - replace with real API calls
    setTimeout(() => {
      setStats({
        totalProducts: 156,
        totalCategories: 8,
        totalOrders: 1247,
        totalCustomers: 892,
        revenue: 125430,
        conversionRate: 3.2
      })

      setBestsellers([
        {
          id: '1',
          name: 'Emerald Essence',
          sales: 234,
          revenue: 15600,
          image: '/images/perfume-1.jpg'
        },
        {
          id: '2',
          name: 'Royal Oud',
          sales: 189,
          revenue: 12340,
          image: '/images/perfume-2.jpg'
        },
        {
          id: '3',
          name: 'Mystic Rose',
          sales: 156,
          revenue: 9870,
          image: '/images/perfume-3.jpg'
        }
      ])

      setIsLoading(false)
    }, 1000)
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  const statCards = [
    {
      name: 'Total Products',
      value: stats.totalProducts,
      icon: ShoppingBagIcon,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      name: 'Categories',
      value: stats.totalCategories,
      icon: TagIcon,
      color: 'bg-green-500',
      change: '+2%'
    },
    {
      name: 'Total Orders',
      value: stats.totalOrders,
      icon: ChartBarIcon,
      color: 'bg-purple-500',
      change: '+18%'
    },
    {
      name: 'Customers',
      value: stats.totalCustomers,
      icon: UsersIcon,
      color: 'bg-orange-500',
      change: '+24%'
    }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back! Here's what's happening with your store.</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Current Banner</p>
                <p className="text-sm font-medium" style={{ color: activeBanner?.color || '#50C878' }}>
                  {activeBanner?.title || 'No active banner'}
                </p>
              </div>
              {activeBanner && (
                <div 
                  className="w-8 h-8 rounded border-2 border-gray-300"
                  style={{ backgroundColor: activeBanner.color }}
                  title={`Current color: ${activeBanner.color}`}
                />
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                  <div key={stat.name} className="admin-card">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-lg ${stat.color}`}>
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                        <div className="flex items-center">
                          <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                          <span className="ml-2 text-sm text-green-600 font-medium">{stat.change}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Revenue and Conversion */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="admin-card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">${stats.revenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold text-green-600">+15.3%</p>
                      <p className="text-sm text-gray-600">vs last month</p>
                    </div>
                  </div>
                </div>

                <div className="admin-card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Rate</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{stats.conversionRate}%</p>
                      <p className="text-sm text-gray-600">Conversion Rate</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold text-blue-600">+0.8%</p>
                      <p className="text-sm text-gray-600">vs last month</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bestseller Products */}
              <div className="admin-card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Bestseller Products</h3>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {bestsellers.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-lg font-bold text-gray-600">#{index + 1}</span>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-600">{product.sales} sales</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">${product.revenue.toLocaleString()}</p>
                        <p className="text-xs text-gray-600">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="admin-card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => router.push('/admin/dashboard/banner')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <PhotoIcon className="h-8 w-8 text-blue-600 mb-2" />
                    <h4 className="font-medium text-gray-900">Update Banner</h4>
                    <p className="text-sm text-gray-600">Change homepage banner and colors</p>
                  </button>
                  
                  <button
                    onClick={() => router.push('/admin/dashboard/analytics')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <ChartBarIcon className="h-8 w-8 text-green-600 mb-2" />
                    <h4 className="font-medium text-gray-900">View Analytics</h4>
                    <p className="text-sm text-gray-600">Detailed performance metrics</p>
                  </button>
                  
                  <button
                    onClick={() => window.open('/', '_blank')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <EyeIcon className="h-8 w-8 text-purple-600 mb-2" />
                    <h4 className="font-medium text-gray-900">Preview Site</h4>
                    <p className="text-sm text-gray-600">View your live website</p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}