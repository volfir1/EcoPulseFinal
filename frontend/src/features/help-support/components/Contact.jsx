import React from 'react';
import { Mail, Phone, MessageCircle } from 'lucide-react';

const ContactSection = () => {
  return (
    <div className="max-w-4xl mx-auto mt-16">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <Mail className="mx-auto mb-4 text-green-600" size={24} />
          <h3 className="font-semibold mb-2">Email Support</h3>
          <p className="text-gray-600">ecoplusesupport@gmail.com</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <Phone className="mx-auto mb-4 text-green-600" size={24} />
          <h3 className="font-semibold mb-2">Phone Support</h3>
          <p className="text-gray-600">+1 (555) 123-4567</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <MessageCircle className="mx-auto mb-4 text-green-600" size={24} />
          <h3 className="font-semibold mb-2">Live Chat</h3>
          <p className="text-gray-600">Available 24/7</p>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;