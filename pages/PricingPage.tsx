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
    <div className="bg-slate-50">
      <Header />
      <main className="py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Limited Time Offer!</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              To celebrate our launch, all plans are 100% free for the first month. No credit card required.
            </p>
          </div>
          {error && <p className="text-center text-red-500 mt-4">{error}</p>}
          {successMessage && <p className="text-center text-green-600 mt-4">{successMessage}</p>}
          <div className="mt-20 grid max-w-lg mx-auto gap-8 lg:max-w-none lg:grid-cols-3">
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex flex-col rounded-2xl shadow-lg border ${tier.mostPopular ? 'border-transparent' : 'border-slate-200'}`}
              >
                {tier.mostPopular && (
                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary to-secondary animate-glow" style={{ filter: 'blur(6px)' }} />
                )}
                <div className="relative flex flex-col bg-white rounded-2xl h-full">
                  <div className="p-8">
                    <h3 className="text-2xl font-semibold text-slate-900">{tier.name}</h3>
                    {tier.mostPopular && (
                      <p className="absolute top-0 -translate-y-1/2 transform bg-gradient-to-r from-primary to-secondary px-3 py-1 text-sm font-semibold text-white rounded-full shadow-md">Most Popular</p>
                    )}
                    <p className="mt-4 text-slate-500">{tier.description}</p>
                    <div className="mt-6">
                      {tier.name === 'Pro' ? (
                        <div>
                            <span className="text-4xl font-bold tracking-tight text-slate-900">Free</span>
                            <span className="text-lg font-medium text-slate-500"> for 1 month</span>
                            <p className="text-sm text-slate-400 mt-1">Then {tier.originalPrice}{tier.frequency}</p>
                        </div>
                      ) : (
                         <p className="text-4xl font-bold tracking-tight text-slate-900">
                            {tier.price}
                            <span className="text-lg font-medium text-slate-500">{tier.frequency}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 p-8 border-t border-slate-200">
                    <ul role="list" className="space-y-4">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start">
                          <div className="flex-shrink-0">
                            <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
                          </div>
                          <p className="ml-3 text-base text-slate-700">{feature}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-8 mt-auto">
                    <Button 
                      variant={tier.mostPopular ? 'primary' : 'outline'} 
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
