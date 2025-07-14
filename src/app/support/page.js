'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Support() {
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const faqs = [
    {
      id: 1,
      category: 'general',
      question: 'How does SageMedia AI work?',
      answer: 'SageMedia AI uses advanced machine learning algorithms to analyze news content, extract insights, and provide intelligent recommendations based on your interests and search patterns.'
    },
    {
      id: 2,
      category: 'billing',
      question: 'Can I change my subscription plan?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and billing will be prorated accordingly.'
    },
    {
      id: 3,
      category: 'features',
      question: 'What is the difference between Free and Pro plans?',
      answer: 'Pro plans include unlimited searches, advanced AI analysis, unlimited bookmarks, priority support, and API access. Free plans are limited to 5 searches per day and basic features.'
    },
    {
      id: 4,
      category: 'technical',
      question: 'How do I integrate the API?',
      answer: 'Our REST API is available for Pro+ users. Check our developer documentation for authentication, endpoints, and code examples in multiple programming languages.'
    },
    {
      id: 5,
      category: 'billing',
      question: 'Do you offer refunds?',
      answer: 'Yes, we offer a 30-day money-back guarantee for all paid plans. Contact support for refund requests.'
    },
    {
      id: 6,
      category: 'features',
      question: 'Can I export my bookmarks and search history?',
      answer: 'Yes, Pro+ users can export their data in CSV, JSON, or PDF formats. Go to Settings > Data Export to download your information.'
    }
  ]

  const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'general', label: 'General' },
    { id: 'billing', label: 'Billing' },
    { id: 'features', label: 'Features' },
    { id: 'technical', label: 'Technical' }
  ]

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className={`${isDarkTheme ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen font-poppins`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Support Center</h1>
            <p className="opacity-75">Find answers and get help</p>
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

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link href="/contact-us" className="bg-opacity-10 bg-blue-500 rounded-lg p-6 hover:bg-opacity-20 transition-all block">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="text-xl font-semibold mb-2">Contact Support</h3>
            <p className="opacity-75">Get direct help from our team</p>
          </Link>

          <div className="bg-opacity-10 bg-green-500 rounded-lg p-6 hover:bg-opacity-20 transition-all cursor-pointer">
            <div className="text-3xl mb-3">📚</div>
            <h3 className="text-xl font-semibold mb-2">Documentation</h3>
            <p className="opacity-75">Comprehensive guides and tutorials</p>
          </div>

          <div className="bg-opacity-10 bg-purple-500 rounded-lg p-6 hover:bg-opacity-20 transition-all cursor-pointer">
            <div className="text-3xl mb-3">🎥</div>
            <h3 className="text-xl font-semibold mb-2">Video Tutorials</h3>
            <p className="opacity-75">Step-by-step video guides</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help topics..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-center gap-2 flex-wrap">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          
          {filteredFaqs.length > 0 ? (
            <div className="space-y-4">
              {filteredFaqs.map((faq) => (
                <div key={faq.id} className="bg-opacity-10 bg-gray-500 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
                  <p className="opacity-80 leading-relaxed">{faq.answer}</p>
                  <div className="mt-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      faq.category === 'general' ? 'bg-blue-600' :
                      faq.category === 'billing' ? 'bg-green-600' :
                      faq.category === 'features' ? 'bg-purple-600' :
                      'bg-orange-600'
                    }`}>
                      {faq.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No results found</h3>
              <p className="opacity-60 mb-6">Try adjusting your search terms or category filter</p>
              <button 
                onClick={() => {setSearchQuery(''); setSelectedCategory('all')}}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Additional Resources */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Additional Resources</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-opacity-10 bg-gray-500 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>API Status</span>
                  <span className="text-green-400 flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    Operational
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>News Feed</span>
                  <span className="text-green-400 flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    Operational
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Search Service</span>
                  <span className="text-green-400 flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    Operational
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-opacity-10 bg-gray-500 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="space-y-3">
                <Link href="/pricing" className="block text-blue-400 hover:text-blue-300">
                  → Pricing & Plans
                </Link>
                <Link href="/terms-and-conditions" className="block text-blue-400 hover:text-blue-300">
                  → Terms of Service
                </Link>
                <Link href="/privacy-policy" className="block text-blue-400 hover:text-blue-300">
                  → Privacy Policy
                </Link>
                <Link href="/refund-policy" className="block text-blue-400 hover:text-blue-300">
                  → Refund Policy
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Still Need Help */}
        <div className="mt-16 text-center bg-opacity-10 bg-blue-500 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
          <p className="opacity-80 mb-6">
            Our support team is here to help you with any questions or issues
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/contact-us"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Contact Support
            </Link>
            <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors">
              Start Live Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 