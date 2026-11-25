/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Download, RotateCcw, Upload } from 'lucide-react';
import type {
  CatalogueSection,
  GarmentCategory,
  GarmentItem,
  ImageCrop,
  MediaSlot,
  MediaSlotKey,
  MetallicTheme,
  PrintConfig,
} from './types/catalogue';
import {
  BRAND_LOGO_PATH,
  DEFAULT_CATALOGUE_META,
  METALLIC_THEMES,
  buildDefaultDescriptionBullets,
  buildDefaultKeyFeatures,
  createInitialGarments,
  getFabricSwatchSpreadPage,
  getProductSpreadOffset,
} from './data/garments';
import {
  getFactoryFabricHeroImageKey,
  getPreferredFactoryFabricImage,
} from './data/factoryFabricColors';
import { exportGarmentsToCsv, importGarmentsFromCsv } from './utils/dataTransfer';
import { FlipbookStage } from './components/FlipbookStage';
import { FabricSwatchBoard } from './components/FabricSwatchBoard';
import { CatalogueIndex } from './components/CatalogueIndex';
import { PrintSheetPreview } from './components/PrintSheetPreview';
import { ProductShowcasePage } from './components/ProductShowcasePage';
import { useIsMobile } from './hooks/useIsMobile';
import { SlotEditorDrawer } from './components/SlotEditorDrawer';
import {
  ExportPdfModal,
  MacroLightboxModal,
  VideoStudyModal,
} from './components/MediaModals';

const STORAGE_KEY = 'dream-tomorrow-catalogue-v3';
const FACTORY_DATA_VERSION = 2;
type CatalogueViewMode = 'interactive' | 'classic' | 'closeup';

interface SavedState {
  garments: GarmentItem[];
  catalogueDataVersion?: number;
  metallicTheme: MetallicTheme;
  shortlist: string[];
  coverCustomImage?: string;
  fabricColorImages?: Record<string, string>;
}

function hydrateGarments(
  savedGarments: GarmentItem[],
  factoryDataIsCurrent: boolean
): GarmentItem[] {
  const savedById = new Map(savedGarments.map((garment) => [garment.id, garment]));
  return createInitialGarments().map((defaults) => {
    const saved = savedById.get(defaults.id);
    if (!saved) return defaults;
    const savedCustom = saved.media?.custom;
    const savedSpecs = saved.specs ?? defaults.specs;
    const isLegacyCustomPlaceholder =
      savedCustom &&
      !savedCustom.url &&
      savedCustom.caption ===
        `Fig. ${String(defaults.index).padStart(2, '0')}.E — Custom Fit / Label / Trim Note` &&
      savedCustom.note === 'Optional B2B care label, hardware, or fit-session photo';

    return {
      ...defaults,
      ...saved,
      sku: defaults.sku,
      summary: factoryDataIsCurrent ? saved.summary : defaults.summary,
      title: defaults.title,
      productUrl: defaults.productUrl,
      colorCount: factoryDataIsCurrent ? saved.colorCount : defaults.colorCount,
      colorways:
        factoryDataIsCurrent && Array.isArray(saved.colorways) && saved.colorways.length > 0
          ? saved.colorways
          : [...defaults.colorways],
      dataFlags: factoryDataIsCurrent ? saved.dataFlags ?? defaults.dataFlags : defaults.dataFlags,
      descriptionBullets:
        factoryDataIsCurrent &&
        Array.isArray(saved.descriptionBullets) &&
        saved.descriptionBullets.length > 0
          ? saved.descriptionBullets
          : buildDefaultDescriptionBullets(
              factoryDataIsCurrent ? savedSpecs : defaults.specs
            ),
      keyFeatures:
        factoryDataIsCurrent && Array.isArray(saved.keyFeatures) && saved.keyFeatures.length > 0
          ? saved.keyFeatures
          : buildDefaultKeyFeatures(
              factoryDataIsCurrent ? savedSpecs : defaults.specs
            ),
      specs: {
        ...defaults.specs,
        ...savedSpecs,
        ...(factoryDataIsCurrent
          ? {}
          : {
              fabricRollRef: defaults.specs.fabricRollRef,
              composition: defaults.specs.composition,
              weightGsm: defaults.specs.weightGsm,
              fabricWidth: defaults.specs.fabricWidth,
            }),
      },
      media: {
        ...defaults.media,
        ...saved.media,
        hero: saved.media?.hero?.url ? saved.media.hero : defaults.media.hero,
        pocket: saved.media?.pocket?.url ? saved.media.pocket : defaults.media.pocket,
        seam: saved.media?.seam?.url ? saved.media.seam : defaults.media.seam,
        swatch: saved.media?.swatch?.url ? saved.media.swatch : defaults.media.swatch,
        custom: isLegacyCustomPlaceholder
          ? defaults.media.custom
          : savedCustom ?? defaults.media.custom,
      },
    };
  });
}

