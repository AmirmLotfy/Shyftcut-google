import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { Logo, ArrowLeftIcon } from '../components/icons';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { motion } from 'framer-motion';

const FloatingLabelInput = ({ id, name, type, value, onChange, required, children }: any) => (
  <div className="relative">
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      className="block px-3.5 pb-2.5 pt-4 w-full text-sm text-slate-900 bg-transparent rounded-lg border border-slate-300 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
      placeholder=" "
    />
    <label
      htmlFor={id}
      className="absolute text-sm text-slate-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
    >
      {children}
    </label>
  </div>
);


const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const createNewUserProfile = async (user: User) => {
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        name: user.displayName || name,
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
      });
    }
  };

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await createNewUserProfile(userCredential.user);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        await createNewUserProfile(result.user);
        navigate('/dashboard');
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
            <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Home
            </Link>
        </div>
        <motion.div 
         initial={{ opacity: 0, scale: 0.9 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ duration: 0.5, ease: 'easeOut' }}
         className="relative"
        >
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <Logo className="mx-auto h-12 w-auto text-primary" />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
            {isLogin ? 'Welcome back' : 'Create your account'}
            </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white/60 backdrop-blur-lg py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-200/80">
            <form className="space-y-6" onSubmit={handleAuthAction}>
                {!isLogin && (
                    <FloatingLabelInput id="name" name="name" type="text" value={name} onChange={(e: any) => setName(e.target.value)} required>Full Name</FloatingLabelInput>
                )}
                <FloatingLabelInput id="email" name="email" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} required>Email address</FloatingLabelInput>
                <FloatingLabelInput id="password" name="password" type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} required>Password</FloatingLabelInput>
                
                {isLogin && (
                <div className="flex items-center justify-end">
                    <div className="text-sm">
                    <Link to="/forgot-password" className="font-medium text-primary hover:text-primary-500">
                        Forgot your password?
                    </Link>
                    </div>
                </div>
                )}
                
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <div>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Spinner size="sm" /> : (isLogin ? 'Sign in' : 'Create Account')}
                </Button>
                </div>
            </form>

            <div className="mt-6">
                <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500">Or</span>
                </div>
                </div>

                <div className="mt-6">
                <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
                        <path fill="#4285F4" d="M24 9.5c3.2 0 6.1 1.1 8.4 3.2l6.3-6.3C34.9 2.5 29.8 0 24 0 14.5 0 6.5 5.8 2.8 13.9l7.4 5.8C11.9 14.1 17.5 9.5 24 9.5z"></path>
                        <path fill="#34A853" d="M46.2 25.4c0-1.7-.2-3.4-.5-5H24v9.3h12.5c-.5 3-2.1 5.6-4.6 7.3l7.1 5.5C43.2 38.3 46.2 32.5 46.2 25.4z"></path>
                        <path fill="#FBBC05" d="M10.2 28.3c-.5-1.5-.8-3.1-.8-4.8s.3-3.3.8-4.8l-7.4-5.8C1 17.1 0 20.4 0 24s1 6.9 2.8 9.9l7.4-5.6z"></path>
                        <path fill="#EA4335" d="M24 48c5.8 0 10.9-1.9 14.5-5.2l-7.1-5.5c-1.9 1.3-4.4 2.1-7.4 2.1-6.6 0-12.2-4.6-14.1-10.8l-7.4 5.8C6.5 42.2 14.5 48 24 48z"></path>
                        <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                    Continue with Google
                </Button>
                </div>
            </div>
            <div className="text-sm text-center mt-6">
                <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-primary hover:text-primary-500">
                    {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
                </button>
                </div>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;