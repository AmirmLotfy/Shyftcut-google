import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo } from '../components/icons';
import { useAuth } from '../hooks/useAuth';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import DashboardMobileNav from './DashboardMobileNav';

const Sidebar: React.FC = () => {
    const { userProfile } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };
    
    const navItems = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'New Roadmap', href: '/app/wizard' },
        { name: 'Settings', href: '/settings' },
    ];

    const userInitials = userProfile?.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase() || '..';

    return (
        <aside className="glass-sidebar w-72 flex-col hidden lg:flex">
            <div className="h-24 flex items-center px-8 border-b border-white/20">
                <Logo className="h-9 w-auto text-slate-900 transition-transform hover:scale-105" />
            </div>
            <nav className="flex-1 px-6 py-6 space-y-2">
                {navItems.map(item => (
                     <NavLink
                        key={item.name}
                        to={item.href}
                        end={item.href === '/dashboard'}
                        className={({ isActive }) =>
                          `flex items-center px-4 py-3 text-base rounded-xl transition-all duration-300 backdrop-blur-sm ${
                            isActive
                              ? 'bg-primary/20 text-primary font-semibold border border-primary/30 shadow-md'
                              : 'text-slate-600 hover:bg-white/60 hover:text-slate-900 hover:border border-transparent hover:border-slate-200/50'
                          }`
                        }
                      >
                        {item.name}
                    </NavLink>
                ))}
            </nav>
            <div className="p-6 border-t border-white/20 glass-card m-4 rounded-xl">
                 <div className="flex items-center gap-4 mb-4">
                    {userProfile?.avatarUrl && userProfile.avatarUrl.trim() !== '' ? (
                        <img 
                            src={userProfile.avatarUrl} 
                            alt={userProfile.name || 'User avatar'} 
                            className="w-11 h-11 max-w-11 max-h-11 rounded-full object-cover border-2 border-primary/20 flex-shrink-0"
                            style={{ maxWidth: '44px', maxHeight: '44px', width: '44px', height: '44px' }}
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                const nextEl = (e.target as HTMLImageElement).nextElementSibling;
                                if (nextEl) nextEl.classList.remove('hidden');
                            }}
                        />
                    ) : null}
                    <div className={`w-11 h-11 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${userProfile?.avatarUrl && userProfile.avatarUrl.trim() !== '' ? 'hidden' : ''}`}>
                        {userInitials}
                    </div>
                    <div className="text-sm overflow-hidden min-w-0 flex-1">
                        <div className="font-semibold text-slate-800 truncate">{userProfile?.name}</div>
                        <div className="text-slate-500 truncate">{userProfile?.email}</div>
                    </div>
                </div>
                <Button onClick={handleLogout} variant="glass" size="sm" className="w-full !justify-start text-slate-600 hover:!bg-white/60">
                    Log Out
                </Button>
            </div>
        </aside>
    );
};


const DashboardLayout: React.FC = () => {
  const { loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Spinner size="lg" /></div>;
  }
  
  return (
    <div className="flex h-screen font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        <motion.div 
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="p-4 sm:p-6 lg:p-10"
        >
            <Outlet />
        </motion.div>
      </main>
      <DashboardMobileNav />
    </div>
  );
};

export default DashboardLayout;