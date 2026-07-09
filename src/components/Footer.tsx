import React from 'react';

interface FooterProps {
  setCurrentView: (view: string) => void;
}

export function Footer({ setCurrentView }: FooterProps) {
  return (
    <footer className="mt-16 border-t border-gray-200 dark:border-gray-800 pt-8 pb-12">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <img src="/Logo.png" alt="Logo" className="w-8 h-8 object-contain rounded bg-white p-1" />
          <span className="font-bold text-gray-900 dark:text-white">AI Open Image</span>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          <button onClick={() => setCurrentView('privacy')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Privacy Policy
          </button>
          <button onClick={() => setCurrentView('terms')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Terms & Conditions
          </button>
          <button onClick={() => setCurrentView('refund')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Refund & Cancellation
          </button>
          <button onClick={() => setCurrentView('contact')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Contact Us
          </button>
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-500">
          &copy; {new Date().getFullYear()} AI Open Image. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
