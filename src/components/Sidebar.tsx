import React, { useState } from 'react';
import { AppState, AppMode, Gender, Pose, StyleExtra, BackgroundType, ImageQuality, AspectRatio, Preset, CreationType } from '../types';
import { Uploader } from './Uploader';
import { Sliders, Palette, Layout, Wand2, Image as ImageIcon, Bookmark, Save, Trash2, Sparkles, Gem, ShieldCheck, Ruler, Scissors, Plus, Tag } from 'lucide-react';
import { FidelityMode } from '../types';

interface SidebarProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onGenerate: () => void;
  isGenerating: boolean;
  onUpgradeToPro: () => void;
  presets: Preset[];
  onSavePreset: (name: string) => void;
  onLoadPreset: (preset: Preset) => void;
  onDeletePreset: (id: string) => void;
  userCredits: number;
  freeGenerationsUsed: number;
}

export function Sidebar({ state, setState, onGenerate, isGenerating, onUpgradeToPro, presets, onSavePreset, onLoadPreset, onDeletePreset, userCredits, freeGenerationsUsed }: SidebarProps) {
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);

  const handleEnhancePrompt = async () => {
    if (!state.customPrompt.trim()) return;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      alert("API key is missing. Please check your environment variables.");
      return;
    }

    setIsEnhancingPrompt(true);
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `User idea: ${state.customPrompt}`,
        config: {
          systemInstruction: "You are the AI Fashion Architect for a high-end fashion app. Your job is to take a simple user idea and turn it into a 'Cinematic Masterpiece Prompt' optimized for image generation.\n\nGuidelines:\n\nVisual Detail: Describe lighting (cinematic, volumetric), camera angle, and texture (hyper-realistic, 4k, 8k).\n\nPose & Expression: Focus on the model's pose and expression.\n\nConstraint: Keep the prompt under 100 words but make it extremely descriptive.\n\nOutput Format: Provide only the final refined prompt. Do not add conversational filler."
        }
      });
      if (response.text) {
        updateState('customPrompt', response.text.trim());
      }
    } catch (error: any) {
      console.error('Error enhancing prompt:', error);
      alert(error.message || "Failed to enhance prompt. Please check your API key.");
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  const updateState = (key: keyof AppState, value: any) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const handleMultiModelUpdate = (index: number, key: string, value: string | null) => {
    setState(prev => {
      const newModels = [...prev.catalogueModels];
      if (!newModels[index]) {
        newModels[index] = {
          id: index,
          garmentType: prev.garmentType,
          outfitImage: null,
          dressTopImage: null,
          dressBottomImage: null,
          dressDupattaImage: null,
          sareeImage: null,
          blouseImage: null
        };
      }
      (newModels[index] as any)[key] = value;
      return { ...prev, catalogueModels: newModels };
    });
  };



  return (
    <div className="w-80 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-colors">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden shrink-0">
              <img 
                src="/Logo.png" 
                alt="AI Open Image" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = document.getElementById('sidebar-logo-fallback');
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              <Wand2 id="sidebar-logo-fallback" className="hidden w-5 h-5 text-indigo-600" />
            </div>
            AI Open Image
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Generate high-res model photos</p>
        </div>
        {userCredits > 0 ? (
          <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
            <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">Balance</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{userCredits} Credits</span>
              <button 
                onClick={onUpgradeToPro}
                className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-md font-bold hover:bg-indigo-700 transition-colors"
              >
                BUY
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={onUpgradeToPro}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl border border-indigo-500 shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-bold">Buy Credits</span>
          </button>
        )}
      </div>

      <div className="p-6 flex-1 space-y-8 overflow-y-auto min-h-0">
        {/* 1. Image Model */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            Image Model
          </label>
          <div className="grid grid-cols-3 gap-2">
            {state.apiProvider === 'google' && (
              <>
                <button
                  onClick={() => { updateState('imageModel', 'gemini-fast'); updateState('outputFormat', 'image'); }}
                  className={`py-2 px-3 text-sm font-medium rounded-lg transition-colors ${
                    state.imageModel === 'gemini-fast'
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Gemini (Fast)
                </button>
                <button
                  onClick={() => { updateState('imageModel', 'gemini-hq'); updateState('outputFormat', 'image'); }}
                  className={`py-2 px-3 text-sm font-medium rounded-lg transition-colors ${
                    state.imageModel === 'gemini-hq'
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Gemini (HQ)
                </button>
                <button
                  onClick={() => { updateState('imageModel', 'veo-fast'); updateState('outputFormat', 'video'); }}
                  className={`py-2 px-3 text-sm font-medium rounded-lg transition-colors ${
                    state.imageModel === 'veo-fast'
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Veo (Video)
                </button>
              </>
            )}
          </div>
        </div>

        {/* 2. Advanced Fidelity & Consistency */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            Advanced Fidelity & Consistency
          </label>
          
          <div className="space-y-4 p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100/50 dark:border-indigo-800/30">
            <div>
              <label className="block text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">Fidelity Mode (IP-Adapter)</label>
              <div className="grid grid-cols-1 gap-2">
                {(['Standard', 'High', 'Ultra (Strict Design Matching)'] as FidelityMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => updateState('fidelityMode', mode)}
                    className={`py-1.5 px-3 text-xs font-medium rounded-lg transition-all ${
                      state.fidelityMode === mode
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Ruler className="w-3 h-3" />
                Structure Reference (Canny)
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={state.structureReference} 
                  onChange={e => updateState('structureReference', e.target.checked)} 
                />
                <div className="w-8 h-4 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Denoising Strength</label>
                <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-1.5 rounded">{state.denoisingStrength.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={state.denoisingStrength}
                onChange={e => updateState('denoisingStrength', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-indigo-200 dark:bg-indigo-900/50 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[8px] text-gray-400 uppercase font-bold tracking-wider">
                <span>Heavy Copy</span>
                <span>Creative</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Scissors className="w-3 h-3" />
                In-Painting Mode
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={state.inPaintingMode} 
                  onChange={e => updateState('inPaintingMode', e.target.checked)} 
                />
                <div className="w-8 h-4 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* 3. Presets */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              Presets
            </label>
            <button
              onClick={() => setIsSavingPreset(true)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              <Save className="w-3 h-3" /> Save Current
            </button>
          </div>
          
          {isSavingPreset && (
            <div className="flex gap-2 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Preset name..."
                className="flex-1 text-xs border border-gray-200 dark:border-gray-700 rounded-md p-1.5 bg-white dark:bg-gray-800 dark:text-white outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && presetName.trim()) {
                    onSavePreset(presetName.trim());
                    setPresetName('');
                    setIsSavingPreset(false);
                  }
                }}
              />
              <button
                onClick={() => {
                  if (presetName.trim()) {
                    onSavePreset(presetName.trim());
                    setPresetName('');
                    setIsSavingPreset(false);
                  }
                }}
                disabled={!presetName.trim()}
                className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setPresetName('');
                  setIsSavingPreset(false);
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
            {presets.map(preset => (
              <div key={preset.id} className="group relative">
                <button
                  onClick={() => onLoadPreset(preset)}
                  className="w-full text-left py-2 px-3 text-xs border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 dark:hover:border-indigo-500 transition-colors truncate pr-8 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  {preset.name}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePreset(preset.id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            {presets.length === 0 && !isSavingPreset && (
              <div className="col-span-2 text-center py-4 text-xs text-gray-500 dark:text-gray-400 italic">
                No presets saved yet
              </div>
            )}
          </div>
        </div>

        {/* 4. Garments & Layout */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            Garments & Layout
          </label>
          
          {((state.creationType === 'Poster' && state.posterPages === 2) || state.creationType === 'Catalogue') && (
            <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">Cover Page</label>
              {state.mode === 'saree' || state.garmentType === 'Saree' ? (
                <>
                  <Uploader label="Upload Cover Saree Drape" image={state.coverSareeImage} onChange={img => updateState('coverSareeImage', img)} libraryType="saree" />
                  <Uploader label="Upload Cover Blouse" image={state.coverBlouseImage} onChange={img => updateState('coverBlouseImage', img)} libraryType="blouse" />
                </>
              ) : state.garmentType === 'Dress' ? (
                <>
                  <Uploader label="Upload Cover Dress Top" image={state.coverDressTopImage} onChange={img => updateState('coverDressTopImage', img)} libraryType="outfit" />
                  <Uploader label="Upload Cover Dress Bottom" image={state.coverDressBottomImage} onChange={img => updateState('coverDressBottomImage', img)} libraryType="outfit" />
                  <Uploader label="Upload Cover Dupatta" image={state.coverDressDupattaImage} onChange={img => updateState('coverDressDupattaImage', img)} libraryType="outfit" />
                </>
              ) : (
                <Uploader 
                  label="Upload Cover Page Closeup" 
                  image={state.coverCloseupImage} 
                  onChange={img => updateState('coverCloseupImage', img)} 
                  libraryType="outfit"
                />
              )}
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Back design will be generated automatically.</p>
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Creation Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => updateState('creationType', 'Photo')}
                className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-colors ${
                  state.creationType === 'Photo'
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Photo
              </button>
              <button
                onClick={() => updateState('creationType', 'Poster')}
                className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-colors ${
                  state.creationType === 'Poster'
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Poster
              </button>
              <button
                onClick={() => updateState('creationType', 'Catalogue')}
                className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-colors ${
                  state.creationType === 'Catalogue'
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Catalogue
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Model Count</label>
            <select
              value={[1, 2, 6, 8, 10, 12].includes(state.modelCount) ? state.modelCount : 0}
              onChange={e => updateState('modelCount', parseInt(e.target.value) || 0)}
              className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            >
              <option value={1}>Single Model</option>
              <option value={2}>2 Models</option>
              <option value={6}>6 Models</option>
              <option value={8}>8 Models</option>
              <option value={10}>10 Models</option>
              <option value={12}>12 Models</option>
              <option value={0}>Custom</option>
            </select>
            
            {![1, 2, 6, 8, 10, 12].includes(state.modelCount) && (
              <input
                type="number"
                min="1"
                max="100"
                value={state.modelCount || ''}
                onChange={e => updateState('modelCount', parseInt(e.target.value) || 0)}
                placeholder="Enter number of models"
                className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors mt-2"
              />
            )}
          </div>

          {state.creationType === 'Catalogue' && (
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Catalogue Pages</label>
              <select
                value={state.cataloguePages}
                onChange={e => updateState('cataloguePages', parseInt(e.target.value) as any)}
                className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              >
                <option value={12}>12 Pages</option>
                <option value={14}>14 Pages</option>
                <option value={16}>16 Pages</option>
                <option value={18}>18 Pages</option>
                <option value={20}>20 Pages</option>
                <option value={22}>22 Pages</option>
                <option value={24}>24 Pages</option>
                <option value={26}>26 Pages</option>
                <option value={28}>28 Pages</option>
                <option value={30}>30 Pages</option>
                <option value={32}>32 Pages</option>
              </select>
            </div>
          )}

          {state.creationType === 'Poster' && (
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Poster Length</label>
              <select
                value={state.posterPages}
                onChange={e => updateState('posterPages', parseInt(e.target.value) as any)}
                className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              >
                <option value={1}>1 Page (Standard)</option>
                <option value={2}>2 Pages (Tall)</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Garment Type</label>
            <select
              value={state.garmentType}
              onChange={e => {
                updateState('garmentType', e.target.value as any);
                if (e.target.value === 'Saree') {
                  updateState('mode', 'saree');
                } else if (state.mode === 'saree') {
                  updateState('mode', 'outfit');
                }
              }}
              className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            >
              <option value="Saree">Saree</option>
              <option value="Dress">Dress</option>
              <option value="T-Shirt">T-Shirt</option>
              <option value="Shirt">Shirt</option>
              <option value="Pants">Pants</option>
              <option value="Skirt">Skirt</option>
              <option value="Jacket">Jacket</option>
              <option value="Sweater">Sweater</option>
              <option value="Suit">Suit</option>
              <option value="Activewear">Activewear</option>
              <option value="Swimwear">Swimwear</option>
              <option value="Lingerie">Lingerie</option>
              <option value="Man's Kurta">Man's Kurta</option>
              <option value="Men's Dress">Men's Dress</option>
              <option value="Women's Dress">Women's Dress</option>
              <option value="Stole">Stole</option>
              <option value="Men's Innerwear">Men's Innerwear</option>
              <option value="Women's Innerwear">Women's Innerwear</option>
              <option value="Men's Bottomwear">Men's Bottomwear</option>
              <option value="Women's Bottomwear">Women's Bottomwear</option>
              <option value="Jewelry">Jewelry</option>
            </select>
          </div>

          {state.modelCount === 1 ? (
            <>
              {state.mode === 'saree' || state.garmentType === 'Saree' ? (
                <>
                  <Uploader label="Upload Saree Drape" image={state.sareeImage} onChange={img => updateState('sareeImage', img)} libraryType="saree" />
                  <Uploader label="Upload Blouse" image={state.blouseImage} onChange={img => updateState('blouseImage', img)} libraryType="blouse" />
                </>
              ) : state.garmentType === 'Dress' ? (
                <>
                  <Uploader label="Upload Dress Top" image={state.dressTopImage} onChange={img => updateState('dressTopImage', img)} libraryType="outfit" />
                  <Uploader label="Upload Dress Bottom" image={state.dressBottomImage} onChange={img => updateState('dressBottomImage', img)} libraryType="outfit" />
                  <Uploader label="Upload Dupatta" image={state.dressDupattaImage} onChange={img => updateState('dressDupattaImage', img)} libraryType="outfit" />
                </>
              ) : (
                <Uploader label="Upload Outfit Image" image={state.outfitImage} onChange={img => updateState('outfitImage', img)} libraryType="outfit" />
              )}
            </>
          ) : (
            <div className="space-y-6 mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Model Garments ({state.modelCount} Models)</label>
              {Array.from({ length: state.modelCount }).map((_, index) => {
                const model = state.catalogueModels[index] || {};
                
                return (
                  <div key={index} className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Model {index + 1}</p>
                    {state.mode === 'saree' || state.garmentType === 'Saree' ? (
                      <>
                        <Uploader label={`Model ${index + 1} Saree Drape`} image={model.sareeImage || null} onChange={img => handleMultiModelUpdate(index, 'sareeImage', img)} libraryType="saree" />
                        <Uploader label={`Model ${index + 1} Blouse`} image={model.blouseImage || null} onChange={img => handleMultiModelUpdate(index, 'blouseImage', img)} libraryType="blouse" />
                      </>
                    ) : state.garmentType === 'Dress' ? (
                      <>
                        <Uploader label={`Model ${index + 1} Dress Top`} image={model.dressTopImage || null} onChange={img => handleMultiModelUpdate(index, 'dressTopImage', img)} libraryType="outfit" />
                        <Uploader label={`Model ${index + 1} Dress Bottom`} image={model.dressBottomImage || null} onChange={img => handleMultiModelUpdate(index, 'dressBottomImage', img)} libraryType="outfit" />
                        <Uploader label={`Model ${index + 1} Dupatta`} image={model.dressDupattaImage || null} onChange={img => handleMultiModelUpdate(index, 'dressDupattaImage', img)} libraryType="outfit" />
                      </>
                    ) : (
                      <Uploader label={`Model ${index + 1} Outfit Image`} image={model.outfitImage || null} onChange={img => handleMultiModelUpdate(index, 'outfitImage', img)} libraryType="outfit" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. Model & Pose */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            Model & Pose
          </label>
          
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Gender</label>
            <select
              value={state.gender}
              onChange={e => updateState('gender', e.target.value as Gender)}
              className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Non-binary">Non-binary</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Pose</label>
            <select
              value={state.pose}
              onChange={e => updateState('pose', e.target.value as Pose)}
              className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            >
              <option value="Standing">Standing</option>
              <option value="Walking">Walking</option>
              <option value="Sitting">Sitting</option>
              <option value="Dynamic">Dynamic</option>
              <option value="Fancy Pose">Fancy Pose</option>
            </select>
          </div>

          <div className="pt-2">
            <Uploader 
              label="Model Face/Body Reference (Optional)" 
              image={state.modelReferenceImage} 
              onChange={img => updateState('modelReferenceImage', img)} 
              libraryType="outfit"
            />
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-tight">Upload a reference image to keep the model's appearance consistent across generations.</p>
          </div>
        </div>

        {/* 6. Style & Environment */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Palette className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            Style & Environment
          </label>

          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Style Extras</label>
            <select
              value={state.styleExtra}
              onChange={e => updateState('styleExtra', e.target.value as StyleExtra)}
              className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            >
              <option value="None">None</option>
              <option value="Cinematic">Cinematic</option>
              <option value="Studio">Studio</option>
              <option value="Vintage">Vintage</option>
              <option value="Editorial">Editorial</option>
              <option value="Hold Clutch">Hold Clutch</option>
              <option value="Sunglasses">Sunglasses</option>
              <option value="Sun Hat">Sun Hat</option>
              <option value="Coffee Cup">Coffee Cup</option>
              <option value="Phone">Phone</option>
              <option value="Hands on Hips">Hands on Hips</option>
              <option value="Scarf">Scarf</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Background</label>
            <select
              value={state.background}
              onChange={e => updateState('background', e.target.value as BackgroundType)}
              className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            >
              <option value="Solid Color">Solid Color</option>
              <option value="Outdoor">Outdoor</option>
              <option value="Studio">Studio</option>
              <option value="Cyberpunk City">Cyberpunk City</option>
              <option value="Minimalist Studio">Minimalist Studio</option>
              <option value="Vintage Mansion">Vintage Mansion</option>
              <option value="Neon Lights">Neon Lights</option>
              <option value="Beach Resort">Beach Resort</option>
              <option value="Luxury Hotel">Luxury Hotel</option>
              <option value="Urban Street">Urban Street</option>
              <option value="Custom">Custom Prompt</option>
              <option value="Uploaded">Upload Background</option>
              <option value="AI Generated">AI Generated Background</option>
            </select>
          </div>

          {state.background === 'Solid Color' && (
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Color Name/Hex</label>
              <input
                type="text"
                value={state.customBackground}
                onChange={e => updateState('customBackground', e.target.value)}
                placeholder="e.g. #F5F5F5 or Light Gray"
                className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              />
            </div>
          )}

          {state.background === 'Custom' && (
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Custom Background Prompt</label>
              <input
                type="text"
                value={state.customBackground}
                onChange={e => updateState('customBackground', e.target.value)}
                placeholder="e.g. A bustling street in Paris during sunset"
                className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              />
            </div>
          )}

          {state.background === 'Uploaded' && (
            <Uploader 
              label="Upload Background" 
              image={state.backgroundImage} 
              onChange={img => updateState('backgroundImage', img)} 
            />
          )}

          {state.background === 'AI Generated' && (
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">AI Background Style</label>
              <input
                type="text"
                value={state.aiBackgroundStyle}
                onChange={e => updateState('aiBackgroundStyle', e.target.value)}
                placeholder="e.g. Dreamy forest with glowing mushrooms"
                className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              />
            </div>
          )}
        </div>

        {/* 7. Output Settings */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Layout className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            Output Settings
          </label>

          {state.outputFormat === 'image' ? (
            <>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Image Resolution</label>
                <select
                  value={state.quality}
                  onChange={e => updateState('quality', e.target.value as ImageQuality)}
                  className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                >
                  <option value="Low Res (Free)">Low Res (Free)</option>
                  <option value="Standard">Standard</option>
                  <option value="HD">HD</option>
                  <option value="FHD">Full HD</option>
                  <option value="2K">2K</option>
                  <option value="4K">4K</option>
                  <option value="Ultra">Ultra</option>
                  <option value="Gigapixel">Gigapixel Mode (Max)</option>
                  <option value="Print (5792x8688)">Print (5792x8688)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Aspect Ratio</label>
                <select
                  value={state.aspectRatio}
                  onChange={e => updateState('aspectRatio', e.target.value as AspectRatio)}
                  className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                >
                  <option value="1:1">1:1 (Square)</option>
                  <option value="3:4">3:4 (Portrait)</option>
                  <option value="4:3">4:3 (Landscape)</option>
                  <option value="9:16">9:16 (Story/Reel)</option>
                  <option value="16:9">16:9 (Widescreen)</option>
                  <option value="1:4">1:4 (Banner Portrait)</option>
                  <option value="1:8">1:8 (Tall Banner)</option>
                  <option value="4:1">4:1 (Banner Landscape)</option>
                  <option value="8:1">8:1 (Wide Banner)</option>
                  <option value="12x18">12x18 (Poster)</option>
                  <option value="6x9">6x9 (Book Cover)</option>
                  <option value="13x19">13x19 (Super B)</option>
                  <option value="9x12">9x12 (Art Print)</option>
                  <option value="13x40">13x40 (Panoramic Vertical)</option>
                  <option value="13x30">13x30 (Panoramic Portrait)</option>
                  <option value="10x14">10x14 (Art Canvas)</option>
                  <option value="Custom">Custom Dimensions</option>
                </select>
              </div>

              {state.aspectRatio === 'Custom' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Unit</label>
                      <select
                        value={state.customUnit || 'inches'}
                        onChange={e => updateState('customUnit', e.target.value as any)}
                        className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      >
                        <option value="pixels">pixels</option>
                        <option value="inches">inches</option>
                        <option value="cm">cm</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Width</label>
                      <input
                        type="number"
                        value={state.customWidth}
                        onChange={e => updateState('customWidth', parseInt(e.target.value) || (state.customUnit === 'pixels' ? 1024 : 10))}
                        className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Height</label>
                      <input
                        type="number"
                        value={state.customHeight}
                        onChange={e => updateState('customHeight', parseInt(e.target.value) || (state.customUnit === 'pixels' ? 1024 : 10))}
                        className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Resolution (DPI)</label>
                    <input
                      type="number"
                      value={state.customDPI || 300}
                      onChange={e => updateState('customDPI', parseInt(e.target.value) || 300)}
                      className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Video Resolution</label>
                <select
                  value={state.videoResolution}
                  onChange={e => updateState('videoResolution', e.target.value as VideoResolution)}
                  className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                >
                  <option value="720p">720p</option>
                  <option value="1080p">1080p</option>
                  <option value="4K Ultra Master">4K Ultra Master</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Duration (Seconds)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={state.videoDuration}
                  onChange={e => updateState('videoDuration', parseInt(e.target.value) || 1)}
                  className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </>
          )}
        </div>

        {/* 8. Target Outfit Color */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Palette className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              Target Outfit Color
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={state.enableOutfitColor} 
                onChange={e => updateState('enableOutfitColor', e.target.checked)} 
              />
              <div className="w-8 h-4 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          
          {state.enableOutfitColor && (
            <input
              type="text"
              value={state.outfitColor}
              onChange={e => updateState('outfitColor', e.target.value)}
              placeholder="e.g. Emerald Green, #FF5733"
              className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            />
          )}
        </div>
        
        {/* 9. Jewellery */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Gem className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              Jewellery
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={state.enableJewellery} 
                onChange={e => updateState('enableJewellery', e.target.checked)} 
              />
              <div className="w-8 h-4 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          
          {state.enableJewellery && (
            <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <Uploader 
                label="Upload Jewellery Ref (Optional)" 
                image={state.jewelleryImage} 
                onChange={img => updateState('jewelleryImage', img)} 
              />
              <div>
                <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-bold">Jewellery Description</label>
                <input
                  type="text"
                  value={state.jewelleryDescription}
                  onChange={e => updateState('jewelleryDescription', e.target.value)}
                  placeholder="e.g. Heavy Kundan necklace with matching earrings"
                  className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          )}
        </div>
        
        {/* 10. Color Customization (Recolor) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Palette className="w-4 h-4 text-pink-500" />
              Color Customization (Recolor)
            </label>
          </div>
          
          <div className="border border-dashed border-pink-500/50 rounded-lg p-2">
            <button 
              onClick={() => {
                const newMods = [...state.colorModifications, { id: Math.random().toString(), element: '', color: '' }];
                updateState('colorModifications', newMods);
              }}
              className="w-full text-xs text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 px-2 py-1.5 rounded-md font-medium transition-colors flex items-center justify-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add Color Change
            </button>
          </div>
          
          {state.colorModifications.length > 0 && (
            <div className="space-y-2 mt-3">
              {state.colorModifications.map((mod, index) => (
                <div key={mod.id} className="flex gap-2 items-start">
                  <input
                    type="text"
                    value={mod.element}
                    onChange={e => {
                      const newMods = [...state.colorModifications];
                      newMods[index].element = e.target.value;
                      updateState('colorModifications', newMods);
                    }}
                    placeholder="Element (e.g. Blouse)"
                    className="flex-1 text-xs border border-gray-200 dark:border-gray-700 rounded-lg p-1.5 bg-white dark:bg-gray-800 dark:text-white outline-none"
                  />
                  <input
                    type="text"
                    value={mod.color}
                    onChange={e => {
                      const newMods = [...state.colorModifications];
                      newMods[index].color = e.target.value;
                      updateState('colorModifications', newMods);
                    }}
                    placeholder="Color"
                    className="w-20 text-xs border border-gray-200 dark:border-gray-700 rounded-lg p-1.5 bg-white dark:bg-gray-800 dark:text-white outline-none"
                  />
                  <button
                    onClick={() => {
                      const newMods = state.colorModifications.filter(m => m.id !== mod.id);
                      updateState('colorModifications', newMods);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 11. Branding Details */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            Branding Details
          </label>
          
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <Uploader 
              label="Brand Logo (Optional)" 
              image={state.brandLogo} 
              onChange={img => updateState('brandLogo', img)} 
            />
            
            {state.brandLogo && (
              <div className="flex items-start gap-3">
                <label className="relative inline-flex items-center cursor-pointer mt-1">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={state.brandWatermark} 
                    onChange={e => updateState('brandWatermark', e.target.checked)} 
                  />
                  <div className="w-8 h-4 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Add brand logo as center watermark</label>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Places a faint brand logo in the center of the image</p>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Brand Name (Optional)</label>
              <input
                type="text"
                value={state.brandName}
                onChange={e => updateState('brandName', e.target.value)}
                placeholder="e.g. Royal Silks"
                className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Design Number (Optional)</label>
              <input
                type="text"
                value={state.designNumber}
                onChange={e => updateState('designNumber', e.target.value)}
                placeholder="e.g. RS-2024-001"
                className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* 12. Custom Prompt */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-gray-500" />
              Custom Prompt
            </label>
            <button 
              onClick={handleEnhancePrompt} 
              disabled={!state.customPrompt.trim() || isEnhancingPrompt}
              className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 px-2 py-1 rounded font-medium disabled:opacity-50 transition-colors flex items-center gap-1"
            >
              {isEnhancingPrompt ? (
                <div className="w-3 h-3 border border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              Enhance Prompt
            </button>
          </div>
          <textarea
            value={state.customPrompt}
            onChange={e => updateState('customPrompt', e.target.value)}
            placeholder="Add specific details (e.g., 'model wearing sunglasses', 'windy hair')"
            className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-h-[80px] resize-none transition-colors"
          />
        </div>
      </div>
<div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-3 transition-colors shrink-0 mt-auto">

        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400 font-medium">Generation Cost:</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
            {(() => {
              const videoMultiplier = state.outputFormat === 'video' ? (state.videoDuration || 1) : 1;
              let pageMultiplier = 1;
              if (state.outputFormat === 'image') {
                if (state.creationType === 'Poster') {
                  pageMultiplier = state.posterPages || 1;
                } else if (state.creationType === 'Catalogue') {
                  pageMultiplier = state.cataloguePages || 12;
                }
              }
              const modelMultiplier = state.modelCount || 1;
              const baseCost = state.outputFormat === 'video' 
                ? (state.videoResolution === '4K Ultra Master' ? 3 : state.videoResolution === '1080p' ? 2 : 1)
                : (state.quality === 'Low Res (Free)' ? 0 : 
                   state.quality === 'Standard' || state.quality === 'HD' ? 1 :
                   state.quality === 'FHD' || state.quality === '2K' ? 2 :
                   state.quality === '4K' || state.quality === 'Ultra' ? 3 : 4);
              const cost = baseCost * videoMultiplier * pageMultiplier * modelMultiplier;
              return `${cost} Credits`;
            })()}
          </span>
        </div>
        <button
          onClick={onGenerate}
          disabled={
            isGenerating || 
            (state.mode === 'catalogue' 
              ? (!state.catalogueModels || state.catalogueModels.every(m => 
                  !m.outfitImage && !m.dressTopImage && !m.dressBottomImage && !m.dressDupattaImage && !m.sareeImage && !m.blouseImage
                ))
              : state.mode === 'saree' 
                ? (!state.sareeImage && !state.blouseImage) 
                : (state.garmentType === 'Dress' 
                    ? (!state.dressTopImage && !state.dressBottomImage && !state.dressDupattaImage) 
                    : !state.outfitImage)) ||
            (state.background === 'Uploaded' && !state.backgroundImage) ||
            (() => {
              const isFreeTier = state.outputFormat === 'image' && state.quality === 'Low Res (Free)';
              if (isFreeTier && freeGenerationsUsed >= 3) return true;
              
              const videoMultiplier = state.outputFormat === 'video' ? (state.videoDuration || 1) : 1;
              let pageMultiplier = 1;
              if (state.outputFormat === 'image') {
                if (state.creationType === 'Poster') {
                  pageMultiplier = state.posterPages || 1;
                } else if (state.creationType === 'Catalogue') {
                  pageMultiplier = state.cataloguePages || 12;
                }
              }
              const modelMultiplier = state.modelCount || 1;
              const baseCost = state.outputFormat === 'video' 
                ? (state.videoResolution === '4K Ultra Master' ? 3 : state.videoResolution === '1080p' ? 2 : 1)
                : (state.quality === 'Low Res (Free)' ? 0 : 
                   state.quality === 'Standard' || state.quality === 'HD' ? 1 :
                   state.quality === 'FHD' || state.quality === '2K' ? 2 :
                   state.quality === '4K' || state.quality === 'Ultra' ? 3 : 4);
              const cost = baseCost * videoMultiplier * pageMultiplier * modelMultiplier;
              return userCredits < cost;
            })()
          }
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (() => {
              const isFreeTier = state.outputFormat === 'image' && state.quality === 'Low Res (Free)';
              if (isFreeTier && freeGenerationsUsed >= 3) return 'limit_reached';
              
              const videoMultiplier = state.outputFormat === 'video' ? (state.videoDuration || 1) : 1;
              let pageMultiplier = 1;
              if (state.outputFormat === 'image') {
                if (state.creationType === 'Poster') {
                  pageMultiplier = state.posterPages || 1;
                } else if (state.creationType === 'Catalogue') {
                  pageMultiplier = state.cataloguePages || 12;
                }
              }
              const modelMultiplier = state.modelCount || 1;
              const baseCost = state.outputFormat === 'video' 
                ? (state.videoResolution === '4K Ultra Master' ? 3 : state.videoResolution === '1080p' ? 2 : 1)
                : (state.quality === 'Low Res (Free)' ? 0 : 
                   state.quality === 'Standard' || state.quality === 'HD' ? 1 :
                   state.quality === 'FHD' || state.quality === '2K' ? 2 :
                   state.quality === '4K' || state.quality === 'Ultra' ? 3 : 4);
              const cost = baseCost * videoMultiplier * pageMultiplier * modelMultiplier;
              return userCredits < cost ? 'insufficient' : 'ok';
            })() === 'limit_reached' ? (
            <>
              <Wand2 className="w-4 h-4" />
              Free Limit Reached (Upgrade)
            </>
          ) : (() => {
              const isFreeTier = state.outputFormat === 'image' && state.quality === 'Low Res (Free)';
              if (isFreeTier && freeGenerationsUsed >= 3) return 'limit_reached';
              
              const videoMultiplier = state.outputFormat === 'video' ? (state.videoDuration || 1) : 1;
              let pageMultiplier = 1;
              if (state.outputFormat === 'image') {
                if (state.creationType === 'Poster') {
                  pageMultiplier = state.posterPages || 1;
                } else if (state.creationType === 'Catalogue') {
                  pageMultiplier = state.cataloguePages || 12;
                }
              }
              const modelMultiplier = state.modelCount || 1;
              const baseCost = state.outputFormat === 'video' 
                ? (state.videoResolution === '4K Ultra Master' ? 3 : state.videoResolution === '1080p' ? 2 : 1)
                : (state.quality === 'Low Res (Free)' ? 0 : 
                   state.quality === 'Standard' || state.quality === 'HD' ? 1 :
                   state.quality === 'FHD' || state.quality === '2K' ? 2 :
                   state.quality === '4K' || state.quality === 'Ultra' ? 3 : 4);
              const cost = baseCost * videoMultiplier * pageMultiplier * modelMultiplier;
              return userCredits < cost ? 'insufficient' : 'ok';
            })() === 'insufficient' ? (
            <>
              <Wand2 className="w-4 h-4" />
              Insufficient Credits
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Start Creating
            </>
          )}
        </button>
      </div>
    </div>
  );
}
