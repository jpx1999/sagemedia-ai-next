'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '../../components/Layout'
import { userPlan } from '../../helpers/api'

const PricingPage = () => {
  const router = useRouter()

  const [activeFaq, setActiveFaq] = useState(null)
  const [userPlanData, setUserPlanData] = useState(null)

  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        const response = await userPlan()
        console.log('response', response)
        setUserPlanData(response)
      } catch (error) {
        console.error('Error fetching plan:', error)
      }
    }
    fetchUserPlan()
  }, [])

  const plan = {
    free: {
      name: 'Free',
      id: 'free_plan',
      amount: 0,
      billing: 'Forever',
      features: [
        '10 searches/hour',
        '10 News Sources',
        'Basic search functionality',
        'Community support',
        'Forever free',
      ],
    },
    professional: {
      name: 'Professional',
      id: process.env.NEXT_PUBLIC_PROFESSIONAL_PLAN_ID,
      amount: 2950,
      billing: 'Monthly',
      features: [
        '5,000 queries/month',
        '50 Premium searches/hour',
        '25+ News Sources',
        'Slack + Teams integration',
        'Basic analytics dashboard',
        'Email support',
        '30-day free trial',
      ],
    },
    enterprise: {
      name: 'Enterprise',
      id: process.env.NEXT_PUBLIC_ENTERPRISE_PLAN_ID,
      amount: 4950,
      originalAmount: 5940,
      billing: 'Annual',
      features: [
        'Unlimited queries',
        '100+ Premium News Sources',
        '100 Premium Searches/hour',
        '10+ integrations (CRM, Slack, Teams etc.)',
        'Advanced analytics + reporting',
        'SSO + Enterprise security',
        'Dedicated success manager',
        'Custom AI training',
        '24/7 priority support',
      ],
    },
  }

  // Navigate to subscription page with plan parameter
  const handleSubscribeClick = (planKey) => {
    router.push(`/subscription?plan=${planKey}`)
  }

  const demoCall = () => {
    router.push('/contact-us')
  }

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index)
  }

  const faqData = [
    {
      question: 'How quickly can we see ROI with Sage AI?',
      answer:
        'Most enterprises see ROI within 2 weeks. Teams typically save 23+ hours per week on research, translating to immediate cost savings and productivity gains.',
    },
    {
             question: "What&apos;s included in the implementation?",
      answer:
        'White-glove setup, data migration, team training, custom AI training for your industry, and 90 days of dedicated support to ensure success.',
    },
    {
      question: 'Is our data secure with Sage AI?',
      answer:
        'Yes. Enterprise-grade security with SOC2 compliance, end-to-end encryption, SSO integration, and granular permissions ensure your data stays protected.',
    },
    {
      question: 'Can we integrate with our existing systems?',
      answer:
        'Absolutely. Sage AI integrates with 100+ enterprise systems including Salesforce, SAP, SharePoint, Slack, Teams, and custom APIs.',
    },
  ]

  // Function to determine current plan
  const getCurrentPlan = () => {
    if (!userPlanData) return 'free'

    if (
      userPlanData.status === 1 &&
      userPlanData.plan?.subscription_status === 'active'
    ) {
      if (
        userPlanData.plan.description.toLowerCase() ===
        'enterprise plan subscription'
      ) {
        return 'enterprise'
      } else if (
        userPlanData.plan.description.toLowerCase() ===
        'professional plan subscription'
      ) {
        return 'professional'
      }
    }

    return 'free'
  }

  const currentPlan = getCurrentPlan()

  return (
    <>
      {/* Structured Data - JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: 'SAGE News Intelligence Platform',
            description:
              'AI-powered news intelligence platform for enterprises and professionals',
            brand: {
              '@type': 'Brand',
              name: 'SpiderX.AI',
            },
            offers: [
              {
                '@type': 'Offer',
                name: 'Free Plan',
                price: '0',
                priceCurrency: 'INR',
                availability: 'https://schema.org/InStock',
                validFrom: new Date().toISOString(),
              },
              {
                '@type': 'Offer',
                name: 'Professional Plan',
                price: '2950',
                priceCurrency: 'INR',
                availability: 'https://schema.org/InStock',
                priceValidUntil: '2024-12-31',
                validFrom: new Date().toISOString(),
              },
              {
                '@type': 'Offer',
                name: 'Enterprise Plan',
                price: '4950',
                priceCurrency: 'INR',
                availability: 'https://schema.org/InStock',
                priceValidUntil: '2024-12-31',
                validFrom: new Date().toISOString(),
              },
            ],
          }),
        }}
      />

      <Layout isDarkTheme={true}>
        {/* Hero Section */}
        <section className="text-center pt-4 md:pt-10 lg:pt-16 mb-5 md:mb-10">
          <div className="pb-10 lg:pb-16">
            <div className="flex justify-center items-center gap-1 sm:gap-4 lg:gap-8 mb-5 lg:mb-10 flex-wrap">
              <div className="flex items-center gap-2 text-gray-400 text-lg font-normal">
                <span>Trusted by Fund Managers</span>
                <span className="text-cyan-400 font-semibold text-xl">
                  500+
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-lg">
                <span>Premium News Sources</span>
                <span className="text-cyan-400 font-semibold text-xl">
                  100+
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-lg">
                <span>Time Saved</span>
                <span className="text-cyan-400 font-semibold text-xl">
                  23 hrs per Week
                </span>
              </div>
            </div>

            <div className="inline-flex items-center bg-gradient-to-r from-[#B8E6F8] to-[#5E8EFF] text-black px-8 py-4 rounded-full font-semibold mb-6">
              <span className="mr-3">⏰</span>
              Limited Time: 2 Months FREE on Annual Plans (Ends September 15th)
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-5 text-white">
            Stop Losing Money on Slow Research
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Enterprise teams waste 23 hours/week on average searching for
            information. Sage AI eliminates this waste and transforms your
            teams productivity.
          </p>
        </section>

        {/* ROI Section */}
        <section className="bg-gray-900 rounded-3xl p-6 mb-8 lg:p-12 lg:mb-16 text-center border border-white/10">
          <h2 className="text-3xl font-semibold mb-8 text-[#6ABCFF]">
            Your ROI with Sage AI
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                ₹12L+
              </div>
              <div className="text-gray-400">Annual Savings per Team</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                240%
              </div>
              <div className="text-gray-400">ROI in First Year</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                2 Weeks
              </div>
              <div className="text-gray-400">Payback Period</div>
            </div>
          </div>
          <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-5">
            <strong>Calculation:</strong> Average team saves 23 hrs/week ×
            ₹2,500/hr × 52 weeks = ₹29.9L saved annually. Investment:
            ₹59,400/year. Net ROI: ₹24L+ profit.
          </div>
        </section>

        {/* Pricing Section */}
        <section className="mb-8 lg:mb-16">
          <div className="text-center mb-5 md:mb-10">
            <h2 className="text-4xl font-semibold mb-4 text-white">
              Choose Your Plan
            </h2>
            <p className="text-gray-400 text-lg">
              Start free, grow with professional, or scale with enterprise -
              both deliver immediate ROI
            </p>
          </div>

          <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 max-w-7xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white/5 border-white/10 backdrop-blur-lg border rounded-3xl p-8 hover:transform hover:-translate-y-2 transition-all duration-300 flex flex-col h-full">
              <div className="flex-grow">
                <div className="text-2xl font-semibold mb-3 text-white">
                  Free
                </div>
                <div className="text-gray-400 mb-6">
                  Perfect for individuals getting started with AI research
                </div>

                <div className="mb-8">
                  <div className="text-4xl lg:text-5xl font-bold text-[#6ABCFF] mb-1">
                    <span className="text-2xl lg:text-3xl align-top">₹</span>0
                  </div>
                  <div className="text-gray-400">forever</div>
                  <div className="text-[#5E8EFF] font-semibold text-sm mt-1">
                    Always Free
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.free.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-[#5E8EFF] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <span className="text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {currentPlan === 'free' && (
                <div
                  onClick={() => router.push('/subscription')}
                  className="w-full bg-green-400/10 border border-green-400/30 border py-4 rounded-xl text-lg font-semibold text-center mt-auto cursor-pointer"
                >
                  Current Plan
                </div>
              )}
            </div>

            {/* Professional Plan */}
            <div className="bg-white/5 border-white/10 backdrop-blur-lg border rounded-3xl p-8 hover:transform hover:-translate-y-2 transition-all duration-300 flex flex-col h-full">
              <div className="flex-grow">
                <div className="text-2xl font-semibold mb-3 text-white">
                  Professional
                </div>
                <div className="text-gray-400 mb-6">
                  Perfect for growing teams ready to accelerate research
                </div>

                <div className="mb-8">
                  <div className="text-4xl lg:text-5xl font-bold text-[#6ABCFF] mb-1">
                    <span className="text-2xl lg:text-3xl align-top">₹</span>
                    2,950
                  </div>
                  <div className="text-gray-400">per month</div>
                  <div className="text-[#5E8EFF] font-semibold text-sm mt-1">
                    Per User
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.professional.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-[#5E8EFF] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <span className="text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {currentPlan === 'professional' ? (
                <div
                  onClick={() => router.push('/subscription')}
                  className="w-full bg-green-400/10 border border-green-400/30 border py-4 rounded-xl text-lg font-semibold text-center mt-auto cursor-pointer"
                >
                  Current Plan
                </div>
              ) : currentPlan === 'free' ? (
                <button
                  className="w-full bg-white/10 border-white/20 text-white border py-4 rounded-xl text-lg font-semibold hover:transform hover:-translate-y-1 transition-all duration-300 mt-auto"
                  onClick={() => handleSubscribeClick('professional')}
                >
                  Subscribe Now
                </button>
              ) : null}
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white/5 backdrop-blur-lg border-2 border-[#6ABCFF] rounded-3xl p-8 relative transform flex flex-col h-full">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                Most Popular
              </div>

              <div className="flex-grow">
                <div className="text-2xl font-semibold mb-3 text-white">
                  Enterprise
                </div>
                <div className="text-gray-400 mb-6">
                  For organizations serious about AI-powered intelligence
                </div>

                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl text-gray-500 line-through">
                      ₹5,940
                    </span>
                  </div>
                  <div className="text-4xl lg:text-5xl font-bold text-[#6ABCFF] mb-1">
                    <span className="text-2xl lg:text-3xl align-top">₹</span>
                    4,950
                  </div>
                  <div className="text-gray-400">per month</div>
                  <div className="text-[#5E8EFF] font-semibold text-sm mt-1">
                    Per User
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.enterprise.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-[#5E8EFF] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <span className="text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {currentPlan === 'enterprise' ? (
                <div
                  onClick={() => router.push('/subscription')}
                  className="w-full bg-green-400/10 border border-green-400/30 border py-4 rounded-xl text-lg font-semibold text-center mt-auto cursor-pointer"
                >
                  Current Plan
                </div>
              ) : currentPlan === 'free' ? (
                <button
                  className="w-full bg-gradient-to-r from-[#B8E6F8] to-[#5E8EFF] text-black py-4 rounded-xl text-lg font-semibold hover:transform hover:-translate-y-1 transition-all duration-300 shadow-lg mt-auto"
                  onClick={() => handleSubscribeClick('enterprise')}
                >
                  Subscribe Now
                </button>
              ) : null}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-8 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-5 lg:mb-10 text-white">
            Trusted by Industry Leaders
          </h2>
          <div className="grid md:grid-cols-3 gap-4 lg:gap-8">
                         {[
               {
                 quote:
                   'Sage AI reduced our research time from 4 hours to 15 minutes per project. The ROI was immediate and our team\'s productivity skyrocketed.',
                 author: 'Suresh Kumar',
                 role: 'VP Research, TechCorp India',
                 initials: 'SK',
               },
               {
                 quote:
                   'We were drowning in data. Sage AI transformed chaos into actionable insights. Best investment we\'ve made for our innovation team.',
                 author: 'Priya Mehta',
                 role: 'Head of Innovation, Global Industries',
                 initials: 'PM',
               },
               {
                 quote:
                   'The voice AI feature is a game-changer. Our field teams can now access critical information hands-free, improving both speed and safety.',
                 author: 'Rajesh Gupta',
                 role: 'Operations Director, Manufacturing Ltd',
                 initials: 'RG',
               },
             ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-900 border-white/10 border rounded-2xl p-8"
              >
                                 <div className="text-md mb-5 text-gray-300">
                   &ldquo;{testimonial.quote}&rdquo;
                 </div>
                <div className="flex items-start gap-4">
                  <div className="min-w-10 min-h-10 bg-gradient-to-r from-[#B8E6F8] to-[#5E8EFF] rounded-full flex items-center justify-center font-bold text-white">
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-white">
                      {testimonial.author}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-8 lg:mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-5 lg:mb-10 text-white">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3 lg:space-y-5">
            {faqData.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-900 border-white/10 border rounded-xl overflow-hidden"
              >
                <div
                  className="px-5 py-4 cursor-pointer hover:bg-white/10 transition-colors flex justify-between items-center font-normal text-lg text-white"
                  onClick={() => toggleFaq(index)}
                >
                  {faq.question}
                  <span className="text-2xl">
                    {activeFaq === index ? '−' : '+'}
                  </span>
                </div>
                {activeFaq === index && (
                  <div className="px-5 pb-5 pt-2 text-gray-400">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center px-4 py-10 lg:py-20 bg-gray-900 rounded-3xl mb-8 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-5 text-white">
            Ready to Transform Your Research?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Join 500+ enterprises saving millions with AI-powered intelligence
          </p>

          <div className="flex justify-center gap-5 flex-wrap">
            <button
              onClick={() => handleSubscribeClick('enterprise')}
              className="bg-gradient-to-r from-[#B8E6F8] to-[#5E8EFF] text-black px-10 py-4 rounded-full text-lg font-medium hover:transform hover:-translate-y-1 transition-all duration-300"
            >
              Subscribe Now
            </button>
            <button
              onClick={demoCall}
              className="bg-white/10 border-white/30 text-white border px-10 py-4 rounded-full text-lg font-medium hover:transform hover:-translate-y-1 transition-all duration-300"
            >
              Schedule Demo Call
            </button>
          </div>

          <div className="mt-8 text-gray-400 text-sm gap-5">
            <span className="block mb-3">
              🛡️ 30-day money-back guarantee • No setup fees • Cancel anytime
            </span>
            <span>🚀 Dedicated success manager included</span>
          </div>
        </section>
      </Layout>
    </>
  )
}

export default PricingPage 