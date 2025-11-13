import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSignInWithEmailLink, signInWithEmailLink, User } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import { Logo } from '../components/icons';

const FinishSignInPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [promptForEmail, setPromptForEmail] = useState(false);
    const navigate = useNavigate();

    const createNewUserProfile = async (user: User) => {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        if (!docSnap.exists()) {
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                name: user.displayName || 'New User',
                country: '',
                age: 0,
                profileComplete: false,
                createdAt: serverTimestamp(),
                preferences: {
                    careerTrack: '',
                    experienceLevel: '',
                    weeklyHours: 0,
                    learningStyles: [],
                    resourcePreference: '',
                },
                subscriptionRole: 'free',
                trialEndsAt: null,
            });
        }
    };

    useEffect(() => {
        const finishSignIn = async () => {
            if (isSignInWithEmailLink(auth, window.location.href)) {
                let emailFromStorage = window.localStorage.getItem('emailForSignIn');
                if (!emailFromStorage) {
                    setPromptForEmail(true);
                    setLoading(false);
                    return;
                }
                setEmail(emailFromStorage);
                
                try {
                    const result = await signInWithEmailLink(auth, emailFromStorage, window.location.href);
                    window.localStorage.removeItem('emailForSignIn');
                    await createNewUserProfile(result.user);
                    navigate('/dashboard');
                } catch (err: any) {
                    console.error(err);
                    setError("Failed to sign in. The link may be expired or invalid. Please try again.");
                    setLoading(false);
                }
            } else {
                 setError("Invalid sign-in link.");
                 setLoading(false);
            }
        };
        finishSignIn();
    }, [navigate]);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const result = await signInWithEmailLink(auth, email, window.location.href);
            window.localStorage.removeItem('emailForSignIn');
            await createNewUserProfile(result.user);
            navigate('/dashboard');
        } catch (err: any) {
             setError("Failed to sign in. The link may be expired, invalid, or the email may be incorrect. Please try again.");
             setLoading(false);
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center text-center">
                <Spinner size="lg" />
                <p className="mt-4 text-slate-600 font-semibold">Completing sign-in...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
             <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Logo className="mx-auto h-12 w-auto text-primary" />
                 <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
                    Confirm your sign-in
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-200/80">
                    {error && (
                        <div className="text-center">
                            <p className="text-red-500">{error}</p>
                            <Button variant="outline" className="mt-4" onClick={() => navigate('/auth')}>Back to Sign In</Button>
                        </div>
                    )}
                    {promptForEmail && !error && (
                        <form onSubmit={handleEmailSubmit} className="space-y-6">
                             <p className="text-center text-sm text-slate-600">To complete your sign-in, please provide your email address for confirmation.</p>
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
                            <div>
                                <Button type="submit" className="w-full">
                                    Confirm & Sign In
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FinishSignInPage;
