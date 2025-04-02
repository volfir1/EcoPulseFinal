import React from 'react';
import { AppIcon, theme } from '@shared/index';

const Footer = ({ showTerms = true }) => {
  const { primary, text } = theme.palette;
  
  const socialLinks = [
    { name: 'github', href: '#', icon: 'github' },
    { name: 'twitter', href: '#', icon: 'twitter' },
    { name: 'linkedin', href: '#', icon: 'linkedin' }
  ];

  const footerLinks = [
    { name: 'About', href: '#' },
    { name: 'Features', href: '#' },
    { name: 'Contact', href: '#' },
    { name: 'Help', href: '#' }
  ];

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="container mx-auto px-6 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4" style={{ color: primary.main }}>
              EcoPulse
            </h3>
            <p className="text-gray-600 mb-4">
              Revolutionizing sustainable energy management through innovative solutions.
            </p>
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map(social => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <AppIcon name={social.icon} size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {footerLinks.map(link => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-600 hover:text-primary-600 transition-colors"
                    style={{ '--tw-text-opacity': 1, '--hover-color': primary.main }}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-1">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
              Contact Us
            </h4>
            <div className="space-y-3">
              <p className="flex items-center text-gray-600">
                <AppIcon name="location" type="tool" className="mr-2" />
                123 Energy Street, NY 10001
              </p>
              <p className="flex items-center text-gray-600">
                <AppIcon name="email" className="mr-2" />
                contact@ecopulse.com
              </p>
              <p className="flex items-center text-gray-600">
                <AppIcon name="phone" className="mr-2" />
                +1 (555) 123-4567
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section with Terms */}
        {showTerms && (
          <div className="border-t border-gray-200 pt-8">
            <p className="text-center text-gray-500 text-sm">
              © {new Date().getFullYear()} EcoPulse. All rights reserved. By using this service, you agree to our{' '}
              {/* <a 
                href="#" 
                className="text-primary-600 hover:underline"
                style={{ color: primary.main }}
              >
                Terms of Service
              </a> */}
              {' '}and{' '}
              {/* <a 
                href="#" 
                className="text-primary-600 hover:underline"
                style={{ color: primary.main }}
              >
                Privacy Policy
              </a> */}
              .
            </p>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;