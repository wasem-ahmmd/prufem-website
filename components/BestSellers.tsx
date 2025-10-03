"use client"

import ProductCard from '@/components/ProductCard'
import { useRef } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

type Product = {
  id: string
  name: string
  price: number
  image: string
  description: string
}

const BEST_SELLERS: Product[] = [
  {
    id: 'perfume-1',
    name: 'Royal Oud',
    price: 149.0,
    image: '/images/perfume-1.jpg',
    description: 'A sophisticated blend of smoky oud and warm spices.'
  },
  {
    id: 'perfume-2',
    name: 'Emerald Breeze',
    price: 129.0,
    image: '/images/perfume-2.jpg',
    description: 'Crisp citrus notes with a refreshing herbal finish.'
  },
  {
    id: 'perfume-3',
    name: 'Velvet Noir',
    price: 159.0,
    image: '/images/perfume-3.jpg',
    description: 'Dark florals and amber for an irresistible evening scent.'
  },
  {
    id: 'perfume-4',
    name: 'Golden Santal',
    price: 139.0,
    image: '/images/perfume-4.jpg',
    description: 'Creamy sandalwood layered with soft vanilla accords.'
  },
  {
    id: 'perfume-5',
    name: 'Citrus Aura',
    price: 119.0,
    image: '/images/perfume-5.jpg',
    description: 'Lively citrus with a subtle floral heart.'
  },
  {
    id: 'perfume-6',
    name: 'Amber Muse',
    price: 169.0,
    image: '/images/perfume-6.jpg',
    description: 'Rich amber wrapped in soft musk and vanilla.'
  },
  {
    id: 'perfume-7',
    name: 'Amber Muse',
    price: 169.0,
    image: '/images/perfume-6.jpg',
    description: 'Rich amber wrapped in soft musk and vanilla.'
  },
  {
    id: 'perfume-8',
    name: 'Amber Muse',
    price: 169.0,
    image: '/images/perfume-6.jpg',
    description: 'Rich amber wrapped in soft musk and vanilla.'
  },
]

export default function BestSellers() {
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const scrollBy = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const amount = Math.max(300, Math.floor(el.clientWidth * 0.9))
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <section className="relative py-10 sm:py-12 md:py-16 bg-gradient-black group">
      <div className="px-0 sm:px-0 lg:px-0">
        {/* Heading */}
        <div className="mb-6 sm:mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-brand-white">Best Sellers</h2>
          <p className="text-brand-gray text-sm sm:text-base mt-2 max-w-2xl mx-auto">Our most-loved fragrances, curated for you.</p>
        </div>

        {/* Horizontal scroll list showing all products */}
        <div className="relative ">
          {/* Arrows appear on hover */}
          <button
            aria-label="Previous"
            onClick={() => scrollBy('left')}
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition p-2 bg-brand-black/60 border border-brand-gray/40 rounded-md"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <button
            aria-label="Next"
            onClick={() => scrollBy('right')}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition p-2 bg-brand-black/60 border border-brand-gray/40 rounded-md"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>

          <div ref={scrollRef} className="overflow-hidden no-scrollbar   pb-2">
            <div className="flex gap-0 sm:gap-0">
              {BEST_SELLERS.map((product) => (
                <div
                  key={product.id}
                  className="shrink-0 basis-1/2 sm:basis-1/3 md:basis-1/3 lg:basis-1/5 xl:basis-1/5"
                >
                  <ProductCard product={product} minimal />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}