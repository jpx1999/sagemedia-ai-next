import PricingPageClient from './PricingPageClient'

// Metadata for SEO - Server-side
export const metadata = {
  title: 'Pricing Plans - SAGE AI News Intelligence | SpiderX.AI',
  description: 'Choose the perfect SAGE AI plan for your needs. Free tier available. Professional at ₹2,950/month. Enterprise at ₹4,950/month. Start your AI-powered news intelligence journey today.',
  keywords: [
    'SAGE AI pricing',
    'news intelligence pricing',
    'AI platform subscription',
    'professional plan',
    'enterprise plan',
    'SpiderX.AI pricing',
    'news analytics pricing',
    'AI news tool cost',
    'business intelligence pricing',
    'news research platform pricing'
  ],
  authors: [{ name: 'SpiderX.AI' }],
  creator: 'SpiderX.AI',
  publisher: 'SpiderX.AI',
  robots: 'index, follow',
  openGraph: {
    title: 'SAGE AI Pricing Plans | Professional & Enterprise Solutions',
    description: 'Transform your research with SAGE AI. Save 23+ hours/week with our Professional (₹2,950/month) and Enterprise (₹4,950/month) plans. 30-day free trial available.',
    url: 'https://sagemedia.ai/pricing',
    siteName: 'SAGE - AI News Intelligence',
    images: [
      {
        url: 'https://sagemedia.ai/images/pricing-meta-og.png',
        width: 1200,
        height: 630,
        alt: 'SAGE AI Pricing Plans - Professional and Enterprise',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SAGE AI Pricing - Professional & Enterprise Plans',
    description: 'Save 23+ hours/week with AI-powered news intelligence. Professional ₹2,950/month, Enterprise ₹4,950/month. 30-day free trial.',
    images: ['https://sagemedia.ai/images/pricing-meta-og.png'],
    creator: '@SpiderXAI',
  },
  alternates: {
    canonical: 'https://sagemedia.ai/pricing',
  },
  category: 'Business',
  other: {
    'price:amount:professional': '2950',
    'price:currency:professional': 'INR',
    'price:amount:enterprise': '4950',
    'price:currency:enterprise': 'INR',
  },
}

export default function Page() {
  return <PricingPageClient />
} 