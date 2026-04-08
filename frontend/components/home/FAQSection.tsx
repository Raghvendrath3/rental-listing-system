'use client';

import { useState } from 'react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Is it free to use RentalHub?',
      answer: 'Yes, creating an account and browsing listings is completely free. For landlords, we offer flexible pricing options for premium features.',
    },
    {
      question: 'How do I verify my identity?',
      answer: 'We verify users through email confirmation and optional ID verification. This ensures a safe community for all users.',
    },
    {
      question: 'Can I list multiple properties?',
      answer: 'Absolutely! You can create and manage as many listings as you need. Upgrade to our Pro plan for advanced analytics and tools.',
    },
    {
      question: 'What if I have an issue with a listing or user?',
      answer: 'Our 24/7 support team is ready to help. Use the report feature on any listing or contact us directly through the help center.',
    },
    {
      question: 'How do I become a verified landlord?',
      answer: 'Simply complete the landlord registration process, verify your email, and provide property details. Verification usually takes 24-48 hours.',
    },
    {
      question: 'Is my personal information secure?',
      answer: 'Yes, we use industry-standard encryption and security measures to protect your data. Your privacy is our top priority.',
    },
  ];

  return (
    <section className="py-20 bg-slate-50 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-slate-600">
            Find answers to common questions about RentalHub
          </p>
        </div>

        {/* FAQ items */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
              >
                <h3 className="font-semibold text-slate-900 text-lg">
                  {faq.question}
                </h3>
                <span
                  className={`text-2xl text-blue-600 transition-transform ${
                    openIndex === idx ? 'rotate-180' : ''
                  }`}
                >
                  ↓
                </span>
              </button>

              {openIndex === idx && (
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                  <p className="text-slate-700 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
