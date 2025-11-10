
import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './icons';

const Footer: React.FC = () => {
  const footerLinks = {
    'Product': [
      { name: 'Features', href: '/#features' },
      { name: 'Pricing', href: '/pricing' },
    ],
    'Legal': [
      { name: 'Privacy Policy', href: '/privacy-policy' },
      { name: 'Terms of Service', href: '/terms-of-service' },
    ],
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <Logo className="h-10 w-auto text-gray-800" />
            <p className="text-gray-500 text-base">
              Your personalized AI-powered learning journey starts here.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Product</h3>
              <ul className="mt-4 space-y-4">
                {footerLinks.Product.map((item) => (
                  <li key={item.name}>
                    <Link to={item.href} className="text-base text-gray-500 hover:text-gray-900">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
              <ul className="mt-4 space-y-4">
                {footerLinks.Legal.map((item) => (
                  <li key={item.name}>
                    <Link to={item.href} className="text-base text-gray-500 hover:text-gray-900">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 xl:text-center">&copy; {new Date().getFullYear()} Shyftcut. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;