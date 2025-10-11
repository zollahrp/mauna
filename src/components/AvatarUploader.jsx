// src/components/AvatarUploader.jsx (Component baru)

import React, { useState, useRef } from 'react';
import { UploadCloud, X, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';
const AvatarUploader = ({ onFileSelected, onClose, currentAvatarUrl }) => {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type === 'image/jpeg' || file.type === 'image/png') {
                onFileSelected(file);
            } else {
                toast.error('Format file tidak didukung. Gunakan JPG atau PNG.');
            }
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type === 'image/jpeg' || file.type === 'image/png') {
                onFileSelected(file);
            } else {
                toast.error('Format file tidak didukung. Gunakan JPG atau PNG.');
            }
        }
    };

    const onButtonClick = () => {
        inputRef.current.click();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800">Unggah Foto Profil</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
                        }`}
                >
                    <UploadCloud size={48} className="text-gray-400 mb-2" />
                    <p className="text-sm text-center text-gray-500 mb-2">
                        Tarik & lepas foto di sini
                    </p>
                    <p className="text-xs text-center text-gray-400 mb-2">atau</p>
                    <button
                        onClick={onButtonClick}
                        className="bg-[#ffbb00] hover:bg-yellow-500 text-white font-semibold py-2 px-5 rounded-lg shadow-md"
                    >
                        Pilih dari Komputer
                    </button>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/jpeg, image/png"
                        onChange={handleChange}
                        className="hidden"
                    />
                </div>

                {currentAvatarUrl && (
                    <div className="mt-4 flex flex-col items-center">
                        <div className="relative w-24 h-24 rounded-full overflow-hidden mb-2">
                            <Image
                                src={currentAvatarUrl}
                                alt="Preview"
                                fill
                                style={{ objectFit: "cover" }}
                                className="rounded-full"
                            />
                        </div>
                        <p className="text-sm font-semibold">Foto Saat Ini</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AvatarUploader;