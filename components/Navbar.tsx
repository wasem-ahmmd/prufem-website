'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAdminBanner } from '@/lib/adminBannerSync'

const Navbar = () => {
  const { activeBanner } = useAdminBanner()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 bg-gradient-black/95 backdrop-blur-sm border-b border-brand-gray/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-1.5 sm:space-x-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8">
              <svg viewBox="0 0 48 48" className="w-full h-full">
                <circle cx="24" cy="24" r="20" stroke="url(#emeraldGradient)" strokeWidth="2" fill="none"/>
                <text x="24" y="28" textAnchor="middle" className={`text-xs font-bold fill-brand-emerald`}>P</text>
                <defs>
                  <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#50C878"/>
                    <stop offset="50%" stopColor="#7FE5A3"/>
                    <stop offset="100%" stopColor="#50C878"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="text-lg sm:text-xl font-serif text-gradient-silver">Prufem</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/collections" className={`text-brand-white ${activeBanner ? 'admin-dynamic-text-hover' : 'hover-text-emerald' }  transition-colors`}>
              Collections
            </Link>
            <Link href="/about" className={`text-brand-white ${activeBanner ? 'admin-dynamic-text-hover' : 'hover-text-emerald' }  transition-colors`}>
              About
            </Link>
            <Link href="/contact" className={`text-brand-white ${activeBanner ? 'admin-dynamic-text-hover' : 'hover-text-emerald' }  transition-colors`}>
              Contact
            </Link>
            <button 
              className="text-brand-white hover-text-emerald transition-colors"
              aria-label="Search products"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button 
              className="text-brand-white hover-text-emerald transition-colors"
              aria-label="Shopping cart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-brand-white hover-text-emerald transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-3 sm:py-4 border-t border-brand-gray/20 bg-gradient-black/90">
            <div className="flex flex-col space-y-3 sm:space-y-4">
              <Link 
                href="/collections" 
                className="text-brand-white hover-text-emerald transition-colors text-sm sm:text-base py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Collections
              </Link>
              <Link 
                href="/about" 
                className="text-brand-white hover-text-emerald transition-colors text-sm sm:text-base py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="text-brand-white hover-text-emerald transition-colors text-sm sm:text-base py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="flex items-center space-x-4 pt-2 border-t border-brand-gray/20 mt-3">
                <button 
                  className="text-brand-white hover-text-emerald transition-colors flex items-center space-x-2"
                  aria-label="Search products"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-sm">Search</span>
                </button>
                <button 
                  className="text-brand-white hover-text-emerald transition-colors flex items-center space-x-2"
                  aria-label="Shopping cart"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  <span className="text-sm">Cart</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar