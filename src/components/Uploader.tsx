import React, { useCallback, useState } from 'react';
import { Upload, X, Library } from 'lucide-react';

interface UploaderProps {
  label: string;
  image: string | null;
  onChange: (image: string | null) => void;
  libraryType?: 'saree' | 'blouse' | 'outfit';
}

const PREDEFINED_LIBRARIES = {
  saree: [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1583391733958-d15314714f50?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1610116306796-6fea9f4fae38?auto=format&fit=crop&q=80&w=400',
  ],
  blouse: [
    'https://images.unsplash.com/photo-1605763240000-7e93b172d754?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1583391733958-d15314714f50?auto=format&fit=crop&q=80&w=400',
  ],
  outfit: [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1550639525-c97d455acf70?auto=format&fit=crop&q=80&w=400',
  ]
};

export function Uploader({ label, image, onChange, libraryType }: UploaderProps) {
  const [showLibrary, setShowLibrary] = useState(false);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onChange]);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">{label}</label>
        {libraryType && !image && (
          <button
            onClick={() => setShowLibrary(!showLibrary)}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <Library size={14} />
            {showLibrary ? 'Hide Library' : 'Library'}
          </button>
        )}
      </div>
      
      {showLibrary && !image && libraryType && (
        <div className="mb-3 grid grid-cols-3 gap-2">
          {PREDEFINED_LIBRARIES[libraryType].map((imgUrl, idx) => (
            <button
              key={idx}
              onClick={() => {
                onChange(imgUrl);
                setShowLibrary(false);
              }}
              className="relative w-full aspect-square rounded-md overflow-hidden border-2 border-transparent hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
            >
              <img src={imgUrl} alt={`Library item ${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {image ? (
        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors">
          <img src={image} alt={label} className="w-full h-full object-cover" />
          <button
            onClick={() => onChange(null)}
            className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-6 h-6 text-gray-400 dark:text-gray-500 mb-2 transition-colors" />
            <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">Click or drag to upload</p>
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        </label>
      )}
    </div>
  );
}
