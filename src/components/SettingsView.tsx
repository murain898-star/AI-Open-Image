import React, { useState } from 'react';
import { FileText, Shield, HelpCircle, Palette, Monitor, Moon, Sun } from 'lucide-react';
import { ThemeMode } from '../App';

interface SettingsViewProps {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

export function SettingsView({ theme, setTheme }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState('appearance');

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto p-8 transition-colors">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
              <button
                onClick={() => setActiveTab('appearance')}
                className={`w-full flex items-center gap-3 px-4 py-4 text-left text-sm font-medium transition-colors ${activeTab === 'appearance' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-l-4 border-indigo-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-4 border-transparent'}`}
              >
                <Palette className="w-5 h-5" /> Appearance
              </button>
              <button
                onClick={() => setActiveTab('tc')}
                className={`w-full flex items-center gap-3 px-4 py-4 text-left text-sm font-medium transition-colors ${activeTab === 'tc' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-l-4 border-indigo-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-4 border-transparent'}`}
              >
                <FileText className="w-5 h-5" /> Terms & Conditions
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`w-full flex items-center gap-3 px-4 py-4 text-left text-sm font-medium transition-colors ${activeTab === 'privacy' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-l-4 border-indigo-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-4 border-transparent'}`}
              >
                <Shield className="w-5 h-5" /> Privacy Policy
              </button>
              <button
                onClick={() => setActiveTab('faq')}
                className={`w-full flex items-center gap-3 px-4 py-4 text-left text-sm font-medium transition-colors ${activeTab === 'faq' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-l-4 border-indigo-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-4 border-transparent'}`}
              >
                <HelpCircle className="w-5 h-5" /> FAQ
              </button>
              <button
                onClick={() => setActiveTab('api-guide')}
                className={`w-full flex items-center gap-3 px-4 py-4 text-left text-sm font-medium transition-colors ${activeTab === 'api-guide' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-l-4 border-indigo-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-4 border-transparent'}`}
              >
                <FileText className="w-5 h-5" /> API & Pricing Guide
              </button>
            </div>
          </div>
          
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 transition-colors">
            {activeTab === 'appearance' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Appearance</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Customize how AI Open Image looks on your device.</p>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Theme</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-gray-600'}`}
                    >
                      <Sun className={`w-8 h-8 mb-2 ${theme === 'light' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} />
                      <span className={`text-sm font-medium ${theme === 'light' ? 'text-indigo-900 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>Light</span>
                    </button>
                    
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-gray-600'}`}
                    >
                      <Moon className={`w-8 h-8 mb-2 ${theme === 'dark' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} />
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-indigo-900 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>Dark</span>
                    </button>
                    
                    <button
                      onClick={() => setTheme('system')}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === 'system' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-gray-600'}`}
                    >
                      <Monitor className={`w-8 h-8 mb-2 ${theme === 'system' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} />
                      <span className={`text-sm font-medium ${theme === 'system' ? 'text-indigo-900 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>System</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'tc' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Terms & Conditions</h2>
                <div className="prose prose-indigo dark:prose-invert text-gray-600 dark:text-gray-300 space-y-4">
                  <p>Welcome to AI Open Image. By using our service, you agree to these terms.</p>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">1. Usage Rights</h3>
                  <p>You retain all rights to the original images you upload. Images and videos generated using the Free plan are for personal use only. Commercial rights are granted only to Studio Pro and Agency plan subscribers.</p>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">2. Credits and Billing</h3>
                  <p>Credits are deducted upon successful generation. Generating an image costs 5 credits, while generating a video costs 20 credits. Subscriptions are billed monthly. Unused credits may roll over depending on your specific plan terms.</p>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">3. Content Guidelines</h3>
                  <p>You agree not to upload or generate inappropriate, offensive, or illegal content in both images and videos. We reserve the right to suspend accounts violating these guidelines.</p>
                </div>
              </div>
            )}
            
            {activeTab === 'privacy' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Privacy Policy</h2>
                <div className="prose prose-indigo dark:prose-invert text-gray-600 dark:text-gray-300 space-y-4">
                  <p>Your privacy is important to us. This policy explains how we handle your data.</p>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">Data Collection</h3>
                  <p>We collect information you provide directly, such as uploaded images and account details. We also collect usage data to improve our AI image and video models.</p>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">Data Usage</h3>
                  <p>Uploaded images are processed temporarily to generate your requested image or video output. We do not use your personal images to train our public models unless you are on an Enterprise plan with custom training enabled.</p>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">Data Security</h3>
                  <p>We implement industry-standard security measures to protect your data during transmission and storage.</p>
                </div>
              </div>
            )}
            
            {activeTab === 'faq' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">How do credits work?</h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">Generating 1 image costs 5 credits. Generating 1 video costs 20 credits. You start with 50 free credits.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Can I use the generated images and videos commercially?</h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">Commercial use is allowed only if you are subscribed to the Studio Pro or Agency plans.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">What happens if a generation fails?</h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">If an error occurs during image or video generation, your credits will not be deducted.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">How long does generation take?</h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">Image generation uses advanced AI and can take anywhere from 5 to 15 seconds. Video generation can take a few minutes depending on server load.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'api-guide' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">API & Pricing Guide</h2>
                <div className="prose prose-indigo dark:prose-invert text-gray-600 dark:text-gray-300 space-y-6">
                  <p>When using your own API keys, you are billed directly by Google AI Studio. Below is a guide to the supported resolutions and estimated costs.</p>
                  
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Google AI Studio (Gemini & Veo)</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Best for high-quality images and cinematic videos. Free tier available for developers.</p>
                    <ul className="space-y-2 text-sm">
                      <li><strong>Image (Gemini 3.1 Flash):</strong> Supports 1K, 2K, 4K, and <strong>Gigapixel Mode (Max)</strong> resolutions.</li>
                      <li><strong>Video (Veo 3.1):</strong> Supports 720p and 1080p resolutions.</li>
                      <li><strong>Pricing:</strong> Images are free on the free tier, or ~$0.03 per image (up to 4K) and <strong>~$0.06 for Gigapixel Mode</strong> on pay-as-you-go. Videos cost ~$0.10 - $0.20 per generation.</li>
                    </ul>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 italic">Note: Prices are estimates and subject to change by Google. Please check their official pricing pages for the most accurate information.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
