
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './icons';

const Footer: React.FC = () => {
  const location = useLocation();
  const isBlogPage = location.pathname.startsWith('/blog');

  const footerLinks = {
    'Product': [
      { name: 'Features', href: '/#features' },
      { name: 'Pricing', href: '/pricing' },
    ],
    'Company': [
      { name: 'Blog', href: '/blog' },
    ],
    'Legal': [
      { name: 'Privacy Policy', href: '/privacy-policy' },
      { name: 'Terms of Service', href: '/terms-of-service' },
    ],
  };
  
  const baseClasses = {
    footer: isBlogPage ? 'bg-slate-900 border-t border-slate-800' : 'bg-gray-50 border-t border-gray-200',
    descriptionText: isBlogPage ? 'text-slate-400 text-base' : 'text-gray-500 text-base',
    headingText: isBlogPage ? 'text-sm font-semibold text-slate-500 tracking-wider uppercase' : 'text-sm font-semibold text-gray-400 tracking-wider uppercase',
    linkText: isBlogPage ? 'text-base text-slate-400 hover:text-white' : 'text-base text-gray-500 hover:text-gray-900',
    divider: isBlogPage ? 'mt-12 border-t border-slate-800 pt-8' : 'mt-12 border-t border-gray-200 pt-8',
    copyrightText: isBlogPage ? 'text-base text-slate-500 xl:text-center' : 'text-base text-gray-400 xl:text-center',
  }

  return (
    <footer className={baseClasses.footer}>
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-4 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <Logo className="h-10 w-auto" />
            <p className={baseClasses.descriptionText}>
              Your personalized AI-powered learning journey starts here.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-3 md:grid-cols-3">
            <div>
              <h3 className={baseClasses.headingText}>Product</h3>
              <ul className="mt-4 space-y-4">
                {footerLinks.Product.map((item) => (
                  <li key={item.name}>
                    <Link to={item.href} className={baseClasses.linkText}>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-12 md:mt-0">
              <h3 className={baseClasses.headingText}>Company</h3>
              <ul className="mt-4 space-y-4">
                {footerLinks.Company.map((item) => (
                  <li key={item.name}>
                    <Link to={item.href} className={baseClasses.linkText}>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-12 md:mt-0">
              <h3 className={baseClasses.headingText}>Legal</h3>
              <ul className="mt-4 space-y-4">
                {footerLinks.Legal.map((item) => (
                  <li key={item.name}>
                    <Link to={item.href} className={baseClasses.linkText}>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className={baseClasses.divider}>
          <p className={baseClasses.copyrightText}>&copy; {new Date().getFullYear()} Shyftcut. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
