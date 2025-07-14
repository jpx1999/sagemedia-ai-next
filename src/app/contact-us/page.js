import ContactUsClient from './ContactUsClient'

// Metadata for SEO - Server-side
export const metadata = {
  title: 'Contact Us & Book Meeting - SAGE AI | SpiderX.AI',
  description: 'Ready to transform your business with AI? Schedule a consultation with SAGE AI experts. Book a meeting, call +91 33 6611 0900, or email hello@sagemedia.ai for personalized AI solutions.',
  keywords: [
    'contact SAGE AI',
    'book meeting SpiderX.AI',
    'AI consultation',
    'schedule demo SAGE',
    'contact AI experts',
    'business AI consultation',
    'SAGE support',
    'AI platform demo',
    'news intelligence consultation',
    'enterprise AI meeting'
  ],
  authors: [{ name: 'SpiderX.AI' }],
  creator: 'SpiderX.AI',
  publisher: 'SpiderX.AI',
  robots: 'index, follow',
  openGraph: {
    title: 'Contact SAGE AI Experts | Schedule Your AI Consultation',
    description: 'Transform your business with AI-powered news intelligence. Book a consultation with our experts and discover how SAGE can revolutionize your workflow.',
    url: 'https://sagemedia.ai/contact-us',
    siteName: 'SAGE - AI News Intelligence',
    images: [
      {
        url: 'https://sagemedia.ai/images/contact-meta-og.png',
        width: 1200,
        height: 630,
        alt: 'Contact SAGE AI - Book Your Consultation',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact SAGE AI - Schedule Your Consultation',
    description: 'Ready to transform your business with AI? Book a meeting with our experts and discover the power of SAGE.',
    images: ['https://sagemedia.ai/images/contact-meta-og.png'],
    creator: '@SpiderXAI',
  },
  alternates: {
    canonical: 'https://sagemedia.ai/contact-us',
  },
  category: 'Business',
  other: {
    'contact:phone': '+91 33 6611 0900',
    'contact:email': 'hello@sagemedia.ai',
    'contact:address': 'Premises No. 14-360, Plot No. DH-6/8, Action Area 1D, Newtown, Kolkata 700156',
  },
}

export default function Page() {
  return <ContactUsClient />
}
