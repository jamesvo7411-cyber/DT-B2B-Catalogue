import React from 'react';
import { Printer, Ruler } from 'lucide-react';
import type {
  CatalogueMetadata,
  GarmentItem,
  MediaSlot,
  PrintConfig,
} from '../types/catalogue';
import { imageCropStyle } from '../utils/media';
import { RunningHeader } from './CatalogueNavigation';
import { ProductSpecStrip } from './ProductSpecStrip';
import { SizeRunChips } from './SizeRunChips';
import { getFactoryFabricColors } from '../data/factoryFabricColors';
import {
  getFabricFamilyName,
  type CatalogueNavigationMap,
} from '../utils/catalogueOrder';
import { conciseSourceNote, displayMoq } from '../utils/productDisplay';
import {
  BRAND_LOGO_PATH,
  CATEGORIES,
  CM_OEM_ODM_PILLARS,
  COVER_ATELIER_ILLUSTRATION,
  PRINT_PRODUCTION_SPEC,
  STAGE_LABELS,
  buildFabricSwatchPrograms,
  getColorSwatchHex,
} from '../data/garments';

interface PrintSheetPreviewProps {
  garments: GarmentItem[];
  allGarments: GarmentItem[];
  navMap?: CatalogueNavigationMap;
  meta: CatalogueMetadata;
  config: PrintConfig;
  coverCustomImage?: string;
  isPrintOnlyPortal?: boolean;
  onUpdateConfig?: (next: Partial<PrintConfig>) => void;
  onTriggerPrint?: () => void;
}

const CropAndSpineMarks: React.FC<{ isLandscape: boolean }> = ({ isLandscape }) => (
  <>
    {/* Outer 3mm Trim / Crop Registration Corner Marks */}
    <span aria-hidden="true" className="pointer-events-none absolute top-2.5 left-2.5 h-3 w-3 border-t border-l border-[#9A9A9A]" />
    <span aria-hidden="true" className="pointer-events-none absolute top-2.5 right-2.5 h-3 w-3 border-t border-r border-[#9A9A9A]" />
    <span aria-hidden="true" className="pointer-events-none absolute bottom-2.5 left-2.5 h-3 w-3 border-b border-l border-[#9A9A9A]" />
    <span aria-hidden="true" className="pointer-events-none absolute bottom-2.5 right-2.5 h-3 w-3 border-b border-r border-[#9A9A9A]" />

    {/* Center Binding Spine Fold Tick Marks in Landscape Two-Page Spreads */}
    {isLandscape && (
      <>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1 left-1/2 h-3 w-px -translate-x-1/2 bg-[#A3A3A3]"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-1 left-1/2 h-3 w-px -translate-x-1/2 bg-[#A3A3A3]"
        />
      </>
    )}
  </>
);

const PrintPlateBox: React.FC<{
  slot: MediaSlot;
  label: string;
  aspectClass: string;
  showBlankGuides: boolean;
  fullHeight?: boolean;
  displayScale?: number;
  hint?: string;
  topOverlay?: React.ReactNode;
  imageOverlay?: React.ReactNode;
  overlayMode?: 'gradient' | 'card';
}> = ({
  slot,
  label,
  aspectClass,
  showBlankGuides,
  fullHeight = false,
  displayScale = 1,
  hint,
  topOverlay,
  imageOverlay,
  overlayMode = 'gradient',
}) => {
  const [useFallback, setUseFallback] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);

  React.useEffect(() => {
    setUseFallback(false);
    setImgError(false);
  }, [slot.url, slot.fallbackUrl]);

  const imageSrc = !imgError
    ? useFallback && slot.fallbackUrl
      ? slot.fallbackUrl
      : slot.url || slot.fallbackUrl || ''
    : '';
  const scaledStyle = imageCropStyle(slot.crop, displayScale);

  return (
    <div className={`flex flex-col ${fullHeight ? 'h-full flex-1' : ''}`}>
      <div
        className={`relative w-full overflow-hidden bg-[#FAF9F5] ${
          fullHeight ? 'h-full flex-1' : ''
        } ${aspectClass}`}
      >
        {imageSrc ? (
          <>
            <img
              src={imageSrc}
              alt={`${label} — ${slot.caption}`}
              referrerPolicy="no-referrer"
              onError={() => {
                if (!useFallback && slot.fallbackUrl) {
                  setUseFallback(true);
                } else {
                  setImgError(true);
                }
              }}
              style={scaledStyle}
              className="h-full w-full object-cover"
            />
            {topOverlay && (
              <div className="pointer-events-none absolute top-3 left-3 right-3 z-20">
                {topOverlay}
              </div>
            )}
            {imageOverlay && (
              overlayMode === 'card' ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#F7F6F2]/94 via-[#F7F6F2]/76 via-58% to-transparent px-4 pb-3 pt-16 text-[#0A0A0A]">
                  {imageOverlay}
                </div>
              ) : (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-10 text-white">
                  {imageOverlay}
                </div>
              )
            )}
          </>
        ) : (
          <div
            className={`${
              showBlankGuides
                ? 'plate-blueprint-bg'
                : 'border border-dashed border-[#D8D6D0] bg-[#FAF9F5]'
            } flex h-full w-full flex-col items-center justify-center p-2.5 text-center`}
          >
            {showBlankGuides ? (
              <>
                <span className="font-sans text-[11px] font-medium text-[#262626]">{label}</span>
                <span className="mt-0.5 font-mono text-[9.5px] text-[#737373] tabular-nums">
                  {slot.aspectLabel}
                </span>
              </>
            ) : (
              <>
                <span className="font-mono text-[8px] font-semibold uppercase tracking-[0.12em] text-[#55534E]">
                  {label}
                </span>
                {hint && (
                  <span className="mt-0.5 text-[8px] leading-snug text-[#77756F]">
                    {hint}
                  </span>
                )}
              </>
            )}
          </div>
        )}
      </div>
      {overlayMode !== 'card' && (
        <div className="mt-1 flex items-baseline justify-between gap-2 text-[9.5px]">
          <span className="font-serif italic text-[#404040] truncate">{slot.caption}</span>
          <span className="font-mono text-[#737373] shrink-0">{STAGE_LABELS[slot.stage]}</span>
        </div>
      )}
    </div>
  );
};

