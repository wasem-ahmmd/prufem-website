'use client'

import { useState, useEffect } from 'react'

const testimonials = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    location: 'New York, NY',
    rating: 5,
    text: 'Absolutely stunning fragrances! The Midnight Elegance has become my signature scent. The quality and longevity are exceptional.',
    product: 'Midnight Elegance',
  },
  {
    id: 2,
    name: 'James Rodriguez',
    location: 'Los Angeles, CA',
    rating: 5,
    text: 'Royal Oud is a masterpiece. The complexity and depth of this fragrance is unmatched. Worth every penny.',
    product: 'Royal Oud',
  },
  {
    id: 3,
    name: 'Emma Thompson',
    location: 'London, UK',
    rating: 5,
    text: 'The customer service is as premium as their perfumes. Fast shipping and beautiful packaging made this a perfect gift.',
    product: 'Velvet Rose',
  },
]

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-brand-emerald' : 'text-brand-gray'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))
  }

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-black">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-gradient-silver mb-3 sm:mb-4">
            What Our Customers Say
          </h2>
          <p className="text-brand-gray text-sm sm:text-base">
            Join thousands of satisfied customers who have discovered their signature scent
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className="relative px-4 sm:px-0">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0">
                  <div className="bg-gradient-black border border-brand-gray/20 rounded-lg p-4 sm:p-6 lg:p-8 text-center">
                    {/* Stars */}
                    <div className="flex justify-center mb-3 sm:mb-4">
                      {renderStars(testimonial.rating)}
                    </div>

                    {/* Testimonial Text */}
                    <blockquote className="text-base sm:text-lg text-brand-white mb-4 sm:mb-6 italic leading-relaxed">
                      "{testimonial.text}"
                    </blockquote>

                    {/* Customer Info */}
                    <div className="border-t border-brand-gray/20 pt-4 sm:pt-6">
                      <cite className="not-italic">
                        <div className="text-gradient-emerald font-semibold text-sm sm:text-base">
                          {testimonial.name}
                        </div>
                        <div className="text-brand-gray text-xs sm:text-sm">
                          {testimonial.location}
                        </div>
                        <div className="text-brand-gray text-xs sm:text-sm mt-1">
                          Purchased: {testimonial.product}
                        </div>
                      </cite>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center mt-6 sm:mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-brand-emerald' : 'bg-brand-gray'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation Arrows - Hidden on mobile */}
          <button
            onClick={() => setCurrentIndex(currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1)}
            className="hidden sm:block absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 text-brand-emerald hover-text-silver transition-colors"
            aria-label="Previous testimonial"
          >
            <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => setCurrentIndex(currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1)}
            className="hidden sm:block absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 text-brand-emerald hover-text-silver transition-colors"
            aria-label="Next testimonial"
          >
            <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center">
          <div>
            <div className="text-xl sm:text-2xl font-bold text-gradient-emerald">10K+</div>
            <div className="text-brand-gray text-xs sm:text-sm">Happy Customers</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-gradient-emerald">4.9</div>
            <div className="text-brand-gray text-xs sm:text-sm">Average Rating</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-gradient-emerald">50+</div>
            <div className="text-brand-gray text-xs sm:text-sm">Unique Fragrances</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-gradient-emerald">24/7</div>
            <div className="text-brand-gray text-xs sm:text-sm">Customer Support</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials