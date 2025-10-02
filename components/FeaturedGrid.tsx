'use client'
import ProductCard from './ProductCard'
import { useAdminBanner } from '@/lib/adminBannerSync'

// Sample product data - replace with actual data from your API/CMS
const featuredProducts = [
  {
    id: '1',
    name: 'Noir Elegance',
    price: 189.99,
    image: '/images/perfume-1.png',
    description: 'A sophisticated blend of bergamot, jasmine, and sandalwood that captures the essence of luxury.',
  },
  {
    id: '2',
    name: 'Mystique Rose',
    price: 225.50,
    image: '/images/perfume-2.jpg',
    description: 'Warm amber and vanilla notes create an intoxicating fragrance perfect for evening wear.',
  },
  {
    id: '3',
    name: 'Velvet Oud',
    price: 299.00,
    image: '/images/perfume-3.jpg',
    description: 'An opulent oud-based fragrance with rose and saffron, embodying timeless sophistication.',
  },
  {
    id: '4',
    name: 'Citrus Bloom',
    price: 159.75,
    image: '/images/perfume-4.jpg',
    description: 'Light and airy with citrus top notes and a clean, modern finish perfect for daily wear.',
  },
  {
    id: '5',
    name: 'Amber Night',
    price: 210.00,
    image: '/images/perfume-5.jpg',
    description: 'A romantic bouquet of Bulgarian rose petals with hints of peony and white musk.',
  },
  {
    id: '6',
    name: 'Golden Aura',
    price: 350.00,
    image: '/images/perfume-6.jpg',
    description: 'Our most exclusive fragrance featuring rare black truffle and precious woods.',
  },
]

const FeaturedGrid = () => {
  const { activeBanner } = useAdminBanner()
  
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-gradient-silver mb-3 sm:mb-4">
            Featured Collection
          </h2>
          <p className="text-sm sm:text-base text-brand-gray max-w-2xl mx-auto px-4 sm:px-0 leading-relaxed">
            Discover our most coveted fragrances, each carefully crafted to embody 
            luxury and sophistication. These signature scents represent the pinnacle of our artistry.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {featuredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product}
              className="animate-fade-in"
            />
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center">
          <a
            href="/products"
            className={`inline-flex items-center ${activeBanner ? 'admin-dynamic-text hover:admin-dynamic-text' : 'text-brand-emerald hover-text-emerald'} transition-colors group`}
            aria-label="View all products"
          >
            <span className="text-lg font-semibold mr-2">View All Products</span>
            <svg 
              className="w-5 h-5 group-hover:translate-x-1 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>

        {/* Categories Strip */}
        <div className="mt-16 pt-16 border-t border-brand-gray/20">
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
    </section>
  )
}

export default FeaturedGrid