export const PrintSheetPreview: React.FC<PrintSheetPreviewProps> = ({
  garments,
  allGarments,
  navMap,
  meta,
  config,
  coverCustomImage = '',
  isPrintOnlyPortal = false,
  onUpdateConfig,
  onTriggerPrint,
}) => {
  const isLandscape = config.orientation === 'landscape';
  const showCoverAndIndex = config.includeCover && config.scope !== 'current';
  const showIndex = config.includeIndex && config.scope !== 'current';
  const showFabrics = config.includeFabrics && config.scope !== 'current';

  const fabricPrograms = showFabrics
    ? navMap?.orderedFabrics ?? buildFabricSwatchPrograms(allGarments)
    : [];
  const fabricChunks: typeof fabricPrograms[] = [];
  for (let i = 0; i < fabricPrograms.length; i += 4) {
    fabricChunks.push(fabricPrograms.slice(i, i + 4));
  }

  const fabricPrintPageByCode = new Map<string, number>();
  const coverSheetOffset = showCoverAndIndex ? 1 : 0;
  const indexSheetOffset = showIndex ? 1 : 0;
  fabricChunks.forEach((chunk, chunkIdx) => {
    const sheetNum = coverSheetOffset + indexSheetOffset + chunkIdx + 1;
    chunk.forEach((prog) => fabricPrintPageByCode.set(prog.fabricCode, sheetNum));
  });

  const totalPages =
    coverSheetOffset +
    indexSheetOffset +
    fabricChunks.length +
    garments.length;

  const sheetBaseClass = isPrintOnlyPortal
    ? 'print-sheet relative flex flex-col justify-between bg-white px-6 py-5 text-[#0A0A0A]'
    : `print-sheet relative mx-auto mb-10 flex flex-col justify-between border border-[#E0E0E0] bg-white px-6 py-6 text-[#0A0A0A] shadow-[0_1px_4px_rgba(0,0,0,0.04)] ${
        isLandscape ? 'max-w-[1160px] min-h-[780px]' : 'max-w-[820px] min-h-[1120px]'
      }`;

  // Asymmetric left-page / right-page spread gutter helpers for physical binding safety
  const versoSafeCls = isLandscape
    ? 'relative flex flex-col justify-between pl-4 pr-8 border-r border-dashed border-[#E5E5E5]'
    : 'relative flex flex-col justify-between pb-4';
  const rectoSafeCls = isLandscape
    ? 'relative flex flex-col justify-between pl-8 pr-4'
    : 'relative flex flex-col justify-between pt-2';

  let pageCursor = 0;

  return (
    <div
      className={
        isPrintOnlyPortal
          ? 'print-only-root hidden'
          : 'mx-auto max-w-[1360px] px-6 py-10 lg:px-10 lg:py-14'
      }
    >
      {/* Interactive Preview Toolbar (Screen Only) */}
      {!isPrintOnlyPortal && onUpdateConfig && onTriggerPrint && (
        <div className="no-print mb-10 flex flex-col justify-between gap-6 border-b border-[#E5E5E5] pb-8 lg:flex-row lg:items-end">
          <div>
            <p className="font-mono text-xs tracking-wider text-[var(--metallic-strong)]">
              Flat Print-Ready Binding Layout · Zero 3D Transforms
            </p>
            <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-[#0A0A0A] sm:text-4xl">
              High-Resolution Landscape PDF Export
            </h1>
            <p className="mt-2 max-w-[68ch] text-sm text-[#525252]">
              Flat vector spreads ({totalPages} {totalPages === 1 ? 'sheet' : 'sheets'}) structured with asymmetric Verso/Recto binding gutters ({PRINT_PRODUCTION_SPEC.innerGutterMm}mm spine · {PRINT_PRODUCTION_SPEC.outerMarginMm}mm outer · {PRINT_PRODUCTION_SPEC.bleedMm}mm bleed readiness) for clean PDF output without cut-off elements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center border border-[#E5E5E5] bg-white">
              <button
                type="button"
                onClick={() => onUpdateConfig({ orientation: 'landscape' })}
                className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap cursor-pointer ${
                  isLandscape ? 'bg-[#0A0A0A] text-white' : 'text-[#525252] hover:text-[#0A0A0A]'
                }`}
              >
                A4 Landscape
              </button>
              <button
                type="button"
                onClick={() => onUpdateConfig({ orientation: 'portrait' })}
                className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap cursor-pointer ${
                  !isLandscape ? 'bg-[#0A0A0A] text-white' : 'text-[#525252] hover:text-[#0A0A0A]'
                }`}
              >
                A4 Portrait
              </button>
            </div>

            <button
              type="button"
              onClick={() => onUpdateConfig({ showCropMarks: !config.showCropMarks })}
              className={`border px-3 py-1.5 text-xs font-medium whitespace-nowrap cursor-pointer ${
                config.showCropMarks
                  ? 'border-[#0A0A0A] text-[#0A0A0A]'
                  : 'border-[#E5E5E5] text-[#737373]'
              }`}
            >
              Crop &amp; Spine Marks: {config.showCropMarks ? 'On' : 'Off'}
            </button>

            <button
              type="button"
              onClick={() => onUpdateConfig({ showSafeZones: !config.showSafeZones })}
              className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-medium whitespace-nowrap cursor-pointer ${
                config.showSafeZones
                  ? 'border-[#0A0A0A] text-[#0A0A0A]'
                  : 'border-[#E5E5E5] text-[#737373]'
              }`}
            >
              <Ruler className="h-3 w-3" />
              <span>Safe Zones: {config.showSafeZones ? 'On' : 'Off'}</span>
            </button>

            <button
              type="button"
              onClick={() => onUpdateConfig({ showBlankGuides: !config.showBlankGuides })}
              className={`border px-3 py-1.5 text-xs font-medium whitespace-nowrap cursor-pointer ${
                config.showBlankGuides
                  ? 'border-[#0A0A0A] text-[#0A0A0A]'
                  : 'border-[#E5E5E5] text-[#737373]'
              }`}
            >
              Slot Labels: {config.showBlankGuides ? 'On' : 'Off'}
            </button>

            <button
              type="button"
              onClick={onTriggerPrint}
              className="inline-flex items-center gap-2 bg-[#0A0A0A] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#262626] whitespace-nowrap cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save High-Res PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          PAGE 1: COVER & CM / OEM / ODM SPREAD (VERSO | RECTO)
          ==================================================================== */}
      {showCoverAndIndex && (() => {
        pageCursor += 1;
        return (
          <section className={sheetBaseClass}>
            {config.showCropMarks && <CropAndSpineMarks isLandscape={isLandscape} />}

            <div className={`grid flex-1 ${isLandscape ? 'grid-cols-2' : 'grid-cols-1 gap-6'}`}>
              {/* Left Verso */}
              <div className={versoSafeCls}>
                {config.showSafeZones && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-2 right-6 border border-dashed border-[var(--metallic-soft)]/70"
                  />
                )}
                <RunningHeader
                  sectionId="introduction"
                  categoryLabel="OVERVIEW"
                  pageLabel={`P.${String(pageCursor).padStart(2, '0')}A`}
                  rightContext="CM · OEM · ODM PORTFOLIO"
                />

                <div className="my-auto space-y-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--metallic-strong)]">
                        B2B Apparel &amp; Textile Portfolio
                      </p>
                      <h2 className="mt-1 font-serif text-4xl font-normal tracking-tight text-[#0A0A0A]">
                        Dream Tomorrow
                      </h2>
                    </div>
                    <img
                      src={BRAND_LOGO_PATH}
                      alt="Dream Tomorrow Monogram"
                      className="h-10 w-auto object-contain"
                    />
                  </div>
                  <p className="font-mono text-[10.5px] text-[var(--metallic-strong)]">{meta.edition}</p>
                  <div className="h-px w-16 metallic-rule" />
                  <p className="max-w-[54ch] text-xs leading-relaxed text-[#525252]">
                    {meta.subtitle}
                  </p>

                  <div className="grid grid-cols-3 gap-3 border-t border-[#E5E5E5] pt-3.5 text-[9.5px]">
                    {CM_OEM_ODM_PILLARS.map((p) => (
                      <div key={p.code} className="flex flex-col">
                        <div className="aspect-[4/3] w-full overflow-hidden border border-[#E6E4DE] bg-[#FAF9F5]">
                          <img
                            src={p.illustration}
                            alt={`${p.code} — ${p.title}`}
                            referrerPolicy="no-referrer"
                            className={`h-full w-full object-cover ${p.cropScaleClass}`}
                          />
                        </div>
                        <p className="mt-2 font-mono text-[9.5px] font-semibold text-[#0A0A0A]">
                          {p.index} · {p.code} — {p.title}
                        </p>
                        <p className="mt-1 leading-relaxed text-[#525252]">{p.detail}</p>
                        <p className="mt-1.5 border-t border-[#EFEFEF] pt-1 text-[8.5px] text-[#404040]">
                          <span className="font-mono uppercase text-[#737373]">Client: </span>
                          {p.buyerSupplies}
                        </p>
                        <p className="text-[8.5px] text-[#0A0A0A]">
                          <span className="font-mono uppercase text-[#737373]">DT: </span>
                          {p.dtDelivers}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#E5E5E5] pt-3 font-mono text-[10px] text-[#737373]">
                  <span>{String(pageCursor).padStart(2, '0')}A</span>
                  <span>{meta.contactEmail}</span>
                </div>
              </div>

              {/* Right Recto */}
              <div className={rectoSafeCls}>
                {config.showSafeZones && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-6 right-2 border border-dashed border-[var(--metallic-soft)]/70"
                  />
                )}
                <RunningHeader
                  sectionId="introduction"
                  categoryLabel="COVER PLATE"
                  pageLabel={`P.${String(pageCursor).padStart(2, '0')}B`}
                  rightContext={`${garments.length} STYLES · ${fabricPrograms.length || 15} FABRICS`}
                />

                <div className="my-auto py-4">
                  <div className="relative mx-auto aspect-[3/4] max-h-[540px] w-full overflow-hidden border border-[#DCDCDC] bg-[#FAF9F5]">
                    <img
                      src={coverCustomImage || COVER_ATELIER_ILLUSTRATION}
                      alt="Dream Tomorrow Cover"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="mt-2 text-center font-serif text-xs italic text-[#404040]">
                    Fig. 00 — Knitwear &amp; Woven Manufacturing Monograph
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-[#E5E5E5] pt-3 font-mono text-[10px] text-[#737373] tabular-nums">
                  <span>{PRINT_PRODUCTION_SPEC.pageFormat}</span>
                  <span>
                    {String(pageCursor).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ====================================================================
          PAGE 2: COLLECTION INDEX SPREAD (MEN'S VERSO | WOMEN'S RECTO)
          ==================================================================== */}
      {showIndex && (() => {
        pageCursor += 1;
        const menItems = garments.filter((g) => g.gender === 'Men');
        const womenItems = garments.filter((g) => g.gender === 'Women');
        const pageOffset = (showCoverAndIndex ? 1 : 0) + 1 + fabricChunks.length;

        return (
          <section className={sheetBaseClass}>
            {config.showCropMarks && <CropAndSpineMarks isLandscape={isLandscape} />}

            <div className={`grid flex-1 ${isLandscape ? 'grid-cols-2' : 'grid-cols-1 gap-6'}`}>
              {/* Left Verso: Chapters + Men's */}
              <div className={versoSafeCls}>
                {config.showSafeZones && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-2 right-6 border border-dashed border-[var(--metallic-soft)]/70"
                  />
                )}
                <div>
                  <div className="mb-3">
                    <RunningHeader
                      sectionId="introduction"
                      categoryLabel="TABLE OF CONTENTS"
                      pageLabel={`P.${String(pageCursor).padStart(2, '0')}A`}
                      rightContext={`MEN'S LINE · ${menItems.length}`}
                    />
                  </div>

                  <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1 text-[9.5px] text-[#525252]">
                    {CATEGORIES.map((c) => (
                      <span key={c.name}>
                        {c.numeral}. {c.name} ({c.count})
                      </span>
                    ))}
                  </div>

                  <div className="divide-y divide-[#EFEFEF] border-t border-b border-[#E5E5E5]">
                    {menItems.map((item) => {
                      const itemPage = pageOffset + garments.findIndex((g) => g.id === item.id) + 1;
                      return (
                        <div
                          key={item.id}
                          className="grid grid-cols-[18px_minmax(0,1fr)_auto_34px] items-baseline gap-2 py-1 text-[9.5px]"
                        >
                          <span className="font-mono text-[8.5px] text-[#9A968E] tabular-nums">
                            {String(item.index).padStart(2, '0')}
                          </span>
                          <span className="truncate font-medium text-[#171715]">{item.title}</span>
                          <span className="shrink-0 font-mono text-[8px] font-normal text-[#9A968E] tabular-nums">
                            {item.sku}
                          </span>
                          <span className="text-right font-mono text-[9px] text-[#0A0A0A] tabular-nums">
                            p.{String(itemPage).padStart(2, '0')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[#E5E5E5] pt-2.5 font-mono text-[10px] text-[#737373]">
                  <span>{String(pageCursor).padStart(2, '0')}A</span>
                  <span>DREAM TOMORROW B2B INDEX</span>
                </div>
              </div>

              {/* Right Recto: Women's */}
              <div className={rectoSafeCls}>
                {config.showSafeZones && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-6 right-2 border border-dashed border-[var(--metallic-soft)]/70"
                  />
                )}
                <div>
                  <div className="mb-3">
                    <RunningHeader
                      sectionId="introduction"
                      categoryLabel="WOMEN'S DIRECTORY"
                      pageLabel={`P.${String(pageCursor).padStart(2, '0')}B`}
                      rightContext={`NỮ · ${womenItems.length}`}
                    />
                  </div>

                  <div className="divide-y divide-[#EFEFEF] border-t border-b border-[#E5E5E5]">
                    {womenItems.map((item) => {
                      const itemPage = pageOffset + garments.findIndex((g) => g.id === item.id) + 1;
                      return (
                        <div
                          key={item.id}
                          className="grid grid-cols-[18px_minmax(0,1fr)_auto_34px] items-baseline gap-2 py-1 text-[9.5px]"
                        >
                          <span className="font-mono text-[8.5px] text-[#9A968E] tabular-nums">
                            {String(item.index).padStart(2, '0')}
                          </span>
                          <span className="truncate font-medium text-[#171715]">{item.title}</span>
                          <span className="shrink-0 font-mono text-[8px] font-normal text-[#9A968E] tabular-nums">
                            {item.sku}
                          </span>
                          <span className="text-right font-mono text-[9px] text-[#0A0A0A] tabular-nums">
                            p.{String(itemPage).padStart(2, '0')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[#E5E5E5] pt-2.5 font-mono text-[10px] text-[#737373] tabular-nums">
                  <span>{fabricPrograms.length || 15} FABRIC PROGRAMS</span>
                  <span>
                    {String(pageCursor).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ====================================================================
          PAGES 3..6: FABRIC & COLOR SWATCH SPREADS (2 VERSO | 2 RECTO)
          ==================================================================== */}
      {fabricChunks.map((chunk, chunkIdx) => {
        pageCursor += 1;
        const leftProgs = chunk.slice(0, 2);
        const rightProgs = chunk.slice(2, 4);
        const pageOffsetForFabrics = coverSheetOffset + indexSheetOffset + fabricChunks.length;

        const renderRollRow = (prog: (typeof chunk)[number]) => (
          <div key={prog.fabricCode} className="space-y-2 py-3">
            <div className="grid grid-cols-12 items-start gap-3">
              <div className="col-span-3">
                <div className="aspect-square w-full overflow-hidden border border-[#DCDCDC] bg-[#FAFAFA]">
                  {prog.swatchImageUrl ? (
                    <img
                      src={prog.swatchImageUrl}
                      alt={prog.fabricCode}
                      className="h-full w-full scale-[1.65] object-cover"
                    />
                  ) : (
                    <div className="plate-blueprint-bg flex h-full w-full items-center justify-center p-1 text-center font-mono text-[8.5px] text-[#737373]">
                      {prog.fabricCode}
                    </div>
                  )}
                </div>
              </div>
              <div className="col-span-9 space-y-1 text-[9.5px]">
                <div className="flex items-baseline justify-between gap-2">
                  <div>
                    <p className="font-mono text-[7.5px] uppercase tracking-wider text-[#737373]">
                      {getFabricFamilyName(prog.fabricCode)}
                    </p>
                    <p className="font-mono text-[11px] font-semibold text-[#0A0A0A]">
                      {prog.fabricCode}
                    </p>
                  </div>
                  <span className="font-mono text-[#737373]">{prog.genders.join(' / ')}</span>
                </div>
                <p className="text-[#262626]">{prog.composition}</p>
                <p className="font-mono text-[#525252] tabular-nums">
                  GSM: {prog.weightGsm} · Width: {prog.fabricWidth}
                </p>
                <p className="font-mono text-[8.5px] text-[#55534E]">
                  Used By:{' '}
                  {prog.linkedSkus
                    .map((sku, idx) => {
                      const styleIdx = prog.linkedIndices[idx];
                      const gPos = garments.findIndex((item) => item.index === styleIdx);
                      const pTag = gPos >= 0 ? ` P.${String(pageOffsetForFabrics + gPos + 1).padStart(2, '0')}` : '';
                      return `${sku}${pTag}`;
                    })
                    .join(' · ')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1">
              {prog.colorways.map((c, idx) => {
                const hex = getColorSwatchHex(c);
                return (
                  <div
                    key={`${c}-${idx}`}
                    className="flex items-center gap-1 border border-[#E5E5E5] px-1 py-0.5"
                  >
                    <span
                      className="h-2.5 w-3 shrink-0 border border-black/15"
                      style={{ backgroundColor: hex ?? '#EFEFEF' }}
                    />
                    <span className="truncate text-[8.5px] text-[#262626]">{c}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );

        return (
          <section key={`fabric-chunk-${chunkIdx}`} className={sheetBaseClass}>
            {config.showCropMarks && <CropAndSpineMarks isLandscape={isLandscape} />}

            <div className={`grid flex-1 ${isLandscape ? 'grid-cols-2' : 'grid-cols-1 gap-6'}`}>
              <div className={versoSafeCls}>
                {config.showSafeZones && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-2 right-6 border border-dashed border-[var(--metallic-soft)]/70"
                  />
                )}
                <div>
                  <div className="mb-2">
                    <RunningHeader
                      sectionId="fabrics"
                      categoryLabel={`SWATCHES ${chunkIdx + 1}/${fabricChunks.length}`}
                      pageLabel={`P.${String(pageCursor).padStart(2, '0')}A`}
                      rightContext="VERSO"
                    />
                  </div>
                  <div className="divide-y divide-[#E5E5E5]">{leftProgs.map(renderRollRow)}</div>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-[#E5E5E5] pt-2 font-mono text-[9.5px] text-[#737373]">
                  <span>{String(pageCursor).padStart(2, '0')}A</span>
                  <span>SWATCHBOOK LIBRARY</span>
                </div>
              </div>

              <div className={rectoSafeCls}>
                {config.showSafeZones && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-6 right-2 border border-dashed border-[var(--metallic-soft)]/70"
                  />
                )}
                <div>
                  <div className="mb-2">
                    <RunningHeader
                      sectionId="fabrics"
                      categoryLabel="PANTONE TCX & WIDTHS"
                      pageLabel={`P.${String(pageCursor).padStart(2, '0')}B`}
                      rightContext="RECTO"
                    />
                  </div>
                  <div className="divide-y divide-[#E5E5E5]">{rightProgs.map(renderRollRow)}</div>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-[#E5E5E5] pt-2 font-mono text-[9.5px] text-[#737373] tabular-nums">
                  <span>GSM &amp; WIDTH SEPARATED</span>
                  <span>
                    {String(pageCursor).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* ====================================================================
          PRODUCT SPREADS (SYMMETRIC VERSO | RECTO WITH INNER SPINE GUTTER)
          ==================================================================== */}
      {garments.map((item) => {
        pageCursor += 1;
        const pagePadded = String(pageCursor).padStart(2, '0');
        const sectionId = item.gender === 'Women' ? 'women' : 'men';
        const fabricSheetNum = fabricPrintPageByCode.get(item.specs.fabricRollRef);
        const fabricPageLabel =
          fabricSheetNum !== undefined
            ? `P.${String(fabricSheetNum).padStart(2, '0')}`
            : undefined;
        const fabricFamilyName = getFabricFamilyName(item.specs.fabricRollRef);
        const colorRefMap = new Map<string, string>();
        getFactoryFabricColors(item.specs.fabricRollRef).forEach((entry) => {
          const refText = entry.reference.trim() || entry.shadeCode.trim();
          if (refText) {
            colorRefMap.set(entry.colorName.trim().toLowerCase(), refText);
            if (entry.factoryColorName.trim()) {
              colorRefMap.set(entry.factoryColorName.trim().toLowerCase(), refText);
            }
          }
        });
        const sourceNote = conciseSourceNote(item.dataFlags);
        const hasHero = Boolean(item.media.hero.url || item.media.hero.fallbackUrl);
        const detailSlots = [
          {
            key: 'pocket' as const,
            label: 'Detail 01',
            hint: item.detailHints?.pocket ?? 'Pocket & trim closeup',
          },
          {
            key: 'seam' as const,
            label: 'Detail 02',
            hint: item.detailHints?.seam ?? 'Collar & seam closeup',
          },
          {
            key: 'swatch' as const,
            label: 'Fabric Image',
            hint: `Swatch ${item.specs.fabricRollRef}`,
          },
          {
            key: 'custom' as const,
            label: 'Detail 03',
            hint: item.detailHints?.custom ?? 'Fit & construction detail',
          },
        ];
        const heroTopLockup = (
          <div className="space-y-2">
            <RunningHeader
              sectionId={sectionId}
              categoryLabel={item.category}
              pageLabel={`P.${pagePadded}A`}
              rightContext={item.sku}
              overImage={hasHero}
            />
            <div className="flex items-start justify-between gap-3 [text-shadow:0_1px_8px_rgba(247,246,242,0.9)]">
              <div className="inline-block">
                <span className="block font-serif text-3xl font-light leading-[0.88] tracking-tight text-[#111111] tabular-nums">
                  {String(item.index).padStart(2, '0')}
                </span>
                <span className="mt-1 inline-block border-t border-[#111111]/25 pt-1 font-mono text-[8px] font-semibold uppercase tracking-[0.16em] text-[#3E3C37]">
                  {item.gender} · {item.category}
                </span>
              </div>
              <span className="pt-0.5 font-mono text-[8px] font-semibold uppercase tracking-[0.18em] text-[#33322F]">
                {item.specs.fabricRollRef}
              </span>
            </div>
          </div>
        );
        const heroBottomCard = (
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-serif text-[22px] font-normal leading-[1.04] tracking-tight text-[#0A0A0A]">
                {item.title}
              </h2>
              <span className="shrink-0 font-mono text-[9.5px] font-semibold tracking-[0.14em] text-[#3E3C37] tabular-nums">
                {item.sku}
              </span>
            </div>
            <div className="mt-2">
              <ProductSpecStrip
                item={item}
                overlay
                fabricPageLabel={fabricPageLabel}
                showWorkbenchNotes
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between border-t border-[#111111]/15 pt-1 font-mono text-[8px] font-semibold text-[#4E4C47] tabular-nums">
              <span>P.{pagePadded}A</span>
              <span>{fabricFamilyName.toUpperCase()}</span>
            </div>
          </div>
        );
        return (
          <section key={item.id} className={sheetBaseClass}>
            {config.showCropMarks && <CropAndSpineMarks isLandscape={isLandscape} />}

            <div className={`grid flex-1 ${isLandscape ? 'grid-cols-2' : 'grid-cols-1 gap-6'}`}>
              <div
                className={
                  !config.showBlankGuides && isLandscape
                    ? 'relative flex h-full flex-col overflow-hidden border-r border-dashed border-[#E5E5E5] bg-[#FAF9F5]'
                    : versoSafeCls
                }
              >
                {config.showSafeZones && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-2 right-6 z-30 border border-dashed border-[var(--metallic-soft)]/70"
                  />
                )}

                {hasHero || config.showBlankGuides ? (
                  <div className="flex h-full flex-1 flex-col">
                    <PrintPlateBox
                      slot={item.media.hero}
                      label="Primary image"
                      aspectClass="h-full w-full flex-1"
                      fullHeight
                      showBlankGuides={config.showBlankGuides}
                      topOverlay={heroTopLockup}
                      imageOverlay={heroBottomCard}
                      overlayMode="card"
                    />
                    {!hasHero && (
                      <div className="mt-2 border-t border-[#E8E6E0] pt-2">
                        {heroBottomCard}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex h-full w-full flex-1 flex-col justify-between bg-[#FAF9F5] p-5">
                    {heroTopLockup}
                    <div className="my-auto py-6 text-center">
                      <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#77756F]">
                        Studio Hero Photography Pending
                      </p>
                      <p className="mt-1 font-serif text-base italic text-[#55534E]">
                        {item.sku} · {item.specs.fabricRollRef}
                      </p>
                    </div>
                    <div className="pt-2">
                      {heroBottomCard}
                    </div>
                  </div>
                )}
              </div>

              <div className={rectoSafeCls}>
                {config.showSafeZones && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-6 right-2 border border-dashed border-[var(--metallic-soft)]/70"
                  />
                )}

                <RunningHeader
                  sectionId={sectionId}
                  categoryLabel={`${item.category} · DETAILS`}
                  pageLabel={`P.${pagePadded}B`}
                  rightContext={item.sku}
                />

                <div className="my-2.5 flex flex-1 flex-col justify-between gap-3">
                  <div className="border-b border-[#E8E6E0] pb-3">
                    <div className="mb-2 flex items-baseline justify-between gap-2">
                      <h3 className="font-serif text-lg tracking-tight text-[#24231F]">
                        Construction &amp; Craftsmanship
                      </h3>
                      <span className="font-mono text-[8px] tracking-wider text-[#77756F]">
                        4 PLATES
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      {detailSlots.map(({ key, label, hint }) => (
                        <PrintPlateBox
                          key={key}
                          slot={item.media[key]}
                          label={label}
                          hint={hint}
                          aspectClass="aspect-[16/10]"
                          displayScale={key === 'swatch' ? 1.65 : 1}
                          showBlankGuides={config.showBlankGuides}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="border-b border-[#E8E6E0] pb-2.5">
                    <div className="mb-1.5 flex items-baseline justify-between gap-2">
                      <p className="font-mono text-[8px] font-semibold tracking-wider text-[#55534E]">
                        COLORWAYS · {item.specs.fabricRollRef}
                      </p>
                      <span className="font-mono text-[8px] text-[#77756F] tabular-nums">
                        {item.colorways.length} {item.colorways.length === 1 ? 'shade' : 'shades'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-x-2 gap-y-1.5">
                      {item.colorways.map((color, index) => {
                        const hex = getColorSwatchHex(color);
                        const refCode = colorRefMap.get(color.trim().toLowerCase());
                        return (
                          <div
                            key={`${color}-${index}`}
                            className="flex min-w-0 items-center gap-1.5 text-[8.5px] text-[#33322F]"
                          >
                            <span
                              aria-hidden="true"
                              className="h-2.5 w-3 shrink-0 border border-black/15"
                              style={
                                hex
                                  ? { backgroundColor: hex }
                                  : {
                                      backgroundImage:
                                        'repeating-linear-gradient(45deg, #F0F0F0, #F0F0F0 3px, #FFFFFF 3px, #FFFFFF 6px)',
                                    }
                              }
                            />
                            <span className="min-w-0 truncate">
                              {color}
                              {refCode && (
                                <span className="ml-1 font-mono text-[7px] text-[#77756F]">
                                  ({refCode})
                                </span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between gap-2.5">
                    <div>
                      <p className="font-mono text-[8px] font-semibold uppercase tracking-wider text-[#55534E]">
                        Silhouette &amp; Production Notes
                      </p>
                      <p className="mt-1 font-serif text-[13.5px] italic leading-snug text-[#1F1E1B]">
                        {item.summary}
                      </p>
                      <ul className="mt-2 space-y-1 text-[9.5px] leading-relaxed text-[#404040]">
                        {item.descriptionBullets.slice(0, 3).map((bullet, idx) => (
                          <li key={idx} className="flex items-baseline gap-2">
                            <span className="font-mono text-[8px] text-[var(--metallic-strong)] tabular-nums">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-[#E8E6E0] pt-2.5 text-[9px]">
                      <div>
                        <dt className="font-mono text-[7.5px] uppercase tracking-wider text-[#77756F]">
                          Stitch Density
                        </dt>
                        <dd className="mt-0.5 font-medium text-[#111111]">
                          {item.specs.stitchDensity}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[7.5px] uppercase tracking-wider text-[#77756F]">
                          Seam Finish
                        </dt>
                        <dd className="mt-0.5 font-medium text-[#111111]">
                          {item.specs.seamFinish}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[7.5px] uppercase tracking-wider text-[#77756F]">
                          Pocket &amp; Trim
                        </dt>
                        <dd className="mt-0.5 font-medium text-[#111111]">
                          {item.specs.pocketConstruction}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[7.5px] uppercase tracking-wider text-[#77756F]">
                          Size Run · MOQ
                        </dt>
                        <dd className="mt-1 flex flex-col gap-1">
                          <SizeRunChips sizeRun={item.specs.sizeRun} size="xs" />
                          <span className="font-mono text-[8px] font-medium text-[#55534E] tabular-nums">
                            MOQ {displayMoq(item.specs.moq)}
                          </span>
                        </dd>
                      </div>
                    </dl>

                    {sourceNote && (
                      <p className="border-t border-[#E8E6E0] pt-1.5 text-[8.5px] leading-relaxed text-[#77756F]">
                        {sourceNote}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#E8E6E0] pt-2 font-mono text-[8.5px] text-[#77756F] tabular-nums">
                  <span>{meta.season}</span>
                  <span className="text-[#24231F]">
                    {String(pageCursor).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
};
