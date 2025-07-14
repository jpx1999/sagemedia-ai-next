import { Inter } from 'next/font/google'
import './globals.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import Providers from '../components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'SAGE - AI-Powered News Intelligence Platform | SpiderX.AI',
  description: 'SAGE by SpiderX.AI is an intelligent news analysis platform powered by advanced AI. Get personalized insights, comprehensive coverage, and real-time updates on global news.',
  keywords: 'AI news analysis, news intelligence, SpiderX.AI, SAGE, artificial intelligence, news insights, real-time news, news platform',
  authors: [{ name: 'SpiderX.AI' }],
  creator: 'SpiderX.AI',
  publisher: 'SpiderX.AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://sagemedia.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SAGE - AI-Powered News Intelligence Platform | SpiderX.AI',
    description: 'SAGE by SpiderX.AI is an intelligent news analysis platform powered by advanced AI. Get personalized insights, comprehensive coverage, and real-time updates on global news.',
    url: 'https://sagemedia.ai',
    siteName: 'SAGE by SpiderX.AI',
    images: [
      {
        url: '/images/homepage-og.png',
        width: 1200,
        height: 630,
        alt: 'SAGE AI Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SAGE - AI-Powered News Intelligence Platform | SpiderX.AI',
    description: 'SAGE by SpiderX.AI is an intelligent news analysis platform powered by advanced AI. Get personalized insights, comprehensive coverage, and real-time updates on global news.',
    images: ['/images/homepage-og.png'],
    creator: '@SpiderXAI',
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
  verification: {
    google: 'your-google-verification-code', // Replace with actual code
    yandex: 'your-yandex-verification-code', // Replace with actual code
    yahoo: 'your-yahoo-verification-code', // Replace with actual code
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Additional meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#6ABCFF" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}