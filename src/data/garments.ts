import type {
  CatalogueMetadata,
  FabricSwatchProgram,
  GarmentCategory,
  GarmentGender,
  GarmentItem,
  MediaSlotKey,
} from '../types/catalogue';
import { getFactoryColorLabels, getFactoryFabricColors } from './factoryFabricColors';
import { getExpectedImageFile, PRODUCT_ASSETS } from './productAssets';
import { PRODUCT_STUDIO_ASSETS } from './productStudioAssets';

export const BRAND_LOGO_PATH = '/assets/aistudio/image_d4ceae1f.png';

export const COVER_ATELIER_ILLUSTRATION =
  '/src/assets/images/cover_atelier_plate_1795580913741.jpg';

export const DEFAULT_CATALOGUE_META: CatalogueMetadata = {
  season: 'Dream Tomorrow (DT) — B2B Landscape Catalogue',
  edition: 'CM · OEM · ODM Capability & 43-Style Line Book',
  subtitle:
    'A modular monochrome B2B lookbook and technical specification portfolio for Dream Tomorrow (DT), structured for CM, OEM, and ODM wholesale partners.',
  presentationNote:
    'Visual frames are initialized as architectural blank plates mapped to each real style code and swatchbook fabric roll. Drag and drop local images onto any slot to preview live in-browser (session-only unless saved to project assets or exported).',
  contactEmail: 'wholesale@dreamtomorrow.studio',
  showroomUrl: 'https://dreamtomorrow.studio/b2b',
};

export const CATEGORIES: {
  name: GarmentCategory;
  numeral: string;
  range: string;
  count: number;
  craftFocus: string;
}[] = [
  {
    name: 'Trousers',
    numeral: 'I',
    range: '01 – 04',
    count: 4,
    craftFocus: 'Curtained waistbands, French bearer pockets, structured suiting drape',
  },
  {
    name: 'Shorts',
    numeral: 'II',
    range: '05 – 09',
    count: 5,
    craftFocus: 'Bar-tacked pocket corners, stretch twill recovery, clean bound interiors',
  },
  {
    name: 'Polos',
    numeral: 'III',
    range: '10 – 23',
    count: 14,
    craftFocus: 'Reinforced box plackets, shape-retaining rib collars, breathable knits',
  },
  {
    name: 'Tees & V-Necks',
    numeral: 'IV',
    range: '24 – 40',
    count: 17,
    craftFocus: 'Zero-torque coverstitch hems, taped shoulder seams, cotton-modal hand-feel',
  },
  {
    name: 'Skirts',
    numeral: 'V',
    range: '41 – 43',
    count: 3,
    craftFocus: 'Concealed zip plackets, clean interior seam overlocking, fluid twill drape',
  },
];

export const CM_OEM_ODM_PILLARS = [
  {
    index: '01',
    code: 'CM',
    title: 'Cut & Make',
    subtitle: 'Buyer-Supplied Fabrics',
    illustration: '/src/assets/images/pillar_cm_illustration_1795580914784.jpg',
    cropScaleClass: 'scale-[1.13]',
    buyerSupplies: 'Fabric rolls, trims & graded tech pack',
    dtDelivers: 'Precision cutting, assembly & inline SPI QC',
    detail:
      'Precision cutting, grading, bar-tacking, and flatlock/coverstitch assembly for client-supplied fabric rolls with inline SPI inspection.',
  },
  {
    index: '02',
    code: 'OEM',
    title: 'Original Equipment',
    subtitle: 'Full-Package Sourcing',
    illustration: '/src/assets/images/pillar_oem_illustration_1795580915075.jpg',
    cropScaleClass: 'scale-[1.03]',
    buyerSupplies: 'Target spec sheet & Pantone TCX palette',
    dtDelivers: '15-mill program sourcing, lab dips & bulk',
    detail:
      'End-to-end mill sourcing across our 15 verified knit & woven programs (Modal, 4-Way Piqué, Slub 20, A-Series Suiting) to your exact tech pack.',
  },
  {
    index: '03',
    code: 'ODM',
    title: 'Original Design',
    subtitle: 'Turnkey Branded Blocks',
    illustration: '/src/assets/images/pillar_odm_illustration_1795580916550.jpg',
    cropScaleClass: 'scale-[1.03]',
    buyerSupplies: 'Brand labels, colorway choice & volume',
    dtDelivers: '43 engineered Men’s & Women’s styles',
    detail:
      '43 pre-engineered Men’s (Nam) and Women’s (Nữ) silhouettes ready for private-label branding, custom colorways, and rapid showroom sampling.',
  },
];

const COLOR_HEX_MAP: Record<string, string> = {
  black: '#111111',
  'black beauty': '#1A1A1C',
  white: '#F8F8F6',
  'bright white': '#FFFFFF',
  'cream white': '#F3EFE6',
  egret: '#EFECE3',
  'stone grey': '#9C9B96',
  'smoke grey': '#6A6D70',
  'cement grey': '#8B8E8F',
  'salt-and-pepper grey': '#8A8C8E',
  'heather grey': '#A7A9AC',
  'melange grey': '#9B9E9F',
  'bean grey': '#7F7B75',
  grey: '#808285',
  fog: '#C6C8C7',
  beige: '#D9CFC0',
  khaki: '#B6A88D',
  'stone khaki': '#B6AA92',
  navy: '#1D2939',
  'light blue': '#9CB7CC',
  blue: '#2E5B88',
  'sea blue': '#3E7A9E',
  'orchid ice': '#DFD1DE',
  peach: '#E5B096',
  mauve: '#9E7B82',
  brick: '#9E4B3B',
  pink: '#E8A5B8',
  'lotus pink': '#E49EB0',
  'lime pink': '#DF8FA8',
  yellow: '#E6C24C',
  'butter yellow': '#F1DF97',
  purple: '#7E5A8F',
  carrot: '#DF6D3B',
  'cream orange': '#E99D6B',
  chocolate: '#5C3A2B',
  olive: '#5A6145',
  'olive green': '#5B6442',
  'silver sage': '#AEB5AC',
  jade: '#4B8B74',
  b8385: '#6D7278',
  b7901: '#4C5055',
  bc14: '#A6A49E',
};

