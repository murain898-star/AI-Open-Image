import { AppState } from "../types";

// Helper to resize image before sending to API to prevent "Payload Too Large" errors
async function resizeImageBase64(base64Str: string, maxWidth = 768, maxHeight = 768): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      
      // If the image is already small enough, don't resize or compress it
      if (width <= maxWidth && height <= maxHeight) {
        resolve(base64Str);
        return;
      }
      
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Preserve transparency by using PNG if original is PNG
        const isPng = base64Str.startsWith('data:image/png');
        if (!isPng) {
          // Fill white background for JPEGs to avoid black backgrounds on transparent images
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }
        ctx.drawImage(img, 0, 0, width, height);
        // Use PNG for transparency, otherwise JPEG with high quality
        resolve(canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.95));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str);
    img.src = base64Str;
  });
}

async function ensureApiKey(model: string): Promise<void> {
  const requiresPaidKey = model === 'gemini-3.1-flash-image-preview' || model.startsWith('veo');

  if (requiresPaidKey && window.aistudio && window.aistudio.hasSelectedApiKey) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
    }
  }
}

function getApiKey(model: string): string {
  const requiresPaidKey = model === 'gemini-3.1-flash-image-preview' || model.startsWith('veo');
  
  let platformKey = '';
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      platformKey = process.env.API_KEY;
    }
  } catch (e) {
    // Ignore ReferenceError if process is not defined
  }

  // If we are in the AI studio iframe, we use the injected platform key
  // @ts-ignore
  if (window.aistudio) {
    if (requiresPaidKey && platformKey) return platformKey;
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) return import.meta.env.VITE_GEMINI_API_KEY;
    // @ts-ignore
    if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
    return platformKey || 'PROXY';
  }

  // Always use a dummy key on the client to route through our secure backend proxy
  return 'PROXY';
}

function extractBase64Data(dataUrl: string) {
  const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 string');
  }
  return {
    mimeType: matches[1],
    data: matches[2]
  };
}

