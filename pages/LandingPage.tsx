
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { ArrowRightIcon, SparklesIcon, CheckCircleIcon, LightBulbIcon, ChartPieIcon, PlusIcon, MinusIcon } from '../components/icons';
import TicTacToe from '../components/TicTacToe';

const features = [
  { name: 'AI-Powered Personalization', description: 'Get a learning path tailored to your specific career goals, experience, and learning style.' },
  { name: 'Up-to-Date Resources', description: 'Leveraging Google Search, our AI finds the latest and most relevant courses, articles, and projects.' },
  { name: 'Structured Milestones', description: 'Break down your journey into manageable, weekly milestones with clear tasks and goals.' },
  { name: 'Progress Tracking', description: 'Visualize your progress and stay motivated with our interactive dashboard.' },
  { name: 'Localized for MENA', description: 'Content and support tailored for learners in Egypt and the GCC region.' },
  { name: 'Flexible Scheduling', description: 'Adapt your learning plan based on your weekly availability, from 5 to 30+ hours.' },
];

const pricingTiers = [
    { name: 'Starter', price: 'Free', frequency: 'Forever', features: ['1 AI-Generated Roadmap per month', 'Community Support'], cta: 'Get Started' },
    { 
      name: 'Pro', 
      price: 'Free', 
      frequency: 'for 1 month', 
      originalPrice: 'Then $29/month',
      features: ['5 Roadmaps/month', 'Interactive Quizzes', 'Advanced Tracking', 'Priority Support'], 
      cta: 'Activate Free Trial', 
      mostPopular: true 
    },
    { name: 'Team', price: 'Contact', features: ['Unlimited Roadmaps', 'Team Dashboard', 'Custom Integrations'], cta: 'Contact Sales' },
  ];
  
