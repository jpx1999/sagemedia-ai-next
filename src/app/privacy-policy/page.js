import React from "react";
import Layout from "@/components/Layout";

const PrivacyPolicy = ({ isDarkTheme }) => {
  return (<Layout isDarkTheme={isDarkTheme}>
        <div className="px-6 py-6 md:py-12 max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-4xl font-medium pb-3 md:pb-5">
            Privacy Policy
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
                1. Information We Collect
              </h2>
              <p className="text-lg leading-relaxed text-gray-300">
                We collect personal information such as name, email address, and
                payment details when you register for the Service. We may also
                collect usage data, including IP addresses, browser types, and
                access times.
              </p>
              <p className="text-lg leading-relaxed text-gray-300 mt-4">
                Additionally, we collect location information to provide you
                with curated news content relevant to your country and region.
                This helps us deliver personalized and geographically relevant
                news updates through our Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium mb-2 text-gray-300">
                2. Use of Information
              </h2>
              <p className="text-lg leading-relaxed text-gray-300">
                Your information is used to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-lg">
                <li>Provide and maintain the Service</li>
                <li>Process transactions</li>
                <li>Communicate with you about updates and promotions</li>
                <li>Improve our Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-medium mb-2 text-gray-300">
                3. Data Sharing
              </h2>
              <p className="text-lg leading-relaxed text-gray-300">
                We do not sell your personal information. We may share data with
                third-party service providers for payment processing and
                analytics, under strict confidentiality agreements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium mb-2 text-gray-300">
                4. Data Security
              </h2>
              <p className="text-lg leading-relaxed text-gray-300">
                We implement industry-standard security measures to protect your
                data. However, no method of transmission over the Internet is
                100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium mb-2 text-gray-300">
                5. Cookies
              </h2>
              <p className="text-lg leading-relaxed text-gray-300">
                sagemedia.ai uses cookies to enhance user experience. You can
                control cookie settings through your browser.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium mb-2 text-gray-300">
                6. User Rights
              </h2>
              <p className="text-lg leading-relaxed text-gray-300">
                You have the right to access, correct, or delete your personal
                information. To exercise these rights, contact us at{" "}
                <a
                  href="mailto:hello@sagemedia.ai"
                  className={`${
                    isDarkTheme
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-600 hover:text-blue-800"
                  } underline transition-colors`}
                >
                  hello@sagemedia.ai
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium mb-2 text-gray-300">
                7. Changes to This Policy
              </h2>
              <p className="text-lg leading-relaxed text-gray-300">
                We may update this Privacy Policy from time to time. Changes
                will be posted on this page with an updated effective date.
              </p>
            </section>
          </div>
        </div>
      </Layout>
   
  );
};

export default PrivacyPolicy;
