import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Roadmap } from '../types';
import Button from './Button';
import Spinner from './Spinner';
import { XIcon } from './icons';

interface EditRoadmapModalProps {
    roadmap: Roadmap;
    onClose: () => void;
    onSave: (updatedData: { title: string; description: string }) => Promise<void>;
}

const EditRoadmapModal: React.FC<EditRoadmapModalProps> = ({ roadmap, onClose, onSave }) => {
    const [title, setTitle] = useState(roadmap.title);
    const [description, setDescription] = useState(roadmap.description);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await onSave({ title, description });
            onClose();
        } catch (err) {
            setError("Failed to save changes. Please try again.");
        } finally {
            setLoading(false);
        }
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
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={handleSave}>
                    <div className="p-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">Edit Roadmap</h2>
                            <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 transition-colors">
                                <XIcon className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="mt-6 space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-slate-700">Roadmap Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 px-6 py-4 rounded-b-2xl flex justify-end items-center gap-4">
                         {error && <p className="text-sm text-red-500">{error}</p>}
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading || (title === roadmap.title && description === roadmap.description)}>
                            {loading ? <Spinner size="sm" /> : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default EditRoadmapModal;