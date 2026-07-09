import React from 'react';
import { ArrowLeft } from 'lucide-react';

export function RefundView({ setCurrentView }: { setCurrentView: (view: string) => void }) {
  return (
    <div className="flex-1 bg-white dark:bg-gray-900 overflow-y-auto p-8 transition-colors">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium mb-8 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Refund & Cancellation Policy</h1>
        
        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-6">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Cancellation Policy</h2>
            <p>You can cancel your subscription or service usage at any time. If you decide to cancel, your cancellation will take effect at the end of the current paid term. You will not receive a refund for the billing cycle in which you canceled.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Refund Policy</h2>
            <p>Because our services involve the generation of digital goods using AI models which consume computing resources immediately, we generally do not offer refunds once credits have been used.</p>
            <p className="mt-2">Refunds for unused credits or mistaken purchases may be granted at our sole discretion if requested within 7 days of the purchase date, provided no credits from that purchase have been used.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. How to Request a Refund</h2>
            <p>If you believe you are eligible for a refund, please contact us at our support email with your account details and the reason for the request.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
