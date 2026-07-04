import { AppState, CatalogueModelGarments } from "../types";

// Helper to resize image before sending to API to prevent "Payload Too Large" errors
async function resizeImageBase64(base64Str: string, maxWidth = 768, maxHeight = 768): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      
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
        const isPng = base64Str.startsWith('data:image/png');
        if (!isPng) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }
        ctx.drawImage(img, 0, 0, width, height);
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
  const requiresPaidKey = model.startsWith('gemini-3') || model.startsWith('veo');
  if (requiresPaidKey && window.aistudio && window.aistudio.hasSelectedApiKey) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
    }
  }
}

function getApiKey(model: string): string {
  const requiresPaidKey = model.startsWith('gemini-3') || model.startsWith('veo');
  let platformKey = '';
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      platformKey = process.env.API_KEY;
    }
  } catch (e) {}

  if (window.aistudio) {
    if (requiresPaidKey && platformKey) return platformKey;
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) return import.meta.env.VITE_GEMINI_API_KEY;
    // @ts-ignore
    if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
    return platformKey || 'PROXY';
  }
  return 'PROXY';
}

function extractBase64Data(dataUrl: string) {
  const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 string');
  }
  return { mimeType: matches[1], data: matches[2] };
}

async function upscaleImageBase64(
  base64Str: string,
  targetLongEdge: number,
  vibrancy = true,
  sharpness = 70,
  denoise = 20
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = async () => {
      const h_w_ratio = img.height / img.width;
      
      let tw, th;
      if (img.width >= img.height) {
        tw = targetLongEdge;
        th = Math.round(targetLongEdge * h_w_ratio);
      } else {
        th = targetLongEdge;
        tw = Math.round(targetLongEdge / h_w_ratio);
      }

      // If the image is already at or above target resolution, do not upscale it
      if (img.width >= tw && img.height >= th) {
        resolve(base64Str);
        return;
      }

      // Create main canvas with target high-resolution dimensions
      let canvas = document.createElement('canvas');
      canvas.width = tw;
      canvas.height = th;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }

      // Draw the image directly to the high-resolution canvas in a single step to prevent repeated blurring
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, tw, th);

      // Apply Hardware-Accelerated Contrast, Brightness, Saturation & High-Fidelity GPU Filters
      try {
        const filterCanvas = document.createElement('canvas');
        filterCanvas.width = tw;
        filterCanvas.height = th;
        const filterCtx = filterCanvas.getContext('2d');
        if (filterCtx) {
          // 1. Draw the base upscaled image onto the filter canvas with basic enhancements
          const contrastBoost = 100 + (sharpness * 0.08); // Subtle contrast boost to enhance details
          const saturateBoost = 100 + (vibrancy ? 8 : 0); // Saturation boost
          const brightnessAdjustment = 100 + (sharpness * 0.01); // Safe brightness boost

          filterCtx.filter = `contrast(${contrastBoost}%) brightness(${brightnessAdjustment}%) saturate(${saturateBoost}%)`;
          filterCtx.drawImage(canvas, 0, 0);

          // 2. Apply a hardware-accelerated high-frequency edge sharpening overlay (GPU-driven Unsharp Mask)
          if (sharpness > 0) {
            filterCtx.save();
            filterCtx.globalCompositeOperation = 'overlay';
            // Scale opacity based on sharpness setting
            filterCtx.globalAlpha = (sharpness / 100) * 0.35;
            // High contrast boost on overlay creates an incredibly crisp, hyper-detailed look on fabrics & textures
            filterCtx.filter = `contrast(${120 + sharpness * 0.5}%) saturate(100%) brightness(100%)`;
            filterCtx.drawImage(canvas, 0, 0);
            filterCtx.restore();
          }

          canvas = filterCanvas;
        }
      } catch (e) {
        console.error("Hardware filter enhancement failed:", e);
      }

      // Return high-quality, high-resolution output (compression 0.98 for maximum crisp details)
      resolve(canvas.toDataURL('image/jpeg', 0.98));
    };
    img.onerror = () => resolve(base64Str);
    img.src = base64Str;
  });
}

async function addModelGarmentsToParts(
  model: CatalogueModelGarments, 
  label: string, 
  parts: any[], 
  maxDim: number,
  baseImageForVideoRef: { current: { mimeType: string; data: string } | null }
) {
  const gType = model.garmentType;
  if (gType === 'Dress') {
    if (model.dressTopImage) {
      try {
        const resized = await resizeImageBase64(model.dressTopImage, maxDim, maxDim);
        const { mimeType, data } = extractBase64Data(resized);
        parts.push({ inlineData: { mimeType, data } });
        parts.push({ text: `Reference Image for ${label} (Dress Top/Kurti design).` });
        if (!baseImageForVideoRef.current) baseImageForVideoRef.current = { mimeType, data };
      } catch (err) {
        console.error(`Failed to process dress top image for ${label}:`, err);
      }
    }
    if (model.dressBottomImage) {
      try {
        const resized = await resizeImageBase64(model.dressBottomImage, maxDim, maxDim);
        const { mimeType, data } = extractBase64Data(resized);
        parts.push({ inlineData: { mimeType, data } });
        parts.push({ text: `Reference Image for ${label} (Dress Bottom/Pants design).` });
      } catch (err) {
        console.error(`Failed to process dress bottom image for ${label}:`, err);
      }
    }
    if (model.dressDupattaImage) {
      try {
        const resized = await resizeImageBase64(model.dressDupattaImage, maxDim, maxDim);
        const { mimeType, data } = extractBase64Data(resized);
        parts.push({ inlineData: { mimeType, data } });
        parts.push({ text: `Reference Image for ${label} (Dress Dupatta/Scarf design).` });
      } catch (err) {
        console.error(`Failed to process dress dupatta image for ${label}:`, err);
      }
    }
  } else if (gType === 'Saree') {
    if (model.sareeImage) {
      try {
        const resized = await resizeImageBase64(model.sareeImage, maxDim, maxDim);
        const { mimeType, data } = extractBase64Data(resized);
        parts.push({ inlineData: { mimeType, data } });
        parts.push({ text: `Reference Image for ${label} (Saree Drape design pattern).` });
        if (!baseImageForVideoRef.current) baseImageForVideoRef.current = { mimeType, data };
      } catch (err) {
        console.error(`Failed to process saree image for ${label}:`, err);
      }
    }
    if (model.blouseImage) {
      try {
        const resized = await resizeImageBase64(model.blouseImage, maxDim, maxDim);
        const { mimeType, data } = extractBase64Data(resized);
        parts.push({ inlineData: { mimeType, data } });
        parts.push({ text: `Reference Image for ${label} (Blouse design matching the saree).` });
      } catch (err) {
        console.error(`Failed to process blouse image for ${label}:`, err);
      }
    }
  } else {
    // Kurti, Suit, Auto, Outfit, Gown, Lehenga, etc. (uses outfitImage)
    if (model.outfitImage) {
      try {
        const resized = await resizeImageBase64(model.outfitImage, maxDim, maxDim);
        const { mimeType, data } = extractBase64Data(resized);
        parts.push({ inlineData: { mimeType, data } });
        parts.push({ text: `Reference Image for ${label} (${gType === 'Auto' ? 'Outfit' : gType} design).` });
        if (!baseImageForVideoRef.current) baseImageForVideoRef.current = { mimeType, data };
      } catch (err) {
        console.error(`Failed to process outfit image for ${label}:`, err);
      }
    }
  }
}

export async function generateFashionMedia(state: AppState, onProgress?: (msg: string) => void): Promise<{url: string, type: 'image' | 'video'}> {
  const provider = state.apiProvider;
  let modelName: string = state.imageModel;
  
  if (provider === 'google') {
    // Map to valid Gemini 3.1 image and video models
    // Automatically select high-quality model if user requests 4K, Gigapixel (8K), or Print
    const isHighQuality = state.quality === '4K' || state.quality === 'Gigapixel' || state.quality === 'Print (5792x8688)' || state.imageModel === 'gemini-hq' || (state.customWidth === 6 && state.customHeight === 9 && state.customUnit === 'inches');
    modelName = isHighQuality 
      ? 'gemini-3.1-flash-image' 
      : state.imageModel === 'veo-fast' 
        ? 'veo-3.1-lite-generate-preview' 
        : 'gemini-3.1-flash-lite-image'; // Fallback to fast image model
  }
  
  await ensureApiKey(modelName);
  const apiKey = getApiKey(modelName);
  
  if (!apiKey) {
    throw new Error("Missing API Key configuration.");
  }

  const parts: any[] = [];
  let baseImageForVideo: { mimeType: string, data: string } | null = null;
  let baseImageUrl: string | null = null;
  const baseImageForVideoRef = { current: baseImageForVideo };

  const maxDim = state.quality === 'Low Res (Free)' ? 512 : 
                 (state.quality === '4K' || state.quality === 'Gigapixel' || state.quality === 'Print (5792x8688)') ? 2048 : 1024;
  if (state.animateReferenceImage) {
    const resized = await resizeImageBase64(state.animateReferenceImage, maxDim, maxDim);
    const { mimeType, data } = extractBase64Data(resized);
    parts.push({ inlineData: { mimeType, data } });
    parts.push({ text: "Reference Image: Starting frame for animation." });
    baseImageForVideoRef.current = { mimeType, data };
    baseImageUrl = resized;
  } else {
    if (state.background === 'Uploaded' && state.backgroundImage) {
      try {
        const resizedBg = await resizeImageBase64(state.backgroundImage, maxDim, maxDim);
        const { mimeType, data } = extractBase64Data(resizedBg);
        parts.push({ inlineData: { mimeType, data } });
        parts.push({ text: "Background Reference Image: Place the model and garments into this specific environment." });
      } catch (err) {
        console.error("Failed to process background image:", err);
      }
    }

    if (state.creationType === 'Catalogue') {
      const activePages = state.cataloguePages || 12;
      const models = state.catalogueModels.slice(0, activePages);
      for (let i = 0; i < models.length; i++) {
        const label = i === 0 ? "Model 1 (Cover Page)" : `Model ${i + 1} (Page ${i + 1})`;
        await addModelGarmentsToParts(models[i], label, parts, maxDim, baseImageForVideoRef);
      }
    } else if (state.creationType === 'Poster') {
      if (state.posterPages === 1) {
        if (state.posterModels && state.posterModels[0]) {
          await addModelGarmentsToParts(state.posterModels[0], "Poster Model 1", parts, maxDim, baseImageForVideoRef);
        }
      } else {
        const coverModel = state.posterModels && state.posterModels[0];
        if (coverModel) {
          await addModelGarmentsToParts(coverModel, "Poster Cover Page Model", parts, maxDim, baseImageForVideoRef);
        }
        const activeModels = state.posterModels.slice(1, 1 + (state.posterMainPageModels || 6));
        for (let i = 0; i < activeModels.length; i++) {
          await addModelGarmentsToParts(activeModels[i], `Poster Main Page Model ${i + 1}`, parts, maxDim, baseImageForVideoRef);
        }
      }
    } else if (state.creationType === 'Photo' && state.modelCount > 1) {
      const activeModels = state.catalogueModels.slice(0, state.modelCount);
      for (let i = 0; i < activeModels.length; i++) {
        await addModelGarmentsToParts(activeModels[i], `Photo Model ${i + 1}`, parts, maxDim, baseImageForVideoRef);
      }
    } else {
      const singleModel: CatalogueModelGarments = {
        id: 1,
        garmentType: state.garmentType,
        outfitImage: state.outfitImage,
        dressTopImage: state.dressTopImage,
        dressBottomImage: state.dressBottomImage,
        dressDupattaImage: state.dressDupattaImage,
        sareeImage: state.sareeImage,
        blouseImage: state.blouseImage
      };
      await addModelGarmentsToParts(singleModel, "Model 1", parts, maxDim, baseImageForVideoRef);
    }
  }

  baseImageForVideo = baseImageForVideoRef.current;

  const fancyPoses = [
    "striking a spectacular editorial pose, standing at an elegant 3/4 angle with one shoulder dropped slightly, showing off the garment's beautiful drapes",
    "standing in a classic fashion posture with a subtle twist of the waist, looking over her shoulder with an elegant, confident expression",
    "striking a chic runway model pose with a stylish weight-shift on her hip, hand resting gracefully on her side, showing off the sleek fabric details",
    "standing in a dynamic asymmetrical pose with a sophisticated body tilt, one hand gently brushing her dark hair, displaying excellent posture"
  ];

  let actualPose = state.pose;
  if (actualPose === 'Close-up') {
    actualPose = 'Standing';
  }

  let poseDescription = `in a full-length head-to-toe standing ${actualPose.toLowerCase()} pose`;
  if (actualPose === 'Standing') {
    poseDescription = `standing in a perfectly straight, symmetric front-facing pose, standing perfectly upright with feet together, looking directly into the camera with absolute composure. This is a classic, straight-standing posture, with a serene and symmetric presentation`;
  } else if (actualPose === 'Walking') {
    poseDescription = `captured in mid-stride, walking naturally forward with an elegant active walking pose, showing a dynamic moving stride, one leg forward in a graceful walking movement, displaying beautiful body motion`;
  } else if (actualPose === 'Sitting') {
    poseDescription = `elegantly seated on a contemporary designer stool, luxury chair, or minimal bench, with her entire body fully visible in a beautiful, natural seated posture, presenting the garments beautifully in a full sitting composition`;
  } else if (actualPose === 'Dynamic') {
    poseDescription = `striking an energetic, high-fashion dynamic pose with a slight body lean, showcasing active body language, creative posture, and beautiful fashion style lines`;
  } else if (actualPose === 'Fancy Pose') {
    poseDescription = fancyPoses[Math.floor(Math.random() * fancyPoses.length)];
  }

  const isCustomVertical = state.customHeight > state.customWidth;

  function getBackgroundDescription(appState: AppState): string {
    switch (appState.background) {
      case 'Solid Color':
        return `against a clean, solid, minimalist flat studio background with a subtle soft shadow. The background is a solid modern light grey or off-white color.`;
      case 'Outdoor': {
        const outdoorBackdrops = [
          `standing outdoors on a clean tiled stone pathway next to a beautiful clear luxury swimming pool resort, with clear turquoise water, green palm trees, warm sunny evening/sunset golden lighting, and soft water reflections.`,
          `standing outdoors in a lush, blooming royal palace garden, surrounded by vibrant exotic flowers, clean manicured green lawns, stone fountains, and soft natural sunset lighting.`,
          `standing outdoors on a scenic seaside wooden boardwalk, with the beautiful blue ocean, gentle waves, distant coastal cliffs, and breezy sunny daylight.`,
          `standing outdoors in a high-end luxury resort open-air courtyard, surrounded by elegant terracotta walls, lush tropical green foliage, modern stylish patio furniture, and warm ambient sunlight.`,
          `standing outdoors on an elegant Parisian stone terrace overlooking beautiful classic European architecture, ornamental wrought-iron railings, and soft warm afternoon lighting.`,
          `standing outdoors in a serene autumn park, surrounded by golden maple trees, a beautifully paved walking path, soft diffused golden hour light, and falling leaves.`
        ];
        return outdoorBackdrops[Math.floor(Math.random() * outdoorBackdrops.length)];
      }
      case 'Studio':
        return `inside a professional high-end fashion photography studio with soft overhead softboxes, clean floor, elegant professional studio backdrops, and subtle studio lights.`;
      case 'Minimalist Studio':
        return `in a modern minimalist studio with neutral warm tones, simple geometric arches, soft shadows, and clean elegant architectural lines.`;
      case 'Vintage Mansion':
        return `inside a grand luxurious vintage mansion lobby with elegant classical marble pillars, high arched windows, ornate wood details, and warm luxurious ambient lighting.`;
      case 'Cyberpunk City':
        return `standing on a high-tech cyberpunk city street at night, with towering skyscrapers, glowing holographic signs, neon pink and blue lights, and atmospheric mist.`;
      case 'Neon Lights':
        return `surrounded by sleek, modern artistic neon lights in a futuristic indoor creative studio space.`;
      case 'Beach Resort':
        return `standing outdoors on a clean tiled stone pathway next to a gorgeous luxury swimming pool at a tropical beach resort, with palm trees, clear blue skies, and warm golden hour sunset lighting casting soft glowing highlights on the model.`;
      case 'Luxury Hotel':
        return `in a grand opulent lobby of a 7-star luxury hotel, with beautiful marble floors, crystal chandeliers, large elegant columns, and glass architecture.`;
      case 'Urban Street':
        return `standing on a clean modern upscale city street with beautiful glass boutiques, elegant urban architecture, and soft outdoor afternoon daylight.`;
      case 'Custom':
        return appState.customBackground ? `with a custom backdrop described as: ${appState.customBackground}` : `against an elegant professional backdrop`;
      case 'Uploaded':
        return `using the provided background environment reference image. The model must be seamlessly composited into this background with matching realistic lighting, shadows, and perspective.`;
      case 'AI Generated':
        return appState.aiBackgroundStyle ? `with a custom AI-generated background style: ${appState.aiBackgroundStyle}` : `with a highly aesthetic AI-generated backdrop`;
      default:
        return `in a beautiful ambient backdrop such as a luxurious resort outdoor lounge or elegant studio with natural light.`;
    }
  }

  const isCoverCloseup = (state.creationType === 'Catalogue' || (state.creationType === 'Poster' && state.posterPages === 2)) && state.coverCloseup !== false;

  let baseSubject = "";
  let prompt = "";

  if (isCoverCloseup) {
    baseSubject = `A stunning, high-fashion editorial magazine cover portrait of a ${state.gender.toLowerCase()} model. This is an elegant close-up/medium shot focusing beautifully on the head, shoulders, expressive face, and upper body.`;
    if (state.gender === 'Female') {
      baseSubject = `A stunningly beautiful Indian female model with perfect symmetrical facial features, warm glowing skin tone, expressive friendly smile, and long elegant dark brown wavy hair flowing beautifully down her shoulders. This is an elegant close-up/medium portrait focusing on her face, neck, and upper outfit.`;
      
      if (state.mode === 'saree' || state.garmentType === 'Saree') {
        baseSubject += ` She is adorned with beautiful traditional ornate kundan jewelry, including a large multi-layered pearl and green beaded Kundan necklace, matching statement Kundan jhumka earrings, and a beautiful maang tikka sitting gracefully on her hairline.`;
      } else if (state.garmentType === 'Dress' || state.garmentType === 'Kurti' || state.garmentType === 'Suit' || state.garmentType === 'Lehenga') {
        baseSubject += ` She is styled with elegant traditional Kundan jewelry, including a matching delicate Kundan necklace and statement earrings.`;
      }
    }

    prompt = `[COMPOSITION MANDATE: HIGH-FASHION CLOSE-UP MAGAZINE COVER PORTRAIT. THE CAMERA IS POSITIONED AT EYE-LEVEL focusing on the head, face, shoulders, and upper outfit with beautiful studio/magazine cover framing]. Head and shoulders fully visible, beautifully composed. ${baseSubject}.
The model is wearing the premium garments from the reference images (top/saree/blouse) with gorgeous fashion details.
Background environment: ${getBackgroundDescription(state)}`;

    prompt += `\n\n---\n`;
    prompt += `CRITICAL COMPOSITION DIRECTIVES (MANDATORY FOR COMMERCIAL COVER):
- PORTRAIT CLOSE-UP/MEDIUM SHOT: Frame the model from the chest up or waist up, focusing on the face, jewelry, hairstyle, and the elegant upper garment drape.
- DO NOT show feet or shoes. The camera must focus on the upper-body details to create an impactful cover.
- Aesthetic quality: photorealistic, hyper-detailed, 8k resolution, elegant professional cover lighting, beautiful colors, premium magazine cover aesthetic.`;
  } else {
    baseSubject = `A premium, high-fashion editorial campaign photograph of a ${state.gender.toLowerCase()} model standing elegantly in a full-length, head-to-toe presentation. This is a complete full-length standing portrait displaying the entire body from head to toe, with absolutely no cropping of any part of the body.`;

    if (state.gender === 'Female') {
      baseSubject = `A stunningly beautiful Indian female model with perfect symmetrical facial features, warm glowing skin tone, expressive friendly smile, and long elegant dark brown wavy hair flowing beautifully down her shoulders. She stands elegantly in a full-length, head-to-toe presentation, with her entire body from head to toe fully visible.`;
      
      if (state.mode === 'saree' || state.garmentType === 'Saree') {
        baseSubject += ` She is adorned with beautiful traditional ornate kundan jewelry, including a large multi-layered pearl and green beaded Kundan necklace, matching statement Kundan jhumka earrings, a beautiful maang tikka sitting gracefully on her hairline, and matching gold and glass bangles on both wrists.`;
      } else if (state.garmentType === 'Dress' || state.garmentType === 'Kurti' || state.garmentType === 'Suit' || state.garmentType === 'Lehenga') {
        baseSubject += ` She is styled with elegant traditional Kundan jewelry, including a matching delicate Kundan necklace and statement earrings, and beautiful gold bracelets.`;
      }
    }

    prompt = `[COMPOSITION MANDATE: EXTREME WIDE-ANGLE LONG SHOT. THE CAMERA IS POSITIONED FAR BACK AND LOW TO CAPTURE 100% OF THE MODEL FROM HEAD TO FEET IN A SINGLE FRAME]. Absolute complete uncropped model silhouette, head-to-toe fully visible. ${baseSubject} ${poseDescription}.
The model is styled in the garments from the reference images (top, bottom, dupatta, saree, blouse). Since the reference garments in the input images might be cropped, close-ups, or flat-lays, you MUST automatically complete the entire look by rendering the complete pants (such as elegant matching trousers, palazzo pants, matching salwar, or skirt) and matching designer shoes, sandals, high heels, or traditional footwear.

The model's footwear (shoes/sandals/heels) MUST be fully visible, standing firmly on the floor or ground, with a soft shadow cast on the floor beneath her shoes. The camera must be zoomed out so that there is clear visible floor/ground space underneath the model's feet and clear empty headroom above her hair.

Background environment: ${getBackgroundDescription(state)}`;

    prompt += `\n\n---\n`;
    prompt += `CRITICAL COMPOSITION DIRECTIVES (MANDATORY FOR COMMERCIAL CATALOG):
- EXTREME FULL SHOT: Zoom out the camera lens extensively. The model's complete body from head to toe (including the hair, shoulders, legs, ankles, feet, and shoes) MUST be 100% fully inside the image bounds.
- HEAD AND FEET SPACE: Ensure there is substantial empty headspace above the model's head and clear ground/floor space below the model's shoes. The shoes must be fully visible and resting on the floor, not cut off by the bottom edge. No part of the model's body, clothing, or hair should touch or be cut off by any edge of the image frame.
- STRICT NEGATIVE DIRECTIVE: Do NOT crop at the ankles, shins, knees, thighs, hips, waist, or torso. Do NOT generate a half-body shot, medium shot, close-up, or typical vertical portrait crop.
- OVERRIDE REFERENCE CROP: Even if any of the provided garment reference images is a close-up, a flat-lay, or heavily cropped, IGNORE that crop completely. Re-imagine and project the garments onto a standing full-length model.
- Footwear Detail: Beautifully matching high heels, designer sandals, or traditional mojris fully visible on the paved path/floor with soft shadows.
- Aesthetic quality: photorealistic, hyper-detailed, 8k resolution, elegant professional catalog lighting, beautiful colors, premium fashion magazine aesthetic.`;
  }

  if (isCustomVertical || state.quality === 'Print (5792x8688)') {
    prompt += `\n- Composition Requirement: Perfect vertical aspect framing distribution. Do not cut any part of the subject.`;
  }

  if (state.styleExtra !== 'None') prompt += `\nStyle: ${state.styleExtra}.`;
  if (state.customPrompt) prompt += `\nAdditional details: ${state.customPrompt}.`;

  const finalPrompt = prompt;
  
  let endInstructionText = `[CRITICAL RE-ENFORCEMENT: Remember, you MUST generate an absolute full-body, head-to-toe standing view. The model must be shown completely from head to feet/shoes. Do NOT crop at the ankles, knees, thighs, hips, or waist. The entire outfit, legs, ankles, and matching footwear MUST be 100% visible, resting on the floor/ground. Ensure there is visible floor/ground space under the shoes of the model, and empty headspace above the head. Zoom out the camera lens extensively to capture the entire figure in a wide shot.]`;
  if (isCoverCloseup) {
    endInstructionText = `[CRITICAL RE-ENFORCEMENT: Remember, you MUST generate a stunning high-fashion cover closeup/medium shot. The model should be framed from the chest up or waist up, focusing beautifully on the face, shoulders, elegant hair, and exquisite kundan jewelry. Do NOT show feet or legs, and do NOT crop the top of the head. Ensure a perfect, clean and impactful cover framing.]`;
  }

  const finalContents: any[] = [
    { text: finalPrompt },
    ...parts,
    { text: endInstructionText }
  ];

  const { GoogleGenAI } = await import("@google/genai");
  const aiOptions: any = { apiKey };
  if (apiKey === 'PROXY') {
    aiOptions.httpOptions = { baseUrl: window.location.origin + '/api/gemini' };
  }
  const ai = new GoogleGenAI(aiOptions);

  if (state.outputFormat === 'video') {
    if (onProgress) onProgress("Starting video generation...");
    let operation = await ai.models.generateVideos({
      model: modelName,
      prompt: finalPrompt,
      image: baseImageForVideo ? { imageBytes: baseImageForVideo.data, mimeType: baseImageForVideo.mimeType } : undefined,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '9:16' }
    });
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({operation});
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("No video returned.");
    const response = await fetch(downloadLink);
    const blob = await response.blob();
    return { url: URL.createObjectURL(blob), type: 'video' };
  } else {
    try {
      const isPrint = state.quality === 'Print (5792x8688)';
      let finalAspectRatio: any = state.aspectRatio;

      if (state.aspectRatio === 'Custom' || (state.customWidth && state.customHeight)) {
        if (state.customHeight > state.customWidth) {
          const targetRatio = state.customWidth / state.customHeight;
          // Vertical sizes: "9:16" (0.5625) vs "3:4" (0.75) vs "1:1" (1.0)
          // To ensure head & feet are not cropped, the generated aspect ratio must be greater than or equal to the target.
          if (targetRatio <= 0.5625) {
            finalAspectRatio = '9:16';
          } else if (targetRatio <= 0.75) {
            finalAspectRatio = '3:4'; // Standard vertical custom size (e.g. 6x9, 5x7, 8x10) maps to 3:4 to prevent head/feet crop!
          } else {
            finalAspectRatio = '1:1';
          }
        } else if (state.customWidth > state.customHeight) {
          const targetRatio = state.customWidth / state.customHeight;
          // Horizontal sizes: "4:3" (1.3333) vs "16:9" (1.7778)
          if (targetRatio <= 1.3333) {
            finalAspectRatio = '4:3';
          } else {
            finalAspectRatio = '16:9';
          }
        } else {
          finalAspectRatio = '1:1';
        }
      } else if (isPrint) {
        finalAspectRatio = '9:16'; // High quality vertical prints should also default to 9:16 for complete full body standing photo!
      }

      // Ensure aspect ratio is supported by nano banana
      const allowedAspectRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
      if (!allowedAspectRatios.includes(finalAspectRatio)) {
        finalAspectRatio = '9:16'; // Fallback to 9:16 for vertical fashion catalogs
      }

      const imageConfig: any = {
        aspectRatio: finalAspectRatio,
        imageSize: (state.quality === 'Gigapixel' || state.quality === '4K' || isPrint) ? '4K' : state.quality === '2K' ? '2K' : '1K'
      };

      if (onProgress) onProgress("Invoking Gemini Image Generation Engine...");

      // For nano banana series models, we call generateContent to generate images
      const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts: finalContents },
        config: {
          imageConfig: imageConfig
        }
      });

      let base64ImageBytes = '';
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            base64ImageBytes = part.inlineData.data;
            break;
          }
        }
      }

      if (!base64ImageBytes) {
        throw new Error("No image data returned from Gemini.");
      }

      let finalUrl = `data:image/jpeg;base64,${base64ImageBytes}`;

      if (state.quality === '4K') {
        if (onProgress) onProgress("Applying Ultra High Definition 4K Neural Reconstruction...");
        finalUrl = await upscaleImageBase64(finalUrl, 4096, true, 65, 15);
      } else if (state.quality === 'Gigapixel') {
        if (onProgress) onProgress("Applying 8K Gigapixel Detail Sharpening & Super-Resolution...");
        finalUrl = await upscaleImageBase64(finalUrl, 8192, true, 80, 10);
      } else if (state.quality === 'Print (5792x8688)') {
        if (onProgress) onProgress("Applying High-Resolution Print Canvas Optimization...");
        finalUrl = await upscaleImageBase64(finalUrl, 8688, true, 85, 10);
      }

      return { url: finalUrl, type: 'image' };
    } catch (error: any) {
      throw new Error(`API Error: ${error.message || error}`);
    }
  }
}

export async function analyzeVideo(videoBase64: string, question: string): Promise<string> {
  const apiKey = getApiKey('gemini-3.1-pro-preview');
  if (!apiKey) throw new Error("API key is missing.");
  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey });
  const { mimeType, data } = extractBase64Data(videoBase64);

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: [{ inlineData: { mimeType, data } }, { text: question }]
  });
  return response.text || "No analysis returned.";
}