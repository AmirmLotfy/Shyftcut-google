
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, DocumentData } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      // Clean up previous profile listener if it exists
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }

      if (firebaseUser) {
        setUser(firebaseUser);
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Set up a real-time listener for the user profile
        unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          setLoading(true);
          if (docSnap.exists()) {
            const profile = docSnap.data() as UserProfile;

            // Client-side check for expired trial
            if (profile.subscriptionRole === 'pro' && profile.trialEndsAt && profile.trialEndsAt.toDate() < new Date()) {
                // The onSnapshot listener will catch this change and update the UI automatically.
                updateDoc(userDocRef, { subscriptionRole: 'free' }).catch(err => {
                    console.error("Failed to downgrade user after trial expiry:", err);
                });
            }
            setUserProfile(profile);

          } else {
            // This can happen briefly during signup before the doc is created
            setUserProfile(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error listening to user profile:", error);
          setUserProfile(null);
          setLoading(false);
        });

      } else {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    // Cleanup function for the effect
    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);


  const value = { user, userProfile, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};