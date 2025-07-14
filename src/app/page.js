'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function HomePage() {
  const [isDarkTheme, setIsDarkTheme] = useState(true)

  return (
    <div className={`${isDarkTheme ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen font-poppins`}>
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">SageMedia AI</h1>
          <p className="text-xl opacity-80 max-w-2xl mx-auto">
            Advanced AI-powered news intelligence and analytics platform
          </p>
          <button
            onClick={() => setIsDarkTheme(!isDarkTheme)}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            {isDarkTheme ? 'Light' : 'Dark'} Mode
          </button>
        </header>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center p-6 rounded-lg bg-opacity-10 bg-gray-500">
            <h3 className="text-xl font-semibold mb-3">News Intelligence</h3>
            <p className="opacity-75">AI-powered news analysis and insights</p>
          </div>
          <div className="text-center p-6 rounded-lg bg-opacity-10 bg-gray-500">
            <h3 className="text-xl font-semibold mb-3">Real-time Analytics</h3>
            <p className="opacity-75">Live data processing and visualization</p>
          </div>
          <div className="text-center p-6 rounded-lg bg-opacity-10 bg-gray-500">
            <h3 className="text-xl font-semibold mb-3">Smart Bookmarks</h3>
            <p className="opacity-75">Organize and track important news</p>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors mr-4"
          >
            Get Started
          </Link>
          <Link
            href="/news-intelligence"
            className="inline-block px-8 py-3 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg font-semibold transition-colors"
          >
            Explore News
          </Link>
        </div>
      </div>
    </div>
  )
}