'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ContactUs() {
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Contact form submitted:', formData)
    // Handle form submission
  }

  return (
    <div className={`${isDarkTheme ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen font-poppins`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
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
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl opacity-80">
              Get in touch with our team. We&apos;re here to help!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="partnership">Partnership</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us how we can help you..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">Get in touch</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">📧</div>
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <p className="opacity-75">support@sagemedia.ai</p>
                      <p className="opacity-75">sales@sagemedia.ai</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="text-2xl">📞</div>
                    <div>
                      <h3 className="font-semibold mb-1">Phone</h3>
                      <p className="opacity-75">+1 (555) 123-4567</p>
                      <p className="text-sm opacity-60">Mon-Fri, 9am-6pm EST</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="text-2xl">📍</div>
                    <div>
                      <h3 className="font-semibold mb-1">Office</h3>
                      <p className="opacity-75">123 Innovation Drive</p>
                      <p className="opacity-75">San Francisco, CA 94102</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="text-2xl">💬</div>
                    <div>
                      <h3 className="font-semibold mb-1">Live Chat</h3>
                      <p className="opacity-75">Available 24/7 for Pro+ users</p>
                      <button className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm">
                        Start Chat
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Links */}
              <div className="bg-opacity-10 bg-gray-500 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Help</h3>
                <div className="space-y-3">
                  <Link href="/support" className="block text-blue-400 hover:text-blue-300">
                    → View Support Center
                  </Link>
                  <Link href="/pricing" className="block text-blue-400 hover:text-blue-300">
                    → Pricing & Plans
                  </Link>
                  <Link href="/privacy-policy" className="block text-blue-400 hover:text-blue-300">
                    → Privacy Policy
                  </Link>
                  <Link href="/terms-and-conditions" className="block text-blue-400 hover:text-blue-300">
                    → Terms of Service
                  </Link>
                </div>
              </div>

              {/* Response Time */}
              <div className="bg-opacity-10 bg-blue-500 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Response Times</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>General Inquiries</span>
                    <span className="text-blue-400">Within 24 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Technical Support</span>
                    <span className="text-blue-400">Within 4 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Billing Questions</span>
                    <span className="text-blue-400">Within 2 hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 