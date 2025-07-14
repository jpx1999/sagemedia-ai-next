'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function PrivacyPolicy() {
  const [isDarkTheme, setIsDarkTheme] = useState(true)

  return (
    <div className={`${isDarkTheme ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen font-poppins`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-blue-500 hover:underline">← Back to Home</Link>
          <button
            onClick={() => setIsDarkTheme(!isDarkTheme)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            {isDarkTheme ? 'Light' : 'Dark'} Mode
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none text-white">
            <p className="text-xl opacity-80 mb-8">
              Last updated: January 16, 2024
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
                <p className="opacity-80 leading-relaxed mb-4">
                  We collect information you provide directly to us, such as when you create an account, subscribe to our service, or contact us for support.
                </p>
                <ul className="list-disc list-inside opacity-80 space-y-2">
                  <li>Account information (name, email, password)</li>
                  <li>Profile information and preferences</li>
                  <li>Payment and billing information</li>
                  <li>Search queries and usage data</li>
                  <li>Communications with our support team</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
                <p className="opacity-80 leading-relaxed mb-4">
                  We use the information we collect to provide, maintain, and improve our services.
                </p>
                <ul className="list-disc list-inside opacity-80 space-y-2">
                  <li>Provide and maintain our service</li>
                  <li>Process payments and send billing information</li>
                  <li>Improve our AI algorithms and recommendations</li>
                  <li>Send you technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Information Sharing</h2>
                <p className="opacity-80 leading-relaxed">
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Data Security</h2>
                <p className="opacity-80 leading-relaxed">
                  We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
                <p className="opacity-80 leading-relaxed mb-4">
                  You have certain rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside opacity-80 space-y-2">
                  <li>Access and update your information</li>
                  <li>Delete your account and data</li>
                  <li>Export your data</li>
                  <li>Opt out of communications</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                <p className="opacity-80 leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at privacy@sagemedia.ai
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 