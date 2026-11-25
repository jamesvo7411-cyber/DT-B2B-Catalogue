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
import { publicAssetUrl } from '../utils/publicAssetUrl';

export const BRAND_LOGO_PATH = publicAssetUrl(
  '/assets/aistudio/image_d4ceae1f.png'
);

export const COVER_ATELIER_ILLUSTRATION =
  publicAssetUrl('/src/assets/images/cover_atelier_plate_1795580913741.jpg');

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
    illustration: publicAssetUrl(
      '/src/assets/images/pillar_cm_illustration_1795580914784.jpg'
    ),
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
    illustration: publicAssetUrl(
      '/src/assets/images/pillar_oem_illustration_1795580915075.jpg'
    ),
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
    illustration: publicAssetUrl(
      '/src/assets/images/pillar_odm_illustration_1795580916550.jpg'
    ),
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
    fitNote: 'Tailored straight-leg ankle-skimming cut with structured 330 GSM architectural drape',
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
    fitNote: 'Balanced mid-weight straight trouser engineered for crease resistance and daily mobility',
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
    stretchFeelNote: 'Heavyweight winter suiting drape with crisp vertical crease retention',
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
    fitNote: 'Lightweight fluid wide-leg suiting trouser pairing cleanly with the WSP0001 skirt',
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
    fitNote: 'Above-knee flat-front chino walk short matching the A28 trouser suiting program',
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
    fitNote: 'Clean straight-leg cotton twill short with responsive 5% stretch and matte snap waist',
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
    stretchFeelNote: 'Substantial 330 GSM woven structure holding clean front lines',
    colorCount: 4,
    colorways: COLORS_A82,
    fitNote: 'High-rise tailored short crafted from structured 330 GSM A82 suiting cloth',
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
    stretchFeelNote: 'Firm architectural drape supporting front darts and notched cuff hems',
    colorCount: 4,
    colorways: COLORS_A82,
    fitNote: 'High-rise A-line tailored short with twin front waist darts and side-notched cuff hems',
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
    stretchFeelNote: 'Smooth heavyweight finish pairing clean front drape with elastic rear comfort',
    colorCount: 4,
    colorways: COLORS_A82,
    fitNote: 'Clean flat-front A-line short engineered with a gathered elastic rear waistband',
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
    fitNote: 'Tailored 3-button box-placket polo in cool, silk-smooth cotton-modal jersey',
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
    fitNote: '2-button box-placket cotton-modal polo distinguished by a faux chest welt detail',
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
    fitNote: 'Modern concealed-zip polo highlighting fluid drape and 6% spandex recovery',
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
    fitNote: 'Structured 3-button micro-piqué polo with crisp ribbed collar and cuffs',
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
    fitNote: 'Minimalist concealed-zip piqué polo showcasing dimensional honeycomb texture',
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
    fitNote: 'Textured 100% cotton slub 3-button polo offering organic visual depth',
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
    fitNote: 'Relaxed Slub 20 cotton zip-placket polo with exposed metallic puller',
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
    fitNote: 'Fitted 3/4-sleeve cotton-modal polo accented with an exposed gold-tone zip neck',
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
    fitNote: 'Contour-friendly cotton-modal polo with an elongated 5-button narrow placket',
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
    fitNote: 'Slim-fit performance piqué polo with an elongated narrow button placket across 9 shades',
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
    fitNote: 'Fitted performance piqué polo framed with crisp white contrast inner-placket piping',
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
    fitNote: 'Clean straight-fit cotton-modal Henley crew elevated with a 2-button neck placket',
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
    fitNote: 'Cotton-modal 3-button Henley tee anchored by a crisp mitered chest pocket',
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
    fitNote: 'Cinched-waist overlap V-neck silhouette paired with silky cotton-modal recovery',
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
    fitNote: 'Contoured slim-fit silhouette with high-resilience rib crew neckline',
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
    fitNote: 'Straight-fit ringer-style crew tee edged with contrast navy sleeve and hem binding',
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
    fitNote: 'Tailored cinched-waist crew neck tee sculpted for clean close-to-body layering',
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
    stretchFeelNote: 'Featherweight 40s combed cotton jersey for breathable drape',
    colorCount: 6,
    colorways: COLORS_CM40,
    fitNote: 'Relaxed oversized dropped-shoulder silhouette in airy 125–130 GSM combed cotton',
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
    fitNote: 'Clean straight-cut crew tee showcasing smooth 4-way compact jersey drape',
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
    fitNote: 'Waist-skimming relaxed crop tee with 4-way elastane return and clean chest profile',
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
    stretchFeelNote: 'Structured 330 GSM cloth holding crisp asymmetrical wrap-front volume',
    colorCount: 4,
    colorways: COLORS_A82,
    fitNote: 'Asymmetric overlap wrap-front skort integrating concealed inner tailored shorts',
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
    stretchFeelNote: 'Structured 330 GSM weave retaining clean low-rise A-line silhouette',
    colorCount: 4,
    colorways: COLORS_A82,
    fitNote: 'Low-rise A-line skort tailored with front waist darts and concealed side zipper',
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
    stretchFeelNote: 'Lightweight 203 GSM fluid suiting weave holding sharp knife pleats',
    colorCount: 2,
    colorways: COLORS_FTR76,
    fitNote: 'A-line knife-pleated mini skirt paired with the WBL0001 fluid suiting program',
  },
];

interface SkuCraftOverride {
  stitchDensity?: string;
  seamFinish?: string;
  pocketConstruction?: string;
  bulletConstruction?: string;
  bulletDetail?: string;
  detailHints?: {
    pocket: string;
    seam: string;
    custom: string;
  };
}

const SKU_CRAFT_OVERRIDES: Record<string, SkuCraftOverride> = {
  MLPA82: {
    seamFinish: 'Clean-bound internal outseams with curtained belt-loop waistband',
    pocketConstruction: 'Slanted French side pockets + buttoned rear single-welt pocket with DT flag',
    bulletConstruction:
      'Built on a structured belt-loop waistband with concealed hook-and-bar zip fly and bound interior seams.',
    bulletDetail:
      'Finished with slanted side pockets and a buttoned rear single-welt pocket trimmed with a subtle DT woven flag.',
    detailHints: {
      pocket: 'Slanted pocket & DT flag closeup',
      seam: 'Buttoned rear welt & waist closeup',
      custom: 'Ankle taper & drape study',
    },
  },
  MSPA28: {
    seamFinish: 'Flat-pressed overlocked outseams with belt-loop waistband & matte snap fly',
    pocketConstruction: 'Slanted side pockets + dual rear single-welt pockets with DT woven flag',
    bulletConstruction:
      'Constructed with flat-pressed outseams, reinforced belt loops, and a matte snap zip-fly closure.',
    bulletDetail:
      'Finished with deep slanted side pockets and twin rear single-welt pockets stamped with a DT woven tab.',
    detailHints: {
      pocket: 'Rear welt pocket & DT flag closeup',
      seam: 'Back rise & dual welt construction',
      custom: 'Front snap fly & slant pocket closeup',
    },
  },
  MSPK03: {
    seamFinish: 'Clean twin-stitched hems with matte button waist & reinforced belt loops',
    pocketConstruction: 'Slanted side pockets + twin rear single-welt pockets with DT woven flag',
    bulletConstruction:
      'Topstitched at pocket stress points, belt loops, and zip-fly J-stitch for repeat wear stability.',
    bulletDetail:
      'Accented with twin rear single-welt pockets, matte top button, and signature DT black woven side tab.',
    detailHints: {
      pocket: 'Rear welt & DT tab closeup',
      seam: 'Button fly & waistband closeup',
      custom: 'Twill weave & hem topstitch',
    },
  },
  'WBS0002-A82': {
    seamFinish: 'Concealed invisible zipper & contoured beltless waist with front darts',
    pocketConstruction: 'Pocketless sleek hip line; twin front darts & notched side-slit hem cuffs',
    bulletConstruction:
      'Shaped with twin front waist darts, a wide contoured waistband, and concealed back zip closure.',
    bulletDetail:
      'Distinguished by side-slit notched hem cuffs and a subtle DT woven flag anchored at the hip seam.',
    detailHints: {
      pocket: 'Front darts & notched cuff hem closeup',
      seam: 'Contoured back waist & zip closeup',
      custom: 'Side split cuff detail',
    },
  },
  'WBS0003-A82': {
    seamFinish: 'Smooth flat-front waistband paired with gathered elastic rear waist',
    pocketConstruction: 'Slanted in-seam side pockets anchored neatly into the front panel',
    bulletConstruction:
      'Pairs a tailored flat-front waist with a gathered elastic back channel for adaptable waist comfort.',
    bulletDetail:
      'Finished with angled side-seam pockets and clean twin-needle hems that preserve an A-line flare.',
    detailHints: {
      pocket: 'Slanted side pocket closeup',
      seam: 'Elastic-back waistband closeup',
      custom: 'A-line side profile detail',
    },
  },
  'MPOLO-MD1': {
    seamFinish: 'Herringbone neck tape with flat-knit collar stand & cuffed sleeves',
    pocketConstruction: 'Clean 3-button box placket (no chest pocket) with tonal DT monogram',
    bulletConstruction:
      'Engineered with an anti-curl flat-knit collar, herringbone neck tape, and crisp 3-button box placket.',
    bulletDetail:
      'Finished with tonal DT left-chest embroidery and ribbed sleeve bands over a clean pocketless torso.',
    detailHints: {
      pocket: '3-button placket & DT embroidery',
      seam: 'Flat-knit collar & neck tape closeup',
      custom: 'Sleeve cuff & drape detail',
    },
  },
  'MPOLO-MD2': {
    seamFinish: 'Ribbed flat-knit collar, herringbone neck tape & cuffed short sleeves',
    pocketConstruction: '2-button box placket paired with faux chest welt trim ("DREAM TOMORROW")',
    bulletConstruction:
      'Constructed with a firm ribbed flat-knit collar and clean 2-button front placket backed by fusible stay.',
    bulletDetail:
      'Distinguished by a decorative faux chest welt bar stamped "DREAM TOMORROW" for subtle graphic structure.',
    detailHints: {
      pocket: 'Collar, placket & faux welt closeup',
      seam: 'Shoulder seam & sleeve rib closeup',
      custom: 'Body drape & cuff study',
    },
  },
  'MPOLO-MD4': {
    seamFinish: 'Concealed half-zip front placket with flat-knit collar & ribbed cuffs',
    pocketConstruction: 'Minimalist hidden-zip neck closure with tonal DT left-chest embroidery',
    bulletConstruction:
      'Tailored with a smooth concealed half-zip front placket and structured flat-knit rib collar.',
    bulletDetail:
      'Completed with tonal embroidered DT chest branding and fine-gauge ribbed sleeve cuffs.',
    detailHints: {
      pocket: 'Concealed zip placket closeup',
      seam: 'Collar & cuff rib closeup',
      custom: 'Drape & silhouette detail',
    },
  },
  'MPOLO-PQ2': {
    seamFinish: 'Taped inner neck, reinforced side vents & fine ribbed sleeve cuffs',
    pocketConstruction: '3-button box placket with DT chest embroidery & side-hem woven flag',
    bulletConstruction:
      'Built with an anti-curl ribbed collar, taped shoulder seams, and clean 3-button placket.',
    bulletDetail:
      'Accented with subtle DT left-chest embroidery, side-hem DT woven flag, and reinforced side vents.',
    detailHints: {
      pocket: '3-button placket & piqué grain',
      seam: 'Side-hem slit & DT flag closeup',
      custom: 'Collar & cuff rib finish',
    },
  },
  'MPOLO-PQ4': {
    seamFinish: 'Concealed silver-zip front placket with structured flat-knit collar',
    pocketConstruction: 'Clean hidden half-zip collar closure with tonal DT chest embroidery',
    bulletConstruction:
      'Integrates a smooth silver-pull concealed zip placket into a dimensionally stable flat-knit collar.',
    bulletDetail:
      'Finished with ribbed sleeve cuffs, side vents, and tonal embroidered DT chest insignia.',
    detailHints: {
      pocket: 'Concealed zip pull & collar closeup',
      seam: 'Micro-piqué rib cuff closeup',
      custom: 'Body silhouette detail',
    },
  },
  'MPOLO-SL201': {
    seamFinish: 'Self-taped neck, open clean-hemmed sleeves & split side-vent bottom',
    pocketConstruction: '3-button box placket with DT chest embroidery & sleeve woven flag',
    bulletConstruction:
      'Tailored with a crisp flat-knit collar, 3-button box placket, and open twin-needle sleeve hems.',
    bulletDetail:
      'Detailed with fine DT left-chest embroidery and a signature black DT flag tab on the left cuff.',
    detailHints: {
      pocket: '3-button placket & slub grain closeup',
      seam: 'Sleeve flag & clean hem closeup',
      custom: 'Drape & collar fit study',
    },
  },
  'MPOLO-SL203': {
    seamFinish: 'Exposed metallic zip-front placket with self-fabric collar & twin-needle hems',
    pocketConstruction: 'Exposed silver zipper neck closure with DT chest embroidery & sleeve flag',
    bulletConstruction:
      'Replaces buttons with a smooth exposed silver zip placket anchored cleanly into the self-fabric collar.',
    bulletDetail:
      'Highlights raw 100% cotton slub striations paired with DT chest embroidery and a sleeve woven flag.',
    detailHints: {
      pocket: 'Exposed silver zip & slub closeup',
      seam: 'Collar & sleeve flag closeup',
      custom: 'Silhouette & drape detail',
    },
  },
  'WPOLO-MD1': {
    seamFinish: 'Slim 3/4-sleeve contoured cut with clean twin-needle cuffs & hem',
    pocketConstruction: 'Exposed gold-tone half-zip front placket with tonal DREAM TOMORROW print',
    bulletConstruction:
      'Contoured with sculpted 3/4 sleeves and a pointed spread collar anchored by an exposed gold zipper.',
    bulletDetail:
      'Finished with tonal matte "DREAM TOMORROW" left-chest print and clean pocketless front panelling.',
    detailHints: {
      pocket: 'Gold-tone zip & chest print closeup',
      seam: '3/4 sleeve & collar seam closeup',
      custom: 'Fitted torso drape detail',
    },
  },
  'WPOLO-MD2': {
    seamFinish: 'Contour side seams, flat-knit collar & notched side-vent hem',
    pocketConstruction: 'Elongated 5-button narrow box placket with DREAM TOMORROW chest print',
    bulletConstruction:
      'Tailored through the waist with a crisp flat-knit collar and slim 5-button placket.',
    bulletDetail:
      'Accented with left-chest "DREAM TOMORROW" lettering and a woven DT flag at the left sleeve cuff.',
    detailHints: {
      pocket: '5-button placket & print closeup',
      seam: 'Cuff tab & hem vent closeup',
      custom: 'Slim-fit profile study',
    },
  },
  'WPOLO-YD1': {
    seamFinish: 'Moisture-wicking flat seams with split side-vent hem & narrow placket',
    pocketConstruction: '4-button narrow box placket with crisp DREAM TOMORROW chest print',
    bulletConstruction:
      'Engineered with a breathable piqué body, slim 4-button placket, and clean side-slit bottom vents.',
    bulletDetail:
      'Detailed with crisp high-contrast "DREAM TOMORROW" chest branding and quick-dry collar recovery.',
    detailHints: {
      pocket: '4-button placket & piqué closeup',
      seam: 'Collar & side vent closeup',
      custom: 'Silhouette fit study',
    },
  },
  'WPOLO-YD2': {
    seamFinish: 'Reinforced split side vents with contrast inner-placket woven piping',
    pocketConstruction: '4-button contrast white-piped placket with DREAM TOMORROW chest print',
    bulletConstruction:
      'Framed along the inner placket and collar edge with crisp contrast white piping for clean definition.',
    bulletDetail:
      'Completed with a 4-button closure, clean twin-needle sleeve hems, and "DREAM TOMORROW" chest mark.',
    detailHints: {
      pocket: 'Contrast white-piped placket closeup',
      seam: 'Collar trim & hem closeup',
      custom: 'Silhouette & drape detail',
    },
  },
  'MTSHIRT-MD1': {
    seamFinish: 'Shoulder-to-shoulder twill tape with zero-torque twin-needle hems',
    pocketConstruction: 'Clean pocketless crew neck with DT left-chest embroidery & sleeve flag',
    bulletConstruction:
      'Anchored with a durable 1x1 ribbed crew collar, inner neck tape, and twin-needle sleeve and bottom hems.',
    bulletDetail:
      'Signed with subtle DT left-chest embroidery and a signature black DT woven flag on the left cuff.',
    detailHints: {
      pocket: 'Ribbed crew neck & DT embroidery',
      seam: 'Sleeve flag & shoulder seam closeup',
      custom: 'Straight-fit body drape',
    },
  },
  'MTSHIRT-MD2': {
    seamFinish: 'Clean twin-needle hems paired with bound 2-button Henley neck placket',
    pocketConstruction: '2-button Henley placket (clean pocketless chest) + DT embroidery & sleeve tab',
    bulletConstruction:
      'Updates the essential crew tee with a fused 2-button Henley neck placket and clean shoulder taping.',
    bulletDetail:
      'Finished with DT left-chest embroidery and a woven DT sleeve flag on a clean pocketless front.',
    detailHints: {
      pocket: '2-button Henley placket closeup',
      seam: 'DT embroidery & sleeve tab closeup',
      custom: 'Straight-fit chest drape',
    },
  },
  'MTSHIRT-MD3': {
    seamFinish: 'Shoulder twill neck tape with twin-needle hems & 3-button Henley placket',
    pocketConstruction: '3-button Henley placket + mitered chest patch pocket embroidered DT',
    bulletConstruction:
      'Combines a structured 3-button Henley neckline with reinforced shoulder seams and clean twin-needle hems.',
    bulletDetail:
      'Grounded by a crisp bar-tacked left-chest patch pocket with DT embroidery and matching sleeve flag.',
    detailHints: {
      pocket: '3-button Henley & patch pocket closeup',
      seam: 'Pocket bar-tack & DT sleeve tab',
      custom: 'Relaxed fit & drape detail',
    },
  },
  'MVNECK-CM26': {
    seamFinish: 'Overlapping mitered V-neck rib collar with clean twin-needle hems',
    pocketConstruction: 'Precision V-neck rib binding with DT chest embroidery & sleeve woven flag',
    bulletConstruction:
      'Engineered with an overlapping mitered V-neck rib that sits flat against the collarbone without gapping.',
    bulletDetail:
      'Detailed with sharp DT left-chest embroidery and a left-sleeve woven DT flag tab.',
    detailHints: {
      pocket: 'Mitered V-neck collar & DT mark',
      seam: 'Sleeve flag & shoulder seam closeup',
      custom: 'Clean drape & hem detail',
    },
  },
  'MTSHIRT-CM36': {
    seamFinish: 'Heavyweight 1x1 dense neck rib with clean shoulder tape & twin-needle hems',
    pocketConstruction: 'Pocketless heavyweight crew profile with DT embroidery & sleeve woven flag',
    bulletConstruction:
      'Paired with a substantial ribbed neckline and flat twin-needle coverstitching built for 220 GSM fabric.',
    bulletDetail:
      'Signed with subtle DT left-chest embroidery and a signature DT sleeve cuff woven tab.',
    detailHints: {
      pocket: 'Dense neck rib & DT embroidery',
      seam: 'Sleeve flag & compact knit closeup',
      custom: 'Structured boxy silhouette',
    },
  },
  'MTSHIRT-CM40': {
    seamFinish: 'Fine single-jersey shoulder seams with clean 1x1 rib collar & twin-needle hems',
    pocketConstruction: 'Featherweight pocketless crew cut with DT embroidery & sleeve woven flag',
    bulletConstruction:
      'Constructed with fine-needle coverstitch hems to keep seams light and flat against 125–130 GSM jersey.',
    bulletDetail:
      'Finished with tonal DT chest embroidery and a miniature DT woven flag tab on the sleeve cuff.',
    detailHints: {
      pocket: 'Fine neck rib & DT embroidery',
      seam: 'Sleeve flag & jersey hand closeup',
      custom: 'Breathable drape detail',
    },
  },
  'WVNECK-MD': {
    seamFinish: 'Contour side-seam shaping with flat mitered V-neck rib & twin-needle hems',
    pocketConstruction: 'Sculpted V-neck rib profile with DREAM TOMORROW chest print & DT sleeve tab',
    bulletConstruction:
      'Patterned with subtle waist-cinching side seams and a smooth mitered V-neck binding.',
    bulletDetail:
      'Completed with left-chest "DREAM TOMORROW" print and a woven DT flag on the short sleeve.',
    detailHints: {
      pocket: 'Mitered V-neck & chest print closeup',
      seam: 'Cinched waist & sleeve flag closeup',
      custom: 'Contoured fit profile',
    },
  },
  'WTSHIRT-MD1': {
    seamFinish: 'High-recovery baby-rib crew collar with contour side seams & clean hems',
    pocketConstruction: 'Minimalist crew silhouette with DREAM TOMORROW chest print & DT sleeve tab',
    bulletConstruction:
      'Built with a neat baby-rib collar and sculpted side seams that hold shape across repeated washes.',
    bulletDetail:
      'Finished with clean "DREAM TOMORROW" chest lettering and a left-sleeve black DT woven flag.',
    detailHints: {
      pocket: 'Crew neckline & chest print closeup',
      seam: 'Back drape & sleeve flag closeup',
      custom: 'Slim-fit contour detail',
    },
  },
  'WTSHIRT-MD2': {
    seamFinish: 'Fine twin-needle body seams framed by contrast navy binding on cuffs & hem',
    pocketConstruction: 'Contrast navy ringer trim along short sleeve cuffs & bottom hem',
    bulletConstruction:
      'Framed with crisp navy contrast binding on the sleeve cuffs and bottom hem over a white modal body.',
    bulletDetail:
      'Clean unadorned front lets the ringer contrast trim and smooth body contour lead the silhouette.',
    detailHints: {
      pocket: 'Contrast sleeve & neck binding closeup',
      seam: 'Contrast navy bottom hem closeup',
      custom: 'Back & fitted profile study',
    },
  },
  'WTSHIRT-CM262': {
    seamFinish: 'Waist-tapered side seams with 1x1 rib crew neck & twin-needle coverstitch hems',
    pocketConstruction: 'Contoured waist crew tee with DREAM TOMORROW chest print & DT sleeve flag',
    bulletConstruction:
      'Darted through the waist side seams over a fine 1x1 ribbed crew collar for a tailored, close line.',
    bulletDetail:
      'Signed with "DREAM TOMORROW" chest lettering and a woven DT sleeve tab.',
    detailHints: {
      pocket: 'Rib collar & chest wordmark closeup',
      seam: 'DT sleeve flag & cuff seam closeup',
      custom: 'Cinched waist silhouette',
    },
  },
  'WTSHIRT-CM402': {
    seamFinish: 'Dropped-shoulder seams with relaxed wide sleeve opening & twin-needle hems',
    pocketConstruction: 'Clean minimalist pocketless front for uninterrupted fluid summer drape',
    bulletConstruction:
      'Cut with generous dropped shoulders, wider short sleeves, and crisp twin-needle coverstitch hems.',
    bulletDetail:
      'Left completely unbranded on the exterior chest for clean private-label CM / OEM / ODM programs.',
    detailHints: {
      pocket: 'Relaxed crew collar & shoulder closeup',
      seam: 'Twin-needle hem & cuff closeup',
      custom: 'Oversized airy drape study',
    },
  },
  WTSHIRT1: {
    seamFinish: 'Fine coverstitch hems & smooth baby-rib crew collar on 4-way stretch jersey',
    pocketConstruction: 'Unbranded clean front panel with woven sleeve flag detail',
    bulletConstruction:
      'Constructed with elastic-core thread along the hems to flex cleanly with 4-way stretch recovery.',
    bulletDetail:
      'Minimalist clean-front aesthetic makes it an immediate canvas for custom B2B heat-transfer or embroidery.',
    detailHints: {
      pocket: 'Crew collar & matte surface closeup',
      seam: 'Sleeve hem & coverstitch closeup',
      custom: 'Straight-fit drape detail',
    },
  },
  WTSHIRT2: {
    seamFinish: 'Fine twin-needle cropped bottom hem & sleek bound crew neckline',
    pocketConstruction: 'Cropped waist-skimming silhouette with DT chest embroidery & sleeve tab',
    bulletConstruction:
      'Cut to a clean cropped length with stretch-calibrated twin-needle bottom and sleeve hems.',
    bulletDetail:
      'Accented with delicate DT left-chest embroidery and a miniature DT woven flag on the cuff.',
    detailHints: {
      pocket: 'DT chest embroidery & collar closeup',
      seam: 'Cropped hem & sleeve tab closeup',
      custom: 'Waist-skimming proportion',
    },
  },
  'WBSK001-A82': {
    seamFinish: 'Concealed center-back invisible zipper with inner short lining & clean hem',
    pocketConstruction: 'Slanted in-seam side pockets + dual rear single-welt pockets',
    bulletConstruction:
      'Engineered with an asymmetric wrap-front panel stitched neatly over a comfortable concealed inner short.',
    bulletDetail:
      'Equipped with slanted side-seam pockets, a center-back invisible zipper, and dual rear welt pockets.',
    detailHints: {
      pocket: 'Rear welt pockets & center-back zip',
      seam: 'Slanted side pocket under wrap panel',
      custom: 'Asymmetric wrap-front hem detail',
    },
  },
  'WBSK002-A82': {
    seamFinish: 'Concealed left-side invisible zipper, front waist darts & wide hem band',
    pocketConstruction: 'Single rear single-welt pocket + woven DT hip flag (clean pocketless front)',
    bulletConstruction:
      'Tailored with twin front darts for smooth hip contouring, concealed side zipper, and deep hem band.',
    bulletDetail:
      'Finished on the back with a single sleek welt pocket and miniature DT woven hip seam flag.',
    detailHints: {
      pocket: 'Rear welt pocket & DT hip flag',
      seam: 'Concealed side zip & dart closeup',
      custom: 'Wide topstitched hem band',
    },
  },
  WSP0001: {
    seamFinish: 'Crisp heat-set knife pleats anchored into a smooth contoured waistband',
    pocketConstruction: 'Clean concealed-zip side closure with uninterrupted pleated skirt fall',
    bulletConstruction:
      'Constructed with evenly spaced knife pleats pressed to hold crisp vertical geometry in motion.',
    bulletDetail:
      'Coordinates directly with WBL0001 suiting trousers in matching 203 GSM 76-series drape.',
    detailHints: {
      pocket: 'Knife pleat waist joinery closeup',
      seam: 'Concealed zip & pleat edge closeup',
      custom: 'Pleat movement & hem detail',
    },
  },
};

function getCraftDetails(row: RawProductRow): {
  stitchDensity: string;
  seamFinish: string;
  pocketConstruction: string;
  moq: string;
  bullets: string[];
  features: string[];
  detailHints: {
    pocket: string;
    seam: string;
    custom: string;
  };
} {
  const override = SKU_CRAFT_OVERRIDES[row.sku];

  if (row.category === 'Trousers') {
    const seamFinish =
      override?.seamFinish ?? 'Clean-bound internal outseams with curtained waistband tape';
    const pocketConstruction =
      override?.pocketConstruction ??
      'Slanted French bearer side pockets with reinforced 32-stitch bar-tacks';
    return {
      stitchDensity: override?.stitchDensity ?? '16–18 SPI',
      seamFinish,
      pocketConstruction,
      moq: '100 pcs / color (Placeholder)',
      bullets: [
        `Cut from ${row.composition} (${row.weightGsm}, ${row.fabricWidth} roll width) for structured drape and crease recovery.`,
        override?.bulletConstruction ??
          'Finished with a curtained tailored waistband and bar-tacked stress zones for extended B2B longevity.',
        override?.bulletDetail ??
          'Reinforced French bearer side pockets and clean overlocked interior seams resist fray across wash cycles.',
      ],
      features: [
        `Structured ${row.weightGsm} fabric architecture (${row.fabricCode}) retaining crisp leg line`,
        pocketConstruction,
        seamFinish,
        `Offered in ${row.colorways.length} colorways across full graded sizing`,
      ],
      detailHints: override?.detailHints ?? {
        pocket: 'Pocket & waist closeup',
        seam: 'Tailored seam & hem closeup',
        custom: 'Silhouette & drape detail',
      },
    };
  }

  if (row.category === 'Shorts') {
    const seamFinish =
      override?.seamFinish ?? 'Flat-pressed overlocked outseams with clean-bound inner waist';
    const pocketConstruction =
      override?.pocketConstruction ??
      'Slanted side pockets and rear welt pockets with reinforced bar-tacks';
    return {
      stitchDensity: override?.stitchDensity ?? '15–16 SPI',
      seamFinish,
      pocketConstruction,
      moq: '120 pcs / color (Placeholder)',
      bullets: [
        `Crafted from ${row.composition} (${row.weightGsm}) balancing breathable comfort with structured form.`,
        override?.bulletConstruction ??
          'Cleanly finished interior waist and flat-pressed outseams maintain sharp profile through repeat wear.',
        override?.bulletDetail ??
          'Reinforced pocket corners and neat twin-needle hems deliver dependable daily durability.',
      ],
      features: [
        `Recovery-engineered ${row.fabricCode} weave preventing hip and seat bagging`,
        pocketConstruction,
        seamFinish,
        `Available across ${row.colorways.length} core monochrome & neutral shades`,
      ],
      detailHints: override?.detailHints ?? {
        pocket: 'Pocket & waist closeup',
        seam: 'Seam & hem closeup',
        custom: 'Fit & proportion detail',
      },
    };
  }

  if (row.category === 'Polos') {
    const seamFinish =
      override?.seamFinish ??
      'Herringbone-taped back neck & shoulder seams with twin-needle side vents';
    const pocketConstruction =
      override?.pocketConstruction ??
      'Structured collar stand with reinforced box placket & internal stay';
    return {
      stitchDensity: override?.stitchDensity ?? '18 SPI / 4-Thread Overlock',
      seamFinish,
      pocketConstruction,
      moq: '150 pcs / color (Placeholder)',
      bullets: [
        `Knitted in ${row.composition} (${row.weightGsm}) combining breathable surface hand-feel with shape retention.`,
        override?.bulletConstruction ??
          'Engineered with an anti-curl flat-knit collar and clean placket backed by fusible interlining.',
        override?.bulletDetail ??
          'Completed with split side-vent hems and crisp tonal chest or sleeve branding.',
      ],
      features: [
        `Signature ${row.fabricCode} textile offering smooth drape and collar stability`,
        pocketConstruction,
        seamFinish,
        `Offered in ${row.colorways.length} palette options from core neutrals to Pantone TCX accents`,
      ],
      detailHints: override?.detailHints ?? {
        pocket: 'Placket & chest mark closeup',
        seam: 'Collar & cuff closeup',
        custom: 'Fit & drape detail',
      },
    };
  }

  if (row.category === 'Skirts') {
    const seamFinish =
      override?.seamFinish ??
      'Concealed invisible zipper placket with clean bias-bound or 4-thread seams';
    const pocketConstruction =
      override?.pocketConstruction ??
      'In-seam or rear welt pocket construction anchored cleanly into the waist';
    return {
      stitchDensity: override?.stitchDensity ?? '18 SPI',
      seamFinish,
      pocketConstruction,
      moq: '100 pcs / color (Placeholder)',
      bullets: [
        `Tailored from ${row.composition} (${row.weightGsm}, ${row.fabricWidth} width) for balanced structure and fluid movement.`,
        override?.bulletConstruction ??
          'Finished with a concealed invisible zipper closure and contoured waistband stay.',
        override?.bulletDetail ??
          'Clean hem construction and flat internal pocket anchoring eliminate hip pulling.',
      ],
      features: [
        `Matching ${row.fabricCode} suiting textile enabling cohesive coordinated B2B sets`,
        pocketConstruction,
        seamFinish,
        `Produced in ${row.colorways.length} refined shades for versatile merchandising`,
      ],
      detailHints: override?.detailHints ?? {
        pocket: 'Waist & pocket closeup',
        seam: 'Zipper & hem closeup',
        custom: 'Silhouette & drape detail',
      },
    };
  }

  const isVNeck = row.sku.includes('VNECK');
  const seamFinish =
    override?.seamFinish ??
    'Shoulder-to-shoulder twill neck tape with zero-torque twin-needle hems';
  const pocketConstruction =
    override?.pocketConstruction ??
    (isVNeck
      ? 'Precision mitered V-neck rib collar engineered to lie flat without gapping'
      : 'Clean seamless chest profile with high-recovery 1x1 rib crew collar');

  return {
    stitchDensity: override?.stitchDensity ?? '18–20 SPI Coverstitch',
    seamFinish,
    pocketConstruction,
    moq: '150 pcs / color (Placeholder)',
    bullets: [
      `Crafted from ${row.composition} (${row.weightGsm}) with a smooth, breathable finish that moves comfortably with the body.`,
      override?.bulletConstruction ??
        'Designed with a durable ribbed neckline that retains its shape wash after wash, paired with clean twin-needle sleeve and bottom hems.',
      override?.bulletDetail ??
        'Four-thread overlocked internal seams and flat twin-needle coverstitching ensure zero torque and long-term durability.',
    ],
    features: [
      `Crafted on the ${row.fabricCode} textile roll (${row.fabricWidth} width) for uniform batch hand-feel`,
      pocketConstruction,
      seamFinish,
      `Available in ${row.colorways.length} colorway options for modular B2B assortment`,
    ],
    detailHints: override?.detailHints ?? {
      pocket: isVNeck ? 'Mitered V-neck closeup' : 'Neckline & chest mark closeup',
      seam: 'Sleeve flag & hem closeup',
      custom: 'Fit & drape detail',
    },
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
        url: publicAssetUrl(`/catalogue-media/${encodeURIComponent(heroFile)}`),
        fallbackUrl:
          row.sku === 'WTSHIRT-MD2'
            ? publicAssetUrl('/assets/aistudio/WTSHIRT-MD2_Hero_acd4d06e.jpg')
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
        url: publicAssetUrl(`/catalogue-media/${encodeURIComponent(fileName)}`),
        stage: 'studio-final',
        caption: `${media[slotKey].caption} · ${fileName}`,
        note: `Studio product detail image: ${fileName}`,
      };
    });

    if (studioMapping?.fabricFile) {
      media.swatch = {
        ...media.swatch,
        url: publicAssetUrl(
          `/catalogue-media/${encodeURIComponent(studioMapping.fabricFile)}`
        ),
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
      detailHints: craft.detailHints,
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

