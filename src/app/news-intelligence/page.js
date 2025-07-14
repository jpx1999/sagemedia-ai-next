'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function NewsIntelligence({ partialAccess = false, newsIdParam = null }) {
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [newsItems, setNewsItems] = useState([])
  const [loading, setLoading] = useState(false)

  // Dummy news data
  const dummyNews = [
    {
      id: 'news-1',
      title: 'AI Revolution in Healthcare: New Breakthrough in Medical Diagnosis',
      summary: 'Revolutionary AI system achieves 95% accuracy in early disease detection',
      content: 'Full article content about AI in healthcare...',
      category: 'Technology',
      publishedAt: '2024-01-15T10:00:00Z',
      source: 'TechNews',
      sentiment: 'positive',
      keywords: ['AI', 'Healthcare', 'Medical', 'Diagnosis']
    },
    {
      id: 'news-2', 
      title: 'Global Climate Summit Reaches Historic Agreement',
      summary: 'World leaders unite on ambitious climate action plan for 2030',
      content: 'Full article content about climate summit...',
      category: 'Environment',
      publishedAt: '2024-01-14T15:30:00Z',
      source: 'Environmental Today',
      sentiment: 'positive',
      keywords: ['Climate', 'Environment', 'Summit', 'Agreement']
    },
    {
      id: 'news-3',
      title: 'Economic Markets Show Mixed Signals Amid Global Uncertainty',
      summary: 'Stock markets fluctuate as investors weigh geopolitical tensions',
      content: 'Full article content about economic markets...',
      category: 'Economics',
      publishedAt: '2024-01-14T09:15:00Z',
      source: 'Financial Tribune',
      sentiment: 'neutral',
      keywords: ['Economy', 'Markets', 'Stocks', 'Investment']
    }
  ]

  useEffect(() => {
    setNewsItems(dummyNews)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      const filtered = dummyNews.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setNewsItems(filtered)
      setLoading(false)
    }, 1000)
  }

  const getSentimentColor = (sentiment) => {
    switch(sentiment) {
      case 'positive': return 'text-green-500'
      case 'negative': return 'text-red-500'
      default: return 'text-yellow-500'
    }
  }

  return (
    <div className={`${isDarkTheme ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen font-poppins`}>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">News Intelligence</h1>
              <p className="opacity-75">AI-powered news analysis and insights</p>
              {partialAccess && (
                <div className="mt-2 p-2 bg-yellow-600 bg-opacity-20 rounded-lg">
                  <span className="text-yellow-400">🔒 Limited access - Login for full features</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              {isDarkTheme ? 'Light' : 'Dark'} Mode
            </button>
          </div>

          <form onSubmit={handleSearch} className="flex gap-4 mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news, topics, keywords..."
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          <div className="flex gap-4 text-sm">
            <span className="px-3 py-1 bg-blue-600 text-white rounded-full">All</span>
            <span className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full cursor-pointer">Technology</span>
            <span className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full cursor-pointer">Environment</span>
            <span className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full cursor-pointer">Economics</span>
            <span className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full cursor-pointer">Politics</span>
          </div>
        </header>

        <div className="grid gap-6">
          {newsItems.map((item) => (
            <div key={item.id} className="bg-opacity-10 bg-gray-500 rounded-lg p-6 hover:bg-opacity-20 transition-all">
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-2 text-sm">
                  <span className="px-2 py-1 bg-blue-600 text-white rounded">{item.category}</span>
                  <span className={`px-2 py-1 rounded ${getSentimentColor(item.sentiment)} bg-opacity-20`}>
                    {item.sentiment}
                  </span>
                </div>
                <span className="text-sm opacity-60">{new Date(item.publishedAt).toLocaleDateString()}</span>
              </div>
              
              <h2 className="text-xl font-semibold mb-2 hover:text-blue-400">
                <Link href={`/news-intelligence/newsid/${item.id}`}>
                  {item.title}
                </Link>
              </h2>
              
              <p className="opacity-80 mb-3">{item.summary}</p>
              
              <div className="flex justify-between items-center">
                <div className="flex gap-2 text-sm">
                  {item.keywords.slice(0, 3).map((keyword, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-700 rounded text-xs">
                      #{keyword}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <span className="text-sm opacity-60">Source: {item.source}</span>
                  {!partialAccess && (
                    <>
                      <button className="text-blue-400 hover:text-blue-300">📖 Analyze</button>
                      <button className="text-yellow-400 hover:text-yellow-300">⭐ Bookmark</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {newsItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl opacity-60">No news items found</p>
            <p className="opacity-40">Try adjusting your search terms</p>
          </div>
        )}
      </div>
    </div>
  )
} 