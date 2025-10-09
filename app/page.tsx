import { Metadata } from 'next'
import Hero from '@/components/Hero'
import BestSellers from '@/components/BestSellers'
import ShortBy from '@/components/ShortBy'
import MostPopular from '@/components/MostPopular'
import FeaturedGrid from '@/components/FeaturedGrid'
import Testimonials from '@/components/Testimonials'

import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Prufem - Premium Luxury Perfumes',
  description: 'Discover exquisite luxury perfumes and fragrances at Prufem. Premium quality, elegant scents for the discerning individual.',
  keywords: 'luxury perfume, premium fragrance, Prufem, perfume collection, designer scents',
  openGraph: {
    title: 'Prufem - Premium Luxury Perfumes',
    description: 'Discover exquisite luxury perfumes and fragrances at Prufem.',
    url: 'https://prufem.com',
    siteName: 'Prufem',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Prufem Luxury Perfumes',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prufem - Premium Luxury Perfumes',
    description: 'Discover exquisite luxury perfumes and fragrances.',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Prufem',
  description: 'Premium luxury perfume and fragrance retailer',
  url: 'https://prufem.com',
  logo: '/images/logo.svg',
  sameAs: [
    'https://instagram.com/prufem',
    'https://facebook.com/prufem',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-555-PERFUME',
    contactType: 'customer service',
  },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'US',
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-brand-black text-brand-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main>
        <Hero />
        <BestSellers />
        <ShortBy />
        <MostPopular />
        {/* <FeaturedGrid /> */}
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}