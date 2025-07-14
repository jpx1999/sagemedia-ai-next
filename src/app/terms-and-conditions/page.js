'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function TermsAndConditions() {
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
          <h1 className="text-5xl font-bold mb-8">Terms and Conditions</h1>
          
          <div className="prose prose-lg max-w-none text-white">
            <p className="text-xl opacity-80 mb-8">
              Last updated: January 16, 2024
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                <p className="opacity-80 leading-relaxed">
                  By accessing and using SageMedia AI, you accept and agree to be bound by the terms and provision of this agreement.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">2. Use License</h2>
                <p className="opacity-80 leading-relaxed mb-4">
                  Permission is granted to temporarily download one copy of SageMedia AI for personal, non-commercial transitory viewing only.
                </p>
                <ul className="list-disc list-inside opacity-80 space-y-2">
                  <li>This is the grant of a license, not a transfer of title</li>
                  <li>You may not modify or copy the materials</li>
                  <li>You may not use the materials for any commercial purpose or for any public display</li>
                  <li>You may not attempt to reverse engineer any software contained on the website</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">3. Disclaimer</h2>
                <p className="opacity-80 leading-relaxed">
                  The materials on SageMedia AI are provided on an &apos;as is&apos; basis. SageMedia AI makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">4. Limitations</h2>
                <p className="opacity-80 leading-relaxed">
                  In no event shall SageMedia AI or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use SageMedia AI, even if SageMedia AI or a SageMedia AI authorized representative has been notified orally or in writing of the possibility of such damage.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">5. Privacy Policy</h2>
                <p className="opacity-80 leading-relaxed">
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">6. Contact Information</h2>
                <p className="opacity-80 leading-relaxed">
                  If you have any questions about these Terms and Conditions, please contact us at legal@sagemedia.ai
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 