const faqs = [
    {
      question: 'How does the AI generate a roadmap?',
      answer: 'Our AI analyzes your career goals, experience level, and learning preferences. It then uses this information to search for the most relevant and up-to-date resources online, structuring them into a coherent, week-by-week learning plan with clear milestones and tasks.'
    },
    {
      question: 'Is the 1-month trial really free?',
      answer: 'Absolutely! For a limited time, you get full access to our Pro plan for one month, completely free. No credit card is required to get started. You can generate multiple roadmaps and use all premium features.'
    },
    {
      question: 'What happens after my free trial ends?',
      answer: 'After one month, your account will automatically transition to our free Starter plan. You\'ll keep any roadmaps you\'ve generated, but will be limited to the features of the free plan. We will introduce paid plans with Paddle in the future to allow you to continue with Pro features.'
    },
    {
      question: 'Can I use Shyftcut for any career field?',
      answer: 'Yes! While we have pre-defined popular tracks, you can select "Other" and specify any field you want. Our AI is designed to be flexible and can generate a learning path for virtually any skill or career goal.'
    }
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const heroContainerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const heroItemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };


  return (
    <div className="bg-slate-50 text-slate-800">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 animate-background-pan" />
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20 lg:py-0 lg:min-h-[calc(100vh-5rem)]">
                    <motion.div
                        variants={heroContainerVariants}
                        initial="hidden"
                        animate="show"
                        className="flex flex-col justify-center text-center lg:text-left z-10"
                    >
                        <motion.h1 variants={heroItemVariants} className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl [text-shadow:1px_1px_2px_rgba(0,0,0,0.1)]">
                        Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">AI Mentor</span> for the Future of Work
                        </motion.h1>
                        <motion.p variants={heroItemVariants} className="mt-6 text-lg sm:text-xl leading-8 text-slate-600 max-w-2xl mx-auto lg:mx-0">
                        Stop guessing your next career move. Shyftcut generates personalized, step-by-step learning roadmaps to help you master new skills and achieve your goals faster.
                        </motion.p>
                        <motion.div variants={heroItemVariants} className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                        <Button
                          size="lg"
                          onClick={() => navigate('/auth')}
                          className="w-full sm:w-auto shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all"
                        >
                            Create Your Free Roadmap
                            <ArrowRightIcon className="w-5 h-5 ml-2" />
                        </Button>
                         <Button
                           size="lg"
                           variant="ghost"
                           onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                           className="w-full sm:w-auto"
                         >
                            How it works
                        </Button>
                        </motion.div>
                    </motion.div>
                    <motion.div
                        className="flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        <TicTacToe />
                    </motion.div>
                </div>
            </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 sm:py-32 bg-slate-100/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        Get Your Personalized Roadmap in 3 Easy Steps
                    </h2>
                    <p className="mt-4 text-lg leading-8 text-slate-600">
                        From goal to action plan in minutes.
                    </p>
                </motion.div>
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                {/* Step 1 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg mx-auto">
                    <LightBulbIcon className="h-8 w-8 text-secondary" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900">1. Share Your Goal</h3>
                    <p className="mt-2 text-slate-600">Tell our AI what you want to learn, your current skill level, and how much time you can commit.</p>
                </motion.div>
                {/* Step 2 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg mx-auto">
                    <SparklesIcon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900">2. Get Your AI Roadmap</h3>
                    <p className="mt-2 text-slate-600">Receive a custom, step-by-step learning plan with curated resources, projects, and quizzes.</p>
                </motion.div>
                {/* Step 3 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg mx-auto">
                    <ChartPieIcon className="h-8 w-8 text-secondary" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900">3. Track Your Progress</h3>
                    <p className="mt-2 text-slate-600">Follow the plan, mark tasks as complete, and watch your skills grow on your personal dashboard.</p>
                </motion.div>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h2 className="text-base font-semibold leading-7 text-primary">Everything You Need</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Learn Smarter, Not Harder
              </p>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                Shyftcut provides the tools and structure to accelerate your learning journey.
              </p>
            </motion.div>
            <div className="mt-20 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div 
                  key={feature.name} 
                  className="relative flex flex-col p-8 rounded-2xl bg-white/50 border border-slate-200/80 transition-all duration-300 hover:shadow-2xl hover:bg-white hover:-translate-y-2 group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <dt className="text-base font-semibold leading-7 text-slate-900">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-white shadow-lg">
                      <SparklesIcon className="h-6 w-6" />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-slate-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Pricing Preview Section */}
        <section className="py-24 sm:py-32 bg-slate-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Start Your Pro Journey for Free
              </h2>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                To celebrate our launch, get 1 month of Pro on us. No credit card required.
              </p>
            </div>
            <div className="mt-20 grid max-w-lg mx-auto gap-8 lg:max-w-none lg:grid-cols-3">
              {pricingTiers.map((tier, index) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative flex flex-col rounded-2xl shadow-lg border ${tier.mostPopular ? 'border-transparent' : 'border-slate-200'}`}
                >
                  {tier.mostPopular && (
                      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary to-secondary animate-glow" style={{ filter: 'blur(6px)' }} />
                  )}
                  <div className="relative flex flex-col bg-white rounded-2xl h-full p-8">
                    <h3 className="text-2xl font-semibold text-slate-900">{tier.name}</h3>
                    {tier.mostPopular && (
                      <p className="absolute top-0 -translate-y-1/2 transform bg-gradient-to-r from-primary to-secondary px-3 py-1 text-sm font-semibold text-white rounded-full shadow-md">Most Popular</p>
                    )}
                    <div className="mt-6">
                      <p className="text-4xl font-bold tracking-tight text-slate-900">
                        {tier.price}
                        {tier.frequency && <span className="text-lg font-medium text-slate-500 ml-1">{tier.frequency}</span>}
                      </p>
                      {tier.originalPrice && (
                        <p className="text-sm text-slate-400 mt-1">{tier.originalPrice}</p>
                      )}
                    </div>
                    <ul role="list" className="mt-8 space-y-4 text-slate-700">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start">
                          <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mr-3" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-8">
                      <Button variant={tier.mostPopular ? 'primary' : 'outline'} className="w-full" size="lg" onClick={() => navigate('/pricing')}>
                        {tier.cta}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
             <div className="mt-16 text-center">
                <Button size="lg" variant="ghost" onClick={() => navigate('/pricing')}>
                    View all plans & features
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                 </Button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Have questions? We've got answers. If you have any other questions, feel free to reach out.
              </p>
            </motion.div>
            <div className="mt-12 space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white/60 border border-slate-200/80 rounded-lg">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="flex items-center justify-between w-full p-6 text-left"
                  >
                    <span className="text-lg font-semibold text-slate-800">{faq.question}</span>
                    <span className="ml-6 flex-shrink-0">
                      {openFaq === index ? <MinusIcon className="h-6 w-6 text-primary" /> : <PlusIcon className="h-6 w-6 text-slate-500" />}
                    </span>
                  </button>
                  <AnimatePresence>
                    {openFaq === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 text-slate-600">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
