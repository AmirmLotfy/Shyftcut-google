
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center px-4">
      <div>
        <h1 className="text-6xl font-extrabold text-primary tracking-tight sm:text-8xl">404</h1>
        <p className="mt-4 text-3xl font-bold text-gray-900 tracking-tight sm:text-4xl">Page not found.</p>
        <p className="mt-6 text-base text-gray-500">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <div className="mt-10">
          <Link to="/">
            <Button>Go back home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;