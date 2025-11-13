
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-slate-50">
      <Header />
      <main className="py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-slate-600"
          >
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Privacy Policy for Shyftcut</h1>
            <p className="text-xl text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
            
            <div className="space-y-6">
                <p>Welcome to Shyftcut. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.</p>

                <h2 className="text-3xl font-bold text-slate-900 mt-12 mb-4">1. Information We Collect</h2>
                <p>We may collect information about you in a variety of ways. The information we may collect includes:</p>
                <ul className="list-disc space-y-2 pl-5">
                  <li><strong className="font-semibold text-slate-800">Personal Data:</strong> Personally identifiable information, such as your name, email address, that you voluntarily give to us when you register with the application.</li>
                  <li><strong className="font-semibold text-slate-800">Derivative Data:</strong> Information our servers automatically collect when you access the application, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the application.</li>
                  <li><strong className="font-semibold text-slate-800">User Preferences:</strong> Information related to your learning goals, experience level, and preferences that you provide to generate your learning roadmaps.</li>
                </ul>

                <h2 className="text-3xl font-bold text-slate-900 mt-12 mb-4">2. Use of Your Information</h2>
                <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you to:</p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>Create and manage your account.</li>
                  <li>Generate personalized learning roadmaps.</li>
                  <li>Email you regarding your account or order.</li>
                  <li>Monitor and analyze usage and trends to improve your experience with the application.</li>
                  <li>Notify you of updates to the application.</li>
                </ul>

                <h2 className="text-3xl font-bold text-slate-900 mt-12 mb-4">3. Disclosure of Your Information</h2>
                <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
                <ul className="list-disc space-y-2 pl-5">
                  <li><strong className="font-semibold text-slate-800">By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
                  <li><strong className="font-semibold text-slate-800">Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, and customer service.</li>
                </ul>

                <h2 className="text-3xl font-bold text-slate-900 mt-12 mb-4">4. Security of Your Information</h2>
                <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>

                <h2 className="text-3xl font-bold text-slate-900 mt-12 mb-4">5. Contact Us</h2>
                <p>If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:privacy@shyftcut.com" className="text-primary hover:underline">privacy@shyftcut.com</a></p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
