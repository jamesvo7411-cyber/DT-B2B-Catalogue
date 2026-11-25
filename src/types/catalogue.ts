export type GarmentCategory =
  | 'Trousers'
  | 'Shorts'
  | 'Polos'
  | 'Tees & V-Necks'
  | 'Skirts';

export type GarmentGender = 'Men' | 'Women';

export type MediaSlotKey = 'hero' | 'pocket' | 'seam' | 'swatch' | 'custom';

export type AssetStage = 'blank' | 'ai-concept' | 'studio-final';

export type MetallicTheme = 'platinum' | 'champagne' | 'graphite';

export interface ImageCrop {
  scale: number;
  x: number;
  y: number;
  posX?: number;
  posY?: number;
}

export type CatalogueSection = 'flipbook' | 'fabrics' | 'index' | 'print';

export type PrintOrientation = 'landscape' | 'portrait';

export type PrintScope = 'all' | 'category' | 'shortlist' | 'current';

export interface MediaSlot {
  url: string;
  fallbackUrl?: string;
  stage: AssetStage;
  caption: string;
  aspectLabel: string;
  note: string;
  isSessionDrop?: boolean;
  isFactoryFabricImage?: boolean;
  crop?: ImageCrop;
}

export interface GarmentSpecs {
  fabricRollRef: string;
  composition: string;
  weightGsm: string;
  fabricWidth: string;
  stretchFeelNote: string;
  stitchDensity: string;
  seamFinish: string;
  pocketConstruction: string;
  cmOemOdmScope: string;
  sizeRun: string;
  moq: string;
  leadTime: string;
  wholesaleRef: string;
}

export interface FactoryFabricColor {
  fabricCode: string;
  colorName: string;
  factoryColorName: string;
  shadeCode: string;
  reference: string;
  lotWeightGsm: string;
  lotWidth: string;
  sourceNote: string;
  swatchImageUrl?: string;
  surfaceCharacter?: string;
}

export interface GarmentItem {
  id: string;
  index: number; // 1..43
  sku: string; // Real style code from DOT Product List (e.g. MLPA82, MTSHIRT-MD1)
  title: string;
  gender: GarmentGender;
  genderCode: 'Nam' | 'Nữ';
  productGroupVi: string;
  category: GarmentCategory;
  chapterNumeral: string;
  summary: string;
  descriptionBullets: string[];
  keyFeatures: string[];
  colorCount: number;
  colorways: string[];
  dataFlags?: string[];
  productUrl: string;
  videoUrl: string;
  videoTitle: string;
  specs: GarmentSpecs;
  media: Record<MediaSlotKey, MediaSlot>;
  detailHints?: {
    pocket: string;
    seam: string;
    custom: string;
  };
}

export interface FabricSwatchProgram {
  fabricCode: string;
  factoryColors: FactoryFabricColor[];
  composition: string;
  weightGsm: string;
  fabricWidth: string;
  stretchFeelNote: string;
  colorCount: number;
  colorways: string[];
  linkedSkus: string[];
  linkedIndices: number[];
  genders: GarmentGender[];
  dataFlags: string[];
  swatchImageUrl: string;
  swatchImageStage: AssetStage;
  isSessionDrop?: boolean;
}

export interface CatalogueMetadata {
  season: string;
  edition: string;
  subtitle: string;
  presentationNote: string;
  contactEmail: string;
  showroomUrl: string;
}

export interface PrintProductionSpec {
  pageFormat: string;
  spreadDimensionsMm: string;
  bleedMm: number;
  trimMarginMm: number;
  innerGutterMm: number;
  outerMarginMm: number;
  targetDpi: number;
  colorProfile: string;
  bindingMethod: string;
}

export interface PrintConfig {
  scope: PrintScope;
  orientation: PrintOrientation;
  showCropMarks: boolean;
  showBlankGuides: boolean;
  showSafeZones: boolean;
  includeCover: boolean;
  includeIndex: boolean;
  includeFabrics: boolean;
}