function normalizeFabricColorImages(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const images: Record<string, string> = {};
  for (const [key, url] of Object.entries(value as Record<string, unknown>)) {
    if (typeof url === 'string') images[key] = url;
  }
  return images;
}

function loadSavedState(): SavedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedState>;
    if (!Array.isArray(parsed.garments) || parsed.garments.length === 0) {
      return null;
    }
    const factoryDataIsCurrent = parsed.catalogueDataVersion === FACTORY_DATA_VERSION;
    return {
      garments: hydrateGarments(parsed.garments, factoryDataIsCurrent),
      catalogueDataVersion: FACTORY_DATA_VERSION,
      metallicTheme: parsed.metallicTheme ?? 'platinum',
      shortlist: Array.isArray(parsed.shortlist) ? parsed.shortlist : [],
      coverCustomImage: parsed.coverCustomImage ?? '',
      fabricColorImages: normalizeFabricColorImages(parsed.fabricColorImages),
    };
  } catch {
    return null;
  }
}

export default function App() {
  const initialSaved = useMemo(() => loadSavedState(), []);
  const isMobile = useIsMobile();

  const [garments, setGarments] = useState<GarmentItem[]>(
    () => initialSaved?.garments ?? createInitialGarments()
  );
  const [metallicTheme, setMetallicTheme] = useState<MetallicTheme>(
    () => initialSaved?.metallicTheme ?? 'platinum'
  );
  const [shortlist, setShortlist] = useState<string[]>(
    () => initialSaved?.shortlist ?? []
  );
  const [coverCustomImage, setCoverCustomImage] = useState<string>(
    () => initialSaved?.coverCustomImage ?? ''
  );
  const [fabricColorImages, setFabricColorImages] = useState<Record<string, string>>(
    () => initialSaved?.fabricColorImages ?? {}
  );
  const presentationGarments = useMemo(
    () =>
      garments.map((garment) => {
        const fabricCode = garment.specs.fabricRollRef;
        const familyImage = getPreferredFactoryFabricImage(fabricCode, fabricColorImages);
        const imageUrl = familyImage?.imageUrl ?? '';
        const isLocalImage = imageUrl.startsWith('data:');
        const stage: GarmentItem['media']['swatch']['stage'] = imageUrl
          ? isLocalImage
            ? 'ai-concept'
            : 'studio-final'
          : 'blank';
        return {
          ...garment,
          media: {
            ...garment.media,
            swatch: {
              ...garment.media.swatch,
              url: imageUrl,
              stage,
              caption: `${fabricCode} fabric image`,
              aspectLabel: '1:1 fabric texture',
              note: imageUrl
                ? `Auto-linked from the ${fabricCode} fabric library.`
                : `No fabric image is linked to ${fabricCode} yet. Add one in the Fabric Library.`,
              isSessionDrop: isLocalImage,
              crop: { scale: 1, x: 0, y: 0 },
            },
          },
        };
      }),
    [garments, fabricColorImages]
  );

  const [section, setSection] = useState<CatalogueSection>('flipbook');
  const [viewMode, setViewMode] = useState<CatalogueViewMode>('classic');
  const [bookPage, setBookPage] = useState<number>(() =>
    isMobile
      ? getProductSpreadOffset(initialSaved?.garments ?? createInitialGarments())
      : 0
  );
  const [turnRequest, setTurnRequest] = useState<{ dir: 'next' | 'prev'; nonce: number } | null>(null);
  const [activeCategory, setActiveCategory] = useState<GarmentCategory | 'All'>('All');
  const [editMode, setEditMode] = useState<boolean>(false);
  const isClassicMode = viewMode === 'classic' && section === 'flipbook';
  const isCloseupMode = viewMode === 'closeup' && section === 'flipbook';
  const productSpreadOffset = getProductSpreadOffset(garments);
  const totalBookPages = productSpreadOffset + garments.length + 1;

  const [editorState, setEditorState] = useState<{
    garmentIndex: number;
    focusSlot?: MediaSlotKey;
  } | null>(null);
  const [lightboxItem, setLightboxItem] = useState<{
    slot: MediaSlot;
    titleLabel: string;
    garmentTitle: string;
  } | null>(null);
  const [videoGarmentId, setVideoGarmentId] = useState<string | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [printConfig, setPrintConfig] = useState<PrintConfig>({
    scope: 'all',
    orientation: 'landscape',
    showCropMarks: true,
    showBlankGuides: true,
    showSafeZones: false,
    includeCover: true,
    includeIndex: true,
    includeFabrics: true,
  });

  const jsonInputRef = useRef<HTMLInputElement | null>(null);
  const csvInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const t = window.setTimeout(() => setToastMessage(null), 3600);
    return () => window.clearTimeout(t);
  }, [toastMessage]);

  useEffect(() => {
    document.documentElement.setAttribute('data-metallic', metallicTheme);
  }, [metallicTheme]);

  useEffect(() => {
    try {
      const payload: SavedState = {
        garments,
        catalogueDataVersion: FACTORY_DATA_VERSION,
        metallicTheme,
        shortlist,
        coverCustomImage,
        fabricColorImages,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      const message =
        error instanceof DOMException && error.name === 'QuotaExceededError'
          ? 'Browser storage is full. Export the catalogue JSON to back up the images.'
          : `Could not save catalogue changes: ${
              error instanceof Error ? error.message : 'unknown storage error'
            }`;
      setToastMessage(message);
    }
  }, [garments, metallicTheme, shortlist, coverCustomImage, fabricColorImages]);

  const triggerTurn = (dir: 'next' | 'prev') => {
    setTurnRequest((prev) => ({ dir, nonce: (prev?.nonce ?? 0) + 1 }));
  };

  // Keyboard navigation in Diagonal Page-Curl Flipbook mode
  useEffect(() => {
    if (
      section !== 'flipbook' ||
      editorState ||
      lightboxItem ||
      videoGarmentId ||
      exportModalOpen
    ) {
      return;
    }
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (viewMode === 'closeup' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        const firstProductPage = productSpreadOffset;
        const lastProductPage = firstProductPage + garments.length - 1;
        setBookPage((page) =>
          e.key === 'ArrowRight'
            ? page >= lastProductPage ? firstProductPage : page + 1
            : page <= firstProductPage ? lastProductPage : page - 1
        );
      } else if (e.key === 'ArrowRight') {
        if (isMobile) {
          e.preventDefault();
          setBookPage((page) => (page + 1) % totalBookPages);
        } else {
          triggerTurn('next');
        }
      } else if (e.key === 'ArrowLeft') {
        if (isMobile) {
          e.preventDefault();
          setBookPage((page) => (page - 1 + totalBookPages) % totalBookPages);
        } else {
          triggerTurn('prev');
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [section, viewMode, isMobile, garments.length, productSpreadOffset, totalBookPages, editorState, lightboxItem, videoGarmentId, exportModalOpen]);

  const activeProductIndex =
    bookPage >= productSpreadOffset && bookPage < productSpreadOffset + garments.length
      ? bookPage - productSpreadOffset + 1
      : 1;
  const currentGarment = presentationGarments[activeProductIndex - 1] ?? presentationGarments[0];
  const editorGarment = editorState
    ? presentationGarments[editorState.garmentIndex - 1] ?? null
    : null;
  const videoGarment = videoGarmentId
    ? garments.find((g) => g.id === videoGarmentId) ?? null
    : null;

  const categoryGarments = useMemo(
    () =>
      activeCategory === 'All'
        ? presentationGarments
        : presentationGarments.filter((g) => g.category === activeCategory),
    [presentationGarments, activeCategory]
  );

  const printGarments = useMemo(() => {
    if (printConfig.scope === 'current') return [currentGarment];
    if (printConfig.scope === 'shortlist') {
      const list = presentationGarments.filter((g) => shortlist.includes(g.id));
      return list.length > 0 ? list : [currentGarment];
    }
    if (printConfig.scope === 'category') return categoryGarments;
    return presentationGarments;
  }, [printConfig.scope, presentationGarments, categoryGarments, shortlist, currentGarment]);

  const handleUpdateGarment = (updated: GarmentItem) => {
    setGarments((prev) =>
      prev.map((garment) =>
        garment.id === updated.id
          ? {
              ...updated,
              media: { ...updated.media, swatch: garment.media.swatch },
            }
          : garment
      )
    );
  };

  const handleReplaceFile = (garmentId: string, slotKey: MediaSlotKey, dataUrl: string) => {
    if (slotKey === 'swatch') {
      showToast('Fabric images are auto-linked. Manage them in the Fabric Library.');
      return;
    }
    setGarments((prev) =>
      prev.map((g) => {
        if (g.id !== garmentId) return g;
        const currentStage = g.media[slotKey].stage;
        return {
          ...g,
          media: {
            ...g.media,
            [slotKey]: {
              ...g.media[slotKey],
              url: dataUrl,
              crop: undefined,
              isSessionDrop: true,
              stage: currentStage === 'blank' ? 'ai-concept' : currentStage,
            },
          },
        };
      })
    );
    showToast('Image saved in this browser and included in PDF export. Export JSON to back it up.');
  };

  const handleUpdateCrop = (garmentId: string, slotKey: MediaSlotKey, crop: ImageCrop) => {
    if (slotKey === 'swatch') return;
    setGarments((prev) =>
      prev.map((garment) =>
        garment.id === garmentId
          ? {
              ...garment,
              media: {
                ...garment.media,
                [slotKey]: { ...garment.media[slotKey], crop },
              },
            }
          : garment
      )
    );
  };

  const handleReplaceFabricSwatch = (fabricCode: string, dataUrl: string) => {
    setFabricColorImages((previous) => ({
      ...previous,
      [getFactoryFabricHeroImageKey(fabricCode)]: dataUrl,
    }));
    showToast(`Fabric hero for ${fabricCode} saved in the Fabric Library.`);
  };

  const handleReplaceFabricColorImage = (imageKey: string, dataUrl: string) => {
    setFabricColorImages((previous) => ({ ...previous, [imageKey]: dataUrl }));
    showToast('Color-specific fabric image saved in this browser.');
  };

  const handleSaveVideo = (garmentId: string, videoUrl: string, videoTitle: string) => {
    setGarments((prev) =>
      prev.map((g) => (g.id === garmentId ? { ...g, videoUrl, videoTitle } : g))
    );
    showToast(videoUrl ? 'Embedded motion study saved.' : 'Motion study cleared.');
  };

  const handleToggleShortlist = (id: string) => {
    setShortlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExportJson = () => {
    const payload = JSON.stringify(
      {
        brand: 'Dream Tomorrow (DT)',
        exportedAt: new Date().toISOString(),
        catalogueDataVersion: FACTORY_DATA_VERSION,
        metallicTheme,
        shortlist,
        garments,
        fabricColorImages,
      },
      null,
      2
    );
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dot-b2b-catalogue-manifest.json';
    link.click();
    URL.revokeObjectURL(url);
    showToast('Catalogue manifest exported as JSON, including saved fabric color images.');
  };

  const handleImportJson = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}')) as Partial<SavedState>;
        if (!Array.isArray(parsed.garments) || parsed.garments.length === 0) {
          showToast('Invalid catalogue JSON manifest.');
          return;
        }
        setGarments(
          hydrateGarments(
            parsed.garments,
            parsed.catalogueDataVersion === FACTORY_DATA_VERSION
          )
        );
        setFabricColorImages(normalizeFabricColorImages(parsed.fabricColorImages));
        if (parsed.metallicTheme) setMetallicTheme(parsed.metallicTheme);
        if (Array.isArray(parsed.shortlist)) setShortlist(parsed.shortlist);
        if (typeof parsed.coverCustomImage === 'string') {
          setCoverCustomImage(parsed.coverCustomImage);
        }
        setBookPage(0);
        showToast(`Loaded ${parsed.garments.length} styles from JSON manifest.`);
      } catch {
        showToast('Could not parse JSON manifest.');
      }
    };
    reader.readAsText(file);
  };

  const handleExportCsv = () => {
    const csv = exportGarmentsToCsv(garments);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dot-b2b-product-list.csv';
    link.click();
    URL.revokeObjectURL(url);
    showToast('43-style product list exported as CSV.');
  };

  const handleImportCsv = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = importGarmentsFromCsv(String(reader.result || ''), garments);
        setGarments(imported);
        setBookPage(0);
        showToast(`Imported ${imported.length} styles from CSV.`);
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Could not parse CSV file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetBlank = () => {
    setGarments(createInitialGarments());
    setFabricColorImages({});
    setShortlist([]);
    setCoverCustomImage('');
    setBookPage(0);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    showToast('Catalogue reset to clean 43-style DT template.');
  };

  const handleExecutePrint = () => {
    setExportModalOpen(false);
    window.setTimeout(() => {
      window.print();
    }, 120);
  };

  const handleExportCurrentProductPdf = (garmentIndex: number) => {
    setBookPage(productSpreadOffset + garmentIndex - 1);
    setPrintConfig((prev) => ({ ...prev, scope: 'current', orientation: 'landscape' }));
    setExportModalOpen(true);
  };

  const navigateSection = (target: CatalogueSection) => {
    setSection(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectFabricCode = (fabricCode: string) => {
    if (viewMode === 'closeup') setViewMode('classic');
    setSection('flipbook');
    setBookPage(getFabricSwatchSpreadPage(fabricCode, garments));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewModeChange = (mode: CatalogueViewMode) => {
    setViewMode(mode);
    setSection('flipbook');
    if (mode !== 'interactive') {
      setEditMode(false);
      setEditorState(null);
      setVideoGarmentId(null);
      setExportModalOpen(false);
      setLightboxItem(null);
    }
    if (mode === 'closeup') {
      if (bookPage < productSpreadOffset || bookPage >= productSpreadOffset + garments.length) {
        setBookPage(productSpreadOffset);
      }
    }
  };

  const catalogueNavItems: { id: CatalogueSection; label: string }[] =
    viewMode === 'interactive'
      ? [
          { id: 'flipbook', label: 'Flipbook' },
          { id: 'fabrics', label: 'Fabrics' },
          { id: 'index', label: 'Collection' },
          { id: 'print', label: 'Print Sheet' },
        ]
      : viewMode === 'classic'
        ? [
            { id: 'flipbook', label: 'Flipbook' },
            { id: 'fabrics', label: 'Fabrics' },
          ]
        : [];

  const viewModeToggle = (
    <div
      role="group"
      aria-label="Catalogue viewing mode"
      className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-[#D5D5D5] bg-[#F3F3F3] p-1"
    >
      <button
        type="button"
        aria-label="Workbench"
        aria-pressed={viewMode === 'interactive'}
        onClick={() => handleViewModeChange('interactive')}
        className={`rounded-full px-1.5 py-1 text-[9px] font-medium transition-colors sm:px-3 sm:py-1.5 sm:text-[11px] ${
          viewMode === 'interactive'
            ? 'bg-[#111111] text-white shadow-sm'
            : 'text-[#555555] hover:text-[#111111]'
        }`}
      >
        <span className="sm:hidden">Work</span>
        <span className="hidden sm:inline">Workbench</span>
      </button>
      <button
        type="button"
        aria-label="Buyer"
        aria-pressed={viewMode === 'classic'}
        onClick={() => handleViewModeChange('classic')}
        className={`rounded-full px-1.5 py-1 text-[9px] font-medium transition-colors sm:px-3 sm:py-1.5 sm:text-[11px] ${
          viewMode === 'classic'
            ? 'bg-[#111111] text-white shadow-sm'
            : 'text-[#555555] hover:text-[#111111]'
        }`}
      >
        Buyer
      </button>
      <button
        type="button"
        aria-label="Editorial"
        aria-pressed={viewMode === 'closeup'}
        onClick={() => handleViewModeChange('closeup')}
        className={`rounded-full px-1.5 py-1 text-[9px] font-medium transition-colors sm:px-3 sm:py-1.5 sm:text-[11px] ${
          viewMode === 'closeup'
            ? 'bg-[#111111] text-white shadow-sm'
            : 'text-[#555555] hover:text-[#111111]'
        }`}
      >
        Editorial
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A]">
      {/* Dynamic @page print orientation rule */}
      <style>{`@page { size: A4 ${printConfig.orientation}; margin: 8mm; }`}</style>

      {/* ====================================================================
          INTERACTIVE WEB SHELL (Hidden during high-resolution PDF print)
          ==================================================================== */}
      <div className="no-print flex min-h-screen flex-col">
        {/* TOP BAR CONTRACT: Strictly 1 row, 3 zones separated by gap-8 */}
        <header
          className={`border-b border-[#E5E5E5] bg-white/95 backdrop-blur-xs ${
            section === 'fabrics' ? 'sticky top-0 z-30' : 'md:sticky md:top-0 md:z-30'
          }`}
        >
          <div className="mx-auto flex h-16 max-w-[1380px] items-center justify-between gap-3 px-4 sm:px-6 lg:gap-8 lg:px-10">
            {/* Zone 1: Single-line Brand Wordmark */}
            <button
              type="button"
              onClick={() => {
                setBookPage(viewMode === 'closeup' ? 6 : 0);
                navigateSection('flipbook');
              }}
              className="flex items-center gap-2 text-left whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A0A0A] sm:gap-3"
            >
              <img
                src={BRAND_LOGO_PATH}
                alt="DT"
                className="h-6 w-auto object-contain"
              />
              <span className="font-sans text-sm font-semibold tracking-tight text-[#0A0A0A] whitespace-nowrap shrink-0 sm:text-base">
                Dream Tomorrow
              </span>
            </button>

            {/* Zone 2: 4 Clean Single-Line Navigation Links */}
            {catalogueNavItems.length > 0 &&
              (section === 'flipbook' || viewMode === 'classic') && (
              <nav
                aria-label="Catalogue navigation"
                className="hidden md:flex items-center gap-7 text-xs font-medium text-[#525252]"
              >
              {catalogueNavItems.map((navItem) => {
                const isActive = section === navItem.id;
                return (
                  <button
                    key={navItem.id}
                    type="button"
                    onClick={() => navigateSection(navItem.id)}
                    className={`border-b py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'border-[#0A0A0A] text-[#0A0A0A]'
                        : 'border-transparent text-[#525252] hover:border-[#A3A3A3] hover:text-[#0A0A0A]'
                    }`}
                  >
                    {navItem.label}
                  </button>
                );
              })}
              </nav>
            )}

            <div className="flex items-center gap-2 shrink-0 sm:gap-3">
              {viewModeToggle}
              {viewMode === 'interactive' && section === 'flipbook' && (
                <button
                  type="button"
                  onClick={() => setExportModalOpen(true)}
                  className="hidden bg-[#0A0A0A] px-4 py-2 text-xs font-medium text-white transition-colors duration-200 hover:bg-[#262626] whitespace-nowrap shrink-0 cursor-pointer xl:block"
                >
                  Print / Export PDF
                </button>
              )}
            </div>
          </div>

          {/* Mobile Single-Row Nav Strip */}
          <nav
            aria-label="Mobile catalogue navigation"
            className={`items-center justify-around border-t border-[#F0F0F0] px-4 py-2 text-xs font-medium md:hidden ${
              catalogueNavItems.length > 0 ? 'flex' : 'hidden'
            }`}
          >
            {catalogueNavItems.map((navItem) => (
              <button
                key={navItem.id}
                type="button"
                onClick={() => navigateSection(navItem.id)}
                className={`px-2 py-1 whitespace-nowrap shrink-0 cursor-pointer ${
                  section === navItem.id
                    ? 'text-[#0A0A0A] underline underline-offset-4'
                    : 'text-[#737373]'
                }`}
              >
                {navItem.label}
              </button>
            ))}
          </nav>
        </header>

        <details className={`${viewMode !== 'interactive' ? 'hidden ' : ''}group border-b border-[#F0F0F0] bg-[#FCFCFC]`}>
          <summary className="mx-auto flex max-w-[1380px] cursor-pointer list-none items-center justify-between gap-4 px-6 py-2.5 text-xs text-[#66645F] lg:px-10">
            <span className="font-semibold uppercase tracking-wide text-[#111111]">Workbench tools</span>
            <span className="inline-flex items-center gap-2">
              <span>Admin tools · assets, crops &amp; data</span>
              <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
            </span>
          </summary>
          <div className="mx-auto flex max-w-[1380px] flex-wrap items-center justify-between gap-4 px-6 py-2 text-[11px] group-open:border-t group-open:border-[#F0F0F0] lg:px-10">
            <div className="flex flex-wrap items-center gap-4 text-[#525252]">
              <span className="text-[#737373]">Finish:</span>
              <div className="flex items-center gap-3">
                {METALLIC_THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setMetallicTheme(t.id)}
                    className={`inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                      metallicTheme === t.id
                        ? 'font-semibold text-[#0A0A0A]'
                        : 'text-[#737373] hover:text-[#0A0A0A]'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 border border-black/15"
                      style={{ backgroundColor: t.swatch }}
                    />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
              <span aria-hidden="true" className="hidden lg:inline text-[#DCDCDC]">|</span>
              <span className="hidden lg:inline text-[#737373]">
                Image drops &amp; crops save in this browser; export JSON for a portable backup
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={() => setEditMode((v) => !v)}
                className={`transition-colors whitespace-nowrap cursor-pointer ${
                  editMode
                    ? 'font-semibold text-[#0A0A0A] underline underline-offset-4'
                    : 'text-[#525252] hover:text-[#0A0A0A]'
                }`}
              >
                {editMode ? 'Replace Mode: On' : 'Replace Mode: Off'}
              </button>
              <span aria-hidden="true" className="text-[#DCDCDC]">|</span>
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1 text-[#525252] hover:text-[#0A0A0A] whitespace-nowrap cursor-pointer"
              >
                <Download className="h-3 w-3" />
                <span>CSV</span>
              </button>
              <button
                type="button"
                onClick={() => csvInputRef.current?.click()}
                className="inline-flex items-center gap-1 text-[#525252] hover:text-[#0A0A0A] whitespace-nowrap cursor-pointer"
              >
                <Upload className="h-3 w-3" />
                <span>Load CSV</span>
              </button>
              <button
                type="button"
                onClick={handleExportJson}
                className="inline-flex items-center gap-1 text-[#525252] hover:text-[#0A0A0A] whitespace-nowrap cursor-pointer"
              >
                <Download className="h-3 w-3" />
                <span>JSON</span>
              </button>
              <button
                type="button"
                onClick={() => jsonInputRef.current?.click()}
                className="inline-flex items-center gap-1 text-[#525252] hover:text-[#0A0A0A] whitespace-nowrap cursor-pointer"
              >
                <Upload className="h-3 w-3" />
                <span>Load JSON</span>
              </button>

              <input
                ref={csvInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  handleImportCsv(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
              <input
                ref={jsonInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  handleImportJson(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
            </div>
          </div>
        </details>

        {/* MAIN VIEWPORT CONTENT */}
        <main className="flex-1">
          {section === 'flipbook' && (
            isCloseupMode && !isMobile ? (
              <ProductShowcasePage
                garment={currentGarment}
                garments={presentationGarments}
                onSelectGarment={(index) => setBookPage(productSpreadOffset + index - 1)}
                onSelectFabricCode={handleSelectFabricCode}
                onInspectMedia={(slot, titleLabel, garmentTitle) =>
                  setLightboxItem({ slot, titleLabel, garmentTitle })
                }
              />
            ) : (
            <FlipbookStage
              isMobile={isMobile}
              isWorkbench={viewMode === 'interactive'}
              garments={presentationGarments}
              meta={DEFAULT_CATALOGUE_META}
              metallicTheme={metallicTheme}
              classicMode={isClassicMode}
              bookPage={bookPage}
              editMode={editMode}
              shortlist={shortlist}
              coverCustomImage={coverCustomImage}
              showSafeZones={printConfig.showSafeZones}
              turnRequest={turnRequest}
              onRequestTurn={triggerTurn}
              onChangeBookPage={(p) => {
                setBookPage(p);
              }}
              onToggleEditMode={() => setEditMode((current) => !current)}
              onChangeMetallicTheme={setMetallicTheme}
              onToggleSafeZones={() =>
                setPrintConfig((prev) => ({ ...prev, showSafeZones: !prev.showSafeZones }))
              }
              onDropCoverImage={(dataUrl) => {
                setCoverCustomImage(dataUrl);
                showToast('Session cover image updated for this browser & PDF export.');
              }}
              onReplaceFile={handleReplaceFile}
              onUpdateCrop={handleUpdateCrop}
              fabricColorImages={fabricColorImages}
              onReplaceFabricColorImage={handleReplaceFabricColorImage}
              onImageUploadError={showToast}
              onToggleShortlist={handleToggleShortlist}
              onInspectMedia={(slot, titleLabel, garmentTitle) =>
                setLightboxItem({ slot, titleLabel, garmentTitle })
              }
              onOpenEditor={(garmentIdx, focusSlot) =>
                setEditorState({ garmentIndex: garmentIdx, focusSlot })
              }
              onOpenVideo={(garment) => setVideoGarmentId(garment.id)}
              onExportCurrentPdf={handleExportCurrentProductPdf}
              onSelectFabricCode={handleSelectFabricCode}
              onOpenFullPrintModal={() => {
                setPrintConfig((prev) => ({ ...prev, scope: 'all', orientation: 'landscape' }));
                setExportModalOpen(true);
              }}
              onExportCsv={handleExportCsv}
              onExportJson={handleExportJson}
              onTriggerImportCsv={() => csvInputRef.current?.click()}
              onTriggerImportJson={() => jsonInputRef.current?.click()}
            />
            )
          )}

          {section === 'fabrics' && (
            <FabricSwatchBoard
              garments={presentationGarments}
              fabricColorImages={fabricColorImages}
              onReplaceFabricSwatch={handleReplaceFabricSwatch}
              onReplaceFabricColorImage={handleReplaceFabricColorImage}
              onImageUploadError={showToast}
              onSelectStyleIndex={(idx) => {
                setBookPage(productSpreadOffset + idx - 1);
                navigateSection('flipbook');
              }}
              interactive={viewMode === 'interactive'}
            />
          )}

          {section === 'index' && (
            <CatalogueIndex
              garments={presentationGarments}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              shortlist={shortlist}
              onToggleShortlist={handleToggleShortlist}
              onSelectGarment={(index) => {
                setBookPage(productSpreadOffset + index - 1);
                navigateSection('flipbook');
              }}
              onSelectFabricCode={handleSelectFabricCode}
              onEditGarment={(index) => {
                setBookPage(productSpreadOffset + index - 1);
                setEditorState({ garmentIndex: index });
              }}
            />
          )}

          {section === 'print' && (
            <PrintSheetPreview
              garments={printGarments}
              allGarments={presentationGarments}
              meta={DEFAULT_CATALOGUE_META}
              config={printConfig}
              coverCustomImage={coverCustomImage}
              onUpdateConfig={(patch) =>
                setPrintConfig((prev) => ({ ...prev, ...patch }))
              }
              onTriggerPrint={handleExecutePrint}
            />
          )}
        </main>

        {/* QUIET MONOCHROME EDITORIAL FOOTER */}
        <footer className={`${viewMode === 'interactive' ? 'mt-12 border-t border-[#E5E5E5] bg-white' : 'hidden'}`}>
          <div className="mx-auto flex max-w-[1380px] flex-col justify-between gap-4 px-6 py-8 text-xs text-[#737373] sm:flex-row sm:items-center lg:px-10">
            <div className="flex items-center gap-3">
              <img
                src={BRAND_LOGO_PATH}
                alt="Dream Tomorrow"
                className="h-4 w-auto object-contain"
              />
              <span className="font-sans text-xs font-semibold text-[#0A0A0A]">
                Dream Tomorrow · DT
              </span>
              <span aria-hidden="true">·</span>
              <span>CM · OEM · ODM B2B Landscape Catalogue</span>
            </div>

            <div className="flex flex-wrap items-center gap-5">
              <span>{DEFAULT_CATALOGUE_META.contactEmail}</span>
              <button
                type="button"
                onClick={handleResetBlank}
                className="inline-flex items-center gap-1 text-[#737373] transition-colors hover:text-[#0A0A0A] cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Template</span>
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* ====================================================================
          DEDICATED HIGH-RESOLUTION PRINT / PDF DOCUMENT TREE (ZERO 3D CSS)
          ==================================================================== */}
      <PrintSheetPreview
        garments={printGarments}
        allGarments={presentationGarments}
        meta={DEFAULT_CATALOGUE_META}
        config={printConfig}
        coverCustomImage={coverCustomImage}
        isPrintOnlyPortal
      />

      {/* ====================================================================
          SLIDE-OVER EDITOR & INTERACTIVE MODALS
          ==================================================================== */}
      <SlotEditorDrawer
        garment={editorGarment}
        initialFocusSlot={editorState?.focusSlot}
        onClose={() => setEditorState(null)}
        onUpdateGarment={handleUpdateGarment}
      />

      <MacroLightboxModal
        item={lightboxItem}
        onClose={() => setLightboxItem(null)}
      />

      <VideoStudyModal
        garment={videoGarment}
        onClose={() => setVideoGarmentId(null)}
        onSaveVideo={handleSaveVideo}
      />

      <ExportPdfModal
        open={exportModalOpen}
        config={printConfig}
        totalCount={garments.length}
        categoryName={activeCategory}
        categoryCount={categoryGarments.length}
        shortlistCount={shortlist.length}
        currentGarmentSku={currentGarment.sku}
        onUpdateConfig={(patch) =>
          setPrintConfig((prev) => ({ ...prev, ...patch }))
        }
        onClose={() => setExportModalOpen(false)}
        onPreviewSheets={() => {
          setExportModalOpen(false);
          navigateSection('print');
        }}
        onExecutePrint={handleExecutePrint}
      />

      {/* Subtle Monochrome Feedback Toast */}
      {toastMessage && viewMode === 'interactive' && (
        <div
          role="status"
          aria-live="polite"
          className="no-print fixed right-6 bottom-6 z-50 border border-[#0A0A0A] bg-[#0A0A0A] px-4 py-2.5 text-xs text-white shadow-lg"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
