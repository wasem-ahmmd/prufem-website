'use client'
import Image from 'next/image'
import Link from 'next/link'

type MostPopularProps = {
  imageSrc?: string
  name?: string
  description?: string
  href?: string
  title?: string
}

const MostPopular = ({
  imageSrc = "/images/perfume-2.jpg",
  name = "9PM",
  description = "Are you a person who likes fragrance that get you noticed? If yes, then this could be the one for you! Bubblegum, vanilla and sensually alluring!",
  href = '/products',
  title = 'MOST POPULAR',
}: MostPopularProps) => {
  const isExternal = imageSrc?.startsWith('http')

  return (
    <section className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 my-10 border-b border-brand-gray">
      <div className="flex flex-col lg:flex-row items-center gap-20  bg-brand-black/20 p-6">
        {/* Image - Left on desktop */}
        <div className="relative w-full lg:w-1/2 aspect-square overflow-hidden">
          <Image
            src={imageSrc}
            alt={name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 hover:scale-105"
            unoptimized={isExternal}
          />
        </div>

        {/* Content - Right on desktop */}
        <div className="w-full lg:w-1/2">
          <div className="mb-2 text-xs sm:text-sm tracking-widest font-semibold text-brand-emerald">{title}</div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-brand-white mb-3 leading-tight">{name}</h2>
          <p className="text-sm sm:text-base text-brand-gray mb-6 leading-relaxed">{description}</p>

          <Link
            href={href}
            aria-label={`Shop ${name}`}
            className="relative inline-flex items-center justify-center px-6 sm:px-7 py-3 border-2 border-brand-emerald text-brand-black bg-gradient-emerald font-semibold transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:ring-offset-2 focus:ring-offset-brand-black"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  )
}

export default MostPopular