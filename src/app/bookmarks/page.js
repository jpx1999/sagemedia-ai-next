'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Bookmarks() {
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

  // Dummy bookmarked news
  const bookmarks = [
    {
      id: 'bookmark-1',
      title: 'AI Revolution in Healthcare: New Breakthrough in Medical Diagnosis',
      summary: 'Revolutionary AI system achieves 95% accuracy in early disease detection',
      category: 'Technology',
      publishedAt: '2024-01-15T10:00:00Z',
      source: 'TechNews',
      sentiment: 'positive',
      bookmarkedAt: '2024-01-16T09:30:00Z',
      tags: ['Important', 'Research'],
      readStatus: 'read'
    },
    {
      id: 'bookmark-2',
      title: 'Global Climate Summit Reaches Historic Agreement',
      summary: 'World leaders unite on ambitious climate action plan for 2030',
      category: 'Environment',
      publishedAt: '2024-01-14T15:30:00Z',
      source: 'Environmental Today',
      sentiment: 'positive',
      bookmarkedAt: '2024-01-15T14:20:00Z',
      tags: ['Important'],
      readStatus: 'unread'
    },
    {
      id: 'bookmark-3',
      title: 'Economic Markets Show Mixed Signals Amid Global Uncertainty',
      summary: 'Stock markets fluctuate as investors weigh geopolitical tensions',
      category: 'Economics',
      publishedAt: '2024-01-14T09:15:00Z',
      source: 'Financial Tribune',
      sentiment: 'neutral',
      bookmarkedAt: '2024-01-14T16:45:00Z',
      tags: ['Market Analysis'],
      readStatus: 'read'
    }
  ]

  const categories = ['All', 'Technology', 'Environment', 'Economics', 'Politics']
  const filteredBookmarks = selectedCategory === 'All' 
    ? bookmarks 
    : bookmarks.filter(bookmark => bookmark.category === selectedCategory)

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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Bookmarks</h1>
            <p className="opacity-75">Saved articles and important news</p>
          </div>
          <div className="flex gap-4">
            <Link href="/news-intelligence" className="text-blue-500 hover:underline">
              ← Back to News
            </Link>
            <button
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              {isDarkTheme ? 'Light' : 'Dark'} Mode
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-opacity-10 bg-gray-500 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{bookmarks.length}</div>
            <div className="text-sm opacity-75">Total Bookmarks</div>
          </div>
          <div className="bg-opacity-10 bg-gray-500 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {bookmarks.filter(b => b.readStatus === 'read').length}
            </div>
            <div className="text-sm opacity-75">Read</div>
          </div>
          <div className="bg-opacity-10 bg-gray-500 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {bookmarks.filter(b => b.readStatus === 'unread').length}
            </div>
            <div className="text-sm opacity-75">Unread</div>
          </div>
          <div className="bg-opacity-10 bg-gray-500 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {[...new Set(bookmarks.flatMap(b => b.tags))].length}
            </div>
            <div className="text-sm opacity-75">Tags</div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div className="flex gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              📱
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              📝
            </button>
          </div>
        </div>

        {/* Bookmarks List */}
        {filteredBookmarks.length > 0 ? (
          <div className={`${viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
            {filteredBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className={`bg-opacity-10 bg-gray-500 rounded-lg p-6 hover:bg-opacity-20 transition-all ${
                  bookmark.readStatus === 'unread' ? 'border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-2 text-sm">
                    <span className="px-2 py-1 bg-blue-600 text-white rounded">{bookmark.category}</span>
                    <span className={`px-2 py-1 rounded ${getSentimentColor(bookmark.sentiment)} bg-opacity-20`}>
                      {bookmark.sentiment}
                    </span>
                    {bookmark.readStatus === 'unread' && (
                      <span className="px-2 py-1 bg-yellow-600 text-white rounded text-xs">NEW</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button className="text-red-400 hover:text-red-300 text-sm">🗑️</button>
                    <button className="text-blue-400 hover:text-blue-300 text-sm">📤</button>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-2 hover:text-blue-400">
                  <Link href={`/news-intelligence/newsid/${bookmark.id.replace('bookmark-', 'news-')}`}>
                    {bookmark.title}
                  </Link>
                </h3>
                
                <p className="opacity-80 mb-3 text-sm">{bookmark.summary}</p>
                
                <div className="flex justify-between items-center text-xs opacity-60 mb-3">
                  <span>Saved: {new Date(bookmark.bookmarkedAt).toLocaleDateString()}</span>
                  <span>Source: {bookmark.source}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex gap-1">
                    {bookmark.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-700 rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <button className="text-blue-400 hover:text-blue-300 text-sm">
                    {bookmark.readStatus === 'read' ? 'Mark Unread' : 'Mark Read'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-xl font-semibold mb-2">No bookmarks found</h3>
            <p className="opacity-60 mb-6">
              {selectedCategory === 'All' 
                ? "You haven't bookmarked any articles yet" 
                : `No bookmarks in ${selectedCategory} category`
              }
            </p>
            <Link
              href="/news-intelligence"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Explore News
            </Link>
          </div>
        )}

        {/* Bulk Actions */}
        {filteredBookmarks.length > 0 && (
          <div className="mt-8 p-4 bg-opacity-10 bg-gray-500 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <button className="text-blue-400 hover:text-blue-300">📤 Export All</button>
                <button className="text-green-400 hover:text-green-300">✓ Mark All Read</button>
                <button className="text-yellow-400 hover:text-yellow-300">🏷️ Bulk Tag</button>
              </div>
              <div className="text-sm opacity-60">
                {filteredBookmarks.length} bookmark{filteredBookmarks.length !== 1 ? 's' : ''} shown
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 