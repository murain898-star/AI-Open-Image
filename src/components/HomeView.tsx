import React from 'react';
import { Wand2, Image as ImageIcon, Video } from 'lucide-react';
import { AppState } from '../types';

interface HomeViewProps {
  setCurrentView: (view: string) => void;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

export function HomeView({ setCurrentView, setState }: HomeViewProps) {
  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto p-8 transition-colors">
      <div className="max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-indigo-800 dark:to-purple-900 rounded-3xl p-10 text-white shadow-xl mb-12 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-4 mb-4">
              <img 
                src="/logo.png" 
                alt="AI Open Image" 
                className="w-16 h-16 object-contain rounded-2xl shadow-lg bg-white/10 backdrop-blur-sm p-1"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <h1 className="text-4xl font-extrabold">Welcome to AI Open Image</h1>
            </div>
            <p className="text-indigo-100 dark:text-indigo-200 text-lg mb-8">
              Transform your clothing designs into photorealistic model photos in seconds.
            </p>
            <button 
              onClick={() => setCurrentView('create')}
              className="bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors shadow-lg"
            >
              <Wand2 className="w-5 h-5" />
              Start Creating Now
            </button>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-400 dark:bg-purple-600 opacity-20 rounded-full blur-2xl translate-y-1/2"></div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">What you can do</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div 
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer" 
            onClick={() => {
              setState(prev => ({ ...prev, outputFormat: 'image' }));
              setCurrentView('create');
            }}
          >
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">High-Res Photos</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Generate stunning 4K model photos wearing your custom outfits with perfect lighting and poses.</p>
          </div>
          
          <div 
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer" 
            onClick={() => {
              setState(prev => ({ ...prev, outputFormat: 'video' }));
              setCurrentView('create');
            }}
          >
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mb-4">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">4K/Ultra Video</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Create cinematic 4K videos of your fashion designs in motion with stunning realism.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
