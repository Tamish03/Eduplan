import React, { useState } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useRAG } from '../contexts/RAGContext';

const DocumentUpload = ({ setId, onUploadComplete }) => {
    const { uploadDocument } = useRAG();
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = async (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            await handleFile(e.target.files[0]);
        }
    };

    const handleFile = async (file) => {
        try {
            setUploading(true);
            setUploadStatus(null);

            await uploadDocument(setId, file);

            setUploadStatus({ type: 'success', message: 'Document uploaded and processed successfully!' });

            if (onUploadComplete) {
                onUploadComplete();
            }

            // Clear status after 3 seconds
            setTimeout(() => setUploadStatus(null), 3000);
        } catch (error) {
            setUploadStatus({ type: 'error', message: error.message || 'Upload failed' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full">
            <form
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className="relative"
            >
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={handleChange}
                    disabled={uploading}
                />

                <label
                    htmlFor="file-upload"
                    className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all ${dragActive
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-slate-700 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-600'
                        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {uploading ? (
                            <>
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                                <p className="text-sm text-slate-400">Processing document...</p>
                            </>
                        ) : (
                            <>
                                <Upload className="w-12 h-12 mb-4 text-slate-400" />
                                <p className="mb-2 text-sm text-slate-300">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-slate-500">PDF, TXT, DOC, or DOCX (MAX. 10MB)</p>
                            </>
                        )}
                    </div>
                </label>
            </form>

            {/* Upload Status */}
            {uploadStatus && (
                <div
                    className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${uploadStatus.type === 'success'
                            ? 'bg-green-500/10 border border-green-500/30'
                            : 'bg-red-500/10 border border-red-500/30'
                        }`}
                >
                    {uploadStatus.type === 'success' ? (
                        <CheckCircle className="text-green-400" size={20} />
                    ) : (
                        <AlertCircle className="text-red-400" size={20} />
                    )}
                    <p
                        className={`text-sm ${uploadStatus.type === 'success' ? 'text-green-300' : 'text-red-300'
                            }`}
                    >
                        {uploadStatus.message}
                    </p>
                </div>
            )}
        </div>
    );
};

export default DocumentUpload;
