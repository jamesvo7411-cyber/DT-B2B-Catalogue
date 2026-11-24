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
  DEFAULT_COLORWAYS,
  METALLIC_THEMES,
  buildDefaultDescriptionBullets,
  buildDefaultKeyFeatures,
  createInitialGarments,
} from './data/garments';
import { exportGarmentsToCsv, importGarmentsFromCsv } from './utils/dataTransfer';
import { FlipbookStage } from './components/FlipbookStage';
import { FabricSwatchBoard } from './components/FabricSwatchBoard';
import { CatalogueIndex } from './components/CatalogueIndex';
import { PrintSheetPreview } from './components/PrintSheetPreview';
import { SlotEditorDrawer } from './components/SlotEditorDrawer';
import {
  ExportPdfModal,
  MacroLightboxModal,
  VideoStudyModal,
} from './components/MediaModals';

const STORAGE_KEY = 'dream-tomorrow-catalogue-v3';
type CatalogueViewMode = 'interactive' | 'classic';

interface SavedState {
  garments: GarmentItem[];
  metallicTheme: MetallicTheme;
  shortlist: string[];
  coverCustomImage?: string;
}

function loadSavedState(): SavedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedState>;
    if (!Array.isArray(parsed.garments) || parsed.garments.length === 0) {
      return null;
    }
    const savedById = new Map(parsed.garments.map((garment) => [garment.id, garment]));
    const hydratedGarments: GarmentItem[] = createInitialGarments().map((defaults) => {
      const saved = savedById.get(defaults.id);
      if (!saved) return defaults;
      const savedCustom = saved.media?.custom;
      const isLegacyCustomPlaceholder =
        savedCustom &&
        !savedCustom.url &&
        savedCustom.caption ===
          `Fig. ${String(defaults.index).padStart(2, '0')}.E — Custom Fit / Label / Trim Note` &&
        savedCustom.note === 'Optional B2B care label, hardware, or fit-session photo';

      return {
        ...defaults,
        ...saved,
        title: defaults.title,
        productUrl: defaults.productUrl,
        descriptionBullets:
          Array.isArray(saved.descriptionBullets) && saved.descriptionBullets.length > 0
            ? saved.descriptionBullets
            : buildDefaultDescriptionBullets(saved.specs),
        keyFeatures:
          Array.isArray(saved.keyFeatures) && saved.keyFeatures.length > 0
            ? saved.keyFeatures
            : buildDefaultKeyFeatures(saved.specs),
        colorways:
          Array.isArray(saved.colorways) && saved.colorways.length > 0
            ? saved.colorways
            : [...DEFAULT_COLORWAYS],
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
    return {
      garments: hydratedGarments,
      metallicTheme: parsed.metallicTheme ?? 'platinum',
      shortlist: Array.isArray(parsed.shortlist) ? parsed.shortlist : [],
      coverCustomImage: parsed.coverCustomImage ?? '',
    };
  } catch {
    return null;
  }
}

export default function App() {
  const initialSaved = useMemo(() => loadSavedState(), []);

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

  const [section, setSection] = useState<CatalogueSection>('flipbook');
  const [viewMode, setViewMode] = useState<CatalogueViewMode>('interactive');
  const [bookPage, setBookPage] = useState<number>(0); // 0=Cover, 1=TOC, 2..5=Swatches, 6..48=43 Products, 49=Print Specs & Data
  const [turnRequest, setTurnRequest] = useState<{ dir: 'next' | 'prev'; nonce: number } | null>(null);
  const [activeCategory, setActiveCategory] = useState<GarmentCategory | 'All'>('All');
  const [editMode, setEditMode] = useState<boolean>(false);
  const isClassicMode = viewMode === 'classic' && section === 'flipbook';

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
        metallicTheme,
        shortlist,
        coverCustomImage,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Browser storage quota reached with large embedded images; in-memory session state remains intact
    }
  }, [garments, metallicTheme, shortlist, coverCustomImage]);

  const triggerTurn = (dir: 'next' | 'prev') => {
    setTurnRequest((prev) => ({ dir, nonce: (prev?.nonce ?? 0) + 1 }));
  };

  // Keyboard navigation in Diagonal Page-Curl Flipbook mode
  useEffect(() => {
    if (
      section !== 'flipbook' ||
      viewMode === 'classic' ||
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
      if (e.key === 'ArrowRight') {
        triggerTurn('next');
      } else if (e.key === 'ArrowLeft') {
        triggerTurn('prev');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [section, viewMode, editorState, lightboxItem, videoGarmentId, exportModalOpen]);

  const activeProductIndex =
    bookPage >= 6 && bookPage < 6 + garments.length ? bookPage - 5 : 1;
  const currentGarment = garments[activeProductIndex - 1] ?? garments[0];
  const editorGarment = editorState ? garments[editorState.garmentIndex - 1] ?? null : null;
  const videoGarment = videoGarmentId
    ? garments.find((g) => g.id === videoGarmentId) ?? null
    : null;

  const categoryGarments = useMemo(
    () =>
      activeCategory === 'All'
        ? garments
        : garments.filter((g) => g.category === activeCategory),
    [garments, activeCategory]
  );

  const printGarments = useMemo(() => {
    if (printConfig.scope === 'current') return [currentGarment];
    if (printConfig.scope === 'shortlist') {
      const list = garments.filter((g) => shortlist.includes(g.id));
      return list.length > 0 ? list : [currentGarment];
    }
    if (printConfig.scope === 'category') return categoryGarments;
    return garments;
  }, [printConfig.scope, garments, categoryGarments, shortlist, currentGarment]);

  const handleUpdateGarment = (updated: GarmentItem) => {
    setGarments((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
  };

  const handleReplaceFile = (garmentId: string, slotKey: MediaSlotKey, dataUrl: string) => {
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
    setGarments((prev) =>
      prev.map((g) => {
        if (g.specs.fabricRollRef !== fabricCode) return g;
        const currentStage = g.media.swatch.stage;
        return {
          ...g,
          media: {
            ...g.media,
            swatch: {
              ...g.media.swatch,
              url: dataUrl,
              crop: undefined,
              isSessionDrop: true,
              stage: currentStage === 'blank' ? 'ai-concept' : currentStage,
            },
          },
        };
      })
    );
    showToast(`Swatch ${fabricCode} saved across linked styles in this browser.`);
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
        metallicTheme,
        shortlist,
        garments,
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
    showToast('Catalogue manifest exported as JSON, including saved image crops.');
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
        setGarments(parsed.garments);
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
    setBookPage(5 + garmentIndex);
    setPrintConfig((prev) => ({ ...prev, scope: 'current', orientation: 'landscape' }));
    setExportModalOpen(true);
  };

  const navigateSection = (target: CatalogueSection) => {
    setSection(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewModeChange = (mode: CatalogueViewMode) => {
    setViewMode(mode);
    if (mode === 'classic') {
      setSection('flipbook');
      setEditMode(false);
      setEditorState(null);
      setLightboxItem(null);
      setVideoGarmentId(null);
      setExportModalOpen(false);
    }
  };

  const viewModeToggle = (
    <div
      role="group"
      aria-label="Catalogue viewing mode"
      className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-[#E8E6E0] bg-[#F8F7F4] p-1"
    >
      <button
        type="button"
        aria-pressed={viewMode === 'interactive'}
        onClick={() => handleViewModeChange('interactive')}
        className={`rounded-full px-2.5 py-1.5 text-[10px] font-medium transition-colors sm:px-3 sm:text-[11px] ${
          viewMode === 'interactive'
            ? 'bg-white text-[#24231F] shadow-sm'
            : 'text-[#77756F] hover:text-[#24231F]'
        }`}
      >
        Interactive
      </button>
      <button
        type="button"
        aria-pressed={viewMode === 'classic'}
        onClick={() => handleViewModeChange('classic')}
        className={`rounded-full px-2.5 py-1.5 text-[10px] font-medium transition-colors sm:px-3 sm:text-[11px] ${
          viewMode === 'classic'
            ? 'bg-white text-[#24231F] shadow-sm'
            : 'text-[#77756F] hover:text-[#24231F]'
        }`}
      >
        Classic (Print)
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
        <header className="sticky top-0 z-30 border-b border-[#E5E5E5] bg-white/95 backdrop-blur-xs">
          <div className="mx-auto flex h-16 max-w-[1380px] items-center justify-between gap-3 px-4 sm:px-6 lg:gap-8 lg:px-10">
            {/* Zone 1: Single-line Brand Wordmark */}
            <button
              type="button"
              onClick={() => {
                setBookPage(0);
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
            {!isClassicMode && (
              <nav
                aria-label="Catalogue navigation"
                className="hidden md:flex items-center gap-7 text-xs font-medium text-[#525252]"
              >
              {(
                [
                  { id: 'flipbook', label: 'Flipbook' },
                  { id: 'fabrics', label: 'Fabrics' },
                  { id: 'index', label: 'Collection' },
                  { id: 'print', label: 'Print Sheet' },
                ] as const
              ).map((navItem) => {
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
              {!isClassicMode && (
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
              isClassicMode ? 'hidden' : 'flex'
            }`}
          >
            {(
              [
                { id: 'flipbook', label: 'Flipbook' },
                { id: 'fabrics', label: 'Fabrics' },
                { id: 'index', label: 'Collection' },
                { id: 'print', label: 'Print' },
              ] as const
            ).map((navItem) => (
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

        <details className={`${isClassicMode ? 'hidden ' : ''}group border-b border-[#F0F0F0] bg-[#FCFCFC]`}>
          <summary className="mx-auto flex max-w-[1380px] cursor-pointer list-none items-center justify-between gap-4 px-6 py-2.5 text-xs text-[#66645F] lg:px-10">
            <span className="font-medium text-[#292824]">Make it yours</span>
            <span className="inline-flex items-center gap-2">
              <span>Edit styles, finishes &amp; files</span>
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
            <FlipbookStage
              garments={garments}
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
              onReplaceFabricSwatch={handleReplaceFabricSwatch}
              onToggleShortlist={handleToggleShortlist}
              onInspectMedia={(slot, titleLabel, garmentTitle) =>
                setLightboxItem({ slot, titleLabel, garmentTitle })
              }
              onOpenEditor={(garmentIdx, focusSlot) =>
                setEditorState({ garmentIndex: garmentIdx, focusSlot })
              }
              onOpenVideo={(garment) => setVideoGarmentId(garment.id)}
              onExportCurrentPdf={handleExportCurrentProductPdf}
              onOpenFullPrintModal={() => {
                setPrintConfig((prev) => ({ ...prev, scope: 'all', orientation: 'landscape' }));
                setExportModalOpen(true);
              }}
              onExportCsv={handleExportCsv}
              onExportJson={handleExportJson}
              onTriggerImportCsv={() => csvInputRef.current?.click()}
              onTriggerImportJson={() => jsonInputRef.current?.click()}
            />
          )}

          {section === 'fabrics' && (
            <FabricSwatchBoard
              garments={garments}
              onReplaceFabricSwatch={handleReplaceFabricSwatch}
              onSelectStyleIndex={(idx) => {
                setBookPage(5 + idx);
                navigateSection('flipbook');
              }}
            />
          )}

          {section === 'index' && (
            <CatalogueIndex
              garments={garments}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              shortlist={shortlist}
              onToggleShortlist={handleToggleShortlist}
              onSelectGarment={(index) => {
                setBookPage(5 + index);
                navigateSection('flipbook');
              }}
              onEditGarment={(index) => {
                setBookPage(5 + index);
                setEditorState({ garmentIndex: index });
              }}
            />
          )}

          {section === 'print' && (
            <PrintSheetPreview
              garments={printGarments}
              allGarments={garments}
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
        <footer className={`${isClassicMode ? 'hidden' : 'mt-12 border-t border-[#E5E5E5] bg-white'}`}>
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
        allGarments={garments}
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
      {toastMessage && !isClassicMode && (
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
