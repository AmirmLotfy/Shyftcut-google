
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const TermsOfServicePage: React.FC = () => {
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
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Terms of Service for Shyftcut</h1>
            <p className="text-xl text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="space-y-6">
                <p>Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Shyftcut application (the "Service") operated by us.</p>
                <p>Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.</p>

                <h2 className="text-3xl font-bold text-slate-900 mt-12 mb-4">1. Accounts</h2>
                <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
                <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.</p>

                <h2 className="text-3xl font-bold text-slate-900 mt-12 mb-4">2. Intellectual Property</h2>
                <p>The Service and its original content, features, and functionality are and will remain the exclusive property of Shyftcut and its licensors. The Service is protected by copyright, trademark, and other laws of both the local and foreign countries.</p>

                <h2 className="text-3xl font-bold text-slate-900 mt-12 mb-4">3. Generated Content</h2>
                <p>Our Service allows you to generate learning roadmaps ("Content"). You are responsible for the use of the Content. While we strive for accuracy, the AI-generated Content may contain inaccuracies or outdated information. You agree to use the Content at your own risk and verify any information before making career or educational decisions.</p>

                <h2 className="text-3xl font-bold text-slate-900 mt-12 mb-4">4. Termination</h2>
                <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                <p>Upon termination, your right to use the Service will immediately cease.</p>

                <h2 className="text-3xl font-bold text-slate-900 mt-12 mb-4">5. Limitation of Liability</h2>
                <p>In no event shall Shyftcut, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

                <h2 className="text-3xl font-bold text-slate-900 mt-12 mb-4">6. Changes</h2>
                <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
                
                <h2 className="text-3xl font-bold text-slate-900 mt-12 mb-4">7. Contact Us</h2>
                <p>If you have any questions about these Terms, please contact us at: <a href="mailto:terms@shyftcut.com" className="text-primary hover:underline">terms@shyftcut.com</a></p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfServicePage;