export function getColorSwatchHex(colorLabel: string): string | null {
  const cleaned = colorLabel
    .replace(/\(.*?\)/g, '')
    .trim()
    .toLowerCase();
  if (cleaned.includes('pending')) return null;
  if (COLOR_HEX_MAP[cleaned]) return COLOR_HEX_MAP[cleaned];
  for (const [key, hex] of Object.entries(COLOR_HEX_MAP)) {
    if (cleaned.includes(key)) return hex;
  }
  return '#BDBDBD';
}

interface RawProductRow {
  rowNum: number;
  gender: GarmentGender;
  genderCode: 'Nam' | 'Nữ';
  productGroupVi: string;
  sku: string;
  title: string;
  category: GarmentCategory;
  chapterNumeral: string;
  fabricCode: string;
  composition: string;
  weightGsm: string;
  fabricWidth: string;
  stretchFeelNote: string;
  colorCount: number;
  colorways: string[];
  fitNote: string;
  dataFlags?: string[];
}

const COLORS_A82 = getFactoryColorLabels('A82');
const COLORS_A28 = getFactoryColorLabels('A28');
const COLORS_A29 = getFactoryColorLabels('A29');
const COLORS_K03 = getFactoryColorLabels('K03');
const COLORS_MODAL_NAM = getFactoryColorLabels('MODAL NAM');
const COLORS_PIQUE_NAM = getFactoryColorLabels('PQ 4 CHIỀU / PIQUE NAM – 4 WAYS');
const COLORS_SLUB20 = getFactoryColorLabels('SLUB 20');
const COLORS_CM26_NAM = getFactoryColorLabels('CM26 NAM');
const COLORS_CM36 = getFactoryColorLabels('CM36');
const COLORS_CM40 = getFactoryColorLabels('CM40');
const COLORS_FTR76 = getFactoryColorLabels('76');
const COLORS_MODAL_NU = getFactoryColorLabels('MODAL NỮ');
const COLORS_PIQUE_YODY_NU = getFactoryColorLabels('YODY NỮ');
const COLORS_CM26_NU = getFactoryColorLabels('CM26 NỮ');
const COLORS_AK005 = getFactoryColorLabels('CM30');

const RAW_PRODUCTS: RawProductRow[] = [
  // TROUSERS
  {
    rowNum: 1,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Quần Dài Nam',
    sku: 'MLPA82',
    title: "Men's Heavyweight Structured Trouser",
    category: 'Trousers',
    chapterNumeral: 'I',
    fabricCode: 'A82',
    composition: '95% Rayon-Poly, 5% Spandex',
    weightGsm: '330 GSM',
    fabricWidth: '152 cm',
    stretchFeelNote: 'Dense 330 GSM structured hand-feel with controlled stretch recovery',
    colorCount: 4,
    colorways: COLORS_A82,
    fitNote: 'Tailored straight-leg cut with substantial 330 GSM architectural drape',
  },
  {
    rowNum: 2,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Quần Dài Nam',
    sku: 'MLPA28',
    title: "Men's Everyday Stretch Tailored Trouser",
    category: 'Trousers',
    chapterNumeral: 'I',
    fabricCode: 'A28',
    composition: '75% Poly, 20% Rayon, 5% Spandex',
    weightGsm: '245–250 GSM',
    fabricWidth: '150 cm (1M50)',
    stretchFeelNote: 'Mid-weight smooth suiting finish engineered for crease resistance',
    colorCount: 4,
    colorways: COLORS_A28,
    fitNote: 'Balanced mid-weight trouser designed for crease resistance and daily mobility',
  },
  {
    rowNum: 3,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Quần Dài Nam',
    sku: 'MLPA29',
    title: "Men's Heavy Suiting Pleated Trouser",
    category: 'Trousers',
    chapterNumeral: 'I',
    fabricCode: 'A29',
    composition: '75% Poly, 20% Rayon, 5% Spandex',
    weightGsm: '330–350 GSM',
    fabricWidth: '150 cm (1M50)',
    stretchFeelNote: 'Heavyweight winter suiting drape with crisp vertical pleat retention',
    colorCount: 4,
    colorways: COLORS_A29,
    fitNote: 'Dense autumn/winter suiting trouser engineered for crisp leg line retention',
  },
  {
    rowNum: 23,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Quần Dài Nữ',
    sku: 'WBL0001',
    title: "Women's Fluid Wide-Leg Tailored Trouser",
    category: 'Trousers',
    chapterNumeral: 'I',
    fabricCode: '76',
    composition: '76% Polyester, 18% Rayon, 6% Spandex',
    weightGsm: '203 GSM',
    fabricWidth: '57/58"',
    stretchFeelNote: 'Lightweight fluid suiting hand-feel with soft movement',
    colorCount: 2,
    colorways: COLORS_FTR76,
    fitNote: 'Lightweight fluid suiting trouser designed for clean wide-leg drape',
  },

  // SHORTS
  {
    rowNum: 4,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Quần Short Khaki Nam',
    sku: 'MSPA28',
    title: "Men's Tailored Khaki Walk Short",
    category: 'Shorts',
    chapterNumeral: 'II',
    fabricCode: 'A28',
    composition: '75% Poly, 20% Rayon, 5% Spandex',
    weightGsm: '245–250 GSM',
    fabricWidth: '150 cm (1M50)',
    stretchFeelNote: 'Clean matte khaki hand-feel matching the A28 trouser program',
    colorCount: 4,
    colorways: COLORS_A28,
    fitNote: 'Above-knee chino silhouette matching the A28 trouser suiting program',
  },
  {
    rowNum: 5,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Quần Short Nam',
    sku: 'MSPK03',
    title: "Men's Stretch Cotton Twill Short",
    category: 'Shorts',
    chapterNumeral: 'II',
    fabricCode: 'K03',
    composition: '95% Cotton, 5% Spandex',
    weightGsm: '240 GSM',
    fabricWidth: '150 cm (1M50)',
    stretchFeelNote: 'Breathable cotton twill with responsive 5% spandex comfort stretch',
    colorCount: 4,
    colorways: COLORS_K03,
    fitNote: 'Breathable cotton-rich twill short with subtle 5% stretch for active wear',
  },
  {
    rowNum: 24,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Quần Short Nữ',
    sku: 'WBS0001-A82',
    title: "Women's High-Rise Tailored Short — Edition 01",
    category: 'Shorts',
    chapterNumeral: 'II',
    fabricCode: 'A82',
    composition: '95% Rayon-Poly, 5% Spandex',
    weightGsm: '330 GSM',
    fabricWidth: '152 cm',
    stretchFeelNote: 'Substantial 330 GSM woven structure holding clean front pleats',
    colorCount: 4,
    colorways: COLORS_A82,
    fitNote: 'Clean front-pleat tailored short crafted from structured 330 GSM A82 cloth',
  },
  {
    rowNum: 25,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Quần Short Nữ',
    sku: 'WBS0002-A82',
    title: "Women's Minimalist Cuff Short — Edition 02",
    category: 'Shorts',
    chapterNumeral: 'II',
    fabricCode: 'A82',
    composition: '95% Rayon-Poly, 5% Spandex',
    weightGsm: '330 GSM',
    fabricWidth: '152 cm',
    stretchFeelNote: 'Firm architectural drape supporting clean turn-up cuffs',
    colorCount: 4,
    colorways: COLORS_A82,
    fitNote: 'Relaxed A-line tailored short with crisp turn-up hem stability',
  },
  {
    rowNum: 26,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Quần Short Nữ',
    sku: 'WBS0003-A82',
    title: "Women's Wide-Cut Atelier Short — Edition 03",
    category: 'Shorts',
    chapterNumeral: 'II',
    fabricCode: 'A82',
    composition: '95% Rayon-Poly, 5% Spandex',
    weightGsm: '330 GSM',
    fabricWidth: '152 cm',
    stretchFeelNote: 'Smooth heavyweight finish engineered for culotte-proportion movement',
    colorCount: 4,
    colorways: COLORS_A82,
    fitNote: 'Longer culotte-proportioned short balancing structure and ease of movement',
  },

  // POLOS
  {
    rowNum: 6,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Polo Nam',
    sku: 'MPOLO-MD1',
    title: "Men's Cotton-Modal Essential Polo — Design 01",
    category: 'Polos',
    chapterNumeral: 'III',
    fabricCode: 'MODAL NAM',
    composition: '94% Cotton Modal, 6% Spandex',
    weightGsm: '190–200 (195) GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: 'Cool silk-smooth modal touch with 6% spandex 4-way recovery',
    colorCount: 8,
    colorways: COLORS_MODAL_NAM,
    fitNote: 'Classic concealed-placket cotton-modal polo with cool, silk-smooth surface',
  },
  {
    rowNum: 7,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Polo Nam',
    sku: 'MPOLO-MD2',
    title: "Men's Cotton-Modal Tipped Collar Polo — Design 02",
    category: 'Polos',
    chapterNumeral: 'III',
    fabricCode: 'MODAL NAM',
    composition: '94% Cotton Modal, 6% Spandex',
    weightGsm: '190–200 (195) GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: 'Cool silk-smooth modal touch with 6% spandex 4-way recovery',
    colorCount: 8,
    colorways: COLORS_MODAL_NAM,
    fitNote: 'Minimalist short-sleeve polo featuring crisp flat-knit collar geometry',
  },
  {
    rowNum: 8,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Polo Nam',
    sku: 'MPOLO-MD3',
    title: "Men's Cotton-Modal Architectural Polo — Design 03",
    category: 'Polos',
    chapterNumeral: 'III',
    fabricCode: 'MODAL NAM',
    composition: '94% Cotton Modal, 6% Spandex',
    weightGsm: '190–200 (195) GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: 'Cool silk-smooth modal touch with 6% spandex 4-way recovery',
    colorCount: 8,
    colorways: COLORS_MODAL_NAM,
    fitNote: 'Refined shoulder-line cotton-modal polo tailored for smart-casual layering',
  },
  {
    rowNum: 9,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Polo Nam',
    sku: 'MPOLO-MD4',
    title: "Men's Cotton-Modal Relaxed Polo — Design 04",
    category: 'Polos',
    chapterNumeral: 'III',
    fabricCode: 'MODAL NAM',
    composition: '94% Cotton Modal, 6% Spandex',
    weightGsm: '190–200 (195) GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: 'Cool silk-smooth modal touch with 6% spandex 4-way recovery',
    colorCount: 8,
    colorways: COLORS_MODAL_NAM,
    fitNote: 'Modern relaxed-block polo highlighting fluid drape and 6% spandex recovery',
  },
  {
    rowNum: 10,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Polo Nam',
    sku: 'MPOLO-PQ1',
    title: "Men's 4-Way Stretch Piqué Polo — Design 01",
    category: 'Polos',
    chapterNumeral: 'III',
    fabricCode: 'PQ 4 CHIỀU / PIQUE NAM – 4 WAYS',
    composition: '95% Cotton, 5% Spandex',
    weightGsm: '190–200 GSM',
    fabricWidth: '185–195 cm',
    stretchFeelNote: 'Airy honeycomb micro-piqué texture with full 4-way stretch mobility',
    colorCount: 8,
    colorways: COLORS_PIQUE_NAM,
    fitNote: 'Breathable micro-piqué weave engineered with full 4-way stretch comfort',
  },
  {
    rowNum: 11,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Polo Nam',
    sku: 'MPOLO-PQ2',
    title: "Men's 4-Way Stretch Piqué Polo — Design 02",
    category: 'Polos',
    chapterNumeral: 'III',
    fabricCode: 'PQ 4 CHIỀU / PIQUE NAM – 4 WAYS',
    composition: '95% Cotton, 5% Spandex',
    weightGsm: '190–200 GSM',
    fabricWidth: '185–195 cm',
    stretchFeelNote: 'Airy honeycomb micro-piqué texture with full 4-way stretch mobility',
    colorCount: 8,
    colorways: COLORS_PIQUE_NAM,
    fitNote: 'Structured piqué polo with reinforced chest pocket and crisp collar stand',
  },
  {
    rowNum: 12,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Polo Nam',
    sku: 'MPOLO-PQ3',
    title: "Men's 4-Way Stretch Piqué Polo — Design 03",
    category: 'Polos',
    chapterNumeral: 'III',
    fabricCode: 'PQ 4 CHIỀU / PIQUE NAM – 4 WAYS',
    composition: '95% Cotton, 5% Spandex',
    weightGsm: '190–200 GSM',
    fabricWidth: '185–195 cm',
    stretchFeelNote: 'Airy honeycomb micro-piqué texture with full 4-way stretch mobility',
    colorCount: 8,
    colorways: COLORS_PIQUE_NAM,
    fitNote: 'Contemporary cut piqué polo built for high-frequency corporate & retail wear',
  },
  {
    rowNum: 13,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Polo Nam',
    sku: 'MPOLO-PQ4',
    title: "Men's 4-Way Stretch Piqué Polo — Design 04",
    category: 'Polos',
    chapterNumeral: 'III',
    fabricCode: 'PQ 4 CHIỀU / PIQUE NAM – 4 WAYS',
    composition: '95% Cotton, 5% Spandex',
    weightGsm: '190–200 GSM',
    fabricWidth: '185–195 cm',
    stretchFeelNote: 'Airy honeycomb micro-piqué texture with full 4-way stretch mobility',
    colorCount: 8,
    colorways: COLORS_PIQUE_NAM,
    fitNote: 'Clean open-placket piqué polo showcasing dimensional honeycomb texture',
  },
  {
    rowNum: 14,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Polo Nam',
    sku: 'MPOLO-SL201',
    title: "Men's Slub 20 Pure Cotton Polo — Design 201",
    category: 'Polos',
    chapterNumeral: 'III',
    fabricCode: 'SLUB 20',
    composition: '100% Cotton',
    weightGsm: '185–190 GSM',
    fabricWidth: '208 cm (2.08 m)',
    stretchFeelNote: 'Natural dry cotton hand-feel with organic irregular slub yarn texture',
    colorCount: 7,
    colorways: COLORS_SLUB20,
    fitNote: 'Textured 100% cotton slub jersey polo offering organic visual depth',
  },
  {
    rowNum: 15,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Polo Nam',
    sku: 'MPOLO-SL203',
    title: "Men's Slub 20 Pure Cotton Polo — Design 203",
    category: 'Polos',
    chapterNumeral: 'III',
    fabricCode: 'SLUB 20',
    composition: '100% Cotton',
    weightGsm: '185–190 GSM',
    fabricWidth: '208 cm (2.08 m)',
    stretchFeelNote: 'Natural dry cotton hand-feel with organic irregular slub yarn texture',
    colorCount: 7,
    colorways: COLORS_SLUB20,
    fitNote: 'Relaxed Slub 20 cotton polo with artisanal irregular yarn character',
  },
  {
    rowNum: 27,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Áo Thun Polo Nữ',
    sku: 'WPOLO-MD1',
    title: "Women's Cotton-Modal Fitted Polo — Design 01",
    category: 'Polos',
    chapterNumeral: 'III',
    fabricCode: 'MODAL NỮ',
    composition: '94% Cotton Modal, 6% Spandex',
    weightGsm: '190–200 (195) GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: 'Ultra-soft modal blend with smooth fluid contour and stretch return',
    colorCount: 3,
    colorways: COLORS_MODAL_NU,
    fitNote: 'Tailored women’s cotton-modal polo with sleek narrow placket and soft drape',
  },
  {
    rowNum: 28,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Áo Thun Polo Nữ',
    sku: 'WPOLO-MD2',
    title: "Women's Cotton-Modal Short-Sleeve Polo — Design 02",
    category: 'Polos',
    chapterNumeral: 'III',
    fabricCode: 'MODAL NỮ',
    composition: '94% Cotton Modal, 6% Spandex',
    weightGsm: '190–200 (195) GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: 'Ultra-soft modal blend with smooth fluid contour and stretch return',
    colorCount: 3,
    colorways: COLORS_MODAL_NU,
    fitNote: 'Contour-friendly cotton-modal polo designed for all-day breathability',
  },
  {
    rowNum: 29,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Áo Thun Polo Nữ',
    sku: 'WPOLO-YD1',
    title: "Women's Performance Piqué Polo — Design 01",
    category: 'Polos',
    chapterNumeral: 'III',
    fabricCode: 'YODY NỮ',
    composition: '45% Cotton, 50% Poly, 5% Spandex',
    weightGsm: '190–200 GSM',
    fabricWidth: '180–185 cm',
    stretchFeelNote: 'Crisp quick-dry cotton-poly piqué with 5% stretch and high colorfastness',
    colorCount: 9,
    colorways: COLORS_PIQUE_YODY_NU,
    fitNote: 'High-durability cotton-poly piqué knit offering moisture control across 9 shades',
  },
  {
    rowNum: 30,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Áo Thun Polo Nữ',
    sku: 'WPOLO-YD2',
    title: "Women's Performance Piqué Polo — Design 02",
    category: 'Polos',
    chapterNumeral: 'III',
    fabricCode: 'YODY NỮ',
    composition: '45% Cotton, 50% Poly, 5% Spandex',
    weightGsm: '190–200 GSM',
    fabricWidth: '180–185 cm',
    stretchFeelNote: 'Crisp quick-dry cotton-poly piqué with 5% stretch and high colorfastness',
    colorCount: 9,
    colorways: COLORS_PIQUE_YODY_NU,
    fitNote: 'Refined women’s piqué silhouette engineered for colorfastness and wash durability',
  },

  // TEES & V-NECKS
  {
    rowNum: 16,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Tshirt Nam',
    sku: 'MTSHIRT-MD1',
    title: "Men's Straight-Fit Crew Neck T-Shirt",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'MODAL NAM',
    composition: '94% Cotton Modal, 6% Spandex',
    weightGsm: '190–200 (195) GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: 'Smooth moisture-wicking modal blend with 6% spandex body recovery',
    colorCount: 8,
    colorways: COLORS_MODAL_NAM,
    fitNote: 'Clean, minimalist straight-fit crew neck with mid-bicep short sleeves',
  },
  {
    rowNum: 17,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Tshirt Nam',
    sku: 'MTSHIRT-MD2',
    title: "Men's Cotton-Modal Pocket Crew Tee",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'MODAL NAM',
    composition: '94% Cotton Modal, 6% Spandex',
    weightGsm: '190–200 (195) GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: 'Smooth moisture-wicking modal blend with 6% spandex body recovery',
    colorCount: 8,
    colorways: COLORS_MODAL_NAM,
    fitNote: 'Architectural crew neck tee enhanced with reinforced chest patch pocket',
  },
  {
    rowNum: 18,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Tshirt Nam',
    sku: 'MTSHIRT-MD3',
    title: "Men's Cotton-Modal Relaxed Boxy Tee",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'MODAL NAM',
    composition: '94% Cotton Modal, 6% Spandex',
    weightGsm: '190–200 (195) GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: 'Smooth moisture-wicking modal blend with 6% spandex body recovery',
    colorCount: 8,
    colorways: COLORS_MODAL_NAM,
    fitNote: 'Slightly dropped-shoulder cotton-modal tee offering effortless drape',
  },
  {
    rowNum: 19,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Tshirt Nam',
    sku: 'MTSHIRT-CM26',
    title: "Men's Combed 26s Pure Cotton Crew Tee",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'CM26 NAM',
    composition: '100% Cotton',
    weightGsm: '195–200 GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: 'Classic crisp 26s combed cotton hand-feel with natural breathability',
    colorCount: 8,
    colorways: COLORS_CM26_NAM,
    fitNote: 'Crisp 100% combed 26s cotton jersey delivering classic dry hand-feel',
  },
  {
    rowNum: 20,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Tshirt Nam',
    sku: 'MVNECK-CM26',
    title: "Men's Combed 26s Pure Cotton V-Neck Tee",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'CM26 NAM',
    composition: '100% Cotton',
    weightGsm: '195–200 GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: 'Classic crisp 26s combed cotton hand-feel with natural breathability',
    colorCount: 8,
    colorways: COLORS_CM26_NAM,
    fitNote: 'Precision mitered V-neck rib construction in breathable 100% combed cotton',
  },
  {
    rowNum: 21,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Tshirt Nam',
    sku: 'MTSHIRT-CM36',
    title: "Men's Heavyweight Stretch CM36 Crew Tee",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'CM36',
    composition: '95% Cotton, 5% Spandex',
    weightGsm: '220 GSM',
    fabricWidth: '177 cm',
    stretchFeelNote: 'Substantial 220 GSM compact jersey with 5% stretch structure',
    colorCount: 6,
    colorways: COLORS_CM36,
    fitNote: 'Substantial 220 GSM jersey providing structured chest presence and stretch return',
  },
  {
    rowNum: 22,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Tshirt Nam',
    sku: 'MTSHIRT-CM40',
    title: "Men's Featherweight Combed 40s Jersey Tee",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'CM40',
    composition: '100% Cotton',
    weightGsm: '125–130 GSM',
    fabricWidth: '155 cm',
    stretchFeelNote: 'Ultra-fine 40s combed cotton jersey with airy summer weight',
    colorCount: 6,
    colorways: COLORS_CM40,
    fitNote: 'Ultra-fine 40s single-jersey cotton engineered for warm-climate breathability',
  },
  {
    rowNum: 31,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Áo Thun Tshirt Nữ',
    sku: 'WVNECK-MD',
    title: "Women's Cotton-Modal Sculpted V-Neck Tee",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'MODAL NỮ',
    composition: '94% Cotton Modal, 6% Spandex',
    weightGsm: '190–200 (195) GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: 'Ultra-soft modal blend with smooth fluid contour and stretch return',
    colorCount: 3,
    colorways: COLORS_MODAL_NU,
    fitNote: 'Clean overlap V-neck collar paired with silky cotton-modal recovery',
  },
  {
    rowNum: 32,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Áo Thun Tshirt Nữ',
    sku: 'WTSHIRT-MD1',
    title: "Women's Cotton-Modal Essential Crew Tee — Design 01",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'MODAL NỮ',
    composition: '94% Cotton Modal, 6% Spandex',
    weightGsm: '190–200 (195) GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: 'Ultra-soft modal blend with smooth fluid contour and stretch return',
    colorCount: 3,
    colorways: COLORS_MODAL_NU,
    fitNote: 'Everyday fitted silhouette with high-resilience rib neckline',
  },
  {
    rowNum: 33,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Áo Thun Tshirt Nữ',
    sku: 'WTSHIRT-MD2',
    title: "Women's Cotton-Modal Relaxed Crew Tee — Design 02",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'MODAL NỮ',
    composition: '94% Cotton Modal, 6% Spandex',
    weightGsm: '190–200 (195) GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: 'Ultra-soft modal blend with smooth fluid contour and stretch return',
    colorCount: 3,
    colorways: COLORS_MODAL_NU,
    fitNote: 'Soft-draping regular fit cut for effortless monochrome layering',
  },
  {
    rowNum: 34,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Áo Thun Tshirt Nữ',
    sku: 'WTSHIRT-CM261',
    title: "Women's Combed 26s Pure Cotton Tee — Design 01",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'CM26 NỮ',
    composition: '100% Cotton',
    weightGsm: '180–185 GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: 'Smooth combed 26s pure cotton with balanced 180–185 GSM structure',
    colorCount: 5,
    colorways: COLORS_CM26_NU,
    fitNote: 'Crisp 180–185 GSM combed cotton silhouette with clean twin-needle hems',
  },
  {
    rowNum: 35,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Áo Thun Tshirt Nữ',
    sku: 'WTSHIRT-CM262',
    title: "Women's Combed 26s Pure Cotton Tee — Design 02",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'CM26 NỮ',
    composition: '100% Cotton',
    weightGsm: '180–185 GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: 'Smooth combed 26s pure cotton with balanced 180–185 GSM structure',
    colorCount: 5,
    colorways: COLORS_CM26_NU,
    fitNote: 'Boxier cropped-proportion cotton jersey tee for relaxed B2B styling',
  },
  {
    rowNum: 36,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Áo Thun Tshirt Nữ',
    sku: 'WVNECK-CM26',
    title: "Women's Combed 26s Pure Cotton V-Neck Tee",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'CM26 NỮ',
    composition: '100% Cotton',
    weightGsm: '180–185 GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: 'Smooth combed 26s pure cotton with balanced 180–185 GSM structure',
    colorCount: 5,
    colorways: COLORS_CM26_NU,
    fitNote: 'Clean mitered V-neck silhouette woven from breathable 100% combed cotton',
  },
  {
    rowNum: 37,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Áo Thun Tshirt Nữ',
    sku: 'WTSHIRT-CM402',
    title: "Women's Featherweight Combed 40s Tee",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'CM40',
    composition: '100% Cotton',
    weightGsm: '125–130 GSM',
    fabricWidth: '155 cm',
    stretchFeelNote: 'Featherweight 40s combed cotton jersey for breathable layering',
    colorCount: 6,
    colorways: COLORS_CM40,
    fitNote: 'Lightweight 125–130 GSM fine combed jersey offering smooth second-skin comfort',
  },
  {
    rowNum: 38,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Áo Thun Tshirt Nữ',
    sku: 'WTSHIRT-L',
    title: "Women's 4-Way Stretch Compact Cotton Long-Line Tee",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'CM30',
    composition: '94% Cotton, 6% Spandex',
    weightGsm: '175–185 GSM',
    fabricWidth: '175 cm (1M75)',
    stretchFeelNote: '40s combed cotton + 30D elastane giving dense 4-way stretch & sleek surface',
    colorCount: 3,
    colorways: COLORS_AK005,
    fitNote: 'Fine 40s combed cotton spun with 30D elastane for 4-way recovery and smooth sheen',
  },
  {
    rowNum: 39,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Áo Thun Tshirt Nữ',
    sku: 'WTSHIRT1',
    title: "Women's 4-Way Stretch Compact Cotton Crew — Edition 01",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'CM30',
    composition: '94% Cotton, 6% Spandex',
    weightGsm: '175–185 GSM',
    fabricWidth: '175 cm (1M75)',
    stretchFeelNote: '40s combed cotton + 30D elastane giving dense 4-way stretch & sleek surface',
    colorCount: 3,
    colorways: COLORS_AK005,
    fitNote: 'Precision-cut fitted crew tee built on the AK005 4-way compact jersey program',
  },
  {
    rowNum: 40,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Áo Thun Tshirt Nữ',
    sku: 'WTSHIRT2',
    title: "Women's 4-Way Stretch Compact Cotton Crew — Edition 02",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'CM30',
    composition: '94% Cotton, 6% Spandex',
    weightGsm: '175–185 GSM',
    fabricWidth: '175 cm (1M75)',
    stretchFeelNote: '40s combed cotton + 30D elastane giving dense 4-way stretch & sleek surface',
    colorCount: 3,
    colorways: COLORS_AK005,
    fitNote: 'Relaxed everyday variation in AK005 cotton-elastane with tonal cream & sage palette',
  },

  // SKIRTS
  {
    rowNum: 41,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Váy Nữ',
    sku: 'WBSK001-A82',
    title: "Women's Architectural A-Line Tailored Skirt — Edition 01",
    category: 'Skirts',
    chapterNumeral: 'V',
    fabricCode: 'A82',
    composition: '95% Rayon-Poly, 5% Spandex',
    weightGsm: '330 GSM',
    fabricWidth: '152 cm',
    stretchFeelNote: 'Structured 330 GSM cloth holding crisp A-line architectural volume',
    colorCount: 4,
    colorways: COLORS_A82,
    fitNote: 'Structured 330 GSM skirt silhouette engineered for clean waist-to-hem line',
  },
  {
    rowNum: 42,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Váy Nữ',
    sku: 'WBSK002-A82',
    title: "Women's Minimalist Wrap-Front Skirt — Edition 02",
    category: 'Skirts',
    chapterNumeral: 'V',
    fabricCode: 'A82',
    composition: '95% Rayon-Poly, 5% Spandex',
    weightGsm: '330 GSM',
    fabricWidth: '152 cm',
    stretchFeelNote: 'Structured 330 GSM drape supporting wrap-front pleat tension',
    colorCount: 4,
    colorways: COLORS_A82,
    fitNote: 'Contemporary structured skirt with concealed interior button anchor and slit ease',
  },
  {
    rowNum: 43,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Váy Nữ',
    sku: 'WSP0001',
    title: "Women's Fluid Pleated Skirt",
    category: 'Skirts',
    chapterNumeral: 'V',
    fabricCode: '76',
    composition: '76% Polyester, 18% Rayon, 6% Spandex',
    weightGsm: '203 GSM',
    fabricWidth: '57/58"',
    stretchFeelNote: 'Lightweight 203 GSM fluid suiting weave pairing with WBL0001 trouser',
    colorCount: 2,
    colorways: COLORS_FTR76,
    fitNote: 'Light 203 GSM fluid suiting skirt paired with the WBL0001 trouser program',
  },
];

function getCraftDetails(row: RawProductRow): {
  stitchDensity: string;
  seamFinish: string;
  pocketConstruction: string;
  moq: string;
  bullets: string[];
  features: string[];
} {
  if (row.category === 'Trousers') {
    return {
      stitchDensity: '16–18 SPI',
      seamFinish: 'Clean-bound internal outseams with curtained waistband tape',
      pocketConstruction: 'Slanted French bearer side pockets with reinforced 32-stitch bar-tacks',
      moq: '100 pcs / color (Placeholder)',
      bullets: [
        `Cut from ${row.composition} (${row.weightGsm}, ${row.fabricWidth} roll width) for structured drape and crease recovery.`,
        `Finished with a curtained tailored waistband and bar-tacked pocket stress zones for extended B2B longevity.`,
        `${row.fitNote}.`,
      ],
      features: [
        `Structured ${row.weightGsm} fabric architecture (${row.fabricCode}) retaining crisp leg crease`,
        'Reinforced French bearer pockets with high-density pocket bag twill',
        'Clean overlocked and bound interior seams preventing fray across industrial wash cycles',
        `Offered in ${row.colorways.length} colorways across full graded sizing`,
      ],
    };
  }

  if (row.category === 'Shorts') {
    return {
      stitchDensity: '15–16 SPI',
      seamFinish: 'Flat-pressed overlocked outseams with clean-bound inner waist',
      pocketConstruction: 'Deep quarter-top side pockets and rear welt pockets with dual bar-tacks',
      moq: '120 pcs / color (Placeholder)',
      bullets: [
        `Crafted from ${row.composition} (${row.weightGsm}) balancing breathable comfort with structured form.`,
        `Reinforced at pocket openings, fly base, and belt loops with precision bar-tack anchoring.`,
        `${row.fitNote}.`,
      ],
      features: [
        `Recovery-engineered ${row.fabricCode} weave preventing knee and seat bagging`,
        'High-tensile pocket bag lining anchored into the waistband seam',
        'Single-needle topstitched waist and reinforced belt-loop joinery',
        `Available across ${row.colorways.length} core monochrome & neutral shades`,
      ],
    };
  }

  if (row.category === 'Polos') {
    return {
      stitchDensity: '18 SPI / 4-Thread Overlock',
      seamFinish: 'Herringbone-taped back neck & shoulder seams with twin-needle side vents',
      pocketConstruction: 'Optional mitered chest pocket + reinforced 2-button box placket with internal stay',
      moq: '150 pcs / color (Placeholder)',
      bullets: [
        `Knitted in ${row.composition} (${row.weightGsm}) combining breathable surface hand-feel with shape retention.`,
        `Engineered with an anti-curl flat-knit collar and clean box placket backed by fusible interlining.`,
        `${row.fitNote}.`,
      ],
      features: [
        `Signature ${row.fabricCode} textile offering smooth drape and wash-after-wash collar stability`,
        'Reinforced placket base bar-tack and herringbone twill neck taping',
        'Split side-vent hems reinforced internally to resist tearing under tension',
        `Offered in ${row.colorways.length} palette options from core neutrals to Pantone TCX accents`,
      ],
    };
  }

  if (row.category === 'Skirts') {
    return {
      stitchDensity: '18 SPI',
      seamFinish: 'Concealed invisible zipper placket with clean bias-bound or 4-thread seams',
      pocketConstruction: 'Hidden in-seam side pockets anchored directly into the waistband stay',
      moq: '100 pcs / color (Placeholder)',
      bullets: [
        `Tailored from ${row.composition} (${row.weightGsm}, ${row.fabricWidth} width) for balanced structure and fluid movement.`,
        `Constructed with anchored in-seam pockets that lie completely flat without hip pulling.`,
        `${row.fitNote}.`,
      ],
      features: [
        `Matching ${row.fabricCode} suiting textile enabling cohesive coordinated B2B sets`,
        'Waistband-anchored side pockets eliminating pocket bag sag',
        'Blind-stitched bottom hem and smooth internal facing finish',
        `Produced in ${row.colorways.length} refined shades for versatile merchandising`,
      ],
    };
  }

  const isVNeck = row.sku.includes('VNECK');
  return {
    stitchDensity: '18–20 SPI Coverstitch',
    seamFinish: 'Shoulder-to-shoulder twill neck tape with zero-torque twin-needle hems',
    pocketConstruction: row.sku.includes('MD2')
      ? 'Clean mitered chest patch pocket with twin-bar-tack upper corners'
      : isVNeck
        ? 'Precision mitered V-neck rib collar engineered to lie flat without gapping'
        : 'Clean seamless chest profile with high-recovery 1x1 rib crew collar',
    moq: '150 pcs / color (Placeholder)',
    bullets: [
      `Crafted from ${row.composition} (${row.weightGsm}) with a smooth, breathable finish that moves comfortably with the body.`,
      `Designed with a durable ribbed neckline that retains its shape wash after wash, paired with clean twin-needle sleeve and bottom hems.`,
      `${row.fitNote}.`,
    ],
    features: [
      `Crafted on the ${row.fabricCode} textile roll (${row.fabricWidth} width) for uniform batch hand-feel`,
      isVNeck
        ? 'Reinforced overlapping V-neck rib binding preventing collar distortion'
        : 'High-recovery ribbed crew collar backed by clean shoulder-to-shoulder taping',
      'Four-thread overlocked internal seams and flat twin-needle coverstitch hems',
      `Available in ${row.colorways.length} colorway options for modular B2B assortment`,
    ],
  };
}

function createBlankMedia(
  index: number,
  row: RawProductRow
): Record<MediaSlotKey, GarmentItem['media'][MediaSlotKey]> {
  const num = String(index).padStart(2, '0');
  return {
    hero: {
      url: '',
      stage: 'blank',
      caption: `Fig. ${num}.A — ${row.sku} Primary Silhouette`,
      aspectLabel: '5:4 Image',
      note: '',
    },
    pocket: {
      url: '',
      stage: 'blank',
      caption: `Fig. ${num}.B — Detail 01`,
      aspectLabel: '4:3 Image',
      note: '',
    },
    seam: {
      url: '',
      stage: 'blank',
      caption: `Fig. ${num}.C — Detail 02`,
      aspectLabel: '4:3 Image',
      note: '',
    },
    swatch: {
      url: '',
      stage: 'blank',
      caption: `Fig. ${num}.D — Fabric image`,
      aspectLabel: '1:1 Image',
      note: '',
    },
    custom: {
      url: '',
      stage: 'blank',
      caption: `Fig. ${num}.E — Detail 03`,
      aspectLabel: '4:3 Image',
      note: '',
    },
  };
}

export function buildDefaultDescriptionBullets(specs: {
  composition: string;
  weightGsm: string;
  pocketConstruction: string;
  seamFinish: string;
}): string[] {
  return [
    `Crafted from ${specs.composition} (${specs.weightGsm}) engineered for clean architectural drape and multi-season durability.`,
    `Constructed with ${specs.seamFinish.toLowerCase()} to maintain garment structure wash after wash.`,
    `Finished with ${specs.pocketConstruction.toLowerCase()} for long-term B2B performance.`,
  ];
}

export function buildDefaultKeyFeatures(specs: {
  stitchDensity: string;
  seamFinish: string;
  pocketConstruction: string;
  fabricRollRef: string;
}): string[] {
  return [
    `High-precision ${specs.stitchDensity} stitch calibration across primary stress zones`,
    `${specs.seamFinish} for clean interior presentation and zero fray`,
    `${specs.pocketConstruction} with reinforced anchor points`,
    `Traceable swatchbook fabric code (${specs.fabricRollRef}) with pre-shrunk stability`,
  ];
}

export const DEFAULT_COLORWAYS: string[] = ['Black', 'White', 'Grey', 'Navy'];

export function createInitialGarments(): GarmentItem[] {
  return RAW_PRODUCTS.map((row, idx) => {
    const num = idx + 1;
    const craft = getCraftDetails(row);
    const slug = row.sku.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const assetMapping = PRODUCT_ASSETS[row.sku];
    const studioMapping = PRODUCT_STUDIO_ASSETS[row.sku];
    const expectedHeroFile = assetMapping
      ? getExpectedImageFile(assetMapping.sourceImage)
      : undefined;
    const media = createBlankMedia(num, row);
    const heroFile = studioMapping?.heroFile ?? assetMapping?.heroFile;

    if (heroFile) {
      media.hero = {
        ...media.hero,
        url: `/catalogue-media/${encodeURIComponent(heroFile)}`,
        fallbackUrl:
          row.sku === 'WTSHIRT-MD2'
            ? '/assets/aistudio/WTSHIRT-MD2_Hero_acd4d06e.jpg'
            : undefined,
        stage: 'studio-final',
        caption: `${media.hero.caption} · ${heroFile}`,
        note: `Local image file: ${heroFile}`,
      };
    } else if (expectedHeroFile) {
      media.hero.note = `Expected local image file: ${expectedHeroFile} (not found in the image folder; drop it here when available).`;
    }

    const detailFiles = studioMapping
      ? studioMapping.detailFiles
      : Object.fromEntries(
          (assetMapping?.followingFiles ?? [])
            .slice(0, 3)
            .map((fileName, fileIndex) => [
              (['pocket', 'seam', 'custom'] as const)[fileIndex],
              fileName,
            ])
        );
    (['pocket', 'seam', 'custom'] as const).forEach((slotKey) => {
      const fileName = detailFiles[slotKey];
      if (!fileName) return;
      media[slotKey] = {
        ...media[slotKey],
        url: `/catalogue-media/${encodeURIComponent(fileName)}`,
        stage: 'studio-final',
        caption: `${media[slotKey].caption} · ${fileName}`,
        note: `Studio product detail image: ${fileName}`,
      };
    });

    if (studioMapping?.fabricFile) {
      media.swatch = {
        ...media.swatch,
        url: `/catalogue-media/${encodeURIComponent(studioMapping.fabricFile)}`,
        stage: 'studio-final',
        caption: `${media.swatch.caption} · ${studioMapping.fabricFile}`,
        note: `Verified product fabric image: ${studioMapping.fabricFile}`,
        isFactoryFabricImage: true,
      };
    }

    return {
      id: `garment-${String(num).padStart(2, '0')}`,
      index: num,
      sku: row.sku,
      title: assetMapping?.title ?? `${row.title}*`,
      gender: row.gender,
      genderCode: row.genderCode,
      productGroupVi: row.productGroupVi,
      category: row.category,
      chapterNumeral: row.chapterNumeral,
      summary: `${row.fitNote}. Cut from swatchbook fabric ${row.fabricCode} (${row.weightGsm}, ${row.fabricWidth} width).`,
      descriptionBullets: craft.bullets,
      keyFeatures: craft.features,
      colorCount: row.colorways.length,
      colorways: row.colorways,
      dataFlags: row.dataFlags,
      productUrl:
        assetMapping?.productUrl ??
        `https://dreamtomorrow.studio/b2b/line-sheet/${slug}`,
      videoUrl: '',
      videoTitle: `${row.sku} Drape & Movement Study`,
      specs: {
        fabricRollRef: row.fabricCode,
        composition: row.composition,
        weightGsm: row.weightGsm,
        fabricWidth: row.fabricWidth,
        stretchFeelNote: row.stretchFeelNote,
        stitchDensity: craft.stitchDensity,
        seamFinish: craft.seamFinish,
        pocketConstruction: craft.pocketConstruction,
        cmOemOdmScope: 'CM / OEM / ODM Ready',
        sizeRun: row.gender === 'Men' ? 'S / M / L / XL / XXL' : 'XS / S / M / L / XL',
        moq: craft.moq,
        leadTime: '4 – 6 Weeks Ex-Factory (Placeholder)',
        wholesaleRef: 'CM / OEM / ODM Quote',
      },
      media,
    };
  });
}

export function buildFabricSwatchPrograms(garments: GarmentItem[]): FabricSwatchProgram[] {
  const map = new Map<string, FabricSwatchProgram>();

  for (const g of garments) {
    const key = g.specs.fabricRollRef;
    const existing = map.get(key);
    if (!existing) {
      const factoryColors = getFactoryFabricColors(key);
      map.set(key, {
        fabricCode: key,
        factoryColors,
        composition: g.specs.composition,
        weightGsm: g.specs.weightGsm,
        fabricWidth: g.specs.fabricWidth,
        stretchFeelNote: g.specs.stretchFeelNote,
        colorCount: factoryColors.length,
        colorways: [...g.colorways],
        linkedSkus: [g.sku],
        linkedIndices: [g.index],
        genders: [g.gender],
        dataFlags: g.dataFlags ? [...g.dataFlags] : [],
        swatchImageUrl: g.media.swatch.url,
        swatchImageStage: g.media.swatch.stage,
        isSessionDrop: g.media.swatch.isSessionDrop,
      });
    } else {
      existing.linkedSkus.push(g.sku);
      existing.linkedIndices.push(g.index);
      if (!existing.genders.includes(g.gender)) {
        existing.genders.push(g.gender);
      }
      if (!existing.swatchImageUrl && g.media.swatch.url) {
        existing.swatchImageUrl = g.media.swatch.url;
        existing.swatchImageStage = g.media.swatch.stage;
        existing.isSessionDrop = g.media.swatch.isSessionDrop;
      }
    }
  }

  return Array.from(map.values());
}

export function getFabricSwatchSpreadCount(garments: GarmentItem[]): number {
  return buildFabricSwatchPrograms(garments).length;
}

export function getProductSpreadOffset(garments: GarmentItem[]): number {
  return 2 + getFabricSwatchSpreadCount(garments);
}

export function getFabricSwatchSpreadPage(fabricCode: string, garments: GarmentItem[]): number {
  const programIndex = buildFabricSwatchPrograms(garments).findIndex(
    (program) => program.fabricCode === fabricCode
  );
  return programIndex < 0
    ? 2
    : 2 + programIndex;
}

export const METALLIC_THEMES = [
  {
    id: 'platinum' as const,
    label: 'Brushed Platinum',
    swatch: '#9BA2A9',
    note: 'Cool silver-steel hairlines on pure gallery white',
  },
  {
    id: 'champagne' as const,
    label: 'Champagne Brass',
    swatch: '#B4A48A',
    note: 'Warm understated satin metal on pure gallery white',
  },
  {
    id: 'graphite' as const,
    label: 'Graphite Steel',
    swatch: '#575C61',
    note: 'High-contrast architectural gunmetal monochrome',
  },
];

export const STAGE_LABELS: Record<'blank' | 'ai-concept' | 'studio-final', string> = {
  blank: 'Blank Slot',
  'ai-concept': 'AI Concept',
  'studio-final': 'Studio Final',
};

export const PRINT_PRODUCTION_SPEC = {
  pageFormat: 'A4 Landscape Open Spread (297 × 210 mm)',
  spreadDimensionsMm: '297 × 210 mm (148.5 × 210 mm per Verso/Recto leaf)',
  bleedMm: 3,
  trimMarginMm: 10,
  innerGutterMm: 18,
  outerMarginMm: 14,
  targetDpi: 300,
  colorProfile: 'sRGB Web Prototype → CMYK ISO Coated v2 (FOGRA39)',
  bindingMethod: 'Smyth-Sewn Lay-Flat / Saddle-Stitch B2B Lookbook',
} as const;

