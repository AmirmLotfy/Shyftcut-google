import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { Logo, ArrowLeftIcon } from '../components/icons';
import { storage } from '../services/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../hooks/useAuth';

const AssetUploader: React.FC<{ title: string; folder: string }> = ({ title, folder }) => {
    const { user } = useAuth();
    const [preview, setPreview] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [downloadURL, setDownloadURL] = useState<string>('');
    const [copySuccess, setCopySuccess] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!user) {
                setError("You must be signed in to upload files.");
                return;
            }
            setError(null);
            setDownloadURL('');
            setUploadProgress(0);

            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);

            // Upload to Firebase Storage with UID prefix for security
            const storageRef = ref(storage, `${folder}/${user.uid}-${Date.now()}-${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                },
                (uploadError) => {
                    console.error("Upload failed:", uploadError);
                    setError("Upload failed. Please check your storage rules and configuration.");
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                        setDownloadURL(url);
                    });
                }
            );
        }
    };

    const handleCopy = () => {
        if (!downloadURL) return;
        navigator.clipboard.writeText(downloadURL).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, (err) => {
            setCopySuccess('Failed!');
            console.error('Could not copy text: ', err);
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
            <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
            <div className="mt-4 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
                {preview ? (
                    <img src={preview} alt={`${title} preview`} className="max-h-32 rounded-md object-contain" />
                ) : (
                    <div className="text-center text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="mt-2 text-sm">{user ? "Select an image to upload" : "Please sign in to upload"}</p>
                    </div>
                )}
                <input
                    type="file"
                    accept="image/png, image/jpeg, image/svg+xml, image/webp, image/x-icon"
                    onChange={handleFileChange}
                    disabled={!user}
                    className="mt-4 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary hover:file:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
                />
            </div>
            
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            
            {uploadProgress > 0 && (
                <div className="mt-4">
                     <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                    <p className="text-sm text-center mt-1 text-slate-600">{uploadProgress < 100 ? `Uploading... ${Math.round(uploadProgress)}%` : "Upload complete!"}</p>
                </div>
            )}
            
            {downloadURL && (
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Permanent Download URL:</label>
                    <textarea
                        readOnly
                        value={downloadURL}
                        className="mt-1 block w-full text-xs p-2 border border-gray-300 rounded-md shadow-sm h-24 bg-gray-50"
                    />
                    <div className="mt-2 text-right">
                        <Button onClick={handleCopy} size="sm" variant="outline">
                            {copySuccess || 'Copy URL'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

const AssetUploaderPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8 relative">
             <div className="absolute top-0 left-0 p-4 sm:p-6">
                <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Home
                </Link>
            </div>
            <div className="max-w-4xl mx-auto pt-10">
                <div className="text-center">
                    <Logo className="mx-auto h-12 w-auto text-primary" />
                    <h1 className="mt-6 text-3xl font-extrabold text-slate-900">
                        Brand Asset Uploader
                    </h1>
                    <p className="mt-2 text-lg text-slate-600">
                        A utility to host your brand assets on Firebase Storage.
                    </p>
                </div>

                <div className="mt-8 bg-slate-50 p-6 rounded-lg border border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-800">Instructions</h2>
                    <ol className="mt-2 list-decimal list-inside space-y-1 text-slate-600">
                        <li>Make sure you are signed in to your account.</li>
                        <li>Upload your images in the sections below (Logo, Favicon, etc.).</li>
                        <li>Wait for the upload to complete and the URL to appear.</li>
                        <li>Click the "Copy URL" button for each generated URL.</li>
                        <li>Paste each copied URL into our chat in a new prompt.</li>
                    </ol>
                </div>

                <div className="mt-8 grid gap-8 md:grid-cols-1">
                    <AssetUploader title="1. Main Logo (PNG or SVG)" folder="logos" />
                    <AssetUploader title="2. Favicon (.ico or PNG, e.g., 32x32)" folder="favicons" />
                    <AssetUploader title="3. Open Graph Image (for social media, e.g., 1200x630)" folder="og-images" />
                </div>
            </div>
        </div>
    );
};

export default AssetUploaderPage;