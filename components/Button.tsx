import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'glass-primary' | 'glass-secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed will-change-transform';

  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-700 focus:ring-primary-500 shadow-lg hover:shadow-xl shadow-primary/20 hover:shadow-primary/30',
    secondary: 'bg-secondary text-white hover:bg-secondary-700 focus:ring-secondary-500 shadow-lg hover:shadow-xl shadow-secondary/20 hover:shadow-secondary/30',
    outline: 'border-2 border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus:ring-primary-500',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-primary-500 shadow-none',
    glass: 'glass-button text-slate-700 hover:text-slate-900 focus:ring-primary/30',
    'glass-primary': 'backdrop-blur-md bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 hover:border-primary/40 focus:ring-primary/30 shadow-lg hover:shadow-xl shadow-primary/10',
    'glass-secondary': 'backdrop-blur-md bg-secondary/20 border border-secondary/30 text-secondary hover:bg-secondary/30 hover:border-secondary/40 focus:ring-secondary/30 shadow-lg hover:shadow-xl shadow-secondary/10',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;