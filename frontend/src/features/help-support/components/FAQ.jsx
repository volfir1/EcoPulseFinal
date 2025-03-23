import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQSection = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  // FAQ data
  const faqs = [
    {
      category: 'Account Management',
      items: [
        { question: 'How do I reset my password?', 
          answer: 'To reset your password, click on the "Forgot Password" link on the login page. You will receive an email with instructions to create a new password. For security reasons, the link expires after 24 hours.' },
        { question: 'How do I update my billing information?', 
          answer: 'Navigate to Settings > Billing & Payments > Payment Methods. Here you can add, remove, or update your payment information. All data is encrypted and securely stored.' }
      ]
    },
    {
      category: 'Billing & Payments',
      items: [
        { question: 'When will I be billed?', 
          answer: 'Billing occurs on the same date each month as your initial subscription. You can view your next billing date in your account settings under Billing & Payments.' },
        { question: 'What payment methods do you accept?', 
          answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for business accounts.' }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {faqs.map((category, categoryIndex) => (
        <div key={categoryIndex} className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">{category.category}</h2>
          <div className="space-y-4">
            {category.items.map((faq, faqIndex) => (
              <div
                key={faqIndex}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-green-50"
                  onClick={() => setExpandedFaq(expandedFaq === `${categoryIndex}-${faqIndex}` ? null : `${categoryIndex}-${faqIndex}`)}
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {expandedFaq === `${categoryIndex}-${faqIndex}` ? (
                    <ChevronUp className="text-gray-400" size={20} />
                  ) : (
                    <ChevronDown className="text-gray-400" size={20} />
                  )}
                </button>
                {expandedFaq === `${categoryIndex}-${faqIndex}` && (
                  <div className="px-6 py-4 bg-green-50 border-t border-gray-200">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQSection;