import type { FactoryFabricColor } from '../types/catalogue';
import { publicAssetUrl } from '../utils/publicAssetUrl';

type FactoryFabricSwatchAsset = Pick<
  FactoryFabricColor,
  'fabricCode' | 'colorName' | 'swatchImageUrl'
> & {
  swatchImageUrl: string;
};

const factoryFabricSwatchAssetData: FactoryFabricSwatchAsset[] = [
  { fabricCode: 'A82', colorName: 'Stone Grey', swatchImageUrl: '/assets/fabric-swatches/Part-01_A82_330GSM/swatch-001.jpg' },
  { fabricCode: 'A82', colorName: 'Smoke Grey', swatchImageUrl: '/assets/fabric-swatches/Part-01_A82_330GSM/swatch-002.jpg' },
  { fabricCode: 'A82', colorName: 'Black', swatchImageUrl: '/assets/fabric-swatches/Part-01_A82_330GSM/swatch-003.jpg' },
  { fabricCode: 'A82', colorName: 'Beige', swatchImageUrl: '/assets/fabric-swatches/Part-01_A82_330GSM/swatch-004.jpg' },
  { fabricCode: 'A28', colorName: 'Black', swatchImageUrl: '/assets/fabric-swatches/Part-02_A28-A29-K03/swatch-005.jpg' },
  { fabricCode: 'A28', colorName: 'Khaki', swatchImageUrl: '/assets/fabric-swatches/Part-02_A28-A29-K03/swatch-006.jpg' },
  { fabricCode: 'A28', colorName: 'Navy', swatchImageUrl: '/assets/fabric-swatches/Part-02_A28-A29-K03/swatch-007.jpg' },
  { fabricCode: 'A28', colorName: 'Smoke Grey', swatchImageUrl: '/assets/fabric-swatches/Part-02_A28-A29-K03/swatch-008.jpg' },
  { fabricCode: 'A29', colorName: 'Black', swatchImageUrl: '/assets/fabric-swatches/Part-02_A28-A29-K03/swatch-009.jpg' },
  { fabricCode: 'A29', colorName: 'Navy', swatchImageUrl: '/assets/fabric-swatches/Part-02_A28-A29-K03/swatch-010.jpg' },
  { fabricCode: 'A29', colorName: 'Smoke Grey', swatchImageUrl: '/assets/fabric-swatches/Part-02_A28-A29-K03/swatch-011.jpg' },
  { fabricCode: 'A29', colorName: 'Khaki', swatchImageUrl: '/assets/fabric-swatches/Part-02_A28-A29-K03/swatch-012.jpg' },
  { fabricCode: 'K03', colorName: 'Black', swatchImageUrl: '/assets/fabric-swatches/Part-02_A28-A29-K03/swatch-013.jpg' },
  { fabricCode: 'K03', colorName: 'Olive', swatchImageUrl: '/assets/fabric-swatches/Part-02_A28-A29-K03/swatch-014.jpg' },
  { fabricCode: 'K03', colorName: 'Navy', swatchImageUrl: '/assets/fabric-swatches/Part-02_A28-A29-K03/swatch-015.jpg' },
  { fabricCode: 'K03', colorName: 'Khaki', swatchImageUrl: '/assets/fabric-swatches/Part-02_A28-A29-K03/swatch-016.jpg' },
  { fabricCode: 'MODAL NAM', colorName: 'B8385 (Steel Blue Melange)', swatchImageUrl: '/assets/fabric-swatches/Part-03_Modal-Nam-Nu/swatch-017.jpg' },
  { fabricCode: 'MODAL NAM', colorName: 'B7901 (Deep Teal Melange)', swatchImageUrl: '/assets/fabric-swatches/Part-03_Modal-Nam-Nu/swatch-018.jpg' },
  { fabricCode: 'MODAL NAM', colorName: 'BC14 (Light Grey-Blue Melange)', swatchImageUrl: '/assets/fabric-swatches/Part-03_Modal-Nam-Nu/swatch-019.jpg' },
  { fabricCode: 'MODAL NAM', colorName: 'Salt-and-Pepper Grey', swatchImageUrl: '/assets/fabric-swatches/Part-03_Modal-Nam-Nu/swatch-020.jpg' },
  { fabricCode: 'MODAL NAM', colorName: 'Black', swatchImageUrl: '/assets/fabric-swatches/Part-03_Modal-Nam-Nu/swatch-021.jpg' },
  { fabricCode: 'MODAL NAM', colorName: 'White', swatchImageUrl: '/assets/fabric-swatches/Part-03_Modal-Nam-Nu/swatch-022.jpg' },
  { fabricCode: 'MODAL NAM', colorName: 'Navy', swatchImageUrl: '/assets/fabric-swatches/Part-03_Modal-Nam-Nu/swatch-023.jpg' },
  { fabricCode: 'MODAL NAM', colorName: 'Heather Grey', swatchImageUrl: '/assets/fabric-swatches/Part-03_Modal-Nam-Nu/swatch-024.jpg' },
  { fabricCode: 'MODAL NỮ', colorName: 'Pink', swatchImageUrl: '/assets/fabric-swatches/Part-03_Modal-Nam-Nu/swatch-025.jpg' },
  { fabricCode: 'MODAL NỮ', colorName: 'Yellow', swatchImageUrl: '/assets/fabric-swatches/Part-03_Modal-Nam-Nu/swatch-026.jpg' },
  { fabricCode: 'MODAL NỮ', colorName: 'Purple', swatchImageUrl: '/assets/fabric-swatches/Part-03_Modal-Nam-Nu/swatch-027.jpg' },
  { fabricCode: 'PQ 4 CHIỀU / PIQUE NAM – 4 WAYS', colorName: 'Black', swatchImageUrl: '/assets/fabric-swatches/Part-04_PQ4Chieu-Slub20/swatch-028.jpg' },
  { fabricCode: 'PQ 4 CHIỀU / PIQUE NAM – 4 WAYS', colorName: 'White', swatchImageUrl: '/assets/fabric-swatches/Part-04_PQ4Chieu-Slub20/swatch-029.jpg' },
  { fabricCode: 'PQ 4 CHIỀU / PIQUE NAM – 4 WAYS', colorName: 'Orchid Ice', swatchImageUrl: '/assets/fabric-swatches/Part-04_PQ4Chieu-Slub20/swatch-030.jpg' },
  { fabricCode: 'PQ 4 CHIỀU / PIQUE NAM – 4 WAYS', colorName: 'Peach', swatchImageUrl: '/assets/fabric-swatches/Part-04_PQ4Chieu-Slub20/swatch-031.jpg' },
  { fabricCode: 'PQ 4 CHIỀU / PIQUE NAM – 4 WAYS', colorName: 'Grey (CGR)', swatchImageUrl: '/assets/fabric-swatches/Part-04_PQ4Chieu-Slub20/swatch-032.jpg' },
  { fabricCode: 'PQ 4 CHIỀU / PIQUE NAM – 4 WAYS', colorName: 'Bean Grey', swatchImageUrl: '/assets/fabric-swatches/Part-04_PQ4Chieu-Slub20/swatch-033.jpg' },
  { fabricCode: 'PQ 4 CHIỀU / PIQUE NAM – 4 WAYS', colorName: 'Navy', swatchImageUrl: '/assets/fabric-swatches/Part-04_PQ4Chieu-Slub20/swatch-034.jpg' },
  { fabricCode: 'PQ 4 CHIỀU / PIQUE NAM – 4 WAYS', colorName: 'Heather Grey', swatchImageUrl: '/assets/fabric-swatches/Part-04_PQ4Chieu-Slub20/swatch-035.jpg' },
  { fabricCode: 'SLUB 20', colorName: 'Mauve', swatchImageUrl: '/assets/fabric-swatches/Part-04_PQ4Chieu-Slub20/swatch-036.jpg' },
  { fabricCode: 'SLUB 20', colorName: 'Khaki', swatchImageUrl: '/assets/fabric-swatches/Part-04_PQ4Chieu-Slub20/swatch-037.jpg' },
  { fabricCode: 'SLUB 20', colorName: 'Grey (CGR)', swatchImageUrl: '/assets/fabric-swatches/Part-04_PQ4Chieu-Slub20/swatch-038.jpg' },
  { fabricCode: 'SLUB 20', colorName: 'Brick', swatchImageUrl: '/assets/fabric-swatches/Part-04_PQ4Chieu-Slub20/swatch-039.jpg' },
  { fabricCode: 'SLUB 20', colorName: 'Cement Grey', swatchImageUrl: '/assets/fabric-swatches/Part-04_PQ4Chieu-Slub20/swatch-040.jpg' },
  { fabricCode: 'SLUB 20', colorName: 'Black', swatchImageUrl: '/assets/fabric-swatches/Part-04_PQ4Chieu-Slub20/swatch-041.jpg' },
  { fabricCode: 'SLUB 20', colorName: 'White', swatchImageUrl: '/assets/fabric-swatches/Part-04_PQ4Chieu-Slub20/swatch-042.jpg' },
  { fabricCode: 'CM26 NAM', colorName: 'Light Blue', swatchImageUrl: '/assets/fabric-swatches/Part-05_CM26-CM36/swatch-043.jpg' },
  { fabricCode: 'CM26 NAM', colorName: 'Black', swatchImageUrl: '/assets/fabric-swatches/Part-05_CM26-CM36/swatch-044.jpg' },
  { fabricCode: 'CM26 NAM', colorName: 'Grey', swatchImageUrl: '/assets/fabric-swatches/Part-05_CM26-CM36/swatch-045.jpg' },
  { fabricCode: 'CM26 NAM', colorName: 'Khaki', swatchImageUrl: '/assets/fabric-swatches/Part-05_CM26-CM36/swatch-046.jpg' },
  { fabricCode: 'CM26 NAM', colorName: 'Peach', swatchImageUrl: '/assets/fabric-swatches/Part-05_CM26-CM36/swatch-047.jpg' },
  { fabricCode: 'CM26 NAM', colorName: 'Cement Grey', swatchImageUrl: '/assets/fabric-swatches/Part-05_CM26-CM36/swatch-048.jpg' },
  { fabricCode: 'CM26 NAM', colorName: 'White', swatchImageUrl: '/assets/fabric-swatches/Part-05_CM26-CM36/swatch-049.jpg' },
  { fabricCode: 'CM26 NAM', colorName: 'Navy', swatchImageUrl: '/assets/fabric-swatches/Part-05_CM26-CM36/swatch-050.jpg' },
  { fabricCode: 'CM26 NỮ', colorName: 'Black', swatchImageUrl: '/assets/fabric-swatches/Part-05_CM26-CM36/swatch-053.jpg' },
  { fabricCode: 'CM26 NỮ', colorName: 'Grey', swatchImageUrl: '/assets/fabric-swatches/Part-05_CM26-CM36/swatch-055.jpg' },
  { fabricCode: 'CM36', colorName: 'Blue', swatchImageUrl: '/assets/fabric-swatches/Part-05_CM26-CM36/swatch-059.jpg' },
];

export const FACTORY_FABRIC_SWATCH_ASSETS = factoryFabricSwatchAssetData.map(
  (asset) => ({
    ...asset,
    swatchImageUrl: publicAssetUrl(asset.swatchImageUrl),
  })
);
