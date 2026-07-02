import React from 'react';
import { Wand2, Image as ImageIcon, Video, Zap, ChevronRight, Info } from 'lucide-react';
import { AppState } from '../types';
import { AdSenseBanner } from './AdSenseBanner';

interface HomeViewProps {
  setCurrentView: (view: string) => void;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

export function HomeView({ setCurrentView, setState }: HomeViewProps) {
  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto p-8 transition-colors">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-indigo-800 dark:to-purple-900 rounded-3xl p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-4 mb-4">
              <img 
                src="/Logo.png" 
                alt="AI Open Image" 
                className="w-16 h-16 object-contain rounded-2xl shadow-lg bg-white p-2"
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
              Start Creatins Now
            </button>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-400 dark:bg-purple-600 opacity-20 rounded-full blur-2xl translate-y-1/2"></div>
        </div>
        
        {/* Trial Plan Banner */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl p-1 shadow-lg cursor-pointer transform transition-transform hover:scale-[1.01]" onClick={() => setCurrentView('pricing')}>
          <div className="bg-white dark:bg-gray-800 rounded-[23px] p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full text-sm font-bold mb-4">
                <Zap className="w-4 h-4" /> Try Before You Buy
              </div>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">₹10 Quick Trial</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                Not sure yet? Get 1 Credit to try our premium AI generation for just ₹10. See the magic for yourself!
              </p>
              <button 
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 text-lg pointer-events-none"
              >
                Try Now for ₹10
              </button>
            </div>
            
            <div className="w-full md:w-1/2 lg:w-5/12 pointer-events-none">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 relative overflow-hidden">
                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur text-white text-xs px-2 py-1 rounded font-medium z-20">Tutorial</div>
                <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                   <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 mix-blend-overlay"></div>
                   <div className="flex items-center gap-4 w-full px-6 relative z-10">
                      <div className="flex-1 h-24 sm:h-32 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center p-2 text-center shadow-sm">
                        <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mb-1" />
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">1. Upload Photo</span>
                      </div>
                      <div className="w-8 flex justify-center">
                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                      </div>
                      <div className="flex-1 h-24 sm:h-32 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center p-2 text-center shadow-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 opacity-20"></div>
                        <Wand2 className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-500 mb-1 relative z-10" />
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-300 relative z-10">2. Generate AI</span>
                      </div>
                   </div>
                </div>
                <p className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 mt-3">See how it works instantly</p>
              </div>
            </div>
          </div>
        </div>

        {/* Advertisement Banner */}
        <AdSenseBanner adSlot={import.meta.env.VITE_ADSENSE_SLOT_1_ID || "1234567890"} />

        {/* AI Gallery Showcase */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Inspiration Gallery</h2>
            <button onClick={() => setCurrentView('create')} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center text-sm">
              Create yours <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          {/* Scrollins Marquee Gallery */}
          <div className="relative w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800/50 p-4 border border-gray-200 dark:border-gray-700">
            {/* Gradient Fades for scrolling effect */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-100 dark:from-gray-900 to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-100 dark:from-gray-900 to-transparent z-10"></div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 pt-2 hide-scrollbar snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {[
                "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400",
                "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=400",
                "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&q=80&w=400",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
                "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=400",
                "https://images.unsplash.com/photo-1502786129293-79981df4e689?auto=format&fit=crop&q=80&w=400",
                "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400"
              ].map((src, idx) => (
                <div key={idx} className="shrink-0 snap-center group relative overflow-hidden rounded-xl w-64 h-80 bg-gray-200 dark:bg-gray-700 shadow-md">
                  <img src={src} alt="AI Generated Fashion Model" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                     <span className="text-white font-medium text-sm flex items-center gap-1">
                       <Wand2 className="w-3 h-3" /> AI Generated
                     </span>
                  </div>
                </div>
              ))}
            </div>
            
            <style>{`
              .hide-scrollbar::-webkit-scrollbar {
                display: none;
              }
            `}</style>
          </div>
        </div>

        <div>
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

        {/* Second Advertisement Banner */}
        <AdSenseBanner adSlot={import.meta.env.VITE_ADSENSE_SLOT_2_ID || "0987654321"} />

        {/* Credit Cost Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">How Credits Work</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">Image Generation</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex justify-between"><span>Low Res (Draft)</span> <span className="font-medium text-green-600 dark:text-green-400">Free (0 Credits)</span></li>
                <li className="flex justify-between"><span>4K / Ultra</span> <span className="font-medium">1 Credit</span></li>
                <li className="flex justify-between"><span>Gigapixel (8K)</span> <span className="font-medium">2 Credits</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">Video Generation (Veo)</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex justify-between"><span>Any Resolution</span> <span className="font-medium">1 Credit / sec</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">Poster & Catalogue</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex justify-between"><span>Poster</span> <span className="font-medium">13 Credits</span></li>
                <li className="flex justify-between"><span>Catalogue</span> <span className="font-medium">2 Credits / Page</span></li>
                <li className="text-xs text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                  Total Cost = Poster: 13 Credits | Catalogue: Number of Pages × 2 Credits
                </li>
                <li className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  1 Credit = ₹8
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
