
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { updateProfile, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth, functions } from '../services/firebase';
import { httpsCallable } from 'firebase/functions';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { useNavigate } from 'react-router-dom';

const FormRow: React.FC<{ children: React.ReactNode, htmlFor?: string, label: string, description?: string }> = ({ children, label, description, htmlFor }) => (
    <div className="grid md:grid-cols-3 gap-4 items-start">
        <div className="md:col-span-1">
            <label htmlFor={htmlFor} className="block text-base font-semibold text-gray-800">{label}</label>
            {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
        </div>
        <div className="md:col-span-2">
            {children}
        </div>
    </div>
);


const SettingsPage: React.FC = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [nameLoading, setNameLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const [nameMessage, setNameMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  
  const [nameError, setNameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
    }
  }, [userProfile]);

  const handleNameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || name === userProfile?.name) return;

    setNameLoading(true);
    setNameError(null);
    setNameMessage(null);

    try {
      await updateProfile(user, { displayName: name });
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { name: name });
      setNameMessage('Your name has been updated successfully!');
    } catch (error: any) {
      setNameError(error.message);
    } finally {
      setNameLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !currentPassword || !newPassword) return;

    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordMessage(null);

    try {
      if (!user.email) throw new Error("User email is not available.");
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setPasswordMessage('Your password has been changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      setPasswordError(error.message);
    } finally {
      setPasswordLoading(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    if (!user || !user.email) {
      setDeleteError("Cannot delete account without user information.");
      return;
    }

    if (!window.confirm("Are you absolutely sure you want to delete your account? This will permanently erase your profile and all associated data. This action CANNOT be undone.")) {
        return;
    }

    const password = prompt("For your security, please re-enter your password to confirm account deletion:");
    if (!password) {
      // User cancelled the prompt
      return;
    }

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      // Call the cloud function to delete all user data
      const deleteUserDataFunc = httpsCallable(functions, 'deleteUserData');
      await deleteUserDataFunc();

      // The onAuthStateChanged listener will automatically handle logout and navigation
      // but we can navigate away immediately for a better user experience.
      alert("Your account has been successfully deleted.");
      navigate('/');
      
    } catch (error: any) {
      console.error("Error deleting account:", error);
      if (error.code === 'auth/wrong-password') {
        setDeleteError("Incorrect password. Deletion failed.");
      } else if (error.code === 'functions/internal') {
        setDeleteError("A server error occurred while deleting your data. Please contact support.");
      } else {
        setDeleteError(`An error occurred: ${error.message}`);
      }
    } finally {
      setDeleteLoading(false);
    }
  };


  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
      <p className="mt-2 text-lg text-slate-500">Manage your profile, subscription, and account settings.</p>
      
      <div className="mt-10 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-4xl">
        {/* Profile Section */}
        <section>
            <h2 className="text-2xl font-bold text-gray-800">Profile</h2>
            <p className="text-slate-500 text-sm mt-1">Update your personal details.</p>
            <form onSubmit={handleNameUpdate} className="mt-6 space-y-6">
                <FormRow label="Email" htmlFor="email">
                     <input type="email" id="email" value={user?.email || ''} disabled className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg shadow-sm sm:text-sm cursor-not-allowed" />
                </FormRow>
                <FormRow label="Full Name" htmlFor="name">
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
                </FormRow>
                 <div className="flex justify-end items-center gap-4">
                    {nameError && <p className="text-sm text-red-600">{nameError}</p>}
                    {nameMessage && <p className="text-sm text-green-600">{nameMessage}</p>}
                    <Button type="submit" disabled={nameLoading || name === userProfile?.name}>
                        {nameLoading ? <Spinner size="sm" /> : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </section>

        <hr className="my-10 border-gray-100" />

        {/* Subscription Section */}
        <section>
             <h2 className="text-2xl font-bold text-gray-800">Subscription</h2>
             <p className="text-slate-500 text-sm mt-1">Manage your current plan.</p>
             <div className="mt-6">
                 <FormRow label="Current Plan">
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div>
                            <p className="text-lg font-semibold text-gray-800 capitalize">{userProfile?.subscriptionRole || 'Free'}</p>
                            {userProfile?.subscriptionRole === 'pro' && userProfile.trialEndsAt && (
                                <p className="text-sm text-slate-600">
                                    Trial ends on: {new Date(userProfile.trialEndsAt.seconds * 1000).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                        {userProfile?.subscriptionRole === 'free' && (
                            <Button variant="outline" onClick={() => navigate('/pricing')}>
                                Upgrade Plan
                            </Button>
                        )}
                    </div>
                </FormRow>
             </div>
        </section>

        <hr className="my-10 border-gray-100" />

         {/* Password Section */}
        <section>
            <h2 className="text-2xl font-bold text-gray-800">Change Password</h2>
            <p className="text-slate-500 text-sm mt-1">For your security, you must provide your current password.</p>
            <form onSubmit={handlePasswordUpdate} className="mt-6 space-y-6">
                <FormRow label="Current Password" htmlFor="current-password">
                    <input type="password" id="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
                </FormRow>
                 <FormRow label="New Password" htmlFor="new-password">
                    <input type="password" id="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
                </FormRow>
                <div className="flex justify-end items-center gap-4">
                    {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
                    {passwordMessage && <p className="text-sm text-green-600">{passwordMessage}</p>}
                    <Button type="submit" disabled={passwordLoading || !currentPassword || !newPassword}>
                        {passwordLoading ? <Spinner size="sm" /> : 'Change Password'}
                    </Button>
                </div>
            </form>
        </section>

        <hr className="my-10 border-gray-100" />
        
        {/* Danger Zone */}
        <section className="bg-red-50 p-6 rounded-xl border border-red-200">
             <h2 className="text-2xl font-bold text-red-800">Danger Zone</h2>
             <div className="mt-4 grid md:grid-cols-3 gap-4 items-center">
                 <div className="md:col-span-1">
                    <p className="font-semibold text-red-700">Delete My Account</p>
                    <p className="text-sm text-red-600 mt-1">Permanently delete your account and all associated data. This action cannot be undone.</p>
                 </div>
                 <div className="md:col-span-2 text-right">
                    <Button variant="outline" onClick={handleDeleteAccount} disabled={deleteLoading} className="!border-red-500 !text-red-500 hover:!bg-red-100 focus:!ring-red-500">
                        {deleteLoading ? <Spinner size="sm" /> : 'Delete Account'}
                    </Button>
                 </div>
             </div>
            {deleteError && <p className="text-sm text-red-600 mt-4 text-center md:text-right">{deleteError}</p>}
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;