import React from 'react';
import { ArrowLeft } from 'lucide-react';

export function TermsView({ setCurrentView }: { setCurrentView: (view: string) => void }) {
  return (
    <div className="flex-1 bg-white dark:bg-gray-900 overflow-y-auto p-8 transition-colors">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium mb-8 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Terms & Conditions</h1>
        
        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-6">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Agreement to Terms</h2>
            <p>By accessing or using our application, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the service.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Intellectual Property</h2>
            <p>The Service and its original content, features, and functionality are and will remain the exclusive property of AI Open Image and its licensors. The generated images provided to you are licensed for your use according to the specific terms of the plan you purchased.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. User Conduct</h2>
            <p>You agree not to use the Service to generate content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Changes to Terms</h2>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
