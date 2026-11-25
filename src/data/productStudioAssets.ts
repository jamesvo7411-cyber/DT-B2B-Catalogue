export type ProductDetailAssetSlot = 'pocket' | 'seam' | 'custom';

export interface ProductStudioAssetMapping {
  heroFile?: string;
  detailFiles: Partial<Record<ProductDetailAssetSlot, string>>;
  fabricFile?: string;
}

export const PRODUCT_STUDIO_ASSETS: Record<string, ProductStudioAssetMapping> = {
  MLPA82: {
    heroFile: 'MLPA82-A82 Hero.jpg',
    detailFiles: {
      pocket: 'MLPA82-A82 closeup1.jpg',
      seam: 'MLPA82-A82 closeup2.jpg',
    },
  },
  MSPA28: {
    heroFile: 'MSPA28 Hero.jpg',
    detailFiles: {
      pocket: 'MSPA28 Closeup1.jpg',
      seam: 'MSPA28 Closeup2.jpg',
      custom: 'MSPA28 Closeup3.jpg',
    },
  },
  MSPK03: {
    heroFile: 'MSPK03 Hero.jpg',
    detailFiles: {
      pocket: 'MSPK03 Closeup1.jpg',
      seam: 'MSPK03 Closeup2.jpg',
    },
  },
  'WBS0002-A82': {
    heroFile: 'WBS0002-A82 Hero.jpg',
    detailFiles: {
      pocket: 'WBS0002-A82 Closeup1.jpg',
      seam: 'WBS0002-A82 Closeup2.jpg',
      custom: 'WBS0002-A82 Closeup3.jpg',
    },
  },
  'WBS0003-A82': {
    heroFile: 'WBS0003-A82 Hero.jpg',
    detailFiles: {
      pocket: 'WBS0003-A82 Closeup1.jpg',
      seam: 'WBS0003-A82 Closeup2.jpg',
      custom: 'WBS0003-A82 Closeup3.jpg',
    },
  },
  'MPOLO-MD1': {
    heroFile: 'MPOLO-MD1 Hero.jpg',
    detailFiles: {
      pocket: 'MPOLO-MD1 Closeup1.jpg',
      seam: 'MPOLO-MD1 Closeup2.jpg',
      custom: 'MPOLO-MD1 Closeup3.jpg',
    },
    fabricFile: 'MPOLO-MD1 Fabric.jpg',
  },
  'MPOLO-MD2': {
    heroFile: 'MPOLO-MD2 Hero.jpg',
    detailFiles: {
      pocket: 'MPOLO-MD2 Closeup1.jpg',
      seam: 'MPOLO-MD2 Closeup2.jpg',
      custom: 'MPOLO-MD2 Closeup3.jpg',
    },
    fabricFile: 'MPOLO-MD2 Fabric.jpg',
  },
  'MPOLO-MD4': {
    heroFile: 'MPOLO-MD4 Hero.jpg',
    detailFiles: {
      pocket: 'MPOLO-MD4 Closeup1.jpg',
      seam: 'MPOLO-MD4 Closeup2.jpg',
      custom: 'MPOLO-MD4 Closeup3.jpg',
    },
  },
  'MPOLO-PQ2': {
    heroFile: 'MPOLO-PQ2 Hero.jpg',
    detailFiles: {
      pocket: 'MPOLO-PQ2 Closeup1.jpg',
      seam: 'MPOLO-PQ2 Closeup2.jpg',
      custom: 'MPOLO-PQ2 Closeup3.jpg',
    },
  },
  'MPOLO-PQ4': {
    heroFile: 'MPOLO-PQ4 Hero.jpg',
    detailFiles: {
      pocket: 'MPOLO-PQ4 Closeup1.jpg',
      seam: 'MPOLO-PQ4 Closeup2.jpg',
    },
  },
  'MPOLO-SL201': {
    heroFile: 'MPOLO-SL201 Hero.jpg',
    detailFiles: {
      pocket: 'MPOLO-SL201 Closeup1.jpg',
    },
  },
  'MPOLO-SL203': {
    heroFile: 'MPOLO-SL203 Hero.jpg',
    detailFiles: {
      pocket: 'MPOLO-SL203 Closeup1.jpg',
      seam: 'MPOLO-SL203 Closeup2.jpg',
      custom: 'MPOLO-SL203 Closeup3.jpg',
    },
  },
  'WPOLO-MD1': {
    heroFile: 'WPOLO-MD1 Hero.jpg',
    detailFiles: {
      pocket: 'WPOLO-MD1 Closeup1.jpg',
      seam: 'WPOLO-MD1 Closeup2.jpg',
      custom: 'WPOLO-MD1 Closeup3.jpg',
    },
  },
  'WPOLO-MD2': {
    heroFile: 'WPOLO-MD2 Hero.jpg',
    detailFiles: {
      pocket: 'WPOLO-MD2 Closeup1.jpg',
      seam: 'WPOLO-MD2 Closeup2.jpg',
    },
  },
  'WPOLO-YD1': {
    heroFile: 'WPOLO-YD1 Hero.jpg',
    detailFiles: {},
  },
  'WPOLO-YD2': {
    heroFile: 'WPOLO-YD2 Hero.jpg',
    detailFiles: {
      pocket: 'WPOLO-YD2 Closeup1.jpg',
      seam: 'WPOLO-YD2 Closeup2.jpg',
    },
  },
  'MTSHIRT-MD1': {
    heroFile: 'MTSHIRT-MD1 Hero.jpg',
    detailFiles: {
      pocket: 'MTSHIRT-MD1 Closeup1.jpg',
      seam: 'MTSHIRT-MD1 Closeup2.jpg',
      custom: 'MTSHIRT-MD1 Closeup3.jpg',
    },
  },
  'MTSHIRT-MD2': {
    heroFile: 'MTSHIRT-MD2 Hero.jpg',
    detailFiles: {
      pocket: 'MTSHIRT-MD2 Closeup1.jpg',
      seam: 'MTSHIRT-MD2 Closeup2.jpg',
      custom: 'MTSHIRT-MD2 Closeup3.jpg',
    },
  },
  'MTSHIRT-MD3': {
    heroFile: 'MTSHIRT-MD3 Hero.jpg',
    detailFiles: {
      pocket: 'MTSHIRT-MD3 Closeup1.jpg',
      seam: 'MTSHIRT-MD3 Closeup2.jpg',
      custom: 'MTSHIRT-MD3 Closeup3.jpg',
    },
  },
  'MVNECK-CM26': {
    heroFile: 'MVNECK-CM26 Hero.jpg',
    detailFiles: {
      pocket: 'MVNECK-CM26 Closeup1.jpg',
      seam: 'MVNECK-CM26 Closeup2.jpg',
      custom: 'MVNECK-CM26 Closeup3.jpg',
    },
  },
  'MTSHIRT-CM36': {
    heroFile: 'MTSHIRT-CM36 Hero.jpg',
    detailFiles: {
      pocket: 'MTSHIRT-CM36 Closeup1.jpg',
      seam: 'MTSHIRT-CM36 Closeup2.jpg',
    },
  },
  'MTSHIRT-CM40': {
    heroFile: 'MTSHIRT-CM40 Hero.jpg',
    detailFiles: {
      pocket: 'MTSHIRT-CM40 Closeup1.jpg',
      seam: 'MTSHIRT-CM40 Closeup2.jpg',
      custom: 'MTSHIRT-CM40 Closeup3.jpg',
    },
  },
  'WVNECK-MD': {
    heroFile: 'WVNECK-MD Hero.jpg',
    detailFiles: {
      pocket: 'WVNECK-MD Closeup1.jpg',
      seam: 'WVNECK-MD Closeup2.jpg',
      custom: 'WVNECK-MD Closeup3.jpg',
    },
  },
  'WTSHIRT-MD1': {
    heroFile: 'WTSHIRT-MD1 Hero.jpg',
    detailFiles: {
      pocket: 'WTSHIRT-MD1 Closeup1.jpg',
      seam: 'WTSHIRT-MD1 Closeup2.jpg',
    },
  },
  'WTSHIRT-MD2': {
    heroFile: 'WTSHIRT-MD2 Hero.jpg',
    detailFiles: {
      pocket: 'WTSHIRT-MD2 Closeup1.jpg',
      seam: 'WTSHIRT-MD2 Closeup2.jpg',
      custom: 'WTSHIRT-MD2 Closeup3.jpg',
    },
  },
  'WTSHIRT-CM262': {
    heroFile: 'WTSHIRT-CM262 Hero.jpg',
    detailFiles: {
      pocket: 'WTSHIRT-CM262 Closeup1.jpg',
      seam: 'WTSHIRT-CM262 Closeup2.jpg',
      custom: 'WTSHIRT-CM262 Closeup3.jpg',
    },
  },
  'WTSHIRT-CM402': {
    heroFile: 'WTSHIRT-CM402 Hero.jpg',
    detailFiles: {
      pocket: 'WTSHIRT-CM402 Closeup1.jpg',
      seam: 'WTSHIRT-CM402 Closeup2.jpg',
      custom: 'WTSHIRT-CM402 Closeup3.jpg',
    },
  },
  WTSHIRT1: {
    heroFile: 'WTSHIRT1-CM30 Hero.jpg',
    detailFiles: {
      pocket: 'WTSHIRT1-CM30 Closeup1.jpg',
      seam: 'WTSHIRT1-CM30 Closeup2.jpg',
      custom: 'WTSHIRT1-CM30 Closeup3.jpg',
    },
  },
  WTSHIRT2: {
    heroFile: 'WTSHIRT2 Hero.jpg',
    detailFiles: {
      pocket: 'WTSHIRT2 Closeup1.jpg',
      seam: 'WTSHIRT2 Closeup2.jpg',
    },
  },
  'WBSK001-A82': {
    heroFile: 'WBSK001-A82 Hero.jpg',
    detailFiles: {
      pocket: 'WBSK001-A82 Closeup1.jpg',
      seam: 'WBSK001-A82 Closeup2.jpg',
      custom: 'WBSK001-A82 Closeup3.jpg',
    },
  },
  'WBSK002-A82': {
    heroFile: 'WBSK002-A82 Hero.jpg',
    detailFiles: {
      pocket: 'WBSK002-A82 Closeup1.jpg',
      seam: 'WBSK002-A82 Closeup2.jpg',
      custom: 'WBSK002-A82 Closeup3.jpg',
    },
  },
  WSP0001: {
    heroFile: 'WSP0001 Hero.jpg',
    detailFiles: {},
  },
};
