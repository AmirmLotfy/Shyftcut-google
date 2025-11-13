import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Roadmap } from '../types';
import { User } from 'firebase/auth';
import Button from './Button';
import Spinner from './Spinner';
import { XIcon, CopyIcon, TwitterIcon, LinkedinIcon, FacebookIcon, CheckIcon, ShareIcon } from './icons';

interface ShareModalProps {
    roadmap: Roadmap;
    user: User;
    onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ roadmap, user, onClose }) => {
    const [isPublic, setIsPublic] = useState(roadmap.isPublic || false);
    const [loading, setLoading] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const shareUrl = `${window.location.origin}/#/public/roadmap/${roadmap.id}`;

    const handleMakePublic = async () => {
        setLoading(true);
        setError(null);
        try {
            const roadmapRef = doc(db, 'tracks', user.uid, 'roadmaps', roadmap.id);
            await updateDoc(roadmapRef, { isPublic: true });
            setIsPublic(true);
        } catch (err) {
            console.error("Failed to make roadmap public:", err);
            setError("Could not make roadmap public. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };
    
    const shareText = `Check out my AI-generated learning roadmap for ${roadmap.title}! Created with #Shyftcut.`;
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    
    const socialLinks = {
        twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
        linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodeURIComponent(roadmap.title)}&summary=${encodedText}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <motion.div
                initial={{ y: 20, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 20, opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-800">Share Your Roadmap</h2>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 transition-colors">
                            <XIcon className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    {!isPublic ? (
                        <div className="text-center mt-6">
                            <div className="mx-auto w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center">
                                <ShareIcon className="w-6 h-6 text-primary" />
                            </div>
                            <p className="mt-4 text-slate-600">To get a shareable link, you need to make this roadmap public. Anyone with the link will be able to view it.</p>
                            <Button onClick={handleMakePublic} disabled={loading} className="mt-6 w-full">
                                {loading ? <Spinner size="sm" /> : 'Make Public & Get Link'}
                            </Button>
                            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                        </div>
                    ) : (
                        <div className="mt-6">
                            <p className="text-sm text-slate-600">Anyone with this link can view a read-only version of your roadmap.</p>
                            <div className="mt-2 flex items-center space-x-2">
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={shareUrl}
                                    className="w-full text-sm px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none text-slate-900"
                                />
                                <Button variant="outline" onClick={handleCopyToClipboard} className="flex-shrink-0">
                                    {copySuccess ? <CheckIcon className="w-5 h-5" /> : <CopyIcon className="w-5 h-5" />}
                                </Button>
                            </div>

                            <div className="mt-6 flex justify-center space-x-4">
                                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors" aria-label="Share on Twitter">
                                    <TwitterIcon className="w-6 h-6 text-slate-700" />
                                </a>
                                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors" aria-label="Share on LinkedIn">
                                    <LinkedinIcon className="w-6 h-6 text-slate-700" />
                                </a>
                                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors" aria-label="Share on Facebook">
                                    <FacebookIcon className="w-6 h-6 text-slate-700" />
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ShareModal;