import React, { useState, useEffect } from 'react';
import { AppState, Preset, getGenerationCost } from './types';
import { Sidebar } from './components/Sidebar';
import { ImagePreview } from './components/ImagePreview';
import { NavigationRail } from './components/NavigationRail';
import { HomeView } from './components/HomeView';
import { SettingsView } from './components/SettingsView';
import { ProfileView } from './components/ProfileView';
import { LoginView } from './components/LoginView';
import { VideoUnderstandingView } from './components/VideoUnderstandingView';
import { PricingView } from './components/PricingView';
import { UpscaleView } from './components/UpscaleView';
import { PrivacyPolicyView } from './components/pages/PrivacyPolicyView';
import { TermsView } from './components/pages/TermsView';
import { RefundView } from './components/pages/RefundView';
import { ContactView } from './components/pages/ContactView';
import { generateFashionMedia } from './services/aiService';
import { Wand2, Loader2 } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';

export type ThemeMode = 'light' | 'dark' | 'system';

export default function App() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<{url: string, type: 'image' | 'video'} | null>(null);
  const [progressMsg, setProgressMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [currentView, setCurrentViewState] = useState<string>(() => {
    const path = window.location.pathname;
    if (path === '/privacy' || path === '/privacy.html') return 'privacy';
    if (path === '/terms' || path === '/terms.html') return 'terms';
    if (path === '/refund' || path === '/refund.html') return 'refund';
    if (path === '/contact' || path === '/contact.html') return 'contact';
    return 'home';
  });

  const setCurrentView = (view: string) => {
    setCurrentViewState(view);
    let path = '/';
    if (view === 'privacy') path = '/privacy';
    else if (view === 'terms') path = '/terms';
    else if (view === 'refund') path = '/refund';
    else if (view === 'contact') path = '/contact';
    
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
  };
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>('system');
  const [userCredits, setUserCredits] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('fashion_ai_credits');
      if (stored !== null) return parseInt(stored);
      localStorage.setItem('fashion_ai_credits', '5');
      return 5;
    } catch (e) {
      return 5;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('fashion_ai_credits', userCredits.toString());
    } catch (e) {}
  }, [userCredits]);
  const [freeGenerationsUsed, setFreeGenerationsUsed] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('fashion_ai_free_used') || '0');
    } catch (e) {
      return 0;
    }
  }); // Default 0 credits
  const [upscaleTargetUrl, setUpscaleTargetUrl] = useState<string | null>(null);

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('fashion_ai_theme') as ThemeMode;
      if (savedTheme) {
        setTheme(savedTheme);
      }
    } catch (e) {
      console.warn("localStorage is not available");
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    
    try {
      localStorage.setItem('fashion_ai_theme', theme);
    } catch (e) {}
  }, [theme]);

  const [state, setState] = useState<AppState>({
    apiProvider: 'google',
    mode: 'saree',
    creationType: 'Photo',
    modelCount: 1,
    cataloguePages: 12,
    posterPages: 1,
    posterMainPageModels: 6,
    catalogueModels: Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      outfitImage: null, dressTopImage: null, dressBottomImage: null, dressDupattaImage: null, sareeImage: null, blouseImage: null, garmentType: 'Auto'
    })),
    posterModels: Array.from({ length: 7 }, (_, i) => ({
      id: i + 1,
      outfitImage: null, dressTopImage: null, dressBottomImage: null, dressDupattaImage: null, sareeImage: null, blouseImage: null, garmentType: 'Auto'
    })),
    coverCloseup: true,
    coverCloseupImage: null,
    coverSareeImage: null,
    coverBlouseImage: null,
    coverDressTopImage: null,
    coverDressBottomImage: null,
    coverDressDupattaImage: null,
    modelReferenceImage: null,
    useProModel: true,
    imageModel: 'gemini-fast',
    sareeImage: null,
    blouseImage: null,
    outfitImage: null,
    dressTopImage: null,
    dressBottomImage: null,
    dressDupattaImage: null,
    garmentType: 'Auto',
    gender: 'Female',
    pose: 'Standing',
    styleExtra: 'None',
    background: 'Solid Color',
    customBackground: '',
    backgroundImage: null,
    aiBackgroundStyle: '',
    customPrompt: '',
    outputFormat: 'image',
    videoDuration: 5,
    videoResolution: '1080p',
    quality: '4K',
    aspectRatio: '3:4',
    customWidth: 6,
    customHeight: 9,
    customUnit: 'inches',
    customDPI: 300,
    enableOutfitColor: false,
    outfitColor: '#ff0000',
    enableJewellery: false,
    jewelleryImage: null,
    jewelleryDescription: '',
    colorModifications: [],
    brandLogo: null,
    removeLogoBackground: true,
    brandWatermark: false,
    brandName: '',
    designNumber: '',
    fidelityMode: 'Ultra (Strict Design Matching)',
    structureReference: true,
    denoisingStrength: 0.1,
    inPaintingMode: false,
    inPaintingMask: null,
    animateReferenceImage: null,
  });

  const handleAnimate = async () => {
    if (!generatedImage || generatedImage.type !== 'image') return;
    
    const newState: AppState = {
      ...state,
      outputFormat: 'video',
      imageModel: 'veo-fast',
      animateReferenceImage: generatedImage.url
    };
    
    setState(newState);
    
    // Trisger generation with the new state directly to avoid waiting for React's async update
    setIsGenerating(true);
    setError(null);
    setProgressMsg(null);
    try {
      const cost = getGenerationCost(newState);
      
      const effectiveCredits = user?.email === 'mura.in898@gmail.com' ? 999999 : userCredits;
      if (cost > 0 && effectiveCredits < cost) {
        setError(`Insufficient credits. You need ${cost} credits but have ${effectiveCredits}. Please purchase more credits.`);
        setIsGenerating(false);
        return;
      }

      const result = await generateFashionMedia(newState, setProgressMsg);
      setGeneratedImage(result);
      if (cost > 0) {
        setUserCredits(prev => prev - cost);
      } else if (newState.outputFormat === 'image' && newState.quality === 'Low Res (Free)') {
        setFreeGenerationsUsed(prev => {
          const newCount = prev + 1;
          try { localStorage.setItem('fashion_ai_free_used', newCount.toString()); } catch (e) {}
          return newCount;
        });
      }
    } catch (err: any) {
      console.error("Animate error:", err);
      setError(err.message || 'Failed to animate image.');
    } finally {
      setIsGenerating(false);
      setProgressMsg(null);
    }
  };

  useEffect(() => {
    if (!auth) {
      setAuthReady(true);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    try {
      const savedPresets = localStorage.getItem('fashion_ai_presets');
      if (savedPresets) {
        try {
          setPresets(JSON.parse(savedPresets));
        } catch (e) {
          console.error("Failed to parse presets", e);
        }
      }
    } catch (e) {
      console.warn("localStorage not available for presets");
    }
  }, []);

  const handleSavePreset = (name: string) => {
    const { sareeImage, blouseImage, outfitImage, dressTopImage, dressBottomImage, dressDupattaImage, jewelleryImage, ...presetState } = state;
    const newPreset: Preset = {
      id: Date.now().toString(),
      name,
      state: presetState
    };
    const updated = [...presets, newPreset];
    setPresets(updated);
    try {
      localStorage.setItem('fashion_ai_presets', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleLoadPreset = (preset: Preset) => {
    setState(prev => ({
      ...prev,
      ...preset.state
    }));
  };

  const handleDeletePreset = (id: string) => {
    const updated = presets.filter(p => p.id !== id);
    setPresets(updated);
    try {
      localStorage.setItem('fashion_ai_presets', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setProgressMsg(null);
    
    // Clear any previous animation reference when starting a fresh generation
    const currentState = { ...state, animateReferenceImage: null };
    setState(currentState);

    try {
      const cost = getGenerationCost(currentState);

      const effectiveCredits = user?.email === 'mura.in898@gmail.com' ? 999999 : userCredits;
      if (cost > 0 && effectiveCredits < cost) {
        setError(`Insufficient credits. You need ${cost} credits but have ${effectiveCredits}. Please purchase more credits.`);
        setIsGenerating(false);
        return;
      }
           
      const result = await generateFashionMedia(currentState, setProgressMsg);
      setGeneratedImage(result);
      if (cost > 0) {
        setUserCredits(prev => prev - cost);
      } else if (currentState.outputFormat === 'image' && currentState.quality === 'Low Res (Free)') {
        setFreeGenerationsUsed(prev => {
          const newCount = prev + 1;
          try { localStorage.setItem('fashion_ai_free_used', newCount.toString()); } catch (e) {}
          return newCount;
        });
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      let errorMessage = 'An error occurred during generation.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (typeof err === 'object' && err !== null) {
        errorMessage = JSON.stringify(err);
      }
      
      const errorStr = errorMessage.toUpperCase();
      // If permission denied or entity not found, the API key might be invalid or from a free project
      if (errorStr.includes('403') || errorStr.includes('PERMISSION_DENIED') || errorStr.includes('REQUESTED ENTITY WAS NOT FOUND')) {
        errorMessage = "Permission Denied: Please select a valid API key from a paid Google Cloud project.";
      }
      
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
      setProgressMsg(null);
    }
  };

  if (showSplash) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white transition-colors">
        <div className="flex flex-col items-center gap-6 animate-pulse">
          <img src="/Logo.png" alt="AI Open Image Logo" className="w-40 h-40 object-contain drop-shadow-2xl bg-white rounded-3xl p-4" />
        </div>
      </div>
    );
  }

  if (!authReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin transition-colors" />
          <p className="text-gray-500 dark:text-gray-400 font-medium transition-colors">Loading AI Fashion Studio...</p>
        </div>
      </div>
    );
  }

  if (!user && auth) {
    return <LoginView />;
  }

  const effectiveCredits = user?.email === 'mura.in898@gmail.com' ? 999999 : userCredits;

  return (
    <div className="flex h-[100dvh] fixed inset-0 w-full bg-gray-50 dark:bg-gray-900 overflow-hidden font-sans transition-colors">
      <NavigationRail currentView={currentView} setCurrentView={setCurrentView} />
      
      {currentView === 'home' && <HomeView setCurrentView={setCurrentView} setState={setState} />}
      
      {currentView === 'settings' && <SettingsView theme={theme} setTheme={setTheme} />}
      
      {currentView === 'profile' && <ProfileView state={state} setState={setState} />}

      {currentView === 'pricing' && <PricingView onPurchaseSuccess={(credits) => setUserCredits(prev => prev + credits)} />}

      {currentView === 'video' && <VideoUnderstandingView />}

      {currentView === 'upscale' && (
        <UpscaleView 
          initialImage={upscaleTargetUrl} 
          userCredits={effectiveCredits} 
          setUserCredits={setUserCredits} 
          onRedirectToPricing={() => setCurrentView('pricing')}
          onBackToCreate={() => { setUpscaleTargetUrl(null); setCurrentView('create'); }}
        />
      )}

      {currentView === 'privacy' && <PrivacyPolicyView setCurrentView={setCurrentView} />}
      {currentView === 'terms' && <TermsView setCurrentView={setCurrentView} />}
      {currentView === 'refund' && <RefundView setCurrentView={setCurrentView} />}
      {currentView === 'contact' && <ContactView setCurrentView={setCurrentView} />}
      
      {currentView === 'create' && (
        <>
          <Sidebar
            state={state}
            setState={setState}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            onUpgradeToPro={() => setCurrentView('pricing')}
            presets={presets}
            onSavePreset={handleSavePreset}
            onLoadPreset={handleLoadPreset}
            onDeletePreset={handleDeletePreset}
            userCredits={effectiveCredits}
            freeGenerationsUsed={user?.email === 'mura.in898@gmail.com' ? 0 : freeGenerationsUsed}
          />
          <div className="flex-1 flex flex-col relative min-h-0">
            {error && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl shadow-lg border border-red-100 dark:border-red-800/50 flex items-center gap-2 transition-colors">
                <span className="font-medium text-sm">{error}</span>
                <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors">
                  &times;
                </button>
              </div>
            )}
            <ImagePreview 
              image={generatedImage} 
              isGenerating={isGenerating} 
              progressMsg={progressMsg} 
              state={state}
              onAnimate={handleAnimate}
              onUpscale={() => { 
                if (generatedImage) {
                  setUpscaleTargetUrl(generatedImage.url);
                  setCurrentView('upscale');
                }
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
