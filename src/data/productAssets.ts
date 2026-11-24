export interface ProductAssetMapping {
  title: string;
  productUrl: string;
  sourceImage: string;
  heroFile?: string;
  followingFiles?: string[];
}

export const PRODUCT_ASSETS: Record<string, ProductAssetMapping> = {
  MSPA28: {
    title: "Men's Straight-Leg Shorts Pant",
    productUrl: 'https://dtuniforms.com/product/the-mens-straight-leg-shorts-pant-mspa28/?attribute_pa_color=gray',
    sourceImage: 'DT289092-1.jpg',
    heroFile: 'DT289092.JPG',
    followingFiles: ['DT289093.JPG', 'DT289094.JPG', 'DT289095.JPG'],
  },
  MLPA82: {
    title: "Men's Straight-Leg Trouser Pants",
    productUrl: 'https://dtuniforms.com/product/the-mens-straight-leg-trouser-pants-mlpa82/?attribute_pa_color=black',
    sourceImage: 'DT288528-1.jpg',
    heroFile: 'DT288528.JPG',
    followingFiles: ['DT288529.JPG', 'DT288530.JPG', 'DT288531.JPG'],
  },
  MLPA28: {
    title: "Men's Straight-Leg Trouser Pants",
    productUrl: 'https://dtuniforms.com/product/the-mens-straight-leg-trouser-pants-mlpa28/?attribute_pa_color=kaki',
    sourceImage: 'DT289470-1.jpg',
    heroFile: 'DT289470.JPG',
  },
  MSPK03: {
    title: "Men's Straight-Leg Khaki Shorts",
    productUrl: 'https://dtuniforms.com/product/the-mens-straight-leg-khaki-shorts-mspk03/?attribute_pa_color=green-olive',
    sourceImage: 'DT288213-1.jpg',
    heroFile: 'DT288213.JPG',
    followingFiles: ['DT288214.JPG'],
  },
  'MPOLO-SL201': {
    title: "Men's 100% Cotton Polo Shirt",
    productUrl: 'https://dtuniforms.com/product/the-mens-100-cotton-polo-shirt-mpolo-sl201/?attribute_pa_color=burnt-orange',
    sourceImage: 'DT289126.jpg',
    heroFile: 'DT289126.JPG',
    followingFiles: ['DT289127.JPG', 'DT289128.JPG', 'DT289129.JPG'],
  },
  'MPOLO-PQ4': {
    title: "Men's Concealed-Zip Polo Shirt",
    productUrl: 'https://dtuniforms.com/product/the-mens-concealed-zip-polo-shirt-mpolo-pq4/?attribute_pa_color=black',
    sourceImage: 'DT288602.jpg',
    heroFile: 'DT288602.JPG',
    followingFiles: ['DT288603.JPG', 'DT288604.JPG', 'DT288605.JPG'],
  },
  'MPOLO-PQ2': {
    title: "Men's 3-Button Polo Shirt",
    productUrl: 'https://dtuniforms.com/product/the-mens-3-button-polo-shirt-mpolo-pq2/?attribute_pa_color=light-pink-orce',
    sourceImage: 'DT288259.jpg',
    heroFile: 'DT288259.JPG',
    followingFiles: ['DT288260.JPG', 'DT288261.JPG', 'DT288262.JPG'],
  },
  'MVNECK-CM26': {
    title: "Men's V-Neck T-Shirt",
    productUrl: 'https://dtuniforms.com/product/the-mens-v-neck-t-shirt-mvneck-cm26/?attribute_pa_color=dark-gray',
    sourceImage: 'DT289400.jpg',
    heroFile: 'DT289400.JPG',
    followingFiles: ['DT289401.JPG', 'DT289402.JPG', 'DT289403.JPG'],
  },
  'MTSHIRT-MD1': {
    title: "Men's Straight-Fit Crew Neck T-Shirt",
    productUrl: 'https://dtuniforms.com/product/the-mens-straight-fit-crew-neck-t-shirt-mtshirt-md1/?attribute_pa_color=light-gary',
    sourceImage: 'DT288902.jpg',
    heroFile: 'DT288902.JPG',
    followingFiles: ['DT288903.JPG', 'DT288904.JPG', 'DT288905.JPG'],
  },
  'MTSHIRT-CM36': {
    title: "Men's Crew Neck T-Shirt",
    productUrl: 'https://dtuniforms.com/product/the-mens-crew-neck-t-shirt-ntshirt-cm36/?attribute_pa_color=light-blue',
    sourceImage: 'DT2185.jpg',
  },
  'MTSHIRT-CM40': {
    title: "Men's Crew Neck T-Shirt",
    productUrl: 'https://dtuniforms.com/product/the-mens-crew-neck-t-shirt-mtshirt-cm40/?attribute_pa_color=dark-gray',
    sourceImage: 'DT3074.jpg',
  },
  'MTSHIRT-MD3': {
    title: "Men's Button-Neck Pocket T-Shirt",
    productUrl: 'https://dtuniforms.com/product/the-mens-button-neck-pocker-t-shirt-mtshirt-md3/?attribute_pa_color=white-wht',
    sourceImage: 'DT3236.jpg',
  },
  'MTSHIRT-MD2': {
    title: "Men's Button-Placket Crew Neck T-Shirt",
    productUrl: 'https://dtuniforms.com/product/the-mens-button-placket-crew-neck-t-shirt-mtshirt-md2/?attribute_pa_color=light-gary',
    sourceImage: 'DT2693.jpg',
  },
  'MPOLO-SL203': {
    title: "Men's 100% Cotton Zip Polo Shirt",
    productUrl: 'https://dtuniforms.com/product/the-mens-100-cotton-zip-polo-shirt-mpolo-sl203/?attribute_pa_color=kaki',
    sourceImage: 'DT2029.jpg',
  },
  'MPOLO-MD2': {
    title: "Men's Faux-Pocket Polo Shirt",
    productUrl: 'https://dtuniforms.com/product/the-mens-faux-pocket-polo-shirt-mpolo-md2/?attribute_pa_color=green-mint',
    sourceImage: 'DT2882.jpg',
  },
  'MPOLO-MD4': {
    title: "Men's Concealed-Zip Polo Shirt",
    productUrl: 'https://dtuniforms.com/product/the-mens-concealed-zip-polo-shirt-mpolo-md4/?attribute_pa_color=black',
    sourceImage: 'DT2497.jpg',
  },
  'MPOLO-MD1': {
    title: "Men's 3-Button Polo Shirt",
    productUrl: 'https://dtuniforms.com/product/the-mens-3-button-polo-shirt-mpolo-md1/?attribute_pa_color=light-gary',
    sourceImage: 'DT2284.jpg',
  },
  'WBSK001-A82': {
    title: "Women's A-Line Skort",
    productUrl: 'https://dtuniforms.com/product/the-womens-a-line-skort-wbsk001-a82/?attribute_pa_color=black',
    sourceImage: 'DT288977-1.jpg',
    heroFile: 'DT288977.JPG',
    followingFiles: ['DT288978.JPG', 'DT288979.JPG', 'DT288980.JPG'],
  },
  'WBS0002-A82': {
    title: "Women's A-Line Shorts",
    productUrl: 'https://dtuniforms.com/product/the-womens-a-line-shorts-wbs0002-a82/?attribute_pa_color=light-gary',
    sourceImage: 'DT288826-1.jpg',
    heroFile: 'DT288826.JPG',
    followingFiles: ['DT288827.JPG', 'DT288828.JPG', 'DT288829.JPG'],
  },
  'WBSK002-A82': {
    title: "Women's Low-Rise Skort",
    productUrl: 'https://dtuniforms.com/product/the-womens-low-rise-skort-wbsk002-a82/?attribute_pa_color=white-cream',
    sourceImage: 'DT289254-1.jpg',
    heroFile: 'DT289254.JPG',
    followingFiles: ['DT289255.JPG', 'DT289256.JPG', 'DT289257.JPG'],
  },
  WSP0001: {
    title: "Women's A-Line Pleated Skirt",
    productUrl: 'https://dtuniforms.com/product/the-womens-a-line-pleated-skirt-wsp0001/?attribute_pa_color=black',
    sourceImage: '717-1.jpg',
  },
  'WPOLO-YD1': {
    title: "Women's Slim-Fit 5-Button Polo Shirt",
    productUrl: 'https://dtuniforms.com/product/the-womens-slim-fit-5-button-polo-shirt-wpolo-yd1/?attribute_pa_color=green-mint',
    sourceImage: 'DT289282.jpg',
    heroFile: 'DT289282.JPG',
    followingFiles: ['DT289283.JPG', 'DT289284.JPG', 'DT289285.JPG'],
  },
  'WBS0003-A82': {
    title: "Women's Elastic-Back A-Line Shorts",
    productUrl: 'https://dtuniforms.com/product/the-womens-elastic-back-a-line-shorts-wbs0003-a82/?attribute_pa_color=black',
    sourceImage: 'DT288063-1.jpg',
    heroFile: 'DT288063.JPG',
    followingFiles: ['DT288064.JPG', 'DT288065.JPG', 'DT288066.JPG'],
  },
  'WPOLO-MD1': {
    title: "Women's Slim-Fit Zip Polo Shirt",
    productUrl: 'https://dtuniforms.com/product/the-womens-slim-fit-zip-polo-shirt-wpolo-md1/?attribute_pa_color=black',
    sourceImage: 'DT288437.jpg',
    heroFile: 'DT288437.JPG',
    followingFiles: ['DT288438.JPG', 'DT288439.JPG', 'DT288440.JPG'],
  },
  'WTSHIRT-MD2': {
    title: "Women's Trimmed Straight-Fit T-Shirt",
    productUrl: 'https://dtuniforms.com/product/the-womens-trimmed-straight-fit-t-shirt-wtshirt-md2/?attribute_pa_color=white-wht',
    sourceImage: 'DT288096.jpg',
    heroFile: 'DT288096.JPG',
    followingFiles: ['DT288097.JPG', 'DT288098.JPG', 'DT288099.JPG'],
  },
  'WTSHIRT-MD1': {
    title: "Women's Cropped Slim-Fit T-Shirt",
    productUrl: 'https://dtuniforms.com/product/the-womens-cropped-slim-fit-t-shirt-wtshirt-md1/?attribute_pa_color=green-gray-b8385',
    sourceImage: 'DT288742.jpg',
    heroFile: 'DT288742.JPG',
    followingFiles: ['DT288743.JPG', 'DT288744.JPG', 'DT288745.JPG'],
  },
  'WTSHIRT-CM402': {
    title: "Women's Oversized T-Shirt",
    productUrl: 'https://dtuniforms.com/product/the-womens-oversized-t-shirt-wtshirt-cm402/?attribute_pa_color=pastel-orange',
    sourceImage: '4875.jpg',
  },
  'WTSHIRT-CM262': {
    title: "Women's Cinched-Waist Crew Neck T-Shirt",
    productUrl: 'https://dtuniforms.com/product/the-womens-cinched-waist-crew-neck-t-shirt-wtshirt-cm262/?attribute_pa_color=white-wht',
    sourceImage: '4193.jpg',
  },
  WTSHIRT2: {
    title: "Women's Relaxed Crop Top",
    productUrl: 'https://dtuniforms.com/product/the-womens-relaxed-crop-top-wtshirt2/?attribute_pa_color=white-cream',
    sourceImage: '5953.jpg',
  },
  'WPOLO-YD2': {
    title: "Women's Contrast-Trim Polo Shirt",
    productUrl: 'https://dtuniforms.com/product/the-womens-contrast-trim-polo-shirt-wpolo-yd2/?attribute_pa_color=pink-neon',
    sourceImage: 'DT-2278-15.jpg',
  },
  'WPOLO-MD2': {
    title: "Women's 5-Button Polo Shirt",
    productUrl: 'https://dtuniforms.com/product/the-womens-5-button-polo-shirt-wpolo-md2/?attribute_pa_color=yellow',
    sourceImage: 'DT19-10-8.jpg',
  },
  'WVNECK-MD': {
    title: "Women's Cinched-Waist V-Neck T-Shirt",
    productUrl: 'https://dtuniforms.com/product/the-womens-cinched-waist-v-neck-t-shirt-wvneck-md/?attribute_pa_color=gray-mouse',
    sourceImage: '876.jpg',
  },
};

export function getExpectedImageFile(sourceImage: string): string {
  return sourceImage.replace(/-1(?=\.[^.]+$)/, '');
}
