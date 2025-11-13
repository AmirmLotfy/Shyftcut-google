import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Logo, ArrowLeftIcon } from '../components/icons';
import Button from '../components/Button';
import Spinner from '../components/Spinner';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('Password reset email sent! Please check your inbox (and spam folder).');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 animate-background-pan" />
            <div className="absolute top-0 left-0 p-4 sm:p-6 z-10">
                <Link to="/auth" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Sign In
                </Link>
            </div>
            <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
                <Logo className="mx-auto h-12 w-auto text-primary" />
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
                    Reset your password
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Enter your email and we'll send you a link to get back into your account.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white/60 backdrop-blur-lg py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-200/80">
                    {message ? (
                        <div className="text-center">
                            <p className="text-green-600">{message}</p>
                            <Link to="/auth" className="font-medium text-primary hover:text-primary-500">
                                Return to Sign In
                            </Link>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handlePasswordReset}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                    Email address
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                    />
                                </div>
                            </div>

                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                            <div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? <Spinner size="sm" /> : 'Send Reset Link'}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
