import React, { useState, useEffect } from 'react';
import { AppState, Preset } from './types';
import { Sidebar } from './components/Sidebar';
import { ImagePreview } from './components/ImagePreview';
import { NavigationRail } from './components/NavigationRail';
import { HomeView } from './components/HomeView';
import { SettingsView } from './components/SettingsView';
import { ProfileView } from './components/ProfileView';
import { LoginView } from './components/LoginView';
import { VideoUnderstandingView } from './components/VideoUnderstandingView';
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
  const [currentView, setCurrentView] = useState<string>('home');
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>('system');

  useEffect(() => {
    const savedTheme = localStorage.getItem('fashion_ai_theme') as ThemeMode;
    if (savedTheme) {
      setTheme(savedTheme);
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
    localStorage.setItem('fashion_ai_theme', theme);
  }, [theme]);

  const [state, setState] = useState<AppState>({
    apiProvider: 'google',
    mode: 'saree',
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
    quality: 'Standard',
    aspectRatio: '3:4',
    customWidth: 10,
    customHeight: 10,
    enableOutfitColor: false,
    outfitColor: '#ff0000',
    enableJewellery: false,
    jewelleryImage: null,
    jewelleryDescription: '',
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
    
    // Trigger generation with the new state directly to avoid waiting for React's async update
    setIsGenerating(true);
    setError(null);
    setProgressMsg(null);
    try {
      const result = await generateFashionMedia(newState, setProgressMsg);
      setGeneratedImage(result);
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
    const savedPresets = localStorage.getItem('fashion_ai_presets');
    if (savedPresets) {
      try {
        setPresets(JSON.parse(savedPresets));
      } catch (e) {
        console.error("Failed to parse presets", e);
      }
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
    localStorage.setItem('fashion_ai_presets', JSON.stringify(updated));
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
    localStorage.setItem('fashion_ai_presets', JSON.stringify(updated));
  };

  const handleGenerate = async () => {
    let apiKey = '';
    if (state.apiProvider === 'google') {
      apiKey = localStorage.getItem('custom_gemini_api_key') || '';
    }

    const hasCustomKey = apiKey && apiKey.trim() !== '';
    const requiresPaidKey = state.imageModel === 'gemini-hq' || state.imageModel === 'veo-fast';

    if (!hasCustomKey && !requiresPaidKey) {
      setError(`Please add your Google AI Studio API Key in the Profile section to generate.`);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgressMsg(null);
    
    // Clear any previous animation reference when starting a fresh generation
    const currentState = { ...state, animateReferenceImage: null };
    setState(currentState);

    try {
      const result = await generateFashionMedia(currentState, setProgressMsg);
      setGeneratedImage(result);
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

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-900 overflow-hidden font-sans transition-colors">
      <NavigationRail currentView={currentView} setCurrentView={setCurrentView} />
      
      {currentView === 'home' && <HomeView setCurrentView={setCurrentView} setState={setState} />}
      
      {currentView === 'settings' && <SettingsView theme={theme} setTheme={setTheme} />}
      
      {currentView === 'profile' && <ProfileView state={state} setState={setState} />}

      {currentView === 'video' && <VideoUnderstandingView />}
      
      {currentView === 'create' && (
        <>
          <Sidebar
            state={state}
            setState={setState}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            onUpgradeToPro={() => {}}
            presets={presets}
            onSavePreset={handleSavePreset}
            onLoadPreset={handleLoadPreset}
            onDeletePreset={handleDeletePreset}
          />
          <div className="flex-1 flex flex-col relative">
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
            />
          </div>
        </>
      )}
    </div>
  );
}
