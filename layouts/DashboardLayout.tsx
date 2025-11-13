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
        <aside className="w-72 bg-white border-r border-gray-100 flex-col hidden lg:flex">
            <div className="h-24 flex items-center px-8">
                <Logo className="h-9 w-auto text-slate-900" />
            </div>
            <nav className="flex-1 px-6 py-4 space-y-2">
                {navItems.map(item => (
                     <NavLink
                        key={item.name}
                        to={item.href}
                        end={item.href === '/dashboard'}
                        className={({ isActive }) =>
                          `flex items-center px-4 py-3 text-base rounded-xl transition-colors duration-200 ${
                            isActive
                              ? 'bg-primary-50 text-primary font-semibold'
                              : 'text-slate-600 hover:bg-gray-100 hover:text-slate-900'
                          }`
                        }
                      >
                        {item.name}
                    </NavLink>
                ))}
            </nav>
            <div className="p-6 border-t border-gray-100">
                 <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {userInitials}
                    </div>
                    <div className="text-sm overflow-hidden">
                        <div className="font-semibold text-slate-800 truncate">{userProfile?.name}</div>
                        <div className="text-slate-500 truncate">{userProfile?.email}</div>
                    </div>
                </div>
                <Button onClick={handleLogout} variant="ghost" size="sm" className="w-full mt-4 !justify-start text-slate-500 hover:!bg-gray-100">
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
    <div className="flex h-screen bg-gray-50 font-sans">
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