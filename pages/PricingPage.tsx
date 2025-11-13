import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { CheckCircleIcon } from '../components/icons';
import { motion } from 'framer-motion';
import Spinner from '../components/Spinner';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const tiers = [
  {
    name: 'Starter',
    priceId: null, // No checkout needed
    price: 'Free',
    frequency: 'Forever',
    description: 'Perfect for individuals starting a new skill.',
    features: [
      '1 AI-Generated Roadmap per month',
      'Access to Public Resources',
      'Community Support',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Pro',
    priceId: 'pro_trial',
    price: '$29',
    originalPrice: '$29',
    frequency: '/month',
    description: 'For serious learners and career shifters.',
    features: [
      '5 AI-Generated Roadmaps per month',
      'Advanced Progress Tracking',
      'Interactive Quizzes & Grading',
      'Priority Email Support',
    ],
    cta: 'Activate 1-Month Free Trial',
    mostPopular: true,
  },
  {
    name: 'Team',
    priceId: null,
    price: 'Contact Us',
    frequency: '',
    description: 'Equip your entire team with personalized learning paths.',
    features: [
      'Unlimited Roadmaps',
      'Team Progress Dashboard',
      'Custom Integrations',
      'Dedicated Account Manager',
    ],
    cta: 'Contact Sales',
  },
];

const PricingPage: React.FC = () => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePlanSelection = async (tier: typeof tiers[0]) => {
    setError(null);
    setSuccessMessage(null);

    if (tier.name === 'Team') {
      window.location.href = 'mailto:sales@shyftcut.com';
      return;
    }
    
    if (tier.name === 'Starter') {
        navigate(user ? '/dashboard' : '/auth');
        return;
    }

    if (tier.priceId === 'pro_trial') {
        if (!user) {
          navigate('/auth?redirect=/pricing');
          return;
        }

        setLoadingPlan(tier.name);
        try {
          const userRef = doc(db, 'users', user.uid);
          const trialEndDate = new Date();
          trialEndDate.setMonth(trialEndDate.getMonth() + 1);

          await updateDoc(userRef, {
            subscriptionRole: 'pro',
            trialEndsAt: trialEndDate,
          });

          setSuccessMessage('Your 1-month Pro trial has been activated! Redirecting...');
          setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err: any) {
          console.error("Error activating trial:", err);
          setError(err.message || 'Could not activate trial. Please try again.');
        } finally {
          setLoadingPlan(null);
        }
    }
  };


  return (
    <div className="gradient-primary min-h-screen">
      <Header />
      <main className="py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Limited Time Offer!</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-700">
              To celebrate our launch, all plans are 100% free for the first month. No credit card required.
            </p>
          </motion.div>
          {error && (
            <motion.div 
              className="glass-card p-4 mt-4 border-red-200 bg-red-50/80 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-center text-red-600">{error}</p>
            </motion.div>
          )}
          {successMessage && (
            <motion.div 
              className="glass-card p-4 mt-4 border-green-200 bg-green-50/80 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-center text-green-600">{successMessage}</p>
            </motion.div>
          )}
          <div className="mt-20 grid max-w-lg mx-auto gap-8 lg:max-w-none lg:grid-cols-3">
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex flex-col rounded-2xl shadow-xl border-2 ${tier.mostPopular ? 'border-transparent' : 'border-white/30 glass-card'}`}
              >
                {tier.mostPopular && (
                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary to-secondary animate-glow" style={{ filter: 'blur(8px)' }} />
                )}
                <div className={`relative flex flex-col rounded-2xl h-full ${tier.mostPopular ? 'glass-card bg-white/90' : 'bg-white/70 backdrop-blur-sm'}`}>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
                    {tier.mostPopular && (
                      <p className="absolute top-0 -translate-y-1/2 transform bg-gradient-to-r from-primary to-secondary px-4 py-1.5 text-xs font-bold text-white rounded-full shadow-lg shadow-primary/30 uppercase tracking-wider">Most Popular</p>
                    )}
                    <p className="mt-4 text-slate-600 font-medium">{tier.description}</p>
                    <div className="mt-6">
                      {tier.name === 'Pro' ? (
                        <div>
                            <span className="text-4xl font-bold tracking-tight text-gray-900">Free</span>
                            <span className="text-lg font-medium text-slate-600"> for 1 month</span>
                            <p className="text-sm text-slate-500 mt-1">Then {tier.originalPrice}{tier.frequency}</p>
                        </div>
                      ) : (
                         <p className="text-4xl font-bold tracking-tight text-gray-900">
                            {tier.price}
                            <span className="text-lg font-medium text-slate-600">{tier.frequency}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 p-8 border-t border-white/20">
                    <ul role="list" className="space-y-4">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30 mr-3">
                            <CheckCircleIcon className="h-4 w-4 text-white" aria-hidden="true" />
                          </div>
                          <p className="ml-1 text-base text-slate-700 font-medium">{feature}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-8 mt-auto">
                    <Button 
                      variant={tier.mostPopular ? 'primary' : 'glass-primary'} 
                      className="w-full" 
                      size="lg"
                      onClick={() => handlePlanSelection(tier)}
                      disabled={loadingPlan === tier.name}
                    >
                      {loadingPlan === tier.name ? <Spinner size="sm" /> : tier.cta}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage;