export async function generateFashionMedia(state: AppState, onProgress?: (msg: string) => void): Promise<{url: string, type: 'image' | 'video'}> {
  const provider = state.apiProvider;
  let modelName: string = state.imageModel;
  
  if (provider === 'google') {
    modelName = state.imageModel === 'gemini-hq' ? 'gemini-3.1-flash-image-preview' : 
                state.imageModel === 'veo-fast' ? 'veo-3.1-fast-generate-preview' : 'gemini-2.5-flash-image';
  }
  
  await ensureApiKey(modelName);
  const apiKey = getApiKey(modelName);
  
  if (!apiKey) {
    throw new Error("Missing API Key. Please make sure your VITE_GEMINI_API_KEY is configured in your Environment Variables (like Vercel settings or .env file) to generate media.");
  }

  const parts: any[] = [];
  let baseImageForVideo: { mimeType: string, data: string } | null = null;
  let baseImageUrl: string | null = null;

  const maxDim = state.quality === 'Low Res (Free)' ? 512 : 768;

  // 1. Add Images FIRST (AI models process visual context better when it comes first)
  if (state.animateReferenceImage) {
    const resized = await resizeImageBase64(state.animateReferenceImage, maxDim, maxDim);
    const { mimeType, data } = extractBase64Data(resized);
    parts.push({ inlineData: { mimeType, data } });
    parts.push({ text: "Reference Image: Starting frame for animation." });
    baseImageForVideo = { mimeType, data };
    baseImageUrl = resized;
  } else {
    if ((state.creationType === 'Poster' && state.posterPages === 2) || state.creationType === 'Catalogue') {
      const pageName = state.creationType === 'Catalogue' ? 'Cover Page (Close-up)' : 'Poster Cover Page (Close-up)';
      if (state.garmentType === 'Dress') {
        if (state.coverDressTopImage) {
          const resized = await resizeImageBase64(state.coverDressTopImage, maxDim, maxDim);
          const { mimeType, data } = extractBase64Data(resized);
          parts.push({ inlineData: { mimeType, data } });
          parts.push({ text: `${pageName} Top/Kurti design reference.` });
          if (!baseImageForVideo) baseImageForVideo = { mimeType, data };
        }
        if (state.coverDressBottomImage) {
          const resized = await resizeImageBase64(state.coverDressBottomImage, maxDim, maxDim);
          const { mimeType, data } = extractBase64Data(resized);
          parts.push({ inlineData: { mimeType, data } });
          parts.push({ text: `${pageName} Bottom/Pants design reference.` });
        }
        if (state.coverDressDupattaImage) {
          const resized = await resizeImageBase64(state.coverDressDupattaImage, maxDim, maxDim);
          const { mimeType, data } = extractBase64Data(resized);
          parts.push({ inlineData: { mimeType, data } });
          parts.push({ text: `${pageName} Dupatta/Scarf design reference.` });
        }
      } else if (state.mode === 'saree' || state.garmentType === 'Saree') {
        if (state.coverSareeImage) {
          const resized = await resizeImageBase64(state.coverSareeImage, maxDim, maxDim);
          const { mimeType, data } = extractBase64Data(resized);
          parts.push({ inlineData: { mimeType, data } });
          parts.push({ text: `${pageName} Saree Drape design reference.` });
          if (!baseImageForVideo) baseImageForVideo = { mimeType, data };
        }
        if (state.coverBlouseImage) {
          const resized = await resizeImageBase64(state.coverBlouseImage, maxDim, maxDim);
          const { mimeType, data } = extractBase64Data(resized);
          parts.push({ inlineData: { mimeType, data } });
          parts.push({ text: `${pageName} Blouse design reference.` });
        }
      } else {
        if (state.coverCloseupImage) {
          const resized = await resizeImageBase64(state.coverCloseupImage, maxDim, maxDim);
          const { mimeType, data } = extractBase64Data(resized);
          parts.push({ inlineData: { mimeType, data } });
          parts.push({ text: `${pageName} design reference.` });
          if (!baseImageForVideo) baseImageForVideo = { mimeType, data };
        }
      }
    }
    
    if (state.creationType === 'Poster' && state.posterPages === 2) {
      for (let i = 0; i < (state.posterModels || []).length; i++) {
        const model = state.posterModels[i];
        const pageName = `Main Page Model ${i + 1}`;
        if (model.garmentType === 'Dress') {
          if (model.dressTopImage) {
            const resized = await resizeImageBase64(model.dressTopImage, maxDim, maxDim);
            const { mimeType, data } = extractBase64Data(resized);
            parts.push({ inlineData: { mimeType, data } });
            parts.push({ text: `Poster ${pageName} Top/Kurti design reference.` });
            if (!baseImageForVideo) baseImageForVideo = { mimeType, data };
          }
          if (model.dressBottomImage) {
            const resized = await resizeImageBase64(model.dressBottomImage, maxDim, maxDim);
            const { mimeType, data } = extractBase64Data(resized);
            parts.push({ inlineData: { mimeType, data } });
            parts.push({ text: `Poster ${pageName} Bottom/Pants design reference.` });
          }
          if (model.dressDupattaImage) {
            const resized = await resizeImageBase64(model.dressDupattaImage, maxDim, maxDim);
            const { mimeType, data } = extractBase64Data(resized);
            parts.push({ inlineData: { mimeType, data } });
            parts.push({ text: `Poster ${pageName} Dupatta/Scarf design reference.` });
          }
        } else if (model.garmentType === 'Saree') {
          if (model.sareeImage) {
            const resized = await resizeImageBase64(model.sareeImage, maxDim, maxDim);
            const { mimeType, data } = extractBase64Data(resized);
            parts.push({ inlineData: { mimeType, data } });
            parts.push({ text: `Poster ${pageName} Saree Drape design reference.` });
            if (!baseImageForVideo) baseImageForVideo = { mimeType, data };
          }
          if (model.blouseImage) {
            const resized = await resizeImageBase64(model.blouseImage, maxDim, maxDim);
            const { mimeType, data } = extractBase64Data(resized);
            parts.push({ inlineData: { mimeType, data } });
            parts.push({ text: `Poster ${pageName} Blouse design reference.` });
          }
        } else {
          if (model.outfitImage) {
            const resized = await resizeImageBase64(model.outfitImage, maxDim, maxDim);
            const { mimeType, data } = extractBase64Data(resized);
            parts.push({ inlineData: { mimeType, data } });
            parts.push({ text: `Poster ${pageName} ${model.garmentType !== 'Auto' ? model.garmentType : 'outfit'} design reference.` });
            if (!baseImageForVideo) baseImageForVideo = { mimeType, data };
          }
        }
      }
    } else if (state.mode === 'catalogue') {
      for (let index = 0; index < (state.catalogueModels || []).length; index++) {
        const model = state.catalogueModels[index];
        const pageName = state.creationType === 'Catalogue' ? `Inner Catalogue - Model ${index + 1}` : `Model ${model.id}`;
        
        if (model.garmentType === 'Dress') {
          if (model.dressTopImage) {
            const resized = await resizeImageBase64(model.dressTopImage, maxDim, maxDim);
            const { mimeType, data } = extractBase64Data(resized);
            parts.push({ inlineData: { mimeType, data } });
            parts.push({ text: `${pageName} Top/Kurti design reference.` });
            if (!baseImageForVideo) baseImageForVideo = { mimeType, data };
          }
          if (model.dressBottomImage) {
            const resized = await resizeImageBase64(model.dressBottomImage, maxDim, maxDim);
            const { mimeType, data } = extractBase64Data(resized);
            parts.push({ inlineData: { mimeType, data } });
            parts.push({ text: `${pageName} Bottom/Pants design reference.` });
          }
          if (model.dressDupattaImage) {
            const resized = await resizeImageBase64(model.dressDupattaImage, maxDim, maxDim);
            const { mimeType, data } = extractBase64Data(resized);
            parts.push({ inlineData: { mimeType, data } });
            parts.push({ text: `${pageName} Dupatta/Scarf design reference.` });
          }
        } else if (model.garmentType === 'Saree') {
          if (model.sareeImage) {
            const resized = await resizeImageBase64(model.sareeImage, maxDim, maxDim);
            const { mimeType, data } = extractBase64Data(resized);
            parts.push({ inlineData: { mimeType, data } });
            parts.push({ text: `${pageName} Saree Drape design reference.` });
            if (!baseImageForVideo) baseImageForVideo = { mimeType, data };
          }
          if (model.blouseImage) {
            const resized = await resizeImageBase64(model.blouseImage, maxDim, maxDim);
            const { mimeType, data } = extractBase64Data(resized);
            parts.push({ inlineData: { mimeType, data } });
            parts.push({ text: `${pageName} Blouse design reference.` });
          }
        } else {
          if (model.outfitImage) {
            const resized = await resizeImageBase64(model.outfitImage, maxDim, maxDim);
            const { mimeType, data } = extractBase64Data(resized);
            parts.push({ inlineData: { mimeType, data } });
            parts.push({ text: `${pageName} ${model.garmentType !== 'Auto' ? model.garmentType : 'outfit'} design reference.` });
            if (!baseImageForVideo) baseImageForVideo = { mimeType, data };
          }
        }
      }
    } else if (state.mode === 'saree') {
      if (state.sareeImage) {
        const resized = await resizeImageBase64(state.sareeImage, maxDim, maxDim);
        const { mimeType, data } = extractBase64Data(resized);
        parts.push({ inlineData: { mimeType, data } });
        parts.push({ text: "Reference Image 1: The exact saree design to use." });
        baseImageForVideo = { mimeType, data };
      }
      if (state.blouseImage) {
        const resized = await resizeImageBase64(state.blouseImage, maxDim, maxDim);
        const { mimeType, data } = extractBase64Data(resized);
        parts.push({ inlineData: { mimeType, data } });
        parts.push({ text: "Reference Image 2: The exact blouse design to use." });
        if (!baseImageForVideo) baseImageForVideo = { mimeType, data };
      }
    } else if (state.garmentType === 'Dress') {
      if (state.dressTopImage) {
        const resized = await resizeImageBase64(state.dressTopImage, maxDim, maxDim);
        const { mimeType, data } = extractBase64Data(resized);
        parts.push({ inlineData: { mimeType, data } });
        parts.push({ text: "Reference Image 1: The exact top/kurti design to use." });
        baseImageForVideo = { mimeType, data };
      }
      if (state.dressBottomImage) {
        const resized = await resizeImageBase64(state.dressBottomImage, maxDim, maxDim);
        const { mimeType, data } = extractBase64Data(resized);
        parts.push({ inlineData: { mimeType, data } });
        parts.push({ text: "Reference Image 2: The exact bottom/pants design to use." });
        if (!baseImageForVideo) baseImageForVideo = { mimeType, data };
      }
      if (state.dressDupattaImage) {
        const resized = await resizeImageBase64(state.dressDupattaImage, maxDim, maxDim);
        const { mimeType, data } = extractBase64Data(resized);
        parts.push({ inlineData: { mimeType, data } });
        parts.push({ text: "Reference Image 3: The exact dupatta/scarf design to use." });
      }
    } else {
      if (state.outfitImage) {
        const resized = await resizeImageBase64(state.outfitImage, maxDim, maxDim);
        const { mimeType, data } = extractBase64Data(resized);
        parts.push({ inlineData: { mimeType, data } });
        parts.push({ text: `Reference Image: The exact ${state.garmentType !== 'Auto' ? state.garmentType : 'outfit'} design to use.` });
        baseImageForVideo = { mimeType, data };
      }
    }

    if (state.enableJewellery && state.jewelleryImage) {
      const resized = await resizeImageBase64(state.jewelleryImage, maxDim, maxDim);
      const { mimeType, data } = extractBase64Data(resized);
      parts.push({ inlineData: { mimeType, data } });
      parts.push({ text: "Reference Image: The exact jewellery to use." });
    }

    if (state.background === 'Uploaded' && state.backgroundImage) {
      const resized = await resizeImageBase64(state.backgroundImage, maxDim, maxDim);
      const { mimeType, data } = extractBase64Data(resized);
      parts.push({ inlineData: { mimeType, data } });
      parts.push({ text: "Reference Image: The background to use." });
    }
  }

  // 2. Build a highly direct, simplified prompt
  const fancyPoses = [
    "striking a high-fashion editorial pose",
    "elegantly touching their hair",
    "doing a dramatic over-the-shoulder glance",
    "in a chic, confident stance with hands on hips",
    "striking a fierce runway model pose"
  ];

  let poseDescription = `in a ${state.pose.toLowerCase()} pose`;
  if (state.pose === 'Fancy Pose') {
    poseDescription = fancyPoses[Math.floor(Math.random() * fancyPoses.length)];
  }

  let baseSubject = `full-body fashion catalog photo of a ${state.gender.toLowerCase()} model`;
  
  const layoutVariations = [
    "creative and unique framing",
    "dynamic asymmetric composition",
    "elegant grid-like arrangement",
    "editorial collage style",
    "modern overlapping presentation",
    "classic symmetrical layout",
    "cinematic wide-angle perspective"
  ];
  const randomLayout = layoutVariations[Math.floor(Math.random() * layoutVariations.length)];

  if (state.creationType === 'Poster') {
    baseSubject = `cinematic, high-end fashion poster featuring a ${state.gender.toLowerCase()} model in a ${randomLayout}`;
  } else if (state.creationType === 'Catalogue') {
    baseSubject = `clean, commercial fashion catalogue spread featuring a ${state.gender.toLowerCase()} model with a ${randomLayout}`;
  } else {
    baseSubject = `high-quality, professional full-body fashion photo of a ${state.gender.toLowerCase()} model`;
  }

  let prompt = `Generate a ${baseSubject} ${poseDescription}.`;

  if (state.modelCount > 1) {
    if (state.creationType === 'Poster') {
      prompt = `Generate a cinematic, high-end fashion poster featuring EXACTLY ${state.modelCount} ${state.gender.toLowerCase()} models posing together ${poseDescription}. Use a ${randomLayout}.`;
    } else if (state.creationType === 'Catalogue') {
      prompt = `Generate a clean, commercial fashion catalogue spread featuring EXACTLY ${state.modelCount} ${state.gender.toLowerCase()} models posing together ${poseDescription}. Use a ${randomLayout}.`;
    } else {
      prompt = `Generate a high-quality, professional fashion photo layout featuring EXACTLY ${state.modelCount} ${state.gender.toLowerCase()} models posing together ${poseDescription}.`;
    }
  }
  
  if (state.creationType === 'Poster') {
    prompt += `\n\nCOMPOSITION: The layout MUST be completely unique and different for this generation, using a striking visual poster arrangement. Leave elegant negative space for typography and titles. Use dramatic, cinematic lighting, and high editorial fashion aesthetics. You can include inset frames or creative overlapping if it suits the poster style.`;
    if (state.posterPages === 2) {
      prompt += `\n\nSPREAD REQUIREMENT: This is a 2-page poster design. Please visually represent this as a two-part composition or a collage: Page 1 (Cover) MUST feature a dramatic close-up or back pose, and Page 2 (Main) features EXACTLY ${state.posterMainPageModels} models in a dynamic layout.`;
    }
  } else if (state.creationType === 'Catalogue') {
    prompt += `\n\nCOMPOSITION: The layout MUST be a unique catalogue spread for this generation. Arrange the models or frames in a dynamic and fresh way. Ensure perfect even lighting, neutral or complementary backgrounds, and absolutely clear focus on the garments' details.`;
    if (state.modelCount >= 1) {
      prompt += `\n\nSPREAD REQUIREMENT: This represents an extensive catalogue layout. Please generate a highly composite, multi-frame layout strictly structured as follows: Page 1 is the Cover Page (Close-up layout), Pages 2 & 3 form an inner spread (joined but visually separated), followed by 2 pages for each model (1 full pose and 1 close-up pose), then a 2-page joined Index spread, and finally the Back Page. Ensure the models remain visually consistent across the spread.`;
    }
  }

  if (state.quality === 'Print (5792x8688)') {
    prompt += `\n\nRESOLUTION INSTRUCTION: This must be a hyper-high-resolution 144 Megapixel image suitable for 5792x8688 camera print in a 2:3 poster aspect ratio. Ensure incredible micro-details, ultra-sharp focus, and absolute photorealism.`;
  } else {
    prompt += `\n\nQUALITY INSTRUCTION: The generated image MUST be of ultra-high definition, photorealistic quality with extreme sharpness. The facial features, skin texture, and fabric details MUST be flawlessly sharp, matching the quality of a high-end DSLR studio photoshoot. Ensure there is no blur or AI artifacting.`;
  }

  // Handle print sizes
  if (state.aspectRatio !== '1:1' && state.aspectRatio !== '3:4' && state.aspectRatio !== '4:3' && state.aspectRatio !== '9:16' && state.aspectRatio !== '16:9') {
    if (state.aspectRatio === 'Custom') {
      prompt += `\n\nSIZE INSTRUCTION: Compose the image explicitly for a physical dimension of ${state.customWidth} ${state.customUnit || 'inches'} width by ${state.customHeight} ${state.customUnit || 'inches'} height at ${state.customDPI || 300} DPI. The aspect ratio of the generated image MUST strictly match ${state.customWidth}:${state.customHeight}. Ensure the subject framing respects this exact proportional boundary.`;
    } else {
      const dimensions = state.aspectRatio.split('x');
      if (dimensions.length === 2) {
        prompt += `\n\nSIZE INSTRUCTION: Compose the image explicitly for a physical dimension of ${dimensions[0]} inches width by ${dimensions[1]} inches height at 300 DPI. The aspect ratio of the generated image MUST strictly match ${dimensions[0]}:${dimensions[1]}. Ensure the subject framing respects this exact proportional boundary.`;
      }
    }
  }

  prompt += `\n\nCRITICAL INSTRUCTION: The model(s) MUST be wearing the EXACT garment(s) shown in the provided reference image(s). 
You must perfectly copy the embroidery, motifs, pattern, color, and fabric texture from the reference images onto the model's outfit.`;

  if (state.modelCount > 1) {
    prompt += `\nPay careful attention to which reference images belong to which model number, as each model in the group has different specific garments assigned to them.`;
  }

  prompt += `\nDO NOT invent a new design. DO NOT change the design. It must be a 1:1 exact visual match of the uploaded garment(s).`;

  if (state.animateReferenceImage) {
    prompt = `ANIMATION MODE: Use the provided image as the exact starting frame. Animate the model in the image naturally.`;
  }

  if (state.inPaintingMode && state.inPaintingMask) {
    const { mimeType, data } = extractBase64Data(state.inPaintingMask);
    parts.push({ inlineData: { mimeType, data } });
    parts.push({ text: "Mask Image (white areas are to be modified)." });
    prompt += `\nIN-PAINTING TASK: Only modify the areas specified by the mask. Preserve the rest of the image exactly.`;
  }

  if (state.styleExtra !== 'None') prompt += `\nStyle: ${state.styleExtra}.`;
  if (state.customPrompt) prompt += `\nAdditional details: ${state.customPrompt}.`;
  
  if (state.colorModifications && state.colorModifications.length > 0) {
    const validMods = state.colorModifications.filter(m => m.element.trim() !== '' && m.color.trim() !== '');
    if (validMods.length > 0) {
      prompt += `\n\nCRITICAL COLOR INSTRUCTIONS:\n`;
      validMods.forEach(mod => {
        prompt += `- Change the color of the ${mod.element} to ${mod.color}.\n`;
      });
      prompt += `Ensure these color changes are applied accurately while preserving the original design patterns, embroidery, and textures.`;
    }
  }

  if (state.background !== 'Uploaded') {
    prompt += `\nBackground: ${state.background === 'Custom' ? state.customBackground : state.background}.`;
  }
  
  // Add fidelity and denoising instructions to the prompt so the AI respects the user's choices
  if (state.fidelityMode) {
    prompt += `\nFidelity Mode: ${state.fidelityMode}. Ensure strict adherence to the reference design.`;
  }
  if (state.denoisingStrength !== undefined) {
    prompt += `\nDenoising/Creativity Strength: ${state.denoisingStrength} (Lower means closer to original, higher means more creative variations).`;
  }

  let finalPrompt = prompt;
  parts.push({ text: finalPrompt });

  // Dynamically import to prevent process.env lookup errors at module load time in browser
  const { GoogleGenAI } = await import("@google/genai");

  // Google Provider (Default)
  const aiOptions: any = { apiKey };
  if (apiKey === 'PROXY') {
    aiOptions.httpOptions = { baseUrl: window.location.origin + '/api/gemini' };
  }
  const ai = new GoogleGenAI(aiOptions);

  if (state.outputFormat === 'video') {
    if (onProgress) onProgress(`Starting video generation (Target: ${state.videoDuration}s)...`);
    let operation;
    try {
      operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: finalPrompt,
        image: baseImageForVideo ? {
          imageBytes: baseImageForVideo.data,
          mimeType: baseImageForVideo.mimeType,
        } : undefined,
        config: {
          numberOfVideos: 1,
          resolution: state.videoResolution === '1080p' ? '1080p' : '720p',
          aspectRatio: state.aspectRatio === '16:9' ? '16:9' : '9:16'
        }
      });

      while (!operation.done) {
        if (onProgress) onProgress("Generating base video... This may take a few minutes.");
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({operation: operation});
      }
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      if (errorMessage.includes('403') || errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('Requested entity was not found')) {
        if (window.aistudio) {
          await window.aistudio.openSelectKey();
        }
        throw new Error("Permission Denied (403): Your selected API key does not have access to Veo Video Generation. Please select a key from a paid Google Cloud project with Veo enabled, then try again.");
      }
      if (errorMessage.includes('503') || errorMessage.includes('UNAVAILABLE') || errorMessage.includes('high demand')) {
        throw new Error("Service Unavailable (503): Google's Gemini AI servers are currently experiencing very high demand. This is a temporary server issue, not a problem with your app or API key. Please try again in a few minutes.");
      }
      throw new Error(`API Error: ${errorMessage}`);
    }

    let currentVideo = operation.response?.generatedVideos?.[0]?.video;
    if (!currentVideo) throw new Error("No video returned from Gemini.");

    let extensionsNeeded = 0;
    if (typeof state.videoDuration === 'number' && state.videoDuration > 5) {
      extensionsNeeded = Math.ceil((state.videoDuration - 5) / 5);
    }

    for (let i = 0; i < extensionsNeeded; i++) {
      if (onProgress) onProgress(`Extending video (Part ${i + 1} of ${extensionsNeeded})...`);
      operation = await ai.models.generateVideos({
        model: 'veo-3.1-generate-preview',
        prompt: finalPrompt,
        video: currentVideo,
        config: {
          numberOfVideos: 1,
          resolution: state.videoResolution === '1080p' ? '1080p' : '720p',
          aspectRatio: state.aspectRatio === '16:9' ? '16:9' : '9:16'
        }
      });

      while (!operation.done) {
        if (onProgress) onProgress(`Generating extension ${i + 1}... This takes time.`);
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({operation: operation});
      }
      currentVideo = operation.response?.generatedVideos?.[0]?.video;
      if (!currentVideo) throw new Error("Failed to extend video.");
    }

    const downloadLink = currentVideo.uri;
    if (!downloadLink) throw new Error("No video URI returned.");
    
    if (onProgress) onProgress("Downloading final video...");
    let downloadUrl = downloadLink;
    if (apiKey === 'PROXY' && downloadLink.startsWith('https://generativelanguage.googleapis.com')) {
      downloadUrl = downloadLink.replace('https://generativelanguage.googleapis.com', window.location.origin + '/api/gemini');
    }
    
    const response = await fetch(downloadUrl, {
      method: 'GET',
      headers: apiKey !== 'PROXY' ? {
        'x-goog-api-key': apiKey,
      } : undefined,
    });
    const blob = await response.blob();
    return { url: URL.createObjectURL(blob), type: 'video' };
  } else {
    try {
      const isPrint = state.quality === 'Print (5792x8688)';
      
      let finalAspectRatio = state.aspectRatio;
      if (isPrint) {
        finalAspectRatio = '3:4';
      } else if (state.aspectRatio === 'Custom') {
        const ratio = state.customWidth / state.customHeight;
        if (Math.abs(ratio - 1) < 0.1) finalAspectRatio = '1:1';
        else if (ratio < 0.6) finalAspectRatio = '9:16';
        else if (ratio < 0.85) finalAspectRatio = '3:4';
        else if (ratio > 1.6) finalAspectRatio = '16:9';
        else finalAspectRatio = '4:3';
      } else if (state.aspectRatio !== '1:1' && state.aspectRatio !== '3:4' && state.aspectRatio !== '4:3' && state.aspectRatio !== '9:16' && state.aspectRatio !== '16:9') {
        // Handle print sizes like '12x18'
        const dims = state.aspectRatio.split('x');
        if (dims.length === 2) {
          const w = parseFloat(dims[0]);
          const h = parseFloat(dims[1]);
          const ratio = w / h;
          if (Math.abs(ratio - 1) < 0.1) finalAspectRatio = '1:1';
          else if (ratio < 0.6) finalAspectRatio = '9:16';
          else if (ratio < 0.85) finalAspectRatio = '3:4';
          else if (ratio > 1.6) finalAspectRatio = '16:9';
          else finalAspectRatio = '4:3';
        } else {
          finalAspectRatio = '1:1';
        }
      }

      const imageConfig: any = {
        aspectRatio: finalAspectRatio
      };
      
      if (modelName === 'gemini-3.1-flash-image-preview') {
        imageConfig.imageSize = (state.quality === 'Gigapixel' || state.quality === '4K' || isPrint) ? '4K' : state.quality === '2K' ? '2K' : state.quality === 'Low Res (Free)' ? '512px' : '1K';
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: parts
        },
        config: {
          imageConfig: imageConfig
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return { url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`, type: 'image' };
        }
      }
      
      throw new Error("No image data returned from Gemini.");
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      const errorMessage = error.message || String(error);
      
      if (errorMessage.includes('403') || errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('Requested entity was not found')) {
        if (window.aistudio && window.aistudio.openSelectKey) {
          await window.aistudio.openSelectKey();
        }
        throw new Error("Permission Denied (403): Your API key is invalid or doesn't have access. If you created this key in Google Cloud Console, you MUST enable the 'Generative Language API' for your project. Alternatively, create a key at aistudio.google.com/app/apikey.");
      }
      
      if (errorMessage.includes('429') || errorMessage.includes('quota')) {
        throw new Error(`Quota Exceeded (429): If you are using Gemini HQ or Veo Video, they DO NOT have a free tier (you must enable billing). Switch to 'Gemini (Fast)' for free usage. If you are already on Gemini (Fast), you have hit the free limit. Try again later.\n\nOriginal Error: ${errorMessage}`);
      }

      if (errorMessage.includes('503') || errorMessage.includes('UNAVAILABLE') || errorMessage.includes('high demand')) {
        throw new Error("Service Unavailable (503): Google's Gemini AI servers are currently experiencing very high demand. This is a temporary server issue, not a problem with your app or API key. Please try again in a few minutes.");
      }
      
      if (errorMessage.includes('safety') || errorMessage.includes('blocked') || errorMessage.includes('content policy')) {
        throw new Error("Safety Filter Blocked: Google's AI safety filters blocked this request. Try using a different reference image or simpler prompt.");
      }
      
      // Throw the actual error so the user can see exactly what went wrong
      throw new Error(`API Error: ${errorMessage}`);
    }
  }
}

export async function analyzeVideo(videoBase64: string, question: string): Promise<string> {
  const apiKey = getApiKey('gemini-3.1-pro-preview');
  if (!apiKey) {
    throw new Error("API key is missing. Please check your environment variables.");
  }
  
  const { GoogleGenAI } = await import("@google/genai");
  const aiOptions: any = { apiKey };
  if (apiKey === 'PROXY') {
    aiOptions.httpOptions = { baseUrl: window.location.origin + '/api/gemini' };
  }
  const ai = new GoogleGenAI(aiOptions);
  const { mimeType, data } = extractBase64Data(videoBase64);

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: [
      {
        inlineData: {
          mimeType,
          data
        }
      },
      {
        text: question
      }
    ]
  });

  return response.text || "No analysis returned.";
}
