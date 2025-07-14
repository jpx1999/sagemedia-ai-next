'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function PricingPage() {
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const [isAnnual, setIsAnnual] = useState(false)

  const plans = [
    {
      name: 'Free',
      price: { monthly: 0, annual: 0 },
      description: 'Perfect for getting started',
      features: [
        '5 news searches per day',
        'Basic sentiment analysis',
        'Limited bookmarks (10)',
        'Standard support',
        'Basic keywords extraction'
      ],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Pro',
      price: { monthly: 29, annual: 290 },
      description: 'For professionals and teams',
      features: [
        'Unlimited news searches',
        'Advanced AI analysis',
        'Unlimited bookmarks',
        'Priority support',
        'Custom keywords & alerts',
        'Export to PDF/Excel',
        'API access (1000 calls/month)',
        'Collaboration tools'
      ],
      cta: 'Start Pro Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: { monthly: 99, annual: 990 },
      description: 'For large organizations',
      features: [
        'Everything in Pro',
        'Unlimited API calls',
        'Custom integrations',
        'Dedicated account manager',
        'White-label options',
        'Advanced analytics dashboard',
        'SSO integration',
        'Custom training'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ]

  return (
    <div className={`${isDarkTheme ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen font-poppins`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-between items-center mb-8">
            <Link href="/" className="text-blue-500 hover:underline">← Back to Home</Link>
            <button
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              {isDarkTheme ? 'Light' : 'Dark'} Mode
            </button>
          </div>
          
          <h1 className="text-5xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl opacity-80 max-w-2xl mx-auto mb-8">
            Unlock the full power of AI-driven news intelligence
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-8">
            <span className={`mr-3 ${!isAnnual ? 'text-blue-400 font-semibold' : 'opacity-60'}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`ml-3 ${isAnnual ? 'text-blue-400 font-semibold' : 'opacity-60'}`}>
              Annual
              <span className="ml-1 text-green-400 text-sm">(Save 20%)</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-lg p-8 border-2 transition-all hover:scale-105 ${
                plan.popular
                  ? 'border-blue-500 bg-blue-500 bg-opacity-10'
                  : 'border-gray-600 bg-opacity-5 bg-gray-500'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="opacity-75 mb-4">{plan.description}</p>
                <div className="mb-4">
                  <span className="text-4xl font-bold">
                    ${isAnnual ? plan.price.annual : plan.price.monthly}
                  </span>
                  {plan.price.monthly > 0 && (
                    <span className="opacity-60">
                      /{isAnnual ? 'year' : 'month'}
                    </span>
                  )}
                </div>
                {isAnnual && plan.price.monthly > 0 && (
                  <p className="text-green-400 text-sm">
                    Save ${(plan.price.monthly * 12) - plan.price.annual} per year
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <span className="text-green-400 mr-3">✓</span>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-opacity-10 bg-gray-500 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
              <p className="opacity-80 text-sm">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div className="bg-opacity-10 bg-gray-500 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="opacity-80 text-sm">Yes, Pro plan comes with a 14-day free trial. No credit card required to start.</p>
            </div>
            <div className="bg-opacity-10 bg-gray-500 rounded-lg p-6">
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="opacity-80 text-sm">We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.</p>
            </div>
            <div className="bg-opacity-10 bg-gray-500 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="opacity-80 text-sm">Yes, we offer a 30-day money-back guarantee for all paid plans.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl opacity-80 mb-8">Join thousands of professionals using SageMedia AI</p>
          <div className="flex justify-center gap-4">
            <Link
              href="/login"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              href="/contact-us"
              className="px-8 py-3 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg font-semibold transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 