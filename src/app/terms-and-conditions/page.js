import React from "react";
import Layout from "@/components/Layout";

const TermsAndConditions = ({ isDarkTheme }) => {
  return (
  

      <Layout isDarkTheme={isDarkTheme}>
        <div className="px-6 py-6 md:py-12 max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-4xl font-medium pb-3 md:pb-5">
            Terms and Conditions
          </h1>
          <div className="mb-8 md:mb-12 pt-4 border-t border-gray-700 dark:border-gray-700">
            <p
              className={`text-sm ${
                isDarkTheme ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-6 md:space-y-8">
            <section>
              <h2 className="text-xl font-medium mb-2 text-gray-300">
                1. Acceptance of Terms
              </h2>
              <p className="text-lg leading-relaxed text-gray-300">
                By accessing or using sagemedia.ai (&quot;Service&quot;), you agree to be
                bound by these Terms and Conditions (&quot;Terms&quot;). If you do not
                agree to these Terms, you must not access or use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium mb-2 text-gray-300">
                2. Description of Service
              </h2>
              <p className="text-lg leading-relaxed text-gray-300">
                sagemedia.ai provides AI-driven news intelligence tools on a
                subscription basis. We reserve the right to modify or
                discontinue the Service (or any part thereof) at any time
                without notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium mb-2 text-gray-300">
                3. User Obligations
              </h2>
              <p className="text-lg leading-relaxed text-gray-300">
                You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-lg">
                <li>
                  Provide accurate and complete information during registration.
                </li>
                <li>
                  Maintain the confidentiality of your account credentials.
                </li>
                <li>
                  Use the Service only for lawful purposes and in accordance
                  with these Terms.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-medium mb-2 text-gray-300">
                4. Intellectual Property
              </h2>
              <p className="text-lg leading-relaxed text-gray-300">
                All content, trademarks, and data on sagemedia.ai are the
                property of sagemedia.ai or its licensors and are protected by
                applicable intellectual property laws. You may not reproduce,
                distribute, or create derivative works from any content without
                our prior written consent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium mb-2 text-gray-300">
                5. Subscription and Payment
              </h2>
              <p className="text-lg leading-relaxed text-gray-300">
                Subscriptions are billed in advance on a recurring basis. By
                subscribing, you authorize us to charge your payment method for
                the applicable fees. All fees are non-refundable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium mb-2 text-gray-300">
                6. Limitation of Liability
              </h2>
              <p className="text-lg leading-relaxed text-gray-300">
                sagemedia.ai shall not be liable for any indirect, incidental,
                or consequential damages arising out of your use of the Service.
                Our total liability shall not exceed the amount paid by you for
                the Service during the twelve (12) months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium mb-2 text-gray-300">
                7. Termination
              </h2>
              <p className="text-lg leading-relaxed text-gray-300">
                We reserve the right to suspend or terminate your access to the
                Service at our sole discretion, without notice, for conduct that
                we believe violates these Terms or is harmful to other users or
                us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium mb-2 text-gray-300">
                8. Governing Law
              </h2>
              <p className="text-lg leading-relaxed text-gray-300">
                These Terms are governed by the laws of India. Any disputes
                arising under these Terms shall be subject to the exclusive
                jurisdiction of the courts located in Kolkata, West Bengal.
              </p>
            </section>
          </div>
        </div>
      </Layout>
  );
};

export default TermsAndConditions;
