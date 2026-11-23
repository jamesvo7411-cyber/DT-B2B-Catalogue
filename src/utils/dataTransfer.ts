import type { GarmentCategory, GarmentGender, GarmentItem } from '../types/catalogue';
import {
  buildDefaultDescriptionBullets,
  buildDefaultKeyFeatures,
} from '../data/garments';

const CSV_HEADERS = [
  'index',
  'sku',
  'gender',
  'genderCode',
  'category',
  'title',
  'fabricCode',
  'composition',
  'weightGsm',
  'fabricWidth',
  'colorCount',
  'colorways',
  'stretchFeelNote',
  'stitchDensity',
  'seamFinish',
  'pocketConstruction',
  'moq',
  'leadTime',
  'heroImageUrl',
  'pocketImageUrl',
  'seamImageUrl',
  'swatchImageUrl',
  'customImageUrl',
  'productUrl',
  'videoUrl',
  'dataFlags',
] as const;

function escapeCsvCell(value: string | number): string {
  const str = String(value ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportGarmentsToCsv(garments: GarmentItem[]): string {
  const rows: string[] = [CSV_HEADERS.join(',')];
  for (const g of garments) {
    rows.push(
      [
        g.index,
        g.sku,
        g.gender,
        g.genderCode,
        g.category,
        g.title,
        g.specs.fabricRollRef,
        g.specs.composition,
        g.specs.weightGsm,
        g.specs.fabricWidth,
        g.colorCount,
        g.colorways.join('; '),
        g.specs.stretchFeelNote,
        g.specs.stitchDensity,
        g.specs.seamFinish,
        g.specs.pocketConstruction,
        g.specs.moq,
        g.specs.leadTime,
        g.media.hero.url.startsWith('data:') ? '' : g.media.hero.url,
        g.media.pocket.url.startsWith('data:') ? '' : g.media.pocket.url,
        g.media.seam.url.startsWith('data:') ? '' : g.media.seam.url,
        g.media.swatch.url.startsWith('data:') ? '' : g.media.swatch.url,
        g.media.custom.url.startsWith('data:') ? '' : g.media.custom.url,
        g.productUrl,
        g.videoUrl,
        (g.dataFlags ?? []).join('; '),
      ]
        .map(escapeCsvCell)
        .join(',')
    );
  }
  return rows.join('\n');
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && next === '\n') i++;
      row.push(cell);
      if (row.some((c) => c.trim() !== '')) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += ch;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    if (row.some((c) => c.trim() !== '')) rows.push(row);
  }
  return rows;
}

const VALID_CATEGORIES: GarmentCategory[] = [
  'Trousers',
  'Shorts',
  'Polos',
  'Tees & V-Necks',
  'Skirts',
];

function inferChapter(cat: GarmentCategory): string {
  switch (cat) {
    case 'Trousers':
      return 'I';
    case 'Shorts':
      return 'II';
    case 'Polos':
      return 'III';
    case 'Tees & V-Necks':
      return 'IV';
    case 'Skirts':
      return 'V';
  }
}

export function importGarmentsFromCsv(
  csvText: string,
  baseGarments: GarmentItem[]
): GarmentItem[] {
  const rows = parseCsvRows(csvText);
  if (rows.length < 2) {
    throw new Error('CSV file must include a header row and at least one product row.');
  }

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const colIndex = (name: string) => header.indexOf(name.toLowerCase());
  const get = (cells: string[], ...aliases: string[]): string => {
    for (const a of aliases) {
      const idx = colIndex(a);
      if (idx >= 0 && cells[idx] !== undefined) return cells[idx].trim();
    }
    return '';
  };

  const baseBySku = new Map(baseGarments.map((g) => [g.sku.toLowerCase(), g]));

  return rows.slice(1).map((cells, idx) => {
    const sku = get(cells, 'sku', 'style code', 'style_code') || `STYLE-${idx + 1}`;
    const existing = baseBySku.get(sku.toLowerCase());
    const rawGender = get(cells, 'gender').toLowerCase();
    const gender: GarmentGender =
      rawGender.includes('women') || rawGender === 'nữ' || rawGender === 'nu'
        ? 'Women'
        : rawGender.includes('men') || rawGender === 'nam'
          ? 'Men'
          : existing?.gender ?? 'Men';
    const genderCode = gender === 'Women' ? 'Nữ' : 'Nam';

    const rawCategory = get(cells, 'category') as GarmentCategory;
    const category: GarmentCategory = VALID_CATEGORIES.includes(rawCategory)
      ? rawCategory
      : existing?.category ?? 'Tees & V-Necks';

    const fabricCode =
      get(cells, 'fabricCode', 'swatchbook fab code', 'swatchbook_code') ||
      existing?.specs.fabricRollRef ||
      'UNSPECIFIED';
    const composition =
      get(cells, 'composition', 'fabric content', 'fabric_content') ||
      existing?.specs.composition ||
      '[Source Pending]';
    const weightGsm =
      get(cells, 'weightGsm', 'gsm', 'gsm (typical)') ||
      existing?.specs.weightGsm ||
      'TBD';
    const fabricWidth =
      get(cells, 'fabricWidth', 'width', 'width (typical)') ||
      existing?.specs.fabricWidth ||
      'TBD';

    const rawColorways = get(cells, 'colorways', 'available colors');
    const colorways = rawColorways
      ? rawColorways
          .split(/[;,]/)
          .map((c) => c.trim())
          .filter(Boolean)
      : existing?.colorways ?? ['Black', 'White'];
    const rawColorCount = Number(get(cells, 'colorCount', '# colors'));
    const colorCount = Number.isFinite(rawColorCount) && rawColorCount > 0
      ? rawColorCount
      : colorways.length;

    const heroUrl = get(cells, 'heroImageUrl', 'hero_url');
    const pocketUrl = get(cells, 'pocketImageUrl', 'pocket_url');
    const seamUrl = get(cells, 'seamImageUrl', 'seam_url');
    const swatchUrl = get(cells, 'swatchImageUrl', 'swatch_url');
    const customUrl = get(cells, 'customImageUrl', 'custom_url');

    const title = get(cells, 'title', 'product', 'style name') || existing?.title || sku;
    const seamFinish =
      get(cells, 'seamFinish', 'seam_finish') ||
      existing?.specs.seamFinish ||
      'Clean overlocked & reinforced structural seams';
    const pocketConstruction =
      get(cells, 'pocketConstruction', 'pocket_construction') ||
      existing?.specs.pocketConstruction ||
      'Reinforced stress-point construction';
    const stitchDensity =
      get(cells, 'stitchDensity', 'stitch_density') ||
      existing?.specs.stitchDensity ||
      '16–18 SPI';

    const nextSpecs = {
      fabricRollRef: fabricCode,
      composition,
      weightGsm,
      fabricWidth,
      stretchFeelNote:
        get(cells, 'stretchFeelNote', 'stretch_feel') ||
        existing?.specs.stretchFeelNote ||
        'Balanced drape and recovery calibrated for B2B commercial wear',
      stitchDensity,
      seamFinish,
      pocketConstruction,
      cmOemOdmScope: existing?.specs.cmOemOdmScope ?? 'CM / OEM / ODM Ready',
      sizeRun:
        existing?.specs.sizeRun ??
        (gender === 'Men' ? 'S / M / L / XL / XXL' : 'XS / S / M / L / XL'),
      moq: get(cells, 'moq') || existing?.specs.moq || '120 pcs / color',
      leadTime:
        get(cells, 'leadTime', 'lead_time') ||
        existing?.specs.leadTime ||
        '4 – 6 Weeks Ex-Factory',
      wholesaleRef: existing?.specs.wholesaleRef ?? 'CM / OEM / ODM Quote',
    };

    const rawFlags = get(cells, 'dataFlags', 'data_flags');
    const dataFlags = rawFlags
      ? rawFlags
          .split(/[;|]/)
          .map((f) => f.trim())
          .filter(Boolean)
      : existing?.dataFlags;

    const num = idx + 1;
    const numPad = String(num).padStart(2, '0');

    return {
      id: existing?.id ?? `garment-${numPad}`,
      index: num,
      sku,
      title,
      gender,
      genderCode,
      productGroupVi: existing?.productGroupVi ?? category,
      category,
      chapterNumeral: inferChapter(category),
      summary:
        existing?.summary ??
        `Cut from swatchbook fabric ${fabricCode} (${composition}, ${weightGsm}, ${fabricWidth}).`,
      descriptionBullets:
        existing?.descriptionBullets ?? buildDefaultDescriptionBullets(nextSpecs),
      keyFeatures: existing?.keyFeatures ?? buildDefaultKeyFeatures(nextSpecs),
      colorCount,
      colorways,
      dataFlags,
      productUrl:
        get(cells, 'productUrl', 'product_url') ||
        existing?.productUrl ||
        `https://dreamtomorrow.studio/b2b/line-sheet/${sku.toLowerCase()}`,
      videoUrl: get(cells, 'videoUrl', 'video_url') || existing?.videoUrl || '',
      videoTitle: existing?.videoTitle ?? `${sku} Drape & Movement Study`,
      specs: nextSpecs,
      media: {
        hero: {
          ...(existing?.media.hero ?? {
            caption: `Fig. ${numPad}.A — ${sku} Primary Silhouette`,
            aspectLabel: '3:4 Portrait Plate',
            note: 'Primary silhouette shot',
          }),
          url: heroUrl || existing?.media.hero.url || '',
          stage: heroUrl ? 'studio-final' : existing?.media.hero.stage ?? 'blank',
        },
        pocket: {
          ...(existing?.media.pocket ?? {
            caption: `Fig. ${numPad}.B — Pocket & Placket Construction`,
            aspectLabel: '4:3 Macro Plate',
            note: pocketConstruction,
          }),
          url: pocketUrl || existing?.media.pocket.url || '',
          stage: pocketUrl ? 'studio-final' : existing?.media.pocket.stage ?? 'blank',
        },
        seam: {
          ...(existing?.media.seam ?? {
            caption: `Fig. ${numPad}.C — Inner Seam & Binding`,
            aspectLabel: '4:3 Macro Plate',
            note: seamFinish,
          }),
          url: seamUrl || existing?.media.seam.url || '',
          stage: seamUrl ? 'studio-final' : existing?.media.seam.stage ?? 'blank',
        },
        swatch: {
          ...(existing?.media.swatch ?? {
            caption: `Fig. ${numPad}.D — ${fabricCode} Texture Swatch`,
            aspectLabel: '1:1 Textile Plate',
            note: `${fabricCode} · ${composition} · ${weightGsm}`,
          }),
          url: swatchUrl || existing?.media.swatch.url || '',
          stage: swatchUrl ? 'studio-final' : existing?.media.swatch.stage ?? 'blank',
        },
        custom: {
          ...(existing?.media.custom ?? {
            caption: `Fig. ${numPad}.E — Custom Fit / Label / Trim Note`,
            aspectLabel: '4:3 Custom Plate',
            note: 'Optional B2B trim, hangtag, or fit-session photograph',
          }),
          url: customUrl || existing?.media.custom.url || '',
          stage: customUrl ? 'studio-final' : existing?.media.custom.stage ?? 'blank',
        },
      },
    };
  });
}
