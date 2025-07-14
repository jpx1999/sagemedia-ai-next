'use client'

import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import Layout from '../components/Layout'
import Image from 'next/image'

const HomePage = () => {
  const router = useRouter()
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn)

  const handleGetStarted = () => {
    if (isLoggedIn) {
      router.push('/news-intelligence')
    } else {
      router.push('/login')
    }
  }

  const handleNavigation = (path) => {
    router.push(path)
  }

  return (
    <>
      {/* Structured Data - JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'SAGE - AI News Intelligence',
            description:
              'SAGE by SpiderX.AI is an intelligent news analysis platform powered by advanced AI. Get personalized insights, comprehensive coverage, and real-time updates on global news.',
            url: 'https://sagemedia.ai',
            applicationCategory: 'NewsApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            publisher: {
              '@type': 'Organization',
              name: 'SpiderX.AI',
              logo: {
                '@type': 'ImageObject',
                url: '/images/spiderx-logo-light.svg',
              },
            },
            screenshot: {
              '@type': 'ImageObject',
              url: 'https://sagemedia.ai/images/homepage-og.png',
            },
          }),
        }}
      />

      <Layout isDarkTheme={true}>
        {/* Hero Section */}
        <section className="max-w-[1700px] mx-auto flex flex-col-reverse lg:flex-row items-center justify-center md:py-10 px-4 sm:px-6 lg:px-10 fade-line relative">
          {/* Left Side - Content */}
          <div className="flex-1 flex flex-col items-center lg:items-start justify-center text-center lg:text-left pb-10 md:pb-0">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold mb-3 sm:mb-6">
              Welcome to <span className="text-[#6ABCFF]">SAGE</span>
            </h1>
            <p className="text:lg sm:text-xl md:text-2xl mb-8 text-gray-400 max-w-2xl">
              Your intelligent news analysis platform powered by advanced AI.
              Stay informed with personalized insights and comprehensive
              coverage.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() =>
                  handleNavigation(isLoggedIn ? '/news-intelligence' : '/login')
                }
                className="border border-[#6ABCFF] text-[#6ABCFF] px-8 py-2 md:py-4 rounded-lg font-medium text-lg hover:bg-[#6ABCFF] hover:text-black transition-colors"
              >
                {isLoggedIn ? 'Go to Dashboard' : 'Get Started'}
              </button>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="flex-1 flex items-center justify-center p-4 relative">
            <Image
              src="/images/sage-login-img.png"
              alt="SAGE AI Platform"
              className="w-10/12 md:w-11/12 lg:w-9/12"
              width={1000}
              height={1000}
            />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-8 px-4 md:py-16 md:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold text-center mb-8 lg:mb-12">
              Why Choose SAGE?
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 lg:gap-8">
              <div className="text-center p-5 lg:p-8 mb-1 relative rounded-2xl border border-gray-700 bg-[#22262a]">
                <div className="w-16 h-16 bg-[#5E8EFF] rounded-md mx-auto mb-4 flex items-center justify-center">
                  <Image
                    src="/images/globe_book-light.svg"
                    alt="News Intelligence"
                    className="w-8 h-8"
                    width={32}
                    height={32}
                  />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  News Intelligence
                </h3>
                <p className="text-gray-400">
                  Advanced AI-powered analysis of global news with personalized
                  insights and real-time updates.
                </p>
              </div>
              <div className="text-center p-5 lg:p-8 mb-1 relative rounded-2xl border border-gray-700 bg-[#22262a]">
                <div className="w-16 h-16 bg-[#5E8EFF] rounded-md mx-auto mb-4 flex items-center justify-center">
                  <Image
                    src="/images/manage_search-light.svg"
                    alt="Custom Searches"
                    className="w-8 h-8"
                    width={32}
                    height={32}
                  />
                </div>
                <h3 className="text-xl font-semibold mb-3">Custom Searches</h3>
                <p className="text-gray-400">
                  Create tailored search queries to find exactly the information
                  you need across multiple sources.
                </p>
              </div>
              <div className="text-center p-5 lg:p-8 mb-1 relative rounded-2xl border border-gray-700 bg-[#22262a]">
                <div className="w-16 h-16 bg-[#5E8EFF] rounded-md mx-auto mb-4 flex items-center justify-center">
                  <Image
                    src="/images/workspaces-light.svg"
                    alt="Team Collaboration"
                    className="w-8 h-8"
                    width={32}
                    height={32}
                  />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Team Collaboration
                </h3>
                <p className="text-gray-400">
                  Share insights and collaborate with your team on important
                  news developments and analysis.
                </p>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  )
}

export default HomePage