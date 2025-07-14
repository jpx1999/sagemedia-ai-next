'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function NewsDetail() {
  const params = useParams()
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const [newsItem, setNewsItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false) // This would come from Redux in real app

  // Dummy news data
  const dummyNewsData = {
    'news-1': {
      id: 'news-1',
      title: 'AI Revolution in Healthcare: New Breakthrough in Medical Diagnosis',
      summary: 'Revolutionary AI system achieves 95% accuracy in early disease detection',
      content: `
        <p>A groundbreaking artificial intelligence system has achieved an unprecedented 95% accuracy rate in early disease detection, marking a significant milestone in medical diagnostics.</p>
        
        <p>The new AI platform, developed by a team of researchers at leading medical institutions, utilizes advanced machine learning algorithms to analyze medical imaging data with remarkable precision.</p>
        
        <h3>Key Features:</h3>
        <ul>
          <li>95% accuracy in early disease detection</li>
          <li>Real-time analysis capabilities</li>
          <li>Integration with existing medical systems</li>
          <li>Cost-effective implementation</li>
        </ul>
        
        <p>This breakthrough has the potential to revolutionize healthcare by enabling earlier interventions and improving patient outcomes significantly.</p>
        
        <blockquote>"This technology represents a paradigm shift in how we approach medical diagnosis," said Dr. Sarah Johnson, lead researcher on the project.</blockquote>
        
        <p>The system is expected to be deployed in major hospitals within the next 18 months, pending regulatory approval.</p>
      `,
      category: 'Technology',
      publishedAt: '2024-01-15T10:00:00Z',
      source: 'TechNews',
      sentiment: 'positive',
      keywords: ['AI', 'Healthcare', 'Medical', 'Diagnosis'],
      readTime: '5 min read',
      author: 'Dr. Michael Chen'
    },
    'news-2': {
      id: 'news-2',
      title: 'Global Climate Summit Reaches Historic Agreement',
      summary: 'World leaders unite on ambitious climate action plan for 2030',
      content: `
        <p>In a historic moment for global climate action, world leaders have reached a comprehensive agreement on ambitious targets for 2030.</p>
        
        <p>The summit, held over three days, saw unprecedented cooperation between nations as they committed to binding targets for carbon emissions reduction.</p>
        
        <h3>Key Commitments:</h3>
        <ul>
          <li>50% reduction in global emissions by 2030</li>
          <li>$1 trillion climate fund for developing nations</li>
          <li>Transition to 80% renewable energy</li>
          <li>Protection of 30% of global biodiversity</li>
        </ul>
        
        <p>This agreement represents the most comprehensive climate action plan ever negotiated, with legal frameworks to ensure compliance.</p>
      `,
      category: 'Environment',
      publishedAt: '2024-01-14T15:30:00Z',
      source: 'Environmental Today',
      sentiment: 'positive',
      keywords: ['Climate', 'Environment', 'Summit', 'Agreement'],
      readTime: '7 min read',
      author: 'Emily Rodriguez'
    },
    'news-3': {
      id: 'news-3',
      title: 'Economic Markets Show Mixed Signals Amid Global Uncertainty',
      summary: 'Stock markets fluctuate as investors weigh geopolitical tensions',
      content: `
        <p>Global financial markets are displaying mixed signals as investors navigate an increasingly complex economic landscape marked by geopolitical uncertainties.</p>
        
        <p>Major indices have shown significant volatility over the past week, with technology stocks leading gains while energy and commodity sectors face pressure.</p>
        
        <h3>Market Highlights:</h3>
        <ul>
          <li>S&P 500 up 2.3% for the week</li>
          <li>Tech sector gains 4.1%</li>
          <li>Energy stocks down 1.8%</li>
          <li>Bond yields remain stable</li>
        </ul>
        
        <p>Analysts suggest that market sentiment remains cautiously optimistic despite ongoing global challenges.</p>
      `,
      category: 'Economics',
      publishedAt: '2024-01-14T09:15:00Z',
      source: 'Financial Tribune',
      sentiment: 'neutral',
      keywords: ['Economy', 'Markets', 'Stocks', 'Investment'],
      readTime: '4 min read',
      author: 'James Williams'
    }
  }

  useEffect(() => {
    const fetchNews = () => {
      setLoading(true)
      // Simulate API call
      setTimeout(() => {
        const item = dummyNewsData[params.newsId]
        setNewsItem(item || null)
        setLoading(false)
      }, 500)
    }

    if (params.newsId) {
      fetchNews()
    }
  }, [params.newsId])

  const getSentimentColor = (sentiment) => {
    switch(sentiment) {
      case 'positive': return 'text-green-500'
      case 'negative': return 'text-red-500'
      default: return 'text-yellow-500'
    }
  }

  const partialAccess = !isLoggedIn // In real app, this would be based on auth state

  if (loading) {
    return (
      <div className={`${isDarkTheme ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen font-poppins flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl">Loading news article...</p>
        </div>
      </div>
    )
  }

  if (!newsItem) {
    return (
      <div className={`${isDarkTheme ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen font-poppins flex items-center justify-center`}>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <p className="text-xl opacity-75 mb-8">The news article you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/news-intelligence" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
            ← Back to News Intelligence
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`${isDarkTheme ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen font-poppins`}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Navigation */}
          <div className="flex justify-between items-center mb-8">
            <Link href="/news-intelligence" className="text-blue-500 hover:underline">
              ← Back to News Intelligence
            </Link>
            <button
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              {isDarkTheme ? 'Light' : 'Dark'} Mode
            </button>
          </div>

          {/* Partial Access Warning */}
          {partialAccess && (
            <div className="mb-6 p-4 bg-yellow-600 bg-opacity-20 border border-yellow-500 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-yellow-400 font-semibold">🔒 Limited Access</h3>
                  <p className="text-sm opacity-80">You&apos;re viewing this article with limited access. Sign in for full features including AI analysis, bookmarking, and more.</p>
                </div>
                <Link href="/login" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold">
                  Sign In
                </Link>
              </div>
            </div>
          )}

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-600 text-white rounded text-sm">{newsItem.category}</span>
              <span className={`px-3 py-1 rounded text-sm ${getSentimentColor(newsItem.sentiment)} bg-opacity-20`}>
                {newsItem.sentiment}
              </span>
              <span className="px-3 py-1 bg-gray-700 text-white rounded text-sm">{newsItem.readTime}</span>
            </div>
            
            <h1 className="text-4xl font-bold mb-4">{newsItem.title}</h1>
            
            <div className="flex justify-between items-center text-sm opacity-75 mb-6">
              <div>
                <span>By {newsItem.author}</span> • 
                <span> {newsItem.source}</span> • 
                <span> {new Date(newsItem.publishedAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
            </div>

            <p className="text-xl opacity-90 leading-relaxed">{newsItem.summary}</p>
          </header>

          {/* Article Content */}
          <article className="prose prose-lg max-w-none mb-8">
            <div 
              className="leading-relaxed"
              dangerouslySetInnerHTML={{ __html: newsItem.content }}
            />
          </article>

          {/* Keywords */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {newsItem.keywords.map((keyword, index) => (
                <span key={index} className="px-3 py-1 bg-gray-700 rounded-full text-sm">
                  #{keyword}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          {!partialAccess && (
            <div className="border-t border-gray-700 pt-8">
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
                    📊 AI Analysis
                  </button>
                  <button className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-colors">
                    ⭐ Bookmark
                  </button>
                  <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors">
                    📤 Share
                  </button>
                </div>
                <div className="flex gap-2 text-sm">
                  <button className="text-blue-400 hover:text-blue-300">👍 Like</button>
                  <button className="text-red-400 hover:text-red-300">👎 Dislike</button>
                </div>
              </div>
            </div>
          )}

          {/* Related Articles */}
          <div className="mt-12 border-t border-gray-700 pt-8">
            <h3 className="text-2xl font-bold mb-6">Related Articles</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {Object.values(dummyNewsData).filter(item => item.id !== newsItem.id).slice(0, 2).map((relatedItem) => (
                <div key={relatedItem.id} className="bg-opacity-10 bg-gray-500 rounded-lg p-4 hover:bg-opacity-20 transition-all">
                  <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded">{relatedItem.category}</span>
                  <h4 className="font-semibold mt-2 mb-2">
                    <Link href={`/news-intelligence/newsid/${relatedItem.id}`} className="hover:text-blue-400">
                      {relatedItem.title}
                    </Link>
                  </h4>
                  <p className="text-sm opacity-75">{relatedItem.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 