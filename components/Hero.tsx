'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useAdminBanner } from '@/lib/adminBannerSync'

const Hero = () => {
  const { activeBanner, isLoading } = useAdminBanner()
  
  // Use admin banner image if available, otherwise use default
  const heroImage = activeBanner?.image || "/images/hero-perfume-bg.jpg"
  const heroTitle = activeBanner?.title || "Exquisite Fragrances"
  
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-black overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImage}
          alt="Luxury perfume bottles"
          fill
          className="object-cover opacity-100"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-black/50 to-brand-black/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-brand-white mb-4 sm:mb-6 animate-fade-in leading-tight">
          <span className="text-gradient-silver">Exquisite</span>
          <span className={`block ${activeBanner ? 'admin-dynamic-text' : 'text-gradient-emerald'}`}>{heroTitle}</span>
          <span className="block text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-5xl mt-1 sm:mt-2 text-brand-white">for the Discerning</span>
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl text-brand-gray mb-6 sm:mb-8 max-w-2xl mx-auto animate-slide-up leading-relaxed px-2 sm:px-0">
          Discover our curated collection of premium perfumes, crafted with the finest ingredients 
          and designed to captivate the senses. Each fragrance tells a unique story of elegance and sophistication.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center animate-slide-up px-4 sm:px-0">
          <Link
            href="/products"
            className={`w-full sm:w-auto ${activeBanner ? 'admin-dynamic-bg admin-dynamic-hover' : 'bg-gradient-emerald btn-emerald-hover'} text-brand-button-text px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:ring-offset-2 focus:ring-offset-brand-black text-center border-2 border-transparent`}
            aria-label="Shop our perfume collection"
          >
            Shop Now
          </Link>
          
          <Link
            href="/collections"
            className={`w-full sm:w-auto border-2 ${activeBanner ? 'admin-dynamic-border  admin-dynamic-hover' : 'border-brand-emerald text-brand-emerald hover:bg-brand-emerald'} hover:text-brand-button-text px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:ring-offset-2 focus:ring-offset-brand-black text-center`}
            aria-label="View all perfume collections"
          >
            View Collection
          </Link>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className={`w-6 h-6 ${activeBanner ? 'admin-dynamic-text' : 'text-gradient-emerald'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className={`absolute top-20 left-10 w-2 h-2 ${activeBanner ? 'admin-dynamic-bg' : 'bg-gradient-emerald'} rounded-full opacity-60 animate-pulse`} />
      <div className="absolute top-40 right-20 w-1 h-1 bg-gradient-rose-gold rounded-full opacity-40 animate-pulse" />
      <div className={`absolute bottom-32 left-20 w-1.5 h-1.5 ${activeBanner ? 'admin-dynamic-bg' : 'bg-gradient-emerald'} rounded-full opacity-50 animate-pulse`} />
    </section>
  )
}

export default Hero