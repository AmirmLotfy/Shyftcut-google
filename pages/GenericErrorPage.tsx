
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { Logo } from '../components/icons';

const GenericErrorPage: React.FC<{ onReset?: () => void }> = ({ onReset }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 text-center px-4">
      <div className="relative max-w-lg w-full">
         <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 animate-background-pan rounded-2xl opacity-50" />
         <div className="relative bg-white/70 backdrop-blur-lg p-8 sm:p-12 rounded-2xl shadow-2xl border border-slate-200/80">
            <Logo className="mx-auto h-12 w-auto text-primary" />
            <h1 className="mt-8 text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Oops! Something went wrong.
            </h1>
            <p className="mt-4 text-base text-slate-600">
              We're sorry for the inconvenience. Our team has been notified, and we're working to fix the issue.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button onClick={onReset} size="lg">
                Try Again
              </Button>
              <Link to="/">
                <Button variant="outline" size="lg">
                    Go back home
                </Button>
              </Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default GenericErrorPage;