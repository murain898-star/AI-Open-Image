import React from 'react';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';

export function ContactView({ setCurrentView }: { setCurrentView: (view: string) => void }) {
  return (
    <div className="flex-1 bg-white dark:bg-gray-900 overflow-y-auto p-8 transition-colors">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium mb-8 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Contact Us</h1>
        
        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 mb-10">
          <p>We'd love to hear from you. If you have any questions, feedback, or need support, please reach out using the contact details below.</p>
        </div>

        <div className="grid gap-6">
          <div className="flex items-start gap-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Email Support</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-2">For general inquiries and technical support.</p>
              <a href="mailto:mura.in898@gmail.com" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                mura.in898@gmail.com
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Phone</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-2">Mon-Fri from 9am to 6pm.</p>
              <a href="tel:+918128851553" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                +91 81288 51553
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Office Address</h3>
              <p className="text-gray-500 dark:text-gray-400">
                G 1301, Rivanta Gardencity<br />
                Variyav<br />
                Surat, Gujarat, 394520<br />
                India
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
