'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useAdminBanner } from '@/lib/adminBannerSync'

interface Product {
  id: string
  name: string
  price: number
  image: string
  description: string
}

interface ProductCardProps {
  product: Product
  className?: string
}

const ProductCard = ({ product, className = '' }: ProductCardProps) => {
  const { activeBanner } = useAdminBanner()
  
  const handleAddToCart = () => {
    // TODO: Implement Stripe checkout or cart functionality
    console.log('Adding to cart:', product.id)
  }

  return (
    <div className={`group bg-gradient-black border border-brand-gray/20 rounded-lg overflow-hidden ${activeBanner ? 'admin-dynamic-border-hover' : 'hover:border-brand-emerald/50'} product-card-hover transition-all duration-300 ${className}`}>
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
        />
        
        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-brand-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Link
            href={`/products/${product.id}`}
            className={`text-brand-white border ${activeBanner ? 'admin-dynamic-border hover:admin-dynamic-bg' : 'border-brand-emerald hover:bg-brand-emerald'} hover:text-brand-black px-3 sm:px-4 py-2 text-sm transition-colors`}
            aria-label={`Quick view ${product.name}`}
          >
            Quick View
          </Link>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 sm:p-6">
        <h3 className={`text-base sm:text-lg font-serif text-brand-white mb-2 ${activeBanner ? 'hover:admin-dynamic-text' : 'hover-text-emerald'} transition-colors leading-tight`}>
          <Link href={`/products/${product.id}`}>
            {product.name}
          </Link>
        </h3>
        
        <p className="text-brand-gray text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between gap-2">
          <span className={`text-lg sm:text-xl font-semibold ${activeBanner ? 'admin-dynamic-text' : 'text-gradient-emerald'}`}>
            ${product.price.toFixed(2)}
          </span>
          
          <button
            onClick={handleAddToCart}
            className={`${activeBanner ? 'admin-dynamic-bg admin-dynamic-hover' : 'bg-gradient-emerald btn-emerald-hover'} text-brand-button-text px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:ring-offset-2 focus:ring-offset-brand-black whitespace-nowrap border-2 border-transparent`}
            aria-label={`Add ${product.name} to cart`}
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Product Badge (if needed) */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
        {/* Add badges like "New", "Sale", etc. */}
      </div>
    </div>
  )
}

export default ProductCard