import React, { useState, useEffect, useRef } from 'react';
import { Download, Image as ImageIcon, Play, Sparkles, ZoomIn, ZoomOut, Maximize2, Move } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { AppState } from '../types';

interface ImagePreviewProps {
  image: {url: string, type: 'image' | 'video'} | null;
  isGenerating: boolean;
  progressMsg: string | null;
  state: AppState;
  onAnimate?: () => void;
  onUpscale?: () => void;
}

export function ImagePreview({ image, isGenerating, progressMsg, state, onAnimate, onUpscale }: ImagePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Zoom State
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Transform Mode State
  const [isTransformMode, setIsTransformMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<'logo' | 'design' | null>(null);

  // Layout Positions (percentages of container width/height: 0 to 100)
  const [logoLayout, setLogoLayout] = useState({ x: 80, y: 4, w: 16, h: 8 });
  const [designLayout, setDesignLayout] = useState({ x: 70, y: 90, w: 26, h: 6 });

  // For dragging/resizing state
  const [dragState, setDragState] = useState<{
    type: 'move' | 'resize';
    item: 'logo' | 'design';
    handle?: string; // 'tl', 'tr', 'bl', 'br'
    startX: number;
    startY: number;
    startLayout: { x: number; y: number; w: number; h: number };
  } | null>(null);

  // Keyboard shortcut Ctrl+T / Cmd+T to toggle Transform Mode, and Escape to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setIsTransformMode(prev => {
          const next = !prev;
          if (!next) setSelectedItem(null);
          return next;
        });
      }
      if (e.key === 'Escape') {
        setIsTransformMode(false);
        setSelectedItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reset zoom and positions on new image url
  useEffect(() => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    setIsTransformMode(false);
    setSelectedItem(null);
    // Reset positions to default values when image changes
    setLogoLayout({ x: 80, y: 4, w: 16, h: 8 });
    setDesignLayout({ x: 70, y: 90, w: 26, h: 6 });
  }, [image?.url]);

  // Prevent default scroll when zooming with scroll wheel
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      if (isTransformMode) return; // Ignore scroll wheel zoom during transform editing to prevent accidental zoom
      e.preventDefault();
      const scaleFactor = 0.15;
      setZoomScale(prev => {
        const next = e.deltaY < 0 ? prev + scaleFactor : prev - scaleFactor;
        const clamped = Math.max(1, Math.min(5, next));
        if (clamped === 1) {
          setPanOffset({ x: 0, y: 0 });
        }
        return clamped;
      });
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, [isTransformMode]);

  const zoomIn = () => {
    setZoomScale(prev => Math.min(5, prev + 0.25));
  };

  const zoomOut = () => {
    setZoomScale(prev => {
      const next = Math.max(1, prev - 0.25);
      if (next === 1) {
        setPanOffset({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const resetZoom = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleItemPointerDown = (e: React.PointerEvent, item: 'logo' | 'design') => {
    if (!isTransformMode) return;
    e.stopPropagation();
    setSelectedItem(item);
    
    const startLayout = item === 'logo' ? logoLayout : designLayout;
    setDragState({
      type: 'move',
      item,
      startX: e.clientX,
      startY: e.clientY,
      startLayout: { ...startLayout }
    });
  };

  const handleHandlePointerDown = (e: React.PointerEvent, item: 'logo' | 'design', handle: string) => {
    e.stopPropagation();
    const startLayout = item === 'logo' ? logoLayout : designLayout;
    setDragState({
      type: 'resize',
      item,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startLayout: { ...startLayout }
    });
  };

  const handleContainerPointerDown = (e: React.PointerEvent) => {
    if (dragState) return;
    
    // Only pan if we are zoomed in and not editing transform
    if (zoomScale > 1 && !isTransformMode) {
      setIsPanning(true);
      setPanStart({
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y
      });
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handleContainerPointerMove = (e: React.PointerEvent) => {
    if (dragState) {
      const deltaX = e.clientX - dragState.startX;
      const deltaY = e.clientY - dragState.startY;
      
      const imageEl = imageRef.current;
      if (!imageEl) return;
      
      const rect = imageEl.getBoundingClientRect();
      const scale1Width = rect.width / zoomScale;
      const scale1Height = rect.height / zoomScale;
      
      const dxPercent = (deltaX / scale1Width) * 100;
      const dyPercent = (deltaY / scale1Height) * 100;
      
      const layout = dragState.startLayout;
      
      if (dragState.type === 'move') {
        const nextX = Math.max(0, Math.min(100 - layout.w, layout.x + dxPercent));
        const nextY = Math.max(0, Math.min(100 - layout.h, layout.y + dyPercent));
        if (dragState.item === 'logo') {
          setLogoLayout(prev => ({ ...prev, x: nextX, y: nextY }));
        } else {
          setDesignLayout(prev => ({ ...prev, x: nextX, y: nextY }));
        }
      } else if (dragState.type === 'resize' && dragState.handle) {
        const handle = dragState.handle;
        let nextX = layout.x;
        let nextY = layout.y;
        let nextW = layout.w;
        let nextH = layout.h;
        
        if (handle.includes('r')) {
          nextW = Math.max(5, Math.min(100 - layout.x, layout.w + dxPercent));
        }
        if (handle.includes('l')) {
          const maxW = layout.x + layout.w;
          nextX = Math.max(0, Math.min(maxW - 5, layout.x + dxPercent));
          nextW = maxW - nextX;
        }
        if (handle.includes('b')) {
          nextH = Math.max(2, Math.min(100 - layout.y, layout.h + dyPercent));
        }
        if (handle.includes('t')) {
          const maxH = layout.y + layout.h;
          nextY = Math.max(0, Math.min(maxH - 2, layout.y + dyPercent));
          nextH = maxH - nextY;
        }
        
        if (dragState.item === 'logo') {
          setLogoLayout({ x: nextX, y: nextY, w: nextW, h: nextH });
        } else {
          setDesignLayout({ x: nextX, y: nextY, w: nextW, h: nextH });
        }
      }
      return;
    }

    if (isPanning) {
      const nextX = e.clientX - panStart.x;
      const nextY = e.clientY - panStart.y;
      
      const maxPanX = (zoomScale - 1) * 400;
      const maxPanY = (zoomScale - 1) * 400;
      
      setPanOffset({
        x: Math.max(-maxPanX, Math.min(maxPanX, nextX)),
        y: Math.max(-maxPanY, Math.min(maxPanY, nextY))
      });
    }
  };

  const handleContainerPointerUp = (e: React.PointerEvent) => {
    if (dragState) {
      setDragState(null);
    }
    if (isPanning) {
      setIsPanning(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  const renderResizeHandles = (item: 'logo' | 'design') => {
    const handles = ['tl', 'tr', 'bl', 'br'];
    return handles.map(h => {
      let classes = 'absolute w-3 h-3 bg-white border-2 border-indigo-600 rounded-full z-[100]';
      if (h === 'tl') classes += ' -top-1.5 -left-1.5 cursor-nwse-resize';
      if (h === 'tr') classes += ' -top-1.5 -right-1.5 cursor-nesw-resize';
      if (h === 'bl') classes += ' -bottom-1.5 -left-1.5 cursor-nesw-resize';
      if (h === 'br') classes += ' -bottom-1.5 -right-1.5 cursor-nwse-resize';
      return (
        <div
          key={h}
          className={classes}
          onPointerDown={(e) => {
            e.stopPropagation();
            handleHandlePointerDown(e, item, h);
          }}
        />
      );
    });
  };

  const downloadRaw = () => {
    if (!image) return;
    const a = document.createElement('a');
    a.href = image.url;
    
    let extension = 'png';
    if (image.type === 'video') {
      extension = 'mp4';
    } else if (image.url.startsWith('data:image/jpeg')) {
      extension = 'jpg';
    } else if (image.url.startsWith('data:image/webp')) {
      extension = 'webp';
    }

    a.download = `AI-Open-Image-${Date.now()}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownload = async () => {
    if (!image) return;

    if (image.type === 'image' && (state.brandLogo || state.designNumber)) {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Could not get 2D context");

        const baseImg = new Image();
        baseImg.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          baseImg.onload = resolve;
          baseImg.onerror = reject;
          baseImg.src = image.url;
        });

        canvas.width = baseImg.width;
        canvas.height = baseImg.height;
        ctx.drawImage(baseImg, 0, 0);

        if (state.brandLogo) {
          const logoImg = new Image();
          logoImg.crossOrigin = 'anonymous';
          await new Promise((resolve, reject) => {
            logoImg.onload = resolve;
            logoImg.onerror = reject;
            logoImg.src = state.brandLogo!;
          });
          
          const pillX = (logoLayout.x / 100) * canvas.width;
          const pillY = (logoLayout.y / 100) * canvas.height;
          const pillWidth = (logoLayout.w / 100) * canvas.width;
          const pillHeight = (logoLayout.h / 100) * canvas.height;

          // Draw the transparent PNG logo directly without white background or padding!
          ctx.drawImage(logoImg, pillX, pillY, pillWidth, pillHeight);
        }

        if (state.designNumber) {
          const dX = (designLayout.x / 100) * canvas.width;
          const dY = (designLayout.y / 100) * canvas.height;
          const dW = (designLayout.w / 100) * canvas.width;
          const dH = (designLayout.h / 100) * canvas.height;

          const fontSize = Math.max(20, Math.floor(dH * 0.8));
          ctx.font = `bold ${fontSize}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          const textX = dX + dW / 2;
          const textY = dY + dH / 2;

          // Text outline
          ctx.lineWidth = Math.max(2, fontSize * 0.05);
          ctx.strokeStyle = 'black';
          ctx.strokeText(state.designNumber, textX, textY);

          // Text fill
          ctx.fillStyle = 'white';
          ctx.fillText(state.designNumber, textX, textY);
        }

        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `AI-Open-Image-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (err) {
        console.error("Failed to composite image on download", err);
        downloadRaw();
      }
    } else {
      downloadRaw();
    }
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-8 relative overflow-hidden transition-colors flex flex-col">
      <div 
        ref={containerRef}
        className={`w-full h-full flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl bg-gray-100 dark:bg-gray-800/30 overflow-hidden relative ${
          zoomScale > 1 && !isTransformMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        }`}
        onPointerDown={handleContainerPointerDown}
        onPointerMove={handleContainerPointerMove}
        onPointerUp={handleContainerPointerUp}
      >
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center justify-center space-y-4 absolute inset-0"
            >
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-indigo-100 dark:border-indigo-900/50 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 dark:border-indigo-400 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse text-center max-w-xs transition-colors">
                {progressMsg || "Designing your masterpiece..."}
              </p>
            </motion.div>
          ) : image ? (
            <motion.div
              key="result-image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative w-full h-full flex items-center justify-center transition-colors group"
            >
              {isTransformMode && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-indigo-600/95 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg z-[60] pointer-events-none animate-bounce flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5" />
                  <span>Drag & resize logo/design number. Press Esc or Ctrl+T to finish.</span>
                </div>
              )}

              <div 
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
                  transformOrigin: 'center center',
                  transition: isPanning || dragState ? 'none' : 'transform 0.15s ease-out',
                }}
                className="relative inline-block max-w-full max-h-full"
              >
                {image.type === 'video' ? (
                  <video src={image.url} autoPlay loop controls className="max-w-full max-h-full object-contain block" />
                ) : (
                  <img 
                    ref={imageRef}
                    src={image.url} 
                    alt="Generated Fashion" 
                    className="max-w-full max-h-full object-contain block select-none pointer-events-none" 
                  />
                )}
                
                {state.brandLogo && image.type === 'image' && (
                  <div 
                    style={{
                      position: 'absolute',
                      left: `${logoLayout.x}%`,
                      top: `${logoLayout.y}%`,
                      width: `${logoLayout.w}%`,
                      height: `${logoLayout.h}%`,
                      touchAction: 'none'
                    }}
                    className={`z-50 flex items-center justify-center ${
                      isTransformMode 
                        ? `border-2 border-dashed ${selectedItem === 'logo' ? 'border-indigo-600 bg-indigo-50/20' : 'border-indigo-400/50 hover:border-indigo-500'} cursor-move` 
                        : ''
                    }`}
                    onPointerDown={(e) => handleItemPointerDown(e, 'logo')}
                  >
                    <div className="w-full h-full flex items-center justify-center overflow-hidden">
                      <img src={state.brandLogo} alt="Brand Logo" className="w-full h-full object-contain pointer-events-none" />
                    </div>
                    {isTransformMode && selectedItem === 'logo' && renderResizeHandles('logo')}
                  </div>
                )}

                {state.designNumber && image.type === 'image' && (
                  <div 
                    style={{
                      position: 'absolute',
                      left: `${designLayout.x}%`,
                      top: `${designLayout.y}%`,
                      width: `${designLayout.w}%`,
                      height: `${designLayout.h}%`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      touchAction: 'none'
                    }}
                    className={`z-50 ${
                      isTransformMode 
                        ? `border-2 border-dashed ${selectedItem === 'design' ? 'border-indigo-600 bg-indigo-50/20' : 'border-indigo-400/50 hover:border-indigo-500'} cursor-move` 
                        : ''
                    }`}
                    onPointerDown={(e) => handleItemPointerDown(e, 'design')}
                  >
                    <div 
                      className="text-white font-bold select-none text-center leading-none" 
                      style={{ 
                        fontSize: `calc(${designLayout.h}vw * 0.85)`,
                        textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 4px 8px rgba(0,0,0,0.5)',
                        pointerEvents: 'none'
                      }}
                    >
                      {state.designNumber}
                    </div>
                    {isTransformMode && selectedItem === 'design' && renderResizeHandles('design')}
                  </div>
                )}
              </div>

              {/* Floating top right action bar */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-[70]">
                {image.type === 'image' && onUpscale && (
                  <button
                    onClick={onUpscale}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full shadow-lg font-medium text-sm transition-all hover:scale-105"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-250 animate-pulse" />
                    AI Upscale (Gigapixel)
                  </button>
                )}
                {image.type === 'image' && onAnimate && (
                  <button
                    onClick={onAnimate}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full shadow-lg font-medium text-sm transition-all hover:scale-105"
                  >
                    <Play className="w-4 h-4" />
                    Animate
                  </button>
                )}
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-full shadow-lg font-medium text-sm transition-all hover:scale-105"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>

              {/* Zoom & Transform Controls Floating Bar */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-[70] transition-all opacity-90 hover:opacity-100">
                {/* Transform Toggle Button */}
                <button
                  onClick={() => {
                    setIsTransformMode(!isTransformMode);
                    if (isTransformMode) setSelectedItem(null);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-medium text-xs transition-all ${
                    isTransformMode 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Manual Placement / Free Transform (Ctrl + T)"
                >
                  <Move className="w-3.5 h-3.5" />
                  <span>Transform Mode (Ctrl+T)</span>
                </button>

                <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />

                {/* Zoom Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={zoomOut}
                    disabled={zoomScale <= 1}
                    className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 min-w-[48px] text-center font-mono select-none">
                    {Math.round(zoomScale * 100)}%
                  </span>
                  <button
                    onClick={zoomIn}
                    disabled={zoomScale >= 5}
                    className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={resetZoom}
                    disabled={zoomScale === 1 && panOffset.x === 0 && panOffset.y === 0}
                    className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
                    title="Reset Zoom"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 space-y-4 transition-colors absolute inset-0"
            >
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center transition-colors">
                <ImageIcon className="w-10 h-10 text-gray-400 dark:text-gray-500 transition-colors" />
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Your generated image will appear here
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
