'use client'
import Layout from "@/components/Layout";
import React from "react";

const ContactUsClient = () => {
  const calendlyUrl =
    process.env.NEXT_PUBLIC_CALENDLY_URL ||
    "https://calendly.com/hello-spiderx/30min";
  const handleViewInMap = () => {
    const address =
      "No. 360, Web Spiders India Pvt. Ltd., Premises No. 14-360 Plot No. DH-6/8, Street, Action Area 1D, Newtown, Kolkata, West Bengal 700156";
    const encodedAddress = encodeURIComponent(address);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
      "_blank"
    );
  };

  return (
    <Layout isDarkTheme={true}>
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-8 lg:mb-16">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold mb-3 sm:mb-6">
            Book a Meeting
          </h1>
          <p className="text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto">
            Ready to transform your business with AI? Schedule a consultation
            with our experts and discover how Sage can revolutionize your
            workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-12 items-start">
          {/* Calendly Booking Widget */}
          <div className="md:col-span-7 text-center p-5 lg:p-8 mb-1 relative rounded-2xl border border-gray-700 bg-[#22262a]">
            <h2 className="text-xl lg:text-2xl font-semibold mb-6">
              Schedule Your Consultation
            </h2>
            <div className="calendly-iframe-container">
              <iframe
                src={calendlyUrl}
                style={{
                  borderStyle: "none",
                  height: "60vh",
                  width: "100%",
                  minHeight: "400px",
                }}
                allowFullScreen
                title="Schedule a meeting with Sage SpiderX AI"
                className="rounded-lg bg-transparent"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="md:col-span-5 space-y-8">
            <div>
              <h2 className="text-xl lg:text-2xl font-semibold mb-3 lg:mb-6">
                Alternative Contact Methods
              </h2>
              <p className="text-gray-400 mb-6">
                Prefer to reach out directly? Use any of the methods below and
                we will get back to you promptly.
              </p>
            </div>

            {/* Contact Cards */}
            <div className="space-y-6">
              {/* Email */}
              <div
                className={`bg-[#22262a] p-6 rounded-xl flex items-start space-x-4`}
              >
                <div className="w-12 h-12 bg-[#5E8EFF] rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="#fff"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <a
                    href="mailto:hello@sagemedia.ai"
                    className="text-[#6ABCFF] hover:underline"
                  >
                    hello@sagemedia.ai
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div
                className={`bg-[#22262a] p-6 rounded-xl flex items-start space-x-4`}
              >
                <div className="w-12 h-12 bg-[#5E8EFF] rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="#fff"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Phone</h3>
                  <a
                    href="tel:+913366110900"
                    className="text-[#6ABCFF] hover:underline"
                  >
                    +91 33 6611 0900
                  </a>
                </div>
              </div>

              {/* Address */}
              <div
                className={`bg-[#22262a] p-6 rounded-xl flex items-start space-x-4`}
              >
                <div className="w-12 h-12 bg-[#5E8EFF] rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="#fff"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-gray-400 mb-3 leading-relaxed">
                    <span className="text-xl font-medium text-white mb-1">
                      Sage Media AI
                      <br />
                      <p className="text-sm font-normal text-white mb-4">
                        A Group Company of Web Spiders India Pvt Ltd
                      </p>
                    </span>
                    <p>Premises No. 14-360</p>
                    <p>Plot No. DH-6/8, Street No. 360</p>
                    <p>Action Area- 1D, New Town</p>
                    <p>Rajarhat, Kolkata- 700 156, India</p>
                  </div>
                  <button
                    onClick={handleViewInMap}
                    className="text-[#6ABCFF] hover:underline font-medium flex items-center space-x-1"
                  >
                    <span>View in Map</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactUsClient; 