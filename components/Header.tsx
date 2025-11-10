import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Logo, MenuIcon, XIcon, SparklesIcon, CurrencyDollarIcon,
  ChartPieIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon
} from './icons';
import Button from './Button';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

const Avatar: React.FC<{ name?: string | null }> = ({ name }) => {
  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || '...';

  return (
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
      {initials}
    </div>
  );
};

const MobileMenu: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    onClose();
    await signOut(auth);
    navigate('/');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 25 } },
  };

  const navLinks = [
    { name: 'Features', href: '/#features', icon: SparklesIcon },
    { name: 'Pricing', href: '/pricing', icon: CurrencyDollarIcon },
  ];

  const userNavLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: ChartPieIcon },
    { name: 'New Roadmap', href: '/app/wizard', icon: SparklesIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl rounded-t-3xl shadow-2xl z-50 max-h-[85vh] flex flex-col"
            aria-modal="true"
            role="dialog"
          >
            <div className="flex-shrink-0 p-4 border-b border-slate-200 flex items-center justify-between">
              <Logo className="h-8" />
              <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="Close menu">
                <XIcon className="w-6 h-6 text-slate-600" />
              </button>
            </div>
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="flex-1 overflow-y-auto"
            >
              {user && userProfile && (
                <motion.div variants={itemVariants} className="p-4 flex items-center gap-4 border-b border-slate-200">
                  <Avatar name={userProfile.name} />
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-800 truncate">{userProfile.name}</p>
                    <p className="text-sm text-slate-500 truncate">{userProfile.email}</p>
                  </div>
                </motion.div>
              )}

              <nav className="p-2 pb-4">
                {(user ? userNavLinks : navLinks).map((link) => (
                  <motion.div variants={itemVariants} key={link.name}>
                    <NavLink
                      to={link.href}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-4 px-4 py-3 rounded-lg text-lg font-medium transition-colors ${
                          isActive
                            ? 'bg-primary-100 text-primary'
                            : 'text-slate-700 hover:bg-slate-200/50'
                        }`
                      }
                    >
                      <link.icon className="w-6 h-6" />
                      {link.name}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>
            </motion.div>
            
            <div className="flex-shrink-0 p-4 border-t border-slate-200">
              {!loading &&
                (user ? (
                  <motion.div 
                    variants={itemVariants} 
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                  >
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="w-full justify-start text-lg py-3"
                      size="lg"
                    >
                      <ArrowRightOnRectangleIcon className="w-6 h-6 mr-4" />
                      Log Out
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div 
                    variants={itemVariants} 
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    className="grid grid-cols-2 gap-4"
                  >
                    <Button
                      variant="outline"
                      onClick={() => { navigate('/auth'); onClose(); }}
                      size="lg"
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={() => { navigate('/auth'); onClose(); }}
                      size="lg"
                    >
                      Start Free
                    </Button>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};


const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Features', href: '/#features' },
    { name: 'Pricing', href: '/pricing' },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-white/70 backdrop-blur-xl sticky top-0 z-30 border-b border-slate-200/80"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex-shrink-0">
              <Logo className="h-10 w-auto text-slate-900" />
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.href}
                  className={({isActive}) => `text-base font-medium transition-colors ${isActive ? 'text-primary' : 'text-slate-500 hover:text-primary'}`}
                >
                  {link.name}
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center">
              <div className="hidden md:flex items-center space-x-4">
                {!loading &&
                  (user ? (
                    <Button onClick={() => navigate('/dashboard')}>
                      Dashboard
                    </Button>
                  ) : (
                    <>
                        <Link to="/auth" className="text-base font-medium text-slate-500 hover:text-primary transition-colors">
                            Sign In
                        </Link>
                        <Button onClick={() => navigate('/auth')}>Start for Free</Button>
                    </>
                  ))}
              </div>
              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-primary hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                  aria-label="Open main menu"
                >
                  <MenuIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </>
  );
};

export default Header;