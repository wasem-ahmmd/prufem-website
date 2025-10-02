'use client'

import { useState } from 'react'
import Link from 'next/link'

const Footer = () => {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement newsletter subscription
    console.log('Newsletter subscription:', email)
    setIsSubscribed(true)
    setEmail('')
    setTimeout(() => setIsSubscribed(false), 3000)
  }

  return (
    <footer className="bg-gradient-black border-t border-brand-gray/20">
      {/* Newsletter Section */}
      <div className="border-b border-brand-gray/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <h3 className="text-xl sm:text-2xl font-serif text-gradient-silver mb-3 sm:mb-4">
              Stay in the Scent
            </h3>
            <p className="text-sm sm:text-base text-brand-gray mb-4 sm:mb-6 max-w-md mx-auto px-4 sm:px-0">
              Be the first to discover new fragrances and exclusive offers
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto px-4 sm:px-0">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-brand-black border border-brand-gray/40 text-brand-white placeholder-brand-gray focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald text-sm sm:text-base"
                  aria-label="Email address for newsletter"
                />
                <button
                  type="submit"
                  disabled={isSubscribed}
                  className="bg-gradient-emerald text-brand-black px-4 sm:px-6 py-2 sm:py-3 font-semibold btn-emerald-hover transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:ring-offset-2 focus:ring-offset-brand-black text-sm sm:text-base whitespace-nowrap"
                >
                  {isSubscribed ? 'Subscribed!' : 'Subscribe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-2 mb-3 sm:mb-4">
              <div className="w-6 sm:w-8 h-6 sm:h-8">
                <svg viewBox="0 0 48 48" className="w-full h-full">
                  <circle cx="24" cy="24" r="20" stroke="url(#emeraldGradientFooter)" strokeWidth="2" fill="none"/>
                  <text x="24" y="28" textAnchor="middle" className="text-xs font-bold fill-brand-emerald">P</text>
                  <defs>
                    <linearGradient id="emeraldGradientFooter" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#50C878"/>
                      <stop offset="50%" stopColor="#7FE5A3"/>
                      <stop offset="100%" stopColor="#50C878"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="text-lg sm:text-xl font-serif text-gradient-silver">Prufem</span>
            </div>
            <p className="text-brand-gray mb-4 sm:mb-6 max-w-md text-sm sm:text-base leading-relaxed">
              Crafting exceptional fragrances since our founding, we are dedicated to bringing you 
              the finest perfumes that embody luxury, elegance, and sophistication.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-3 sm:space-x-4">
              <a
                href="https://instagram.com/prufem"
                className="text-brand-gray hover-text-emerald transition-colors"
                aria-label="Follow us on Instagram"
              >
                <svg className="w-5 sm:w-6 h-5 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.321-1.297C4.198 14.553 3.708 13.402 3.708 12.105s.49-2.448 1.42-3.321c.873-.873 2.024-1.297 3.321-1.297s2.448.424 3.321 1.297c.93.873 1.42 2.024 1.42 3.321s-.49 2.448-1.42 3.321c-.873.807-2.024 1.297-3.321 1.297z"/>
                </svg>
              </a>
              <a
                href="https://facebook.com/prufem"
                className="text-brand-gray hover-text-emerald transition-colors"
                aria-label="Follow us on Facebook"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://twitter.com/prufem"
                className="text-brand-gray hover-text-emerald transition-colors"
                aria-label="Follow us on Twitter"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gradient-silver font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Quick Links</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link href="/collections" className="text-brand-gray hover-text-emerald transition-colors text-sm sm:text-base">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-brand-gray hover-text-emerald transition-colors text-sm sm:text-base">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-brand-gray hover-text-emerald transition-colors text-sm sm:text-base">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/stores" className="text-brand-gray hover-text-emerald transition-colors text-sm sm:text-base">
                  Store Locator
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-gradient-silver font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Customer Service</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link href="/shipping" className="text-brand-gray hover-text-emerald transition-colors text-sm sm:text-base">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-brand-gray hover-text-emerald transition-colors text-sm sm:text-base">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="text-brand-gray hover-text-emerald transition-colors text-sm sm:text-base">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-brand-gray hover-text-emerald transition-colors text-sm sm:text-base">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-brand-gray/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <p className="text-brand-gray text-xs sm:text-sm text-center sm:text-left">
              © 2024 Prufem. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center sm:justify-end space-x-4 sm:space-x-6">
              <Link href="/privacy" className="text-brand-gray hover-text-emerald transition-colors text-xs sm:text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-brand-gray hover-text-emerald transition-colors text-xs sm:text-sm">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-brand-gray hover-text-emerald transition-colors text-xs sm:text-sm">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer