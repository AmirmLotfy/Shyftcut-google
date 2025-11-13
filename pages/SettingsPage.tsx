import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { updateProfile, reauthenticateWithCredential, EmailAuthProvider, updatePassword, deleteUser } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, auth, storage } from '../services/firebase';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [hasNewAvatar, setHasNewAvatar] = useState(false);
  
  const [nameLoading, setNameLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  
  const [nameMessage, setNameMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [avatarMessage, setAvatarMessage] = useState<string | null>(null);
  
  const [nameError, setNameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      if (userProfile.avatarUrl) {
        setAvatarPreview(userProfile.avatarUrl);
      }
    }
  }, [userProfile]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setHasNewAvatar(false);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file.');
      setHasNewAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image size must be less than 5MB.');
      setHasNewAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Clear any previous errors
    setAvatarError(null);
    setAvatarMessage(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
      setHasNewAvatar(true);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file || !user) return;

    setAvatarLoading(true);
    setAvatarError(null);
    setAvatarMessage(null);

    try {
      // Determine file extension
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const validExt = ['jpg', 'jpeg', 'png', 'webp'].includes(fileExt) ? fileExt : 'jpg';
      const fileName = `avatar.${validExt}`;
      
      // Upload to Firebase Storage
      const avatarRef = ref(storage, `avatars/${user.uid}/${fileName}`);
      await uploadBytes(avatarRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(avatarRef);
      
      // Update user profile in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { avatarUrl: downloadURL });
      
      // Update Firebase Auth profile
      await updateProfile(user, { photoURL: downloadURL });
      
      setAvatarMessage('Avatar uploaded successfully!');
      setHasNewAvatar(false);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      setAvatarError(error.message || 'Failed to upload avatar. Please try again.');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleAvatarRemove = async () => {
    if (!user) return;

    setAvatarLoading(true);
    setAvatarError(null);
    setAvatarMessage(null);

    try {
      // Delete from Storage if exists
      if (userProfile?.avatarUrl) {
        try {
          // Extract path from URL
          const url = new URL(userProfile.avatarUrl);
          const pathParts = url.pathname.split('/');
          const fileName = pathParts[pathParts.length - 1];
          const avatarRef = ref(storage, `avatars/${user.uid}/${fileName}`);
          await deleteObject(avatarRef);
        } catch (storageError: any) {
          // If file doesn't exist in storage, that's okay - just continue
          console.warn('Avatar file not found in storage:', storageError);
        }
      }
      
      // Update user profile in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { avatarUrl: null });
      
      // Update Firebase Auth profile
      await updateProfile(user, { photoURL: null });
      
      setAvatarPreview(null);
      setAvatarMessage('Avatar removed successfully!');
    } catch (error: any) {
      console.error('Error removing avatar:', error);
      setAvatarError(error.message || 'Failed to remove avatar. Please try again.');
    } finally {
      setAvatarLoading(false);
    }
  };

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
      return;
    }

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      // The onUserDelete cloud function will automatically handle cleanup of all Firestore data.
      // We just need to delete the auth user here.
      await deleteUser(user);
      
      alert("Your account has been successfully deleted.");
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
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-lg text-slate-600">Manage your profile, subscription, and account settings.</p>
      </motion.div>
      
      <div className="mt-10 space-y-6 max-w-4xl">
        {/* Profile Section */}
        <motion.section 
          className="glass-card p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/20">
              <div className="h-1 w-12 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
            </div>
            <p className="text-slate-600 text-sm mb-6">Update your personal details.</p>
            <form onSubmit={handleNameUpdate} className="mt-6 space-y-6">
                <FormRow label="Avatar" htmlFor="avatar">
                    <div className="flex items-center gap-6 flex-wrap">
                        <div className="flex-shrink-0">
                            {avatarPreview ? (
                                <motion.img 
                                    src={avatarPreview} 
                                    alt="Avatar preview" 
                                    className="w-28 h-28 rounded-full object-cover border-4 border-white/40 backdrop-blur-sm shadow-lg"
                                    initial={{ scale: 0.9 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 400 }}
                                />
                            ) : (
                                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-2xl border-4 border-white/40 backdrop-blur-sm shadow-lg">
                                    {userProfile?.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || '..'}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 space-y-3 min-w-0">
                            <div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    id="avatar"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={handleAvatarSelect}
                                    className="hidden"
                                />
                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        type="button"
                                        variant="glass-primary"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={avatarLoading}
                                    >
                                        Choose Image
                                    </Button>
                                    {hasNewAvatar && (
                                        <Button
                                            type="button"
                                            onClick={handleAvatarUpload}
                                            disabled={avatarLoading || !fileInputRef.current?.files?.[0]}
                                        >
                                            {avatarLoading ? <Spinner size="sm" /> : 'Upload Avatar'}
                                        </Button>
                                    )}
                                    {userProfile?.avatarUrl && (
                                        <Button
                                            type="button"
                                            variant="glass-secondary"
                                            onClick={handleAvatarRemove}
                                            disabled={avatarLoading}
                                            className="!bg-red-50/80 !border-red-300/50 !text-red-600 hover:!bg-red-100/80"
                                        >
                                            {avatarLoading ? <Spinner size="sm" /> : 'Remove'}
                                        </Button>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 mt-2">JPG, PNG or WEBP. Max size: 5MB</p>
                            </div>
                            {avatarError && (
                                <motion.p 
                                    className="text-sm text-red-600 p-3 rounded-lg bg-red-50/80 border border-red-200/50 backdrop-blur-sm"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    {avatarError}
                                </motion.p>
                            )}
                            {avatarMessage && (
                                <motion.p 
                                    className="text-sm text-green-600 p-3 rounded-lg bg-green-50/80 border border-green-200/50 backdrop-blur-sm"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    {avatarMessage}
                                </motion.p>
                            )}
                        </div>
                    </div>
                </FormRow>
                <FormRow label="Email" htmlFor="email">
                     <input 
                         type="email" 
                         id="email" 
                         value={user?.email || ''} 
                         disabled 
                         className="glass-input w-full px-4 py-2.5 bg-gray-50/80 border-gray-200/50 sm:text-sm cursor-not-allowed" 
                     />
                </FormRow>
                <FormRow label="Full Name" htmlFor="name">
                    <input 
                        type="text" 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="glass-input w-full px-4 py-2.5 sm:text-sm" 
                    />
                </FormRow>
                 <div className="flex justify-end items-center gap-4">
                    {nameError && <p className="text-sm text-red-600">{nameError}</p>}
                    {nameMessage && <p className="text-sm text-green-600">{nameMessage}</p>}
                    <Button type="submit" disabled={nameLoading || name === userProfile?.name}>
                        {nameLoading ? <Spinner size="sm" /> : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </motion.section>

        {/* Subscription Section */}
        <motion.section 
          className="glass-card p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
             <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/20">
               <div className="h-1 w-12 bg-gradient-to-r from-secondary to-primary rounded-full"></div>
               <h2 className="text-2xl font-bold text-gray-900">Subscription</h2>
             </div>
             <p className="text-slate-600 text-sm mb-6">Manage your current plan.</p>
             <div>
                 <FormRow label="Current Plan">
                    <div className="glass-card p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <p className="text-xl font-bold text-gray-900 capitalize">{userProfile?.subscriptionRole || 'Free'}</p>
                                {userProfile?.subscriptionRole === 'pro' && userProfile.trialEndsAt && (
                                    <p className="text-sm text-slate-600 mt-1">
                                        Trial ends on: {new Date(userProfile.trialEndsAt.seconds * 1000).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                            {userProfile?.subscriptionRole === 'free' && (
                                <Button variant="glass-primary" onClick={() => navigate('/pricing')}>
                                    Upgrade Plan
                                </Button>
                            )}
                        </div>
                    </div>
                </FormRow>
             </div>
        </motion.section>

         {/* Password Section */}
        <motion.section 
          className="glass-card p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/20">
              <div className="h-1 w-12 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
            </div>
            <p className="text-slate-600 text-sm mb-6">For your security, you must provide your current password.</p>
            <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <FormRow label="Current Password" htmlFor="current-password">
                    <input 
                        type="password" 
                        id="current-password" 
                        value={currentPassword} 
                        onChange={(e) => setCurrentPassword(e.target.value)} 
                        required 
                        className="glass-input w-full px-4 py-2.5 sm:text-sm" 
                    />
                </FormRow>
                 <FormRow label="New Password" htmlFor="new-password">
                    <input 
                        type="password" 
                        id="new-password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        required 
                        className="glass-input w-full px-4 py-2.5 sm:text-sm" 
                    />
                </FormRow>
                <div className="flex justify-end items-center gap-4">
                    {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
                    {passwordMessage && <p className="text-sm text-green-600">{passwordMessage}</p>}
                    <Button type="submit" disabled={passwordLoading || !currentPassword || !newPassword}>
                        {passwordLoading ? <Spinner size="sm" /> : 'Change Password'}
                    </Button>
                </div>
            </form>
        </motion.section>
        
        {/* Danger Zone */}
        <motion.section 
          className="glass-card p-8 border-2 border-red-200/50 bg-gradient-to-br from-red-50/80 to-red-100/40 backdrop-blur-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
             <div className="flex items-center gap-3 mb-6 pb-4 border-b border-red-200/30">
               <div className="h-1 w-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full"></div>
               <h2 className="text-2xl font-bold text-red-900">Danger Zone</h2>
             </div>
             <div className="grid md:grid-cols-3 gap-6 items-center">
                 <div className="md:col-span-1">
                    <p className="font-bold text-red-800 text-lg">Delete My Account</p>
                    <p className="text-sm text-red-700 mt-2 leading-relaxed">Permanently delete your account and all associated data. This action cannot be undone.</p>
                 </div>
                 <div className="md:col-span-2 text-right">
                    <Button 
                        variant="glass-secondary" 
                        onClick={handleDeleteAccount} 
                        disabled={deleteLoading} 
                        className="!bg-red-50/80 !border-red-300/50 !text-red-700 hover:!bg-red-100/80 hover:!border-red-400/50"
                    >
                        {deleteLoading ? <Spinner size="sm" /> : 'Delete Account'}
                    </Button>
                 </div>
             </div>
            {deleteError && (
                <motion.p 
                    className="text-sm text-red-700 mt-4 text-center md:text-right p-3 rounded-lg bg-red-100/80 border border-red-200/50 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {deleteError}
                </motion.p>
            )}
        </motion.section>
      </div>
    </div>
  );
};

export default SettingsPage;
