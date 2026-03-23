import React from 'react';
import { Download, Image as ImageIcon, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { AppState } from '../types';

interface ImagePreviewProps {
  image: {url: string, type: 'image' | 'video'} | null;
  isGenerating: boolean;
  progressMsg: string | null;
  state: AppState;
  onAnimate?: () => void;
}

export function ImagePreview({ image, isGenerating, progressMsg, state, onAnimate }: ImagePreviewProps) {
  const handleDownload = () => {
    if (image) {
      const a = document.createElement('a');
      a.href = image.url;
      a.download = `fashion-ai-${Date.now()}.${image.type === 'video' ? 'mp4' : 'png'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-8 relative overflow-hidden transition-colors">
      <AnimatePresence mode="wait">
        {isGenerating ? (
          <motion.div
            key="generating"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex flex-col items-center justify-center space-y-4"
          >
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-indigo-100 dark:border-indigo-900/50 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-600 dark:border-indigo-400 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse text-center max-w-xs transition-colors">
              {progressMsg || "Designing your masterpiece..."}
            </p>
          </motion.div>
        ) : image ? (
          <motion.div
            key="result-image"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800 transition-colors"
          >
            {image.type === 'video' ? (
              <video src={image.url} autoPlay loop controls className="max-w-full max-h-[85vh] object-contain" />
            ) : (
              <img src={image.url} alt="Generated Fashion" className="max-w-full max-h-[85vh] object-contain" />
            )}
            <div className="absolute top-4 right-4 flex gap-2">
              {image.type === 'image' && onAnimate && (
                <button
                  onClick={onAnimate}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full shadow-lg font-medium text-sm transition-all hover:scale-105"
                >
                  <Play className="w-4 h-4" />
                  Animate this Image
                </button>
              )}
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-full shadow-lg font-medium text-sm transition-all hover:scale-105"
              >
                <Download className="w-4 h-4" />
                Download {image.type === 'video' ? 'Video' : 'Image'}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 space-y-4 transition-colors"
          >
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center transition-colors">
              <ImageIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 transition-colors" />
            </div>
            <p className="text-sm font-medium">
              Upload garments and click "Start Creating"
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
