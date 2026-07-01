import React from 'react';
import { Download, Image as ImageIcon, Play, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { AppState } from '../types';

interface ImagePreviewProps {
  image: {url: string, type: 'image' | 'video'} | null;
  isGenerating: boolean;
  progressMsg: string | null;
  state: AppState;
  onAnimate?: () => void;
  onUpscale?: () => void;
}

export function ImagePreview({ image, isGenerating, progressMsg, state, onAnimate, onUpscale }: ImagePreviewProps) {
  const handleDownload = () => {
    if (image) {
      const a = document.createElement('a');
      a.href = image.url;
      
      let extension = 'png';
      if (image.type === 'video') {
        extension = 'mp4';
      } else if (image.url.startsWith('data:image/jpeg')) {
        extension = 'jpg';
      } else if (image.url.startsWith('data:image/webp')) {
        extension = 'webp';
      }

      a.download = `AI-Open-Image-${Date.now()}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-8 relative overflow-hidden transition-colors">
      <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl bg-gray-100 dark:bg-gray-800/30 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center justify-center space-y-4 absolute inset-0"
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative w-full h-full flex items-center justify-center transition-colors group"
            >
              {image.type === 'video' ? (
                <video src={image.url} autoPlay loop controls className="max-w-full max-h-full object-contain" />
              ) : (
                <img src={image.url} alt="Generated Fashion" className="max-w-full max-h-full object-contain" />
              )}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {image.type === 'image' && onUpscale && (
                  <button
                    onClick={onUpscale}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full shadow-lg font-medium text-sm transition-all hover:scale-105"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-205 animate-pulse" />
                    AI Upscale (Gigapixel)
                  </button>
                )}
                {image.type === 'image' && onAnimate && (
                  <button
                    onClick={onAnimate}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full shadow-lg font-medium text-sm transition-all hover:scale-105"
                  >
                    <Play className="w-4 h-4" />
                    Animate
                  </button>
                )}
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-full shadow-lg font-medium text-sm transition-all hover:scale-105"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 space-y-4 transition-colors absolute inset-0"
            >
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center transition-colors">
                <ImageIcon className="w-10 h-10 text-gray-400 dark:text-gray-500 transition-colors" />
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Your generated image will appear here
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
