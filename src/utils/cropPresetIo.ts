import type { GarmentItem, ImageCrop, MediaSlotKey } from '../types/catalogue';
import { getFactoryColorImageKey, getFactoryFabricColors } from '../data/factoryFabricColors';
import { normalizeImageCrop } from './media';

export interface SwatchColorSelection {
  fabricCode: string;
  colorName?: string;
  url: string;
}

export interface CatalogueFramingBundle {
  format: 'dream-tomorrow-framing-v1';
  exportedAt: string;
  totalEditedSlots: number;
  crops: Record<string, Partial<Record<MediaSlotKey, ImageCrop>>>;
  swatchColors?: Record<string, SwatchColorSelection>;
}

const SLOT_KEYS: MediaSlotKey[] = ['hero', 'pocket', 'seam', 'swatch', 'custom'];

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function getSlotMinScale(slotKey: MediaSlotKey): number {
  return slotKey === 'swatch' ? 1.65 : 1;
}

export function isDefaultCrop(crop?: Partial<ImageCrop>, minScale = 1): boolean {
  if (!crop) return true;
  const n = normalizeImageCrop(crop, minScale);
  return (
    Math.abs(n.scale - minScale) < 0.005 &&
    Math.abs(n.x) < 0.05 &&
    Math.abs(n.y) < 0.05 &&
    Math.abs(n.posX - 50) < 0.1 &&
    Math.abs(n.posY - 50) < 0.1
  );
}

function serializeCrop(crop: Partial<ImageCrop>, minScale = 1): ImageCrop {
  const n = normalizeImageCrop(crop, minScale);
  const out: ImageCrop = {
    scale: round2(n.scale),
    x: round2(n.x),
    y: round2(n.y),
  };
  if (Math.abs(n.posX - 50) >= 0.1) out.posX = round2(n.posX);
  if (Math.abs(n.posY - 50) >= 0.1) out.posY = round2(n.posY);
  return out;
}

export function countCustomFramingEdits(garments: GarmentItem[]): {
  cropCount: number;
  styleCount: number;
  swatchCount: number;
} {
  let cropCount = 0;
  let styleCount = 0;
  let swatchCount = 0;

  for (const garment of garments) {
    let styleEdited = false;
    for (const key of SLOT_KEYS) {
      if (!isDefaultCrop(garment.media[key]?.crop, getSlotMinScale(key))) {
        cropCount += 1;
        styleEdited = true;
      }
    }
    if (garment.media.swatch.isFactoryFabricImage && garment.media.swatch.url) {
      swatchCount += 1;
    }
    if (styleEdited) styleCount += 1;
  }

  return { cropCount, styleCount, swatchCount };
}

export function buildFramingBundle(garments: GarmentItem[]): CatalogueFramingBundle {
  const crops: Record<string, Partial<Record<MediaSlotKey, ImageCrop>>> = {};
  const swatchColors: Record<string, SwatchColorSelection> = {};
  let totalEditedSlots = 0;

  for (const garment of garments) {
    const slotMap: Partial<Record<MediaSlotKey, ImageCrop>> = {};
    for (const key of SLOT_KEYS) {
      const slot = garment.media[key];
      const minScale = getSlotMinScale(key);
      if (slot?.crop && !isDefaultCrop(slot.crop, minScale)) {
        slotMap[key] = serializeCrop(slot.crop, minScale);
        totalEditedSlots += 1;
      }
    }
    if (Object.keys(slotMap).length > 0) {
      crops[garment.sku] = slotMap;
    }

    if (
      garment.media.swatch.isFactoryFabricImage &&
      garment.media.swatch.url &&
      !garment.media.swatch.url.startsWith('data:')
    ) {
      const fabricCode = garment.specs.fabricRollRef;
      const matchedColor = getFactoryFabricColors(fabricCode).find(
        (c) => c.swatchImageUrl === garment.media.swatch.url
      );
      swatchColors[garment.sku] = {
        fabricCode,
        colorName: matchedColor?.colorName,
        url: garment.media.swatch.url,
      };
    }
  }

  return {
    format: 'dream-tomorrow-framing-v1',
    exportedAt: new Date().toISOString(),
    totalEditedSlots,
    crops,
    ...(Object.keys(swatchColors).length > 0 ? { swatchColors } : {}),
  };
}

function isValidCropLike(value: unknown): value is Partial<ImageCrop> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.scale === 'number' ||
    typeof obj.x === 'number' ||
    typeof obj.y === 'number' ||
    typeof obj.posX === 'number' ||
    typeof obj.posY === 'number'
  );
}

