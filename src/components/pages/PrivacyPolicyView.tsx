import React from 'react';
import { ArrowLeft } from 'lucide-react';

export function PrivacyPolicyView({ setCurrentView }: { setCurrentView: (view: string) => void }) {
  return (
    <div className="flex-1 bg-white dark:bg-gray-900 overflow-y-auto p-8 transition-colors">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium mb-8 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Privacy Policy</h1>
        
        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-6">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, and other information you choose to provide.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Use of Information</h2>
            <p>We may use the information we collect about you to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Provide, maintain, and improve our Services;</li>
              <li>Process payments and send related information;</li>
              <li>Send you technical notices, updates, security alerts and support and administrative messages;</li>
              <li>Respond to your comments, questions and requests and provide customer service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Sharing of Information</h2>
            <p>We do not share personal information with third parties except as necessary to provide our services, comply with the law, or protect our rights.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
