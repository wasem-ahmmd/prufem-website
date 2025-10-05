'use client'

import React from 'react'
import { useAdminBanner } from '@/lib/adminBannerSync'


const ShortBy = () => {
   const { activeBanner } = useAdminBanner()
  return (
    <div className="py-2 sm:pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-black">
        <div className="pt-2 pb-10 border-b border-brand-gray/20">
          <h3 className="text-2xl font-serif text-gradient-silver text-center mb-8">
            Shop by Category
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'For Him', href: '/collections/men' },
              { name: 'For Her', href: '/collections/women' },
              { name: 'Unisex', href: '/collections/unisex' },
              { name: 'Limited Edition', href: '/collections/limited' },
            ].map((category) => (
              <a
                key={category.name}
                href={category.href}
                className={`group p-6 text-center border border-brand-gray/20 ${activeBanner ? 'admin-dynamic-border-hover' : 'hover:border-brand-emerald/50'} product-card-hover transition-all duration-300`}
              >
                <span className={`${activeBanner ? 'text-brand-white hover:admin-dynamic-text' : 'text-brand-white hover-text-emerald'} transition-colors font-semibold`}>
                  {category.name}
                </span>
              </a>
            ))}
          </div>
        </div>
        </div>
  )
}

export default ShortBy