export function parseFramingBundle(rawText: string): CatalogueFramingBundle {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error('Invalid JSON syntax. Please check the exported framing file or pasted text.');
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Framing preset must be a JSON object.');
  }

  const obj = parsed as Record<string, unknown>;
  // Accept either { format, crops, swatchColors } OR bare { [sku]: { hero: {...} } } OR full manifest { garments: [...] }
  if (Array.isArray(obj.garments)) {
    const crops: Record<string, Partial<Record<MediaSlotKey, ImageCrop>>> = {};
    const swatchColors: Record<string, SwatchColorSelection> = {};
    let totalEditedSlots = 0;

    for (const item of obj.garments) {
      if (!item || typeof item !== 'object') continue;
      const g = item as Partial<GarmentItem>;
      if (!g.sku || !g.media) continue;
      const slotMap: Partial<Record<MediaSlotKey, ImageCrop>> = {};
      for (const key of SLOT_KEYS) {
        const crop = g.media[key]?.crop;
        const minScale = getSlotMinScale(key);
        if (crop && !isDefaultCrop(crop, minScale)) {
          slotMap[key] = serializeCrop(crop, minScale);
          totalEditedSlots += 1;
        }
      }
      if (Object.keys(slotMap).length > 0) {
        crops[g.sku] = slotMap;
      }
      if (g.media.swatch?.isFactoryFabricImage && g.media.swatch.url && !g.media.swatch.url.startsWith('data:')) {
        swatchColors[g.sku] = {
          fabricCode: g.specs?.fabricRollRef ?? '',
          url: g.media.swatch.url,
        };
      }
    }

    return {
      format: 'dream-tomorrow-framing-v1',
      exportedAt: new Date().toISOString(),
      totalEditedSlots,
      crops,
      ...(Object.keys(swatchColors).length > 0 ? { swatchColors } : {}),
    };
  }

  const rawCrops =
    obj.crops && typeof obj.crops === 'object' && !Array.isArray(obj.crops)
      ? (obj.crops as Record<string, unknown>)
      : obj;

  const crops: Record<string, Partial<Record<MediaSlotKey, ImageCrop>>> = {};
  let totalEditedSlots = 0;

  for (const [sku, slots] of Object.entries(rawCrops)) {
    if (
      sku === 'format' ||
      sku === 'exportedAt' ||
      sku === 'totalEditedSlots' ||
      sku === 'swatchColors'
    ) {
      continue;
    }
    if (!slots || typeof slots !== 'object' || Array.isArray(slots)) continue;
    const slotMap: Partial<Record<MediaSlotKey, ImageCrop>> = {};
    for (const key of SLOT_KEYS) {
      const candidate = (slots as Record<string, unknown>)[key];
      if (isValidCropLike(candidate)) {
        slotMap[key] = serializeCrop(candidate, getSlotMinScale(key));
        totalEditedSlots += 1;
      }
    }
    if (Object.keys(slotMap).length > 0) {
      crops[sku] = slotMap;
    }
  }

  const swatchColors: Record<string, SwatchColorSelection> = {};
  if (obj.swatchColors && typeof obj.swatchColors === 'object' && !Array.isArray(obj.swatchColors)) {
    for (const [sku, entry] of Object.entries(obj.swatchColors as Record<string, unknown>)) {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
      const e = entry as Record<string, unknown>;
      if (typeof e.url === 'string' && e.url) {
        swatchColors[sku] = {
          fabricCode: typeof e.fabricCode === 'string' ? e.fabricCode : '',
          colorName: typeof e.colorName === 'string' ? e.colorName : undefined,
          url: e.url,
        };
      }
    }
  }

  if (Object.keys(crops).length === 0 && Object.keys(swatchColors).length === 0 && !('crops' in obj)) {
    throw new Error('No valid crop/zoom values were found in the JSON input.');
  }

  return {
    format: 'dream-tomorrow-framing-v1',
    exportedAt: typeof obj.exportedAt === 'string' ? obj.exportedAt : new Date().toISOString(),
    totalEditedSlots,
    crops,
    ...(Object.keys(swatchColors).length > 0 ? { swatchColors } : {}),
  };
}

export function applyFramingBundle(
  garments: GarmentItem[],
  bundle: CatalogueFramingBundle,
  mode: 'merge' | 'replace',
  fabricColorImages: Record<string, string> = {}
): {
  garments: GarmentItem[];
  appliedCrops: number;
  appliedSwatches: number;
} {
  let appliedCrops = 0;
  let appliedSwatches = 0;

  const updated = garments.map((garment) => {
    const skuCrops = bundle.crops[garment.sku];
    const swatchPreset = bundle.swatchColors?.[garment.sku];

    const nextMedia = { ...garment.media };
    for (const key of SLOT_KEYS) {
      const presetCrop = skuCrops?.[key];
      if (presetCrop) {
        nextMedia[key] = {
          ...nextMedia[key],
          crop: normalizeImageCrop(presetCrop, getSlotMinScale(key)),
        };
        appliedCrops += 1;
      } else if (mode === 'replace') {
        nextMedia[key] = {
          ...nextMedia[key],
          crop: undefined,
        };
      }
    }

    if (swatchPreset) {
      const fabricCode = garment.specs.fabricRollRef;
      const resolvedUrl =
        (swatchPreset.colorName
          ? fabricColorImages[getFactoryColorImageKey(fabricCode, swatchPreset.colorName)]
          : undefined) || swatchPreset.url;
      if (resolvedUrl) {
        nextMedia.swatch = {
          ...nextMedia.swatch,
          url: resolvedUrl,
          isFactoryFabricImage: true,
          isSessionDrop: resolvedUrl.startsWith('data:'),
          caption: swatchPreset.colorName
            ? `${fabricCode} · ${swatchPreset.colorName} fabric image`
            : `${fabricCode} fabric image`,
          note: swatchPreset.colorName
            ? `Selected ${swatchPreset.colorName} swatch for ${garment.sku} (${fabricCode}).`
            : nextMedia.swatch.note,
        };
        appliedSwatches += 1;
      }
    }

    return {
      ...garment,
      media: nextMedia,
    };
  });

  return { garments: updated, appliedCrops, appliedSwatches };
}
