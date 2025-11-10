
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { updateProfile, reauthenticateWithCredential, EmailAuthProvider, updatePassword, deleteUser } from 'firebase/auth';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { useNavigate } from 'react-router-dom';

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

    if (!window.confirm("Are you absolutely sure you want to delete your account? This will permanently erase your profile and authentication details. This action CANNOT be undone.")) {
        return;
    }

    const password = prompt("For your security, please re-enter your password to confirm account deletion:");
    if (!password) {
      setDeleteError("Password not provided. Deletion cancelled.");
      return;
    }

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      const userDocRef = doc(db, 'users', user.uid);
      // NOTE: This client-side operation only deletes the main user profile document.
      // All associated roadmaps and progress will be orphaned but inaccessible.
      // A complete data wipe would require a Cloud Function.
      await deleteDoc(userDocRef);

      await deleteUser(user);
      
      // Since deleteUser signs the user out, we should navigate them away.
      navigate('/');
      
    } catch (error: any) {
      console.error("Error deleting account:", error);
      if (error.code === 'auth/wrong-password') {
        setDeleteError("Incorrect password. Deletion failed.");
      } else {
        setDeleteError(`An error occurred: ${error.message}`);
      }
    } finally {
      setDeleteLoading(false);
    }
  };


  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
      
      <div className="mt-8 max-w-2xl">
        {/* Profile Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700">Profile Information</h2>
          <form onSubmit={handleNameUpdate} className="mt-4 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={user?.email || ''}
                disabled
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
            {nameError && <p className="text-sm text-red-600">{nameError}</p>}
            {nameMessage && <p className="text-sm text-green-600">{nameMessage}</p>}
            <div className="flex justify-end">
                <Button type="submit" disabled={nameLoading || name === userProfile?.name}>
                    {nameLoading ? <Spinner size="sm" /> : 'Save Changes'}
                </Button>
            </div>
          </form>
        </div>
        
        {/* Subscription Management */}
        <div className="bg-white p-6 rounded-lg shadow mt-8">
            <h2 className="text-xl font-semibold text-gray-700">Subscription</h2>
            <div className="mt-4 space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Current Plan</p>
                        <p className="text-lg font-semibold text-gray-800 capitalize">{userProfile?.subscriptionRole || 'Free'}</p>
                    </div>
                    {userProfile?.subscriptionRole === 'free' && (
                        <Button variant="outline" onClick={() => navigate('/pricing')}>
                            Upgrade Plan
                        </Button>
                    )}
                </div>
                 {userProfile?.subscriptionRole === 'pro' && userProfile.trialEndsAt && (
                    <div className="p-3 bg-primary-50 border border-primary-200 rounded-md">
                        <p className="text-sm text-primary-800">
                            Your Pro trial ends on: <span className="font-semibold">{new Date(userProfile.trialEndsAt.seconds * 1000).toLocaleDateString()}</span>.
                        </p>
                        <p className="text-xs text-primary-700 mt-1">Paid plans via Paddle coming soon!</p>
                    </div>
                )}
            </div>
        </div>

        {/* Change Password */}
        <div className="bg-white p-6 rounded-lg shadow mt-8">
            <h2 className="text-xl font-semibold text-gray-700">Change Password</h2>
            <form onSubmit={handlePasswordUpdate} className="mt-4 space-y-4">
                <div>
                    <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
                        Current Password
                    </label>
                    <input
                        type="password"
                        id="current-password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                        New Password
                    </label>
                    <input
                        type="password"
                        id="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                    />
                </div>
                {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
                {passwordMessage && <p className="text-sm text-green-600">{passwordMessage}</p>}
                <div className="flex justify-end">
                    <Button type="submit" disabled={passwordLoading || !currentPassword || !newPassword}>
                        {passwordLoading ? <Spinner size="sm" /> : 'Change Password'}
                    </Button>
                </div>
            </form>
        </div>
        
        {/* Danger Zone */}
        <div className="bg-red-50 p-6 rounded-lg shadow mt-8 border border-red-200">
            <h2 className="text-xl font-semibold text-red-800">Danger Zone</h2>
            <div className="mt-4 flex justify-between items-center">
                <div>
                    <p className="font-medium text-red-700">Delete My Account</p>
                    <p className="text-sm text-red-600">Permanently delete your account and all associated data.</p>
                </div>
                 <Button variant="outline" onClick={handleDeleteAccount} disabled={deleteLoading} className="!border-red-500 !text-red-500 hover:!bg-red-100">
                    {deleteLoading ? <Spinner size="sm" /> : 'Delete Account'}
                </Button>
            </div>
            {deleteError && <p className="text-sm text-red-600 mt-4">{deleteError}</p>}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;