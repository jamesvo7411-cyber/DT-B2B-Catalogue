import type {
  FabricSwatchProgram,
  GarmentCategory,
  GarmentItem,
} from '../types/catalogue';
import {
  buildFabricSwatchPrograms,
  CATEGORIES,
} from '../data/garments';
import {
  getFactoryColorImageKey,
  getPreferredFactoryFabricImage,
} from '../data/factoryFabricColors';

export type SectionId =
  | 'introduction'
  | 'fabrics'
  | 'men'
  | 'women'
  | 'technical';

export interface SectionDescriptor {
  id: SectionId;
  label: string;
  shortLabel: string;
  /** Subtle archival color used strictly as a navigation cue */
  markerColor: string;
  startSpreadPage: number; // 0-based index
  endSpreadPage: number;   // 0-based index
}

export const SECTION_THEME: Record<
  SectionId,
  { label: string; shortLabel: string; markerColor: string }
> = {
  introduction: {
    label: 'Introduction',
    shortLabel: 'Intro',
    markerColor: '#7A756B',
  },
  fabrics: {
    label: 'Fabric Library',
    shortLabel: 'Fabrics',
    markerColor: '#4C5D68',
  },
  men: {
    label: "Men's Collection",
    shortLabel: 'Men',
    markerColor: '#4A5649',
  },
  women: {
    label: "Women's Collection",
    shortLabel: 'Women',
    markerColor: '#7A5652',
  },
  technical: {
    label: 'Technical Information',
    shortLabel: 'Tech Info',
    markerColor: '#3F4247',
  },
};

export const FABRIC_FAMILY_NAMES: Record<string, string> = {
  A82: 'Architectural Suiting Twill',
  A28: 'Everyday Stretch Suiting',
  A29: 'Heavyweight Winter Suiting',
  K03: 'Stretch Cotton Chino Twill',
  '76': 'Fluid Poly-Rayon Suiting',
  'MODAL NAM': "Men's Cotton-Modal Stretch Jersey",
  'MODAL NỮ': "Women's Cotton-Modal Stretch Jersey",
  'PQ 4 CHIỀU / PIQUE NAM – 4 WAYS': '4-Way Stretch Micro-Piqué',
  'SLUB 20': 'Pure Cotton Slub 20s Piqué',
  'CM26 NAM': "Men's Combed 26s Pure Cotton",
  'CM26 NỮ': "Women's Combed 26s Pure Cotton",
  CM36: 'Heavyweight Stretch 36s Jersey',
  CM40: 'Featherweight Combed 40s Jersey',
  'YODY NỮ': "Women's Quick-Dry Performance Piqué",
  CM30: 'Compact 40s + 30D 4-Way Jersey',
};

export function getFabricFamilyName(fabricCode: string): string {
  return FABRIC_FAMILY_NAMES[fabricCode] ?? `Textile Program ${fabricCode}`;
}

/**
 * Counts how many of the 5 visual plates (hero, detail 1-3, fabric swatch)
 * hold a verified/loaded image asset on a garment.
 */
export function getGarmentMediaCompleteness(garment: GarmentItem): {
  populatedCount: number;
  hasHero: boolean;
  detailCount: number;
  hasSwatch: boolean;
  isFullImages: boolean;
} {
  const hasHero = Boolean(garment.media.hero.url || garment.media.hero.fallbackUrl);
  const detailKeys = ['pocket', 'seam', 'custom'] as const;
  const detailCount = detailKeys.filter((k) => Boolean(garment.media[k].url)).length;
  const hasSwatch = Boolean(garment.media.swatch.url);
  const populatedCount = (hasHero ? 1 : 0) + detailCount + (hasSwatch ? 1 : 0);
  const isFullImages = hasHero && detailCount === 3 && hasSwatch;
  return {
    populatedCount,
    hasHero,
    detailCount,
    hasSwatch,
    isFullImages,
  };
}

/**
 * Orders garments for Demo Mode: styles with full imagery (5/5 plates: hero,
 * 3 detail closeups, and fabric swatch) are pushed to the very top of the
 * product section, followed by partial-detail sets, hero-only, and pending placeholders.
 */
export function sortGarmentsForDemo(garments: GarmentItem[]): GarmentItem[] {
  return [...garments].sort((a, b) => {
    const scoreA = getGarmentMediaCompleteness(a);
    const scoreB = getGarmentMediaCompleteness(b);

    if (scoreA.isFullImages !== scoreB.isFullImages) {
      return scoreA.isFullImages ? -1 : 1;
    }
    if ((scoreA.populatedCount === 0) !== (scoreB.populatedCount === 0)) {
      return scoreA.populatedCount === 0 ? 1 : -1;
    }
    if (scoreA.populatedCount !== scoreB.populatedCount) {
      return scoreB.populatedCount - scoreA.populatedCount;
    }
    if (scoreA.hasHero !== scoreB.hasHero) {
      return scoreA.hasHero ? -1 : 1;
    }
    if (scoreA.detailCount !== scoreB.detailCount) {
      return scoreB.detailCount - scoreA.detailCount;
    }
    return a.index - b.index;
  });
}

/**
 * Orders fabric programs for Demo Mode: fabrics with verified hero & complete
 * colorway swatch imagery are pushed to the top of the Fabric Library section.
 */
export function sortFabricProgramsForDemo(
  programs: FabricSwatchProgram[],
  garments: GarmentItem[],
  fabricColorImages: Record<string, string> = {}
): FabricSwatchProgram[] {
  const garmentByIndex = new Map(garments.map((g) => [g.index, g]));

  const scoreProgram = (program: FabricSwatchProgram) => {
    const totalColors = program.factoryColors.length;
    const populatedColors = program.factoryColors.filter((color) => {
      const key = getFactoryColorImageKey(program.fabricCode, color.colorName);
      return Boolean(fabricColorImages[key] || color.swatchImageUrl);
    }).length;
    const hasHero = Boolean(
      getPreferredFactoryFabricImage(program.fabricCode, fabricColorImages)?.imageUrl ||
        program.swatchImageUrl
    );
    const isComplete =
      hasHero && totalColors > 0 && populatedColors === totalColors;
    const imageCount = populatedColors + (hasHero ? 1 : 0);
    const totalImages = totalColors + 1;
    const fullProductLinks = program.linkedIndices.filter((idx) => {
      const item = garmentByIndex.get(idx);
      return item ? getGarmentMediaCompleteness(item).isFullImages : false;
    }).length;

    return {
      isComplete,
      hasHero,
      imageCount,
      ratio: imageCount / totalImages,
      populatedColors,
      fullProductLinks,
    };
  };

  return [...programs].sort((a, b) => {
    const sa = scoreProgram(a);
    const sb = scoreProgram(b);

    if (sa.isComplete !== sb.isComplete) return sa.isComplete ? -1 : 1;
    if ((sa.imageCount === 0) !== (sb.imageCount === 0)) {
      return sa.imageCount === 0 ? 1 : -1;
    }
    if (sa.ratio !== sb.ratio) return sb.ratio - sa.ratio;
    if (sa.imageCount !== sb.imageCount) return sb.imageCount - sa.imageCount;
    if (sa.hasHero !== sb.hasHero) return sa.hasHero ? -1 : 1;
    if (sa.fullProductLinks !== sb.fullProductLinks) return sb.fullProductLinks - sa.fullProductLinks;
    if (sa.populatedColors !== sb.populatedColors) return sb.populatedColors - sa.populatedColors;
    return a.fabricCode.localeCompare(b.fabricCode);
  });
}

export interface CatalogueNavigationMap {
  orderedGarments: GarmentItem[];
  orderedFabrics: FabricSwatchProgram[];
  productOffset: number;
  totalSpreads: number;
  fabricPageByCode: Map<string, number>; // 0-based spread index
  garmentPageById: Map<string, number>;  // 0-based spread index
  sections: SectionDescriptor[];
  categoryFirstPage: Record<GarmentCategory, number>;
  categoryRanges: { name: GarmentCategory; numeral: string; count: number; label: string; firstPage: number }[];
}

