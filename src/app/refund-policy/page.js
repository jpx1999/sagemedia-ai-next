import React from "react";
import Layout from "@/components/Layout";

const RefundPolicy = ({ isDarkTheme }) => {
  return (
   <Layout isDarkTheme={isDarkTheme}>
        <div className="px-6 py-6 md:py-12 max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-4xl font-medium pb-3 md:pb-5">
            Refund Policy
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
                1. Subscription Cancellation
              </h2>
              <p className="text-lg leading-relaxed text-gray-300">
                All subscriptions to sagemedia.ai are final. We do not offer
                cancellations once a subscription has been activated.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium mb-2 text-gray-300">
                2. Refund Policy
              </h2>
              <p className="text-lg leading-relaxed text-gray-300">
                We do not provide refunds for any subscriptions, including but
                not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-lg">
                <li>Partial use of the Service</li>
                <li>Downtime or technical issues</li>
                <li>User dissatisfaction</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-medium mb-2 text-gray-300">
                3. Exceptional Circumstances
              </h2>
              <p className="text-lg leading-relaxed text-gray-300">
                In rare cases of billing errors or fraudulent transactions,
                please contact our support team at{" "}
                <a
                  href="mailto:hello@sagemedia.ai"
                  className={`${
                    isDarkTheme
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-600 hover:text-blue-800"
                  } underline transition-colors`}
                >
                  hello@sagemedia.ai
                </a>{" "}
                within 7 days of the transaction for review.
              </p>
              <p className="text-lg leading-relaxed text-gray-300 mt-4">
                If a refund is approved, it will be processed within 4 to 5
                business days. The time for the refund to reflect in your
                account may vary depending on your payment method and financial
                institution.
              </p>
            </section>
          </div>
        </div>
    </Layout>
  );
};

export default RefundPolicy;
