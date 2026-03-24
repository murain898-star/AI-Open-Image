import { AppState } from "../types";
import { GoogleGenAI } from "@google/genai";

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
  
  // If the model requires a paid key, ALWAYS use the platform's key selector
  if (requiresPaidKey && process.env.API_KEY) {
    return process.env.API_KEY;
  }

  // Otherwise, prefer the custom API key from localStorage if it exists
  const customKey = localStorage.getItem('custom_gemini_api_key');
  if (customKey && customKey.trim() !== '') {
    return customKey.trim();
  }

  if (process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  return '';
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
    if (state.mode === 'saree') {
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

  let prompt = `Generate a high-quality, professional full-body fashion catalog photo of a ${state.gender.toLowerCase()} model ${poseDescription}. 

CRITICAL INSTRUCTION: The model MUST be wearing the EXACT garment(s) shown in the provided reference image(s). 
You must perfectly copy the embroidery, motifs, pattern, color, and fabric texture from the reference images onto the model's outfit. 
DO NOT invent a new design. DO NOT change the design. It must be a 1:1 exact visual match of the uploaded garment.`;

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

  // Google Provider (Default)
  const ai = new GoogleGenAI({ apiKey });

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
      throw error;
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
    const response = await fetch(downloadLink, {
      method: 'GET',
      headers: {
        'x-goog-api-key': apiKey,
      },
    });
    const blob = await response.blob();
    return { url: URL.createObjectURL(blob), type: 'video' };
  } else {
    try {
      const imageConfig: any = {
        aspectRatio: state.aspectRatio === '1:1' || state.aspectRatio === '3:4' || state.aspectRatio === '4:3' || state.aspectRatio === '9:16' || state.aspectRatio === '16:9' ? state.aspectRatio : "1:1"
      };
      
      if (modelName === 'gemini-3.1-flash-image-preview') {
        imageConfig.imageSize = state.quality === 'Gigapixel' || state.quality === '4K' ? '4K' : state.quality === '2K' ? '2K' : state.quality === 'Low Res (Free)' ? '512px' : '1K';
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
        throw new Error("Permission Denied (403): Your API key doesn't have access to this specific model. If using a Free key, ensure you selected 'Gemini (Fast)'.");
      }
      
      if (errorMessage.includes('429') || errorMessage.includes('quota')) {
        throw new Error(`Quota Exceeded (429): If you are using Gemini HQ or Veo Video, they DO NOT have a free tier (you must enable billing). Switch to 'Gemini (Fast)' for free usage. If you are already on Gemini (Fast), you have hit the free limit. Try again later.\n\nOriginal Error: ${errorMessage}`);
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
    throw new Error("API key must be set. Please add your Google AI Studio API Key in the Profile section.");
  }
  const ai = new GoogleGenAI({ apiKey });
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