export function buildCatalogueNavigationMap(
  garments: GarmentItem[],
  demoMode: boolean,
  fabricColorImages: Record<string, string> = {}
): CatalogueNavigationMap {
  const baseFabrics = buildFabricSwatchPrograms(garments);
  const orderedFabrics = demoMode
    ? sortFabricProgramsForDemo(baseFabrics, garments, fabricColorImages)
    : baseFabrics;
  const orderedGarments = demoMode ? sortGarmentsForDemo(garments) : garments;

  const productOffset = 2 + orderedFabrics.length;
  const totalSpreads = productOffset + orderedGarments.length + 1;

  const fabricPageByCode = new Map<string, number>();
  orderedFabrics.forEach((program, idx) => {
    fabricPageByCode.set(program.fabricCode, 2 + idx);
  });

  const garmentPageById = new Map<string, number>();
  orderedGarments.forEach((item, idx) => {
    garmentPageById.set(item.id, productOffset + idx);
  });

  const firstMenIdx = orderedGarments.findIndex((g) => g.gender === 'Men');
  const firstWomenIdx = orderedGarments.findIndex((g) => g.gender === 'Women');
  const menStart = firstMenIdx >= 0 ? productOffset + firstMenIdx : productOffset;
  const womenStart = firstWomenIdx >= 0 ? productOffset + firstWomenIdx : productOffset;

  const sections: SectionDescriptor[] = [
    {
      ...SECTION_THEME.introduction,
      id: 'introduction',
      startSpreadPage: 0,
      endSpreadPage: 1,
    },
    {
      ...SECTION_THEME.fabrics,
      id: 'fabrics',
      startSpreadPage: 2,
      endSpreadPage: Math.max(2, productOffset - 1),
    },
    {
      ...SECTION_THEME.men,
      id: 'men',
      startSpreadPage: menStart,
      endSpreadPage: totalSpreads - 2,
    },
    {
      ...SECTION_THEME.women,
      id: 'women',
      startSpreadPage: womenStart,
      endSpreadPage: totalSpreads - 2,
    },
    {
      ...SECTION_THEME.technical,
      id: 'technical',
      startSpreadPage: totalSpreads - 1,
      endSpreadPage: totalSpreads - 1,
    },
  ];

  const categoryFirstPage = {} as Record<GarmentCategory, number>;
  const categoryRanges = CATEGORIES.map((cat) => {
    const pages = orderedGarments
      .map((item, idx) => (item.category === cat.name ? productOffset + idx : -1))
      .filter((p) => p >= 0);
    const firstPage = pages[0] ?? productOffset;
    const minHuman = pages.length > 0 ? Math.min(...pages) + 1 : productOffset + 1;
    const maxHuman = pages.length > 0 ? Math.max(...pages) + 1 : productOffset + 1;
    categoryFirstPage[cat.name] = firstPage;
    return {
      name: cat.name,
      numeral: cat.numeral,
      count: pages.length,
      firstPage,
      label:
        minHuman === maxHuman
          ? `P.${String(minHuman).padStart(2, '0')}`
          : `P.${String(minHuman).padStart(2, '0')}–${String(maxHuman).padStart(2, '0')}`,
    };
  });

  return {
    orderedGarments,
    orderedFabrics,
    productOffset,
    totalSpreads,
    fabricPageByCode,
    garmentPageById,
    sections,
    categoryFirstPage,
    categoryRanges,
  };
}

export function getActiveSectionForSpread(
  pageIndex: number,
  navMap: CatalogueNavigationMap
): SectionId {
  if (pageIndex <= 1) return 'introduction';
  if (pageIndex >= 2 && pageIndex < navMap.productOffset) return 'fabrics';
  if (pageIndex >= navMap.productOffset && pageIndex < navMap.productOffset + navMap.orderedGarments.length) {
    const product = navMap.orderedGarments[pageIndex - navMap.productOffset];
    return product?.gender === 'Women' ? 'women' : 'men';
  }
  return 'technical';
}

export function formatSpreadPageCode(pageIndex: number): string {
  return `P.${String(pageIndex + 1).padStart(2, '0')}`;
}
