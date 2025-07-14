import HomePage from './HomePage'

// Metadata for SEO - Server-side
export const metadata = {
  title: 'SAGE - AI News Intelligence Platform | SpiderX.AI',
  description: 'SAGE by SpiderX.AI is an intelligent news analysis platform powered by advanced AI. Get personalized insights, comprehensive coverage, and real-time updates on global news.',
  keywords: [
    'AI news intelligence',
    'news analysis platform', 
    'artificial intelligence news',
    'personalized news insights',
    'real-time news updates',
    'SpiderX.AI',
    'SAGE platform',
    'news intelligence software',
    'AI-powered news',
    'news analytics'
  ],
  authors: [{ name: 'SpiderX.AI' }],
  creator: 'SpiderX.AI',
  publisher: 'SpiderX.AI',
  robots: 'index, follow',
  openGraph: {
    title: 'SAGE - AI News Intelligence Platform | SpiderX.AI',
    description: 'Transform your news consumption with AI-powered insights. SAGE delivers personalized news analysis and comprehensive coverage from trusted sources.',
    url: 'https://sagemedia.ai',
    siteName: 'SAGE - AI News Intelligence',
    images: [
      {
        url: 'https://sagemedia.ai/images/homepage-og.png',
        width: 1200,
        height: 630,
        alt: 'SAGE AI News Intelligence Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SAGE - AI News Intelligence Platform',
    description: 'Transform your news consumption with AI-powered insights and personalized analysis.',
    images: ['https://sagemedia.ai/images/homepage-og.png'],
    creator: '@SpiderXAI',
  },
  alternates: {
    canonical: 'https://sagemedia.ai',
  },
  category: 'Technology',
}

export default function Page() {
  return <HomePage />
}