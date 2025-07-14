'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SearchHistory() {
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const [searchFilter, setSearchFilter] = useState('')

  // Dummy search history data
  const searchHistory = [
    {
      id: 'search-1',
      query: 'AI healthcare breakthrough',
      timestamp: '2024-01-16T10:30:00Z',
      resultsCount: 127,
      category: 'Technology',
      filters: ['sentiment:positive', 'date:last_week'],
      saved: true
    },
    {
      id: 'search-2',
      query: 'climate change summit 2024',
      timestamp: '2024-01-15T14:20:00Z',
      resultsCount: 89,
      category: 'Environment',
      filters: ['source:environmental_today'],
      saved: false
    },
    {
      id: 'search-3',
      query: 'stock market volatility',
      timestamp: '2024-01-15T09:45:00Z',
      resultsCount: 234,
      category: 'Economics',
      filters: ['date:today', 'sentiment:neutral'],
      saved: true
    },
    {
      id: 'search-4',
      query: 'cybersecurity threats 2024',
      timestamp: '2024-01-14T16:30:00Z',
      resultsCount: 156,
      category: 'Technology',
      filters: ['sentiment:negative'],
      saved: false
    },
    {
      id: 'search-5',
      query: 'renewable energy investments',
      timestamp: '2024-01-14T11:15:00Z',
      resultsCount: 78,
      category: 'Environment',
      filters: ['date:last_month', 'sentiment:positive'],
      saved: true
    }
  ]

  const filteredHistory = searchHistory.filter(search =>
    search.query.toLowerCase().includes(searchFilter.toLowerCase()) ||
    search.category.toLowerCase().includes(searchFilter.toLowerCase())
  )

  const groupedByDate = filteredHistory.reduce((groups, search) => {
    const date = new Date(search.timestamp).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(search)
    return groups
  }, {})

  return (
    <div className={`${isDarkTheme ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen font-poppins`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Search History</h1>
            <p className="opacity-75">Track and manage your previous searches</p>
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
            <div className="text-2xl font-bold text-blue-400">{searchHistory.length}</div>
            <div className="text-sm opacity-75">Total Searches</div>
          </div>
          <div className="bg-opacity-10 bg-gray-500 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {searchHistory.filter(s => s.saved).length}
            </div>
            <div className="text-sm opacity-75">Saved Searches</div>
          </div>
          <div className="bg-opacity-10 bg-gray-500 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {searchHistory.reduce((sum, s) => sum + s.resultsCount, 0)}
            </div>
            <div className="text-sm opacity-75">Total Results</div>
          </div>
          <div className="bg-opacity-10 bg-gray-500 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {[...new Set(searchHistory.map(s => s.category))].length}
            </div>
            <div className="text-sm opacity-75">Categories</div>
          </div>
        </div>

        {/* Search Filter */}
        <div className="mb-6">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter search history..."
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 mb-8">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            📤 Export History
          </button>
          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
            🗑️ Clear All
          </button>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
            ⭐ Saved Only
          </button>
        </div>

        {/* Search History */}
        {Object.keys(groupedByDate).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(groupedByDate)
              .sort(([a], [b]) => new Date(b) - new Date(a))
              .map(([date, searches]) => (
                <div key={date}>
                  <h2 className="text-xl font-semibold mb-4 text-blue-400">{date}</h2>
                  <div className="space-y-3">
                    {searches.map((search) => (
                      <div
                        key={search.id}
                        className="bg-opacity-10 bg-gray-500 rounded-lg p-4 hover:bg-opacity-20 transition-all"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">&ldquo;{search.query}&rdquo;</h3>
                              {search.saved && (
                                <span className="text-yellow-400">⭐</span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm opacity-75">
                              <span>{new Date(search.timestamp).toLocaleTimeString()}</span>
                              <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs">
                                {search.category}
                              </span>
                              <span>{search.resultsCount} results</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="text-blue-400 hover:text-blue-300"
                              title="Run search again"
                            >
                              🔄
                            </button>
                            <button
                              className="text-yellow-400 hover:text-yellow-300"
                              title={search.saved ? 'Remove from saved' : 'Save search'}
                            >
                              {search.saved ? '⭐' : '☆'}
                            </button>
                            <button
                              className="text-red-400 hover:text-red-300"
                              title="Delete search"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        
                        {search.filters.length > 0 && (
                          <div className="flex gap-2 mb-3">
                            <span className="text-xs opacity-60">Filters:</span>
                            {search.filters.map((filter, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-700 rounded text-xs"
                              >
                                {filter}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <Link
                            href={`/news-intelligence?query=${encodeURIComponent(search.query)}`}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            View Results →
                          </Link>
                          <div className="flex gap-3 text-xs opacity-60">
                            <button className="hover:text-white">Copy Query</button>
                            <button className="hover:text-white">Share</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">
              {searchFilter ? 'No matching searches' : 'No search history yet'}
            </h3>
            <p className="opacity-60 mb-6">
              {searchFilter 
                ? 'Try adjusting your filter terms'
                : 'Start searching for news to see your history here'
              }
            </p>
            <Link
              href="/news-intelligence"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Start Searching
            </Link>
          </div>
        )}

        {/* Search Insights */}
        {searchHistory.length > 0 && (
          <div className="mt-12 bg-opacity-10 bg-gray-500 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Search Insights</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="opacity-75">Most searched category:</span>
                <div className="font-semibold text-blue-400">
                  {searchHistory.reduce((acc, search) => {
                    acc[search.category] = (acc[search.category] || 0) + 1
                    return acc
                  }, {})}
                  Technology
                </div>
              </div>
              <div>
                <span className="opacity-75">Average results per search:</span>
                <div className="font-semibold text-green-400">
                  {Math.round(searchHistory.reduce((sum, s) => sum + s.resultsCount, 0) / searchHistory.length)}
                </div>
              </div>
              <div>
                <span className="opacity-75">Most active day:</span>
                <div className="font-semibold text-purple-400">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 