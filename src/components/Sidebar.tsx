import React, { useState } from 'react';
import { AppState, AppMode, Gender, Pose, StyleExtra, BackgroundType, ImageQuality, AspectRatio, Preset, CreationType, VideoResolution, getGenerationCost } from '../types';
import { Uploader } from './Uploader';
import { Sliders, Palette, Layout, Wand2, Image as ImageIcon, Bookmark, Save, Trash2, Sparkles, Gem, ShieldCheck, Ruler, Scissors, Plus } from 'lucide-react';
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

      <div className="p-6 flex-1 space-y-8 overflow-y-auto">
        {/* Branding Details */}
        <div className="space-y-4 pb-4 border-b border-gray-100 dark:border-gray-800">
          <label className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Layout className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            Branding Details
          </label>
          <div className="space-y-3">
            <Uploader 
              label="Upload Brand Logo" 
              image={state.brandLogo} 
              onChange={img => updateState('brandLogo', img)} 
            />
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Design Number</label>
              <input
                type="text"
                value={state.designNumber}
                onChange={e => updateState('designNumber', e.target.value)}
                placeholder="e.g. 1005"
                className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Format Selection */}
        <div className="space-y-4 pb-4 border-b border-gray-100 dark:border-gray-800">
          <label className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Layout className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            Output Format
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { updateState('outputFormat', 'image'); updateState('imageModel', 'gemini-hq'); }}
              className={`py-2 px-3 text-sm font-medium rounded-lg transition-colors ${
                state.outputFormat === 'image'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Image
            </button>
            <button
              onClick={() => { updateState('outputFormat', 'video'); updateState('imageModel', 'veo-fast'); }}
              className={`py-2 px-3 text-sm font-medium rounded-lg transition-colors ${
                state.outputFormat === 'video'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Video
            </button>
          </div>

          {state.outputFormat === 'image' ? (
            <div className="space-y-4 pt-2 animate-in fade-in">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Image Quality</label>
                <select
                  value={state.quality}
                  onChange={e => updateState('quality', e.target.value as ImageQuality)}
                  className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                >
                  <option value="4K">4K</option>
                  <option value="Gigapixel">8K</option>
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
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] text-gray-500 dark:text-gray-400">Unit</label>
                    <select
                      value={state.customUnit || 'pixels'}
                      onChange={e => updateState('customUnit', e.target.value as any)}
                      className="text-xs border border-gray-200 dark:border-gray-700 rounded p-1 bg-white dark:bg-gray-800 dark:text-white outline-none"
                    >
                      <option value="pixels">Pixels</option>
                      <option value="inches">Inches</option>
                      <option value="cm">Centimeters</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Width ({state.customUnit === 'pixels' ? 'px' : state.customUnit === 'inches' ? 'in' : 'cm'})</label>
                      <input
                        type="number"
                        value={state.customWidth}
                        onChange={e => updateState('customWidth', parseFloat(e.target.value) || (state.customUnit === 'inches' ? 10 : state.customUnit === 'cm' ? 25 : 1024))}
                        className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Height ({state.customUnit === 'pixels' ? 'px' : state.customUnit === 'inches' ? 'in' : 'cm'})</label>
                      <input
                        type="number"
                        value={state.customHeight}
                        onChange={e => updateState('customHeight', parseFloat(e.target.value) || (state.customUnit === 'inches' ? 10 : state.customUnit === 'cm' ? 25 : 1024))}
                        className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                  {(state.customUnit === 'inches' || state.customUnit === 'cm') && (
                    <div className="pt-1">
                      <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Resolution (DPI)</label>
                      <select
                        value={state.customDPI || 300}
                        onChange={e => updateState('customDPI', parseInt(e.target.value))}
                        className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      >
                        <option value="72">72 DPI (Web)</option>
                        <option value="150">150 DPI (Print Draft)</option>
                        <option value="300">300 DPI (High Quality Print)</option>
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 pt-2 animate-in fade-in">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Video Resolution</label>
                <select
                  value={state.videoResolution}
                  onChange={e => updateState('videoResolution', e.target.value as VideoResolution)}
                  className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                >
                  <option value="720p">720p</option>
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
            </div>
          )}
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

        {/* Uploads */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            Garments & Layout
          </label>

          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Creation Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Photo', 'Poster', 'Catalogue'] as CreationType[]).map(type => (
                <button
                  key={type}
                  onClick={() => {
                    updateState('creationType', type);
                    if (type === 'Catalogue' && (!state.catalogueModels || state.catalogueModels.length === 0)) {
                      const pages = state.cataloguePages || 12;
                      const initialModels = [];
                      for (let i = 0; i < pages; i++) {
                        initialModels.push({
                          id: i + 1,
                          outfitImage: null, dressTopImage: null, dressBottomImage: null, dressDupattaImage: null, sareeImage: null, blouseImage: null, garmentType: 'Auto'
                        });
                      }
                      updateState('catalogueModels', initialModels);
                    }
                    if (type === 'Poster' && (!state.posterModels || state.posterModels.length === 0)) {
                      const pages = state.posterPages || 1;
                      const totalModels = pages === 1 ? 1 : 1 + (state.posterMainPageModels || 6);
                      const initialModels = [];
                      for (let i = 0; i < totalModels; i++) {
                        initialModels.push({
                          id: i + 1,
                          outfitImage: null, dressTopImage: null, dressBottomImage: null, dressDupattaImage: null, sareeImage: null, blouseImage: null, garmentType: 'Auto'
                        });
                      }
                      updateState('posterModels', initialModels);
                    }
                  }}
                  className={`py-2 px-2 text-xs font-medium rounded-lg transition-colors ${
                    state.creationType === type
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          {state.creationType === 'Poster' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Poster Pages (Charge multiplier)</label>
                <select
                  value={state.posterPages}
                  onChange={e => {
                    const pages = parseInt(e.target.value) as any;
                    updateState('posterPages', pages);
                    const totalModels = pages === 1 ? 1 : 1 + state.posterMainPageModels;
                    const currentModels = state.posterModels || [];
                    const newModels = [...currentModels];
                    for (let i = currentModels.length; i < totalModels; i++) {
                      newModels.push({
                        id: i + 1,
                        outfitImage: null, dressTopImage: null, dressBottomImage: null, dressDupattaImage: null, sareeImage: null, blouseImage: null, garmentType: 'Auto'
                      });
                    }
                    updateState('posterModels', newModels.slice(0, totalModels));
                  }}
                  className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                >
                  <option value={1}>1 Page</option>
                  <option value={2}>2 Pages (Cover + Main)</option>
                </select>
              </div>
              
              {state.posterPages === 2 && (
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Number of Models on Main Page</label>
                  <select
                    value={state.posterMainPageModels}
                    onChange={e => {
                      const modelCount = parseInt(e.target.value);
                      updateState('posterMainPageModels', modelCount);
                      const totalModels = 1 + modelCount;
                      const currentModels = state.posterModels || [];
                      const newModels = [...currentModels];
                      for (let i = currentModels.length; i < totalModels; i++) {
                        newModels.push({
                          id: i + 1,
                          outfitImage: null, dressTopImage: null, dressBottomImage: null, dressDupattaImage: null, sareeImage: null, blouseImage: null, garmentType: 'Auto'
                        });
                      }
                      updateState('posterModels', newModels.slice(0, totalModels));
                    }}
                    className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  >
                    {[6, 8, 10, 12].map(num => (
                      <option key={num} value={num}>{num} Models</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {state.creationType === 'Catalogue' && (
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Catalogue Pages (Charge multiplier)</label>
              <select
                value={state.cataloguePages}
                onChange={e => {
                  const pages = parseInt(e.target.value) as any;
                  updateState('cataloguePages', pages);
                  const currentModels = state.catalogueModels || [];
                  const newModels = [...currentModels];
                  for (let i = currentModels.length; i < pages; i++) {
                    newModels.push({
                      id: i + 1,
                      outfitImage: null, dressTopImage: null, dressBottomImage: null, dressDupattaImage: null, sareeImage: null, blouseImage: null, garmentType: 'Auto'
                    });
                  }
                  updateState('catalogueModels', newModels.slice(0, pages));
                }}
                className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              >
                {[12, 18, 20, 22, 24, 26, 28, 30, 32].map(num => (
                  <option key={num} value={num}>{num} Pages</option>
                ))}
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Model Count</label>
            <select
              value={state.modelCount}
              onChange={e => {
                const count = parseInt(e.target.value) as any;
                updateState('modelCount', count);
                if (count > 1) {
                  updateState('mode', 'catalogue');
                } else {
                  updateState('mode', state.garmentType === 'Saree' ? 'saree' : 'outfit');
                }
              }}
              className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            >
              <option value={1}>Single Model</option>
              <option value={2}>Couple (2 Models)</option>
              <option value={6}>Group (6 Models)</option>
              <option value={8}>Group (8 Models)</option>
              <option value={10}>Group (10 Models)</option>
              <option value={12}>Group (12 Models)</option>
            </select>
          </div>

          {state.creationType === 'Catalogue' ? (
            <div className="space-y-6">
              {state.catalogueModels.map((model, index) => {
                let pageName = '';
                const total = state.catalogueModels.length;
                if (index === 0) pageName = 'Page 1: Cover Page';
                else if (index === 1) pageName = 'Page 2: Inner Page';
                else if (index === total - 1) pageName = `Page ${total}: Back Page`;
                else if (index === total - 2) pageName = `Page ${total - 1}: Index (Double Page)`;
                else {
                  const offset = index - 2;
                  const garmentNum = Math.floor(offset / 2) + 1;
                  const poseType = offset % 2 === 0 ? 'Single/Double Standing' : 'Close-up Pose';
                  pageName = `Page ${index + 1}: Garment ${garmentNum} (${poseType})`;
                }

                return (
                  <div key={model.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white">{pageName} Garments</h4>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Garment Type</label>
                      <select
                        value={model.garmentType}
                        onChange={e => {
                          const newModels = [...state.catalogueModels];
                          newModels[index].garmentType = e.target.value as any;
                          updateState('catalogueModels', newModels);
                        }}
                        className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                      >
                        <option value="Auto">Auto-detect</option>
                        <option value="Dress">Dress (Top/Bottom/Dupatta)</option>
                        <option value="Saree">Saree</option>
                        <option value="Kurti">Kurti</option>
                        <option value="Suit">Suit</option>
                      </select>
                    </div>
                    
                    {model.garmentType === 'Dress' ? (
                      <>
                        <Uploader label="Upload Top" image={model.dressTopImage} onChange={img => { const m = [...state.catalogueModels]; m[index].dressTopImage = img; updateState('catalogueModels', m); }} libraryType="outfit" />
                        <Uploader label="Upload Bottom" image={model.dressBottomImage} onChange={img => { const m = [...state.catalogueModels]; m[index].dressBottomImage = img; updateState('catalogueModels', m); }} libraryType="outfit" />
                        <Uploader label="Upload Dupatta" image={model.dressDupattaImage} onChange={img => { const m = [...state.catalogueModels]; m[index].dressDupattaImage = img; updateState('catalogueModels', m); }} libraryType="outfit" />
                      </>
                    ) : model.garmentType === 'Saree' ? (
                      <>
                        <Uploader label="Upload Saree Drape" image={model.sareeImage} onChange={img => { const m = [...state.catalogueModels]; m[index].sareeImage = img; updateState('catalogueModels', m); }} libraryType="saree" />
                        <Uploader label="Upload Blouse" image={model.blouseImage} onChange={img => { const m = [...state.catalogueModels]; m[index].blouseImage = img; updateState('catalogueModels', m); }} libraryType="blouse" />
                      </>
                    ) : (
                      <Uploader label={`Upload ${model.garmentType === 'Auto' ? 'Outfit' : model.garmentType}`} image={model.outfitImage} onChange={img => { const m = [...state.catalogueModels]; m[index].outfitImage = img; updateState('catalogueModels', m); }} libraryType="outfit" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : state.creationType === 'Poster' && state.posterPages === 2 ? (
            <div className="space-y-6">
              {state.posterModels.map((model, index) => {
                const pageName = index === 0 ? 'Cover Page (Close-up Pose)' : `Main Page Model ${index}`;
                return (
                  <div key={model.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white">{pageName} Garments</h4>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Garment Type</label>
                      <select
                        value={model.garmentType}
                        onChange={e => {
                          const newModels = [...state.posterModels];
                          newModels[index].garmentType = e.target.value as any;
                          updateState('posterModels', newModels);
                        }}
                        className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                      >
                        <option value="Auto">Auto-detect</option>
                        <option value="Dress">Dress (Top/Bottom/Dupatta)</option>
                        <option value="Saree">Saree</option>
                        <option value="Kurti">Kurti</option>
                        <option value="Suit">Suit</option>
                      </select>
                    </div>
                    
                    {model.garmentType === 'Dress' ? (
                      <>
                        <Uploader label="Upload Top" image={model.dressTopImage} onChange={img => { const m = [...state.posterModels]; m[index].dressTopImage = img; updateState('posterModels', m); }} libraryType="outfit" />
                        <Uploader label="Upload Bottom" image={model.dressBottomImage} onChange={img => { const m = [...state.posterModels]; m[index].dressBottomImage = img; updateState('posterModels', m); }} libraryType="outfit" />
                        <Uploader label="Upload Dupatta" image={model.dressDupattaImage} onChange={img => { const m = [...state.posterModels]; m[index].dressDupattaImage = img; updateState('posterModels', m); }} libraryType="outfit" />
                      </>
                    ) : model.garmentType === 'Saree' ? (
                      <>
                        <Uploader label="Upload Saree Drape" image={model.sareeImage} onChange={img => { const m = [...state.posterModels]; m[index].sareeImage = img; updateState('posterModels', m); }} libraryType="saree" />
                        <Uploader label="Upload Blouse" image={model.blouseImage} onChange={img => { const m = [...state.posterModels]; m[index].blouseImage = img; updateState('posterModels', m); }} libraryType="blouse" />
                      </>
                    ) : (
                      <Uploader label={`Upload ${model.garmentType === 'Auto' ? 'Outfit' : model.garmentType}`} image={model.outfitImage} onChange={img => { const m = [...state.posterModels]; m[index].outfitImage = img; updateState('posterModels', m); }} libraryType="outfit" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : state.modelCount > 1 && state.creationType !== 'Poster' ? (
            <div className="space-y-6">
              {state.catalogueModels.map((model, index) => (
                <div key={model.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                  <h4 className="font-medium text-sm text-gray-900 dark:text-white">Model {model.id} Garments</h4>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Garment Type</label>
                    <select
                      value={model.garmentType}
                      onChange={e => {
                        const newModels = [...state.catalogueModels];
                        newModels[index].garmentType = e.target.value as any;
                        updateState('catalogueModels', newModels);
                      }}
                      className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                    >
                      <option value="Auto">Auto-detect</option>
                      <option value="Dress">Dress (Top/Bottom/Dupatta)</option>
                      <option value="Saree">Saree</option>
                      <option value="Kurti">Kurti</option>
                      <option value="Suit">Suit</option>
                    </select>
                  </div>
                  
                  {model.garmentType === 'Dress' ? (
                    <>
                      <Uploader label="Upload Top" image={model.dressTopImage} onChange={img => { const m = [...state.catalogueModels]; m[index].dressTopImage = img; updateState('catalogueModels', m); }} libraryType="outfit" />
                      <Uploader label="Upload Bottom" image={model.dressBottomImage} onChange={img => { const m = [...state.catalogueModels]; m[index].dressBottomImage = img; updateState('catalogueModels', m); }} libraryType="outfit" />
                      <Uploader label="Upload Dupatta" image={model.dressDupattaImage} onChange={img => { const m = [...state.catalogueModels]; m[index].dressDupattaImage = img; updateState('catalogueModels', m); }} libraryType="outfit" />
                    </>
                  ) : model.garmentType === 'Saree' ? (
                    <>
                      <Uploader label="Upload Saree Drape" image={model.sareeImage} onChange={img => { const m = [...state.catalogueModels]; m[index].sareeImage = img; updateState('catalogueModels', m); }} libraryType="saree" />
                      <Uploader label="Upload Blouse" image={model.blouseImage} onChange={img => { const m = [...state.catalogueModels]; m[index].blouseImage = img; updateState('catalogueModels', m); }} libraryType="blouse" />
                    </>
                  ) : (
                    <Uploader label={`Upload ${model.garmentType === 'Auto' ? 'Outfit' : model.garmentType}`} image={model.outfitImage} onChange={img => { const m = [...state.catalogueModels]; m[index].outfitImage = img; updateState('catalogueModels', m); }} libraryType="outfit" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Garment Type</label>
                <select
                  value={state.garmentType}
                  onChange={e => {
                    const val = e.target.value as any;
                    updateState('garmentType', val);
                    updateState('mode', val === 'Saree' ? 'saree' : 'outfit');
                  }}
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
            </>
          )}
        </div>

        {/* Model Settings */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            Model Settings
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

          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Style/Prop</label>
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs text-gray-500 dark:text-gray-400">Custom Generation Prompt</label>
              <button 
                onClick={handleEnhancePrompt} 
                disabled={!state.customPrompt.trim() || isEnhancingPrompt}
                className="text-[10px] bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900/50 dark:hover:bg-indigo-800 dark:text-indigo-300 px-2 py-1 rounded font-medium disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                {isEnhancingPrompt ? (
                  <div className="w-3 h-3 border border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                Enhance
              </button>
            </div>
            <textarea
              value={state.customPrompt}
              onChange={e => updateState('customPrompt', e.target.value)}
              placeholder="Describe what you want to generate in detail..."
              className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-h-[80px] resize-none transition-colors"
            />
          </div>
        </div>



        {/* Outfit Color & Modifications */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Palette className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            Color & Styling
          </label>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Modify Overall Color</label>
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
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Gem className="w-3 h-3 text-indigo-500" />
                Add Jewellery
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
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Specific Color Modifications</label>
              <button 
                onClick={() => {
                  const newMods = [...state.colorModifications, { id: Math.random().toString(), element: '', color: '' }];
                  updateState('colorModifications', newMods);
                }}
                className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-2 py-1 rounded-md font-medium transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            
            {state.colorModifications.length > 0 ? (
              <div className="space-y-2">
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
            ) : (
              <p className="text-[10px] text-gray-500 dark:text-gray-400 italic">No specific modifications.</p>
            )}
          </div>
        </div>

      </div>

      <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-3 transition-colors shrink-0 mt-auto">

        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400 font-medium">Generation Cost:</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
            {(() => {
              const cost = getGenerationCost(state);
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
              
              const cost = getGenerationCost(state);
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
              
              const cost = getGenerationCost(state);
              return userCredits < cost ? 'insufficient' : 'ok';
            })() === 'limit_reached' ? (
            <>
              <Wand2 className="w-4 h-4" />
              Free Limit Reached (Upgrade)
            </>
          ) : (() => {
              const isFreeTier = state.outputFormat === 'image' && state.quality === 'Low Res (Free)';
              if (isFreeTier && freeGenerationsUsed >= 3) return 'limit_reached';
              
              const cost = getGenerationCost(state);
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
