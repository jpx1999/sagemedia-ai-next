'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function RefundPolicy() {
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
          <h1 className="text-5xl font-bold mb-8">Refund Policy</h1>
          
          <div className="prose prose-lg max-w-none text-white">
            <p className="text-xl opacity-80 mb-8">
              Last updated: January 16, 2024
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold mb-4">30-Day Money-Back Guarantee</h2>
                <p className="opacity-80 leading-relaxed">
                  We offer a 30-day money-back guarantee for all paid subscription plans. If you&apos;re not completely satisfied with our service, you can request a full refund within 30 days of your initial purchase.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Eligibility for Refunds</h2>
                <p className="opacity-80 leading-relaxed mb-4">
                  To be eligible for a refund, the following conditions must be met:
                </p>
                <ul className="list-disc list-inside opacity-80 space-y-2">
                  <li>Refund request must be made within 30 days of purchase</li>
                  <li>You must provide a reason for the refund request</li>
                  <li>Account must not have violated our terms of service</li>
                  <li>Refunds apply only to subscription fees, not usage-based charges</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">How to Request a Refund</h2>
                <p className="opacity-80 leading-relaxed mb-4">
                  To request a refund, please follow these steps:
                </p>
                <ol className="list-decimal list-inside opacity-80 space-y-2">
                  <li>Contact our support team at support@sagemedia.ai</li>
                  <li>Include your account email and reason for refund</li>
                  <li>Our team will review your request within 2-3 business days</li>
                  <li>If approved, refunds will be processed within 5-7 business days</li>
                </ol>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Refund Processing</h2>
                <p className="opacity-80 leading-relaxed">
                  Approved refunds will be credited back to the original payment method used for the purchase. Processing times may vary depending on your payment provider.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Pro-rated Refunds</h2>
                <p className="opacity-80 leading-relaxed">
                  For users who downgrade their subscription plan, we offer pro-rated refunds for the unused portion of their current billing period.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Exceptions</h2>
                <p className="opacity-80 leading-relaxed mb-4">
                  The following are not eligible for refunds:
                </p>
                <ul className="list-disc list-inside opacity-80 space-y-2">
                  <li>API usage charges beyond the included quota</li>
                  <li>Custom enterprise integration fees</li>
                  <li>Requests made after the 30-day window</li>
                  <li>Accounts terminated for terms of service violations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
                <p className="opacity-80 leading-relaxed">
                  For refund requests or questions about our refund policy, please contact our support team at support@sagemedia.ai or through our contact form.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 