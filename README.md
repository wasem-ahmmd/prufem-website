# Waseem Jatt & Co. - Premium Perfume E-commerce

A luxury perfume e-commerce website built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd waseem-jatt-perfumes
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎨 Brand Colors

- **Background**: `#000000` (Black)
- **Primary Text**: `#FFFFFF` (White)  
- **Secondary Text**: `#B0B0B0` (Gray)
- **Accent Gold**: `#C9A227`
- **Rose Gold**: `#B76E79`
- **Button Text**: `#000000` (on gold backgrounds)

## 📁 Project Structure

```
waseem-jatt-perfumes/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── ProductCard.tsx
│   ├── FeaturedGrid.tsx
│   ├── Testimonials.tsx
│   └── Footer.tsx
├── public/
│   ├── favicon.svg
│   ├── logo-wordmark.svg
│   └── logo-monogram.svg
├── tailwind.config.js
├── next.config.js
└── package.json
```

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Fonts**: Inter (sans-serif), Playfair Display (serif)
- **Images**: Next.js Image optimization
- **Deployment**: Vercel (recommended)

## 🔧 Configuration

### Environment Variables (when needed)
Create a `.env.local` file:
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### Image Hosting
Replace Cloudinary URLs in components with your actual image URLs:
- Hero background: `hero-perfume-bg.jpg`
- Product images: `perfume-1.jpg` through `perfume-6.jpg`
- OG image: `og-image.jpg`

## 📱 Features

- ✅ Responsive design (mobile-first)
- ✅ SEO optimized with metadata and JSON-LD
- ✅ Accessible components (ARIA labels, keyboard navigation)
- ✅ Performance optimized (lazy loading, image optimization)
- ✅ Modern animations and transitions
- ✅ Newsletter subscription
- ✅ Product showcase
- ✅ Customer testimonials

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically

### Manual Build
```bash
npm run build
npm start
```

## 📋 TODO for Production

- [ ] Replace placeholder images with actual product photos
- [ ] Implement Stripe checkout integration
- [ ] Add product detail pages
- [ ] Set up newsletter API endpoint
- [ ] Configure analytics (Google Analytics, etc.)
- [ ] Add search functionality
- [ ] Implement cart functionality
- [ ] Set up customer authentication
- [ ] Add admin panel for product management

## 🎯 Performance & Accessibility

- Images are optimized with Next.js Image component
- Lazy loading implemented for better performance
- ARIA labels for screen readers
- Keyboard navigation support
- Focus states for interactive elements
- Semantic HTML structure

## 📞 Support

For questions or support, contact: [your-email@domain.com]

---

Built with ❤️ for Waseem Jatt & Co.