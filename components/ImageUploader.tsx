
import React, { useState, useRef } from 'react';

interface ImageUploaderProps {
  id: string;
  title: string;
  onImageUpload: (base64: string) => void;
  imageUrl: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ id, title, onImageUpload, imageUrl }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          onImageUpload(base64);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const onAreaClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-3 text-cyan-400">{title}</h2>
      <div
        className={`relative w-full aspect-square bg-gray-800 rounded-lg border-2 border-dashed transition-all duration-300 ${
          isDragging ? 'border-cyan-400 bg-gray-700' : 'border-gray-600'
        } flex items-center justify-center cursor-pointer group overflow-hidden`}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={onAreaClick}
      >
        <input
          type="file"
          id={id}
          accept="image/jpeg, image/png, image/webp"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files)}
        />
        {imageUrl ? (
          <img
            src={`data:image/jpeg;base64,${imageUrl}`}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center text-gray-400 p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="font-semibold">Click to upload or drag & drop</p>
            <p className="text-sm">JPEG, PNG, or WEBP</p>
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-white font-bold">Change Image</span>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
