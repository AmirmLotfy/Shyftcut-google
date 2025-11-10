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

    return (
        <aside className="w-64 bg-white/60 backdrop-blur-lg border-r border-slate-200/80 flex-col hidden lg:flex">
            <div className="h-20 flex items-center px-6 border-b border-slate-200/80">
                <Logo className="h-8 w-auto text-slate-900" />
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1">
                {navItems.map(item => (
                     <NavLink
                        key={item.name}
                        to={item.href}
                        end={item.href === '/dashboard'}
                        className={({ isActive }) =>
                          `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                            isActive
                              ? 'bg-primary-500 text-white shadow'
                              : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                          }`
                        }
                      >
                        {item.name}
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t border-slate-200/80">
                <div className="text-sm">
                    <div className="font-semibold text-slate-800 truncate">{userProfile?.name}</div>
                    <div className="text-slate-500 truncate">{userProfile?.email}</div>
                </div>
                <Button onClick={handleLogout} variant="outline" size="sm" className="w-full mt-4">
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
    <div className="flex h-screen bg-slate-100 font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        <motion.div 
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-4 sm:p-6 lg:p-8"
        >
            <Outlet />
        </motion.div>
      </main>
      <DashboardMobileNav />
    </div>
  );
};

export default DashboardLayout;