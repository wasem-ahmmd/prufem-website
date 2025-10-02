/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/webp', 'image/avif'],
  },
  // Disable experimental optimizeCss to avoid critters-related build errors
}

module.exports = nextConfig