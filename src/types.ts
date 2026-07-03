export type AppMode = 'saree' | 'outfit' | 'catalogue';
export type Gender = 'Female' | 'Male' | 'Non-binary';
export type Pose = 'Standing' | 'Walking' | 'Sitting' | 'Dynamic' | 'Fancy Pose';
export type StyleExtra = 'Cinematic' | 'Studio' | 'Vintage' | 'Editorial' | 'None' | 'Hold Clutch' | 'Sunglasses' | 'Sun Hat' | 'Coffee Cup' | 'Phone' | 'Hands on Hips' | 'Scarf';
export type BackgroundType = 'Solid Color' | 'Outdoor' | 'Studio' | 'Cyberpunk City' | 'Minimalist Studio' | 'Vintage Mansion' | 'Neon Lights' | 'Beach Resort' | 'Luxury Hotel' | 'Urban Street' | 'Custom' | 'Uploaded' | 'AI Generated';
export type ImageQuality = 'Low Res (Free)' | 'Standard' | 'HD' | 'FHD' | '2K' | '4K' | 'Ultra' | 'Gigapixel' | 'Print (5792x8688)';
export type FidelityMode = 'Standard' | 'High' | 'Ultra (Strict Design Matching)';
export type VideoResolution = '720p' | '1080p' | '4K Ultra Master';
export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9' | '1:4' | '1:8' | '4:1' | '8:1' | '12x18' | '6x9' | '13x19' | '9x12' | '13x40' | '13x30' | '10x14' | 'Custom';
export type OutputFormat = 'image' | 'video';
export type VideoDuration = number;
export type ApiProvider = 'google';
export type ImageModel = 'gemini-fast' | 'gemini-hq' | 'veo-fast';
export type GarmentType = 'Auto' | 'Saree' | 'Kurti' | 'Dress' | 'Top' | 'Pants' | 'Suit' | 'Gown' | 'Lehenga' | 'Shirt' | 'T-shirt' | 'Jacket' | 'Skirt' | 'T-Shirt' | 'Sweater' | 'Activewear' | 'Swimwear' | 'Lingerie' | "Man's Kurta" | "Men's Dress" | "Women's Dress" | 'Stole' | "Men's Innerwear" | "Women's Innerwear" | "Men's Bottomwear" | "Women's Bottomwear" | 'Jewelry';
export type CreationType = 'Photo' | 'Poster' | 'Catalogue';
export type ModelCount = number;

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export interface ColorModification {
  id: string;
  element: string;
  color: string;
}

export interface CatalogueModelGarments {
  id: number;
  outfitImage: string | null;
  dressTopImage: string | null;
  dressBottomImage: string | null;
  dressDupattaImage: string | null;
  sareeImage: string | null;
  blouseImage: string | null;
  garmentType: GarmentType;
}

export type CataloguePages = 12 | 14 | 16 | 18 | 20 | 22 | 24 | 26 | 28 | 30 | 32;
export type PosterPages = 1 | 2;

export interface AppState {
  apiProvider: ApiProvider;
  mode: AppMode;
  creationType: CreationType;
  modelCount: ModelCount;
  cataloguePages: CataloguePages;
  posterPages: PosterPages;
  posterMainPageModels: number;
  catalogueModels: CatalogueModelGarments[];
  posterModels: CatalogueModelGarments[];
  coverCloseupImage: string | null;
  coverSareeImage: string | null;
  coverBlouseImage: string | null;
  coverDressTopImage: string | null;
  coverDressBottomImage: string | null;
  coverDressDupattaImage: string | null;
  modelReferenceImage: string | null;

  useProModel: boolean;
  imageModel: ImageModel;
  sareeImage: string | null;
  blouseImage: string | null;
  outfitImage: string | null;
  dressTopImage: string | null;
  dressBottomImage: string | null;
  dressDupattaImage: string | null;
  garmentType: GarmentType;
  gender: Gender;
  pose: Pose;
  styleExtra: StyleExtra;
  background: BackgroundType;
  customBackground: string;
  backgroundImage: string | null;
  aiBackgroundStyle: string;
  customPrompt: string;
  outputFormat: OutputFormat;
  videoDuration: VideoDuration;
  videoResolution: VideoResolution;
  quality: ImageQuality;
  aspectRatio: AspectRatio;
  customWidth: number;
  customHeight: number;
  customUnit: 'inches' | 'cm' | 'pixels';
  customDPI: number;
  enableOutfitColor: boolean;
  outfitColor: string;
  enableJewellery: boolean;
  jewelleryImage: string | null;
  jewelleryDescription: string;
  colorModifications: ColorModification[];
  
  // Branding Details
  brandLogo: string | null;
  removeLogoBackground?: boolean;
  brandWatermark: boolean;
  brandName: string;
  designNumber: string;

  // Advanced Controls
  fidelityMode: FidelityMode;
  structureReference: boolean;
  denoisingStrength: number;
  inPaintingMode: boolean;
  inPaintingMask: string | null;
  animateReferenceImage: string | null;
}

export type PresetState = Omit<AppState, 'sareeImage' | 'blouseImage' | 'outfitImage' | 'dressTopImage' | 'dressBottomImage' | 'dressDupattaImage' | 'jewelleryImage'>;

export interface Preset {
  id: string;
  name: string;
  state: PresetState;
}

export function getGenerationCost(state: AppState): number {
  const videoMultiplier = state.outputFormat === 'video' ? (state.videoDuration || 1) : 1;
  const baseCost = state.outputFormat === 'video' 
    ? 1 
    : (state.quality === 'Gigapixel' ? 2 : 1);

  if (state.outputFormat === 'video') {
    return baseCost * videoMultiplier;
  }

  if (state.creationType === 'Poster') {
    return 13;
  }

  if (state.creationType === 'Catalogue') {
    return 2 * (state.cataloguePages || 12);
  }

  // Default Image Generation:
  const modelCost = state.modelCount || 1;
  return baseCost * modelCost;
}
