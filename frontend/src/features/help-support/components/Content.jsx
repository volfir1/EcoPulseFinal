import React, { useState } from 'react';
import { Search } from 'lucide-react';
import FAQSection from './FAQ';
import SubmitTicketSection from './SubmitTicket';
import ContactSection from './Contact';

const HelpAndSupport = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('faq');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-yellow-500 text-white">
        <div className="container mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold text-center mb-4">How can we help you?</h1>
          {/* <div className="max-w-2xl mx-auto relative">
            <input
              type="text"
              className="w-full p-4 pr-12 rounded-lg border-2 border-transparent focus:border-green-300 focus:ring-2 focus:ring-green-200 text-gray-900"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-4 top-4 text-gray-400" size={20} />
          </div> */}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-12 space-x-4">
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'faq'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            FAQ
          </button>
          <button
            onClick={() => setActiveTab('ticket')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'ticket'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Submit a Ticket
          </button>
        </div>

        {activeTab === 'faq' ? (
          <FAQSection />
        ) : (
          <SubmitTicketSection />
        )}

        {/* Contact Information */}
        <ContactSection />
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-white">
        <div className="container mx-auto px-6 py-8">
          <p className="text-center text-gray-500 text-sm">
            By using this support page, you agree to our{' '}
            <a href="#" className="text-green-600 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-green-600 hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HelpAndSupport;