export type AppMode = 'saree' | 'outfit';
export type Gender = 'Female' | 'Male' | 'Non-binary';
export type Pose = 'Standing' | 'Walking' | 'Sitting' | 'Dynamic' | 'Fancy Pose';
export type StyleExtra = 'Cinematic' | 'Studio' | 'Vintage' | 'Editorial' | 'None' | 'Hold Clutch' | 'Sunglasses' | 'Sun Hat' | 'Coffee Cup' | 'Phone' | 'Hands on Hips' | 'Scarf';
export type BackgroundType = 'Solid Color' | 'Outdoor' | 'Studio' | 'Cyberpunk City' | 'Minimalist Studio' | 'Vintage Mansion' | 'Neon Lights' | 'Beach Resort' | 'Luxury Hotel' | 'Urban Street' | 'Custom' | 'Uploaded' | 'AI Generated';
export type ImageQuality = 'Low Res (Free)' | 'Standard' | 'HD' | 'FHD' | '2K' | '4K' | 'Ultra' | 'Gigapixel';
export type FidelityMode = 'Standard' | 'High' | 'Ultra (Strict Design Matching)';
export type VideoResolution = '720p' | '1080p' | '4K Ultra Master';
export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9' | '1:4' | '1:8' | '4:1' | '8:1' | '12x18' | '6x9' | '13x19' | '9x12' | '13x40' | '13x30' | '10x14' | 'Custom';
export type OutputFormat = 'image' | 'video';
export type VideoDuration = number;
export type ApiProvider = 'google';
export type ImageModel = 'gemini-fast' | 'gemini-hq' | 'veo-fast';
export type GarmentType = 'Auto' | 'Saree' | 'Kurti' | 'Dress' | 'Top' | 'Pants' | 'Suit' | 'Gown' | 'Lehenga' | 'Shirt' | 'T-shirt' | 'Jacket' | 'Skirt';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export interface AppState {
  apiProvider: ApiProvider;
  mode: AppMode;
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
  enableOutfitColor: boolean;
  outfitColor: string;
  enableJewellery: boolean;
  jewelleryImage: string | null;
  jewelleryDescription: string;
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
