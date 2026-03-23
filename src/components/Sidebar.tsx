import React, { useState } from 'react';
import { AppState, AppMode, Gender, Pose, StyleExtra, BackgroundType, ImageQuality, AspectRatio, Preset } from '../types';
import { Uploader } from './Uploader';
import { Sliders, Palette, Layout, Wand2, Image as ImageIcon, Bookmark, Save, Trash2, Sparkles, Gem, ShieldCheck, Ruler, Scissors } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
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
}

export function Sidebar({ state, setState, onGenerate, isGenerating, onUpgradeToPro, presets, onSavePreset, onLoadPreset, onDeletePreset }: SidebarProps) {
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);

  const handleEnhancePrompt = async () => {
    if (!state.customPrompt.trim()) return;
    
    const apiKey = localStorage.getItem('custom_gemini_api_key');
    if (!apiKey) {
      alert("Please add your Google AI Studio API Key in the Profile section to use this feature.");
      return;
    }

    setIsEnhancingPrompt(true);
    try {
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



  return (
    <div className="w-80 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto flex flex-col transition-colors">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="AI Open Image" 
              className="w-8 h-8 object-contain rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = document.getElementById('sidebar-logo-fallback');
                if (fallback) fallback.style.display = 'block';
              }}
            />
            <Wand2 id="sidebar-logo-fallback" className="hidden w-6 h-6 text-indigo-600" />
            AI Open Image
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Generate high-res model photos</p>
        </div>
      </div>

      <div className="p-6 flex-1 space-y-8">
        {/* Model Selection */}
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

        {/* Advanced Fidelity Controls */}
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
                className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[8px] text-gray-400 uppercase font-bold">
                <span>Strict Copy</span>
                <span>Creative</span>
              </div>
            </div>

            <div className="pt-2 border-t border-indigo-100/50 dark:border-indigo-800/30">
              <div className="flex items-center justify-between mb-2">
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
              {state.inPaintingMode && (
                <Uploader 
                  label="Upload Mask Image" 
                  image={state.inPaintingMask} 
                  onChange={img => updateState('inPaintingMask', img)} 
                />
              )}
            </div>
          </div>
        </div>

        {/* Presets */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              Presets
            </label>
            {!isSavingPreset && (
              <button
                onClick={() => setIsSavingPreset(true)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
              >
                <Save className="w-3 h-3" /> Save Current
              </button>
            )}
          </div>

          {isSavingPreset && (
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
              <input
                type="text"
                value={presetName}
                onChange={e => setPresetName(e.target.value)}
                placeholder="Preset name..."
                className="flex-1 text-sm border-none outline-none bg-transparent dark:text-white dark:placeholder-gray-500"
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter' && presetName.trim()) {
                    onSavePreset(presetName.trim());
                    setPresetName('');
                    setIsSavingPreset(false);
                  } else if (e.key === 'Escape') {
                    setIsSavingPreset(false);
                    setPresetName('');
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
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded font-medium transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsSavingPreset(false);
                  setPresetName('');
                }}
                className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {presets.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {presets.map(preset => (
                <div key={preset.id} className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors group">
                  <button
                    onClick={() => onLoadPreset(preset)}
                    className="text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium truncate flex-1 text-left transition-colors"
                  >
                    {preset.name}
                  </button>
                  <button
                    onClick={() => onDeletePreset(preset.id)}
                    className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete preset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mode Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Layout className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            Studio Mode
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['saree', 'outfit'] as AppMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => updateState('mode', mode)}
                className={`py-2 px-3 text-sm font-medium rounded-lg transition-colors ${
                  state.mode === mode
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {mode === 'saree' ? 'Saree Studio' : 'Outfit Studio'}
              </button>
            ))}
          </div>
        </div>

        {/* Uploads */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            Garments
          </label>
          
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Garment Type</label>
            <select
              value={state.garmentType}
              onChange={e => updateState('garmentType', e.target.value as any)}
              className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            >
              <option value="Auto">Auto-detect</option>
              <option value="Saree">Saree</option>
              <option value="Kurti">Kurti</option>
              <option value="Dress">Dress</option>
              <option value="Top">Top</option>
              <option value="Pants">Pants</option>
              <option value="Suit">Suit</option>
              <option value="Gown">Gown</option>
              <option value="Lehenga">Lehenga</option>
              <option value="Shirt">Shirt</option>
              <option value="T-shirt">T-shirt</option>
              <option value="Jacket">Jacket</option>
              <option value="Skirt">Skirt</option>
            </select>
          </div>

          {state.mode === 'saree' ? (
            <>
              <Uploader label="Upload Saree Drape" image={state.sareeImage} onChange={img => updateState('sareeImage', img)} libraryType="saree" />
              <Uploader label="Upload Blouse" image={state.blouseImage} onChange={img => updateState('blouseImage', img)} libraryType="blouse" />
            </>
          ) : state.garmentType === 'Dress' ? (
            <>
              <Uploader label="Upload Top" image={state.dressTopImage} onChange={img => updateState('dressTopImage', img)} libraryType="outfit" />
              <Uploader label="Upload Bottom" image={state.dressBottomImage} onChange={img => updateState('dressBottomImage', img)} libraryType="outfit" />
              <Uploader label="Upload Dupatta" image={state.dressDupattaImage} onChange={img => updateState('dressDupattaImage', img)} libraryType="outfit" />
            </>
          ) : (
            <Uploader label="Upload Outfit Image" image={state.outfitImage} onChange={img => updateState('outfitImage', img)} libraryType="outfit" />
          )}
        </div>

        {/* Model Settings */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            Model & Pose
          </label>
          
          <div className="space-y-3">
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
          </div>
        </div>

        {/* Style & Background */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Palette className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            Style & Environment
          </label>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Style Extras</label>
              <select
                value={state.styleExtra}
                onChange={e => updateState('styleExtra', e.target.value as StyleExtra)}
                className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              >
                <option value="None">None</option>
                <option value="Cinematic">Cinematic Lighting</option>
                <option value="Studio">Studio Lighting</option>
                <option value="Vintage">Vintage Film</option>
                <option value="Editorial">High Fashion Editorial</option>
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
                <option value="Outdoor">Outdoor / Nature</option>
                <option value="Studio">Studio Backdrop</option>
                <option value="Minimalist Studio">Minimalist Studio</option>
                <option value="Urban Street">Urban Street</option>
                <option value="Cyberpunk City">Cyberpunk City</option>
                <option value="Vintage Mansion">Vintage Mansion</option>
                <option value="Neon Lights">Neon Lights</option>
                <option value="Beach Resort">Beach Resort</option>
                <option value="Luxury Hotel">Luxury Hotel</option>
                <option value="Custom">Custom Prompt</option>
                <option value="Uploaded">Upload Custom Background</option>
              </select>
            </div>

            {state.background === 'Custom' && (
              <div>
                <input
                  type="text"
                  placeholder="Describe the background..."
                  value={state.customBackground}
                  onChange={e => updateState('customBackground', e.target.value)}
                  className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                />
              </div>
            )}

            {state.background === 'Uploaded' && (
              <div className="pt-2">
                <Uploader 
                  label="Upload Background Image" 
                  image={state.backgroundImage} 
                  onChange={img => updateState('backgroundImage', img)} 
                />
              </div>
            )}
          </div>
        </div>

        {/* Output Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Layout className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              Output Settings
            </label>
            {!state.useProModel && (
              <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full uppercase tracking-wider">Standard</span>
            )}
            {state.useProModel && (
              <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full uppercase tracking-wider">Pro</span>
            )}
          </div>
          
          <div className="space-y-3">
            {state.outputFormat === 'image' && state.useProModel && (
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Image Resolution</label>
                <select
                  value={state.quality}
                  onChange={e => updateState('quality', e.target.value as ImageQuality)}
                  className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                >
                  {state.apiProvider === 'google' && (
                    <>
                      <option value="Standard">Standard (1K)</option>
                      <option value="2K">High (2K)</option>
                      <option value="4K">Ultra (4K)</option>
                      <option value="Gigapixel">Gigapixel Mode (Max)</option>
                    </>
                  )}
                </select>
              </div>
            )}

            {state.outputFormat === 'video' && (
              <>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Video Resolution</label>
                  <select
                    value={state.videoResolution}
                    onChange={e => updateState('videoResolution', e.target.value)}
                    className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  >
                    <option value="720p">720p (Standard)</option>
                    <option value="1080p">1080p (HD)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Video Duration (Seconds)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="5"
                      max="60"
                      step="1"
                      value={state.videoDuration}
                      onChange={e => updateState('videoDuration', parseInt(e.target.value) || 5)}
                      className="flex-1 accent-indigo-600"
                    />
                    <input
                      type="number"
                      min="5"
                      max="60"
                      value={state.videoDuration}
                      onChange={e => {
                        let val = parseInt(e.target.value);
                        if (isNaN(val)) val = 5;
                        if (val > 60) val = 60;
                        if (val < 5) val = 5;
                        updateState('videoDuration', val);
                      }}
                      className="w-16 text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-1.5 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-center font-mono transition-colors"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Base is 5s. Longer videos take more time to generate.</p>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Aspect Ratio</label>
              <select
                value={state.aspectRatio}
                onChange={e => updateState('aspectRatio', e.target.value as AspectRatio)}
                className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              >
                {state.outputFormat === 'video' ? (
                  <>
                    <option value="16:9">16:9 (Widescreen)</option>
                    <option value="9:16">9:16 (Story)</option>
                  </>
                ) : (
                  <>
                    <option value="1:1">1:1 (Square)</option>
                    <option value="3:4">3:4 (Portrait)</option>
                    <option value="4:3">4:3 (Landscape)</option>
                    <option value="9:16">9:16 (Story)</option>
                    <option value="16:9">16:9 (Widescreen)</option>
                    {state.useProModel && (
                      <>
                        <option value="1:4">1:4 (Tall)</option>
                        <option value="1:8">1:8 (Extra Tall)</option>
                        <option value="4:1">4:1 (Wide)</option>
                        <option value="8:1">8:1 (Extra Wide)</option>
                        <optgroup label="Print Sizes (300 DPI)">
                          <option value="12x18">12x18</option>
                          <option value="6x9">6x9</option>
                          <option value="13x19">13x19</option>
                          <option value="9x12">9x12</option>
                          <option value="13x40">13x40</option>
                          <option value="13x30">13x30</option>
                          <option value="10x14">10x14</option>
                        </optgroup>
                        <option value="Custom">Custom Size</option>
                      </>
                    )}
                  </>
                )}
              </select>
            </div>

            {state.aspectRatio === 'Custom' && state.useProModel && state.outputFormat === 'image' && (
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Width (inch)</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    step="0.1"
                    value={state.customWidth}
                    onChange={e => updateState('customWidth', parseFloat(e.target.value) || 10)}
                    className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Height (inch)</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    step="0.1"
                    value={state.customHeight}
                    onChange={e => updateState('customHeight', parseFloat(e.target.value) || 10)}
                    className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Target Outfit Color */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
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
              <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          
          {state.enableOutfitColor && (
            <div className="flex items-center gap-3 pt-2">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm shrink-0">
                <input
                  type="color"
                  value={state.outfitColor}
                  onChange={e => updateState('outfitColor', e.target.value)}
                  className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={state.outfitColor.toUpperCase()}
                  onChange={e => updateState('outfitColor', e.target.value)}
                  className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono uppercase transition-colors"
                  placeholder="#HEX"
                />
              </div>
            </div>
          )}
        </div>

        {/* Jewellery Feature */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
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
              <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          
          {state.enableJewellery && (
            <div className="space-y-4 pt-2">
              <Uploader 
                label="Upload Jewellery Image (Optional)" 
                image={state.jewelleryImage} 
                onChange={img => updateState('jewelleryImage', img)} 
              />
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Jewellery Description</label>
                <input
                  type="text"
                  value={state.jewelleryDescription}
                  onChange={e => updateState('jewelleryDescription', e.target.value)}
                  className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  placeholder="e.g., Gold necklace with diamonds"
                />
              </div>
            </div>
          )}
        </div>



        {/* Custom Prompt */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              Custom Prompt
            </label>
            <button
              onClick={handleEnhancePrompt}
              disabled={isEnhancingPrompt || !state.customPrompt.trim()}
              className="text-xs flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Sparkles className={`w-3 h-3 ${isEnhancingPrompt ? 'animate-pulse' : ''}`} />
              {isEnhancingPrompt ? 'Enhancing...' : 'Enhance Prompt'}
            </button>
          </div>
          <textarea
            rows={4}
            placeholder="Add specific details (e.g., 'model wearing sunglasses', 'windy hair')"
            value={state.customPrompt}
            onChange={e => updateState('customPrompt', e.target.value)}
            className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-colors"
          />
        </div>
      </div>

      <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-3 transition-colors">
        <button
          onClick={onGenerate}
          disabled={
            isGenerating || 
            (state.mode === 'saree' 
              ? (!state.sareeImage && !state.blouseImage) 
              : (state.garmentType === 'Dress' 
                  ? (!state.dressTopImage && !state.dressBottomImage && !state.dressDupattaImage) 
                  : !state.outfitImage)) ||
            (state.background === 'Uploaded' && !state.backgroundImage)
          }
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
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
