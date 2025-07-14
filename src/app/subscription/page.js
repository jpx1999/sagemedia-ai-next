'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Subscription() {
  const [isDarkTheme, setIsDarkTheme] = useState(true)

  // Dummy subscription data
  const currentPlan = {
    name: 'Pro',
    price: 29,
    billingCycle: 'monthly',
    nextBilling: '2024-02-16',
    status: 'active',
    features: [
      'Unlimited news searches',
      'Advanced AI analysis',
      'Unlimited bookmarks',
      'Priority support',
      'Custom keywords & alerts',
      'Export to PDF/Excel',
      'API access (1000 calls/month)',
      'Collaboration tools'
    ]
  }

  const usage = {
    searches: { used: 1247, limit: 'unlimited' },
    bookmarks: { used: 89, limit: 'unlimited' },
    apiCalls: { used: 456, limit: 1000 }
  }

  return (
    <div className={`${isDarkTheme ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen font-poppins`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Subscription</h1>
            <p className="opacity-75">Manage your plan and billing</p>
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Current Plan */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-opacity-10 bg-gray-500 rounded-lg p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Current Plan: {currentPlan.name}</h2>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold">${currentPlan.price}</span>
                    <span className="opacity-75">/{currentPlan.billingCycle}</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      currentPlan.status === 'active' ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                      {currentPlan.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-75">Next billing</p>
                  <p className="font-semibold">{new Date(currentPlan.nextBilling).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Plan Features</h3>
                  <ul className="space-y-2">
                    {currentPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <span className="text-green-400 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link
                      href="/pricing"
                      className="block w-full text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      Upgrade Plan
                    </Link>
                    <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                      Download Invoice
                    </button>
                    <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                      Cancel Subscription
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="bg-opacity-10 bg-gray-500 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6">Usage This Month</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Searches</span>
                    <span>{usage.searches.used.toLocaleString()} / {usage.searches.limit}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Bookmarks</span>
                    <span>{usage.bookmarks.used} / {usage.bookmarks.limit}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span>API Calls</span>
                    <span>{usage.apiCalls.used} / {usage.apiCalls.limit}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Billing Info */}
            <div className="bg-opacity-10 bg-gray-500 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Billing Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-75">Payment Method</span>
                  <span>•••• 4242</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">Last Payment</span>
                  <span>Jan 16, 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">Amount</span>
                  <span>$29.00</span>
                </div>
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm">
                Update Payment Method
              </button>
            </div>

            {/* Support */}
            <div className="bg-opacity-10 bg-gray-500 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
              <div className="space-y-3">
                <Link
                  href="/support"
                  className="block text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
                >
                  Contact Support
                </Link>
                <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm">
                  View FAQ
                </button>
              </div>
            </div>

            {/* Plan Comparison */}
            <div className="bg-opacity-10 bg-gray-500 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Compare Plans</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Free</span>
                  <span className="opacity-60">$0/month</span>
                </div>
                <div className="flex justify-between font-semibold text-blue-400">
                  <span>Pro (Current)</span>
                  <span>$29/month</span>
                </div>
                <div className="flex justify-between">
                  <span>Enterprise</span>
                  <span className="opacity-60">$99/month</span>
                </div>
              </div>
              <Link
                href="/pricing"
                className="block text-center mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
              >
                View All Plans
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 