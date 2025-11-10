import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChartPieIcon, SparklesIcon, Cog6ToothIcon } from '../components/icons';

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: ChartPieIcon },
    { name: 'New Roadmap', href: '/app/wizard', icon: SparklesIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

const DashboardMobileNav: React.FC = () => {
    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200/80 shadow-t-lg z-40">
            <div className="flex justify-around h-16">
                {navItems.map(item => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        end={item.href === '/dashboard'}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center w-full text-xs font-medium transition-colors ${
                                isActive ? 'text-primary' : 'text-slate-500 hover:text-primary'
                            }`
                        }
                    >
                        <item.icon className="w-6 h-6 mb-0.5" />
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default DashboardMobileNav;
