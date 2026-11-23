import React from 'react';
import { Printer, Ruler } from 'lucide-react';
import type {
  CatalogueMetadata,
  GarmentItem,
  MediaSlot,
  PrintConfig,
} from '../types/catalogue';
import {
  BRAND_LOGO_PATH,
  CATEGORIES,
  CM_OEM_ODM_PILLARS,
  PRINT_PRODUCTION_SPEC,
  STAGE_LABELS,
  buildFabricSwatchPrograms,
  getColorSwatchHex,
} from '../data/garments';

interface PrintSheetPreviewProps {
  garments: GarmentItem[];
  allGarments: GarmentItem[];
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
}> = ({ slot, label, aspectClass, showBlankGuides }) => (
  <div className="flex flex-col">
    <div
      className={`relative w-full overflow-hidden border border-[#DCDCDC] bg-[#FAFAFA] ${aspectClass}`}
    >
      <span aria-hidden="true" className="absolute top-1.5 left-1.5 h-2 w-2 border-t border-l metallic-frame-tick" />
      <span aria-hidden="true" className="absolute top-1.5 right-1.5 h-2 w-2 border-t border-r metallic-frame-tick" />
      <span aria-hidden="true" className="absolute bottom-1.5 left-1.5 h-2 w-2 border-b border-l metallic-frame-tick" />
      <span aria-hidden="true" className="absolute bottom-1.5 right-1.5 h-2 w-2 border-b border-r metallic-frame-tick" />

      {slot.url ? (
        <img
          src={slot.url}
          alt={`${label} — ${slot.caption}`}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="plate-blueprint-bg flex h-full w-full flex-col items-center justify-center p-2.5 text-center">
          {showBlankGuides && (
            <>
              <span className="font-sans text-[11px] font-medium text-[#262626]">{label}</span>
              <span className="mt-0.5 font-mono text-[9.5px] text-[#737373] tabular-nums">
                {slot.aspectLabel}
              </span>
            </>
          )}
        </div>
      )}
    </div>
    <div className="mt-1 flex items-baseline justify-between gap-2 text-[9.5px]">
      <span className="font-serif italic text-[#404040] truncate">{slot.caption}</span>
      <span className="font-mono text-[#737373] shrink-0">{STAGE_LABELS[slot.stage]}</span>
    </div>
  </div>
);

export const PrintSheetPreview: React.FC<PrintSheetPreviewProps> = ({
  garments,
  allGarments,
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

  const fabricPrograms = showFabrics ? buildFabricSwatchPrograms(allGarments) : [];
  const fabricChunks: typeof fabricPrograms[] = [];
  for (let i = 0; i < fabricPrograms.length; i += 4) {
    fabricChunks.push(fabricPrograms.slice(i, i + 4));
  }

  const totalPages =
    (showCoverAndIndex ? 1 : 0) +
    (showIndex ? 1 : 0) +
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
                <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3 text-[10px] text-[#737373]">
                  <span className="font-mono tracking-wider text-[#0A0A0A]">DOT / DT APPAREL</span>
                  <span>CM · OEM · ODM PORTFOLIO</span>
                </div>

                <div className="my-auto space-y-5 py-6">
                  <img
                    src={BRAND_LOGO_PATH}
                    alt="Dream Tomorrow Monogram"
                    className="h-12 w-auto object-contain"
                  />
                  <h2 className="font-sans text-4xl font-semibold tracking-tight text-[#0A0A0A]">
                    Dream Tomorrow
                  </h2>
                  <p className="font-mono text-xs text-[var(--metallic-strong)]">{meta.edition}</p>
                  <div className="h-px w-16 metallic-rule" />
                  <p className="max-w-[52ch] text-xs leading-relaxed text-[#525252]">
                    {meta.subtitle}
                  </p>

                  <div className="grid grid-cols-3 gap-3 border-t border-[#E5E5E5] pt-4 text-[10px]">
                    {CM_OEM_ODM_PILLARS.map((p) => (
                      <div key={p.code}>
                        <p className="font-mono font-semibold text-[#0A0A0A]">{p.title}</p>
                        <p className="mt-1 leading-relaxed text-[#525252]">{p.detail}</p>
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
                <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3 font-mono text-[10px] text-[#737373]">
                  <span>COVER FOLIO</span>
                  <span>{garments.length} STYLES · 15 FABRICS</span>
                </div>

                <div className="my-auto py-4">
                  <div className="relative mx-auto aspect-[3/4] max-h-[540px] w-full overflow-hidden border border-[#DCDCDC] bg-[#FAFAFA]">
                    {coverCustomImage ? (
                      <img
                        src={coverCustomImage}
                        alt="Dream Tomorrow Cover"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="plate-blueprint-bg flex h-full w-full flex-col items-center justify-center p-6 text-center">
                        <img
                          src={BRAND_LOGO_PATH}
                          alt="DT"
                          className="h-20 w-auto object-contain"
                        />
                        <span className="mt-4 font-serif text-base italic text-[#404040]">
                          Knitwear &amp; Woven Manufacturing Monograph
                        </span>
                        <span className="mt-2 font-mono text-[10.5px] text-[#525252]">
                          {garments.length} STYLES · 15 SWATCHBOOK FABRICS
                        </span>
                      </div>
                    )}
                  </div>
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
                  <div className="mb-3 flex items-center justify-between border-b border-[#E5E5E5] pb-2.5 text-[10px] text-[#737373]">
                    <span className="font-mono text-[#0A0A0A]">TABLE OF CONTENTS</span>
                    <span>MEN&apos;S DIVISION (NAM · {menItems.length})</span>
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
                          className="flex items-baseline justify-between gap-2 py-1 text-[9.5px]"
                        >
                          <div className="flex items-baseline gap-2 min-w-0">
                            <span className="font-mono font-medium text-[#0A0A0A] tabular-nums shrink-0">
                              {item.sku}
                            </span>
                            <span className="truncate text-[#262626]">{item.title}</span>
                          </div>
                          <div className="flex items-baseline gap-2 shrink-0 font-mono text-[9.5px] text-[#737373] tabular-nums">
                            <span>{item.specs.fabricRollRef}</span>
                            <span className="text-[#0A0A0A]">p.{String(itemPage).padStart(2, '0')}</span>
                          </div>
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
                  <div className="mb-3 flex items-center justify-between border-b border-[#E5E5E5] pb-2.5 text-[10px] text-[#737373]">
                    <span className="font-mono text-[#0A0A0A]">COLLECTION DIRECTORY</span>
                    <span>WOMEN&apos;S DIVISION (NỮ · {womenItems.length})</span>
                  </div>

                  <div className="divide-y divide-[#EFEFEF] border-t border-b border-[#E5E5E5]">
                    {womenItems.map((item) => {
                      const itemPage = pageOffset + garments.findIndex((g) => g.id === item.id) + 1;
                      return (
                        <div
                          key={item.id}
                          className="flex items-baseline justify-between gap-2 py-1 text-[9.5px]"
                        >
                          <div className="flex items-baseline gap-2 min-w-0">
                            <span className="font-mono font-medium text-[#0A0A0A] tabular-nums shrink-0">
                              {item.sku}
                            </span>
                            <span className="truncate text-[#262626]">{item.title}</span>
                          </div>
                          <div className="flex items-baseline gap-2 shrink-0 font-mono text-[9.5px] text-[#737373] tabular-nums">
                            <span>{item.specs.fabricRollRef}</span>
                            <span className="text-[#0A0A0A]">p.{String(itemPage).padStart(2, '0')}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[#E5E5E5] pt-2.5 font-mono text-[10px] text-[#737373] tabular-nums">
                  <span>15 FABRIC PROGRAMS</span>
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

        const renderRollRow = (prog: (typeof chunk)[number]) => (
          <div key={prog.fabricCode} className="space-y-2 py-3">
            <div className="grid grid-cols-12 items-start gap-3">
              <div className="col-span-3">
                <div className="aspect-square w-full overflow-hidden border border-[#DCDCDC] bg-[#FAFAFA]">
                  {prog.swatchImageUrl ? (
                    <img
                      src={prog.swatchImageUrl}
                      alt={prog.fabricCode}
                      className="h-full w-full object-cover"
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
                  <p className="font-mono text-[11px] font-semibold text-[#0A0A0A]">
                    {prog.fabricCode}
                  </p>
                  <span className="font-mono text-[#737373]">{prog.genders.join(' / ')}</span>
                </div>
                <p className="text-[#262626]">{prog.composition}</p>
                <p className="font-mono text-[#525252] tabular-nums">
                  GSM: {prog.weightGsm} · Width: {prog.fabricWidth}
                </p>
                <p className="font-mono text-[9px] text-[#737373]">
                  Styles: {prog.linkedSkus.join(', ')}
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
                  <div className="mb-2 flex items-center justify-between border-b border-[#E5E5E5] pb-2 text-[10px] text-[#737373]">
                    <span className="font-mono font-medium text-[#0A0A0A]">
                      FABRIC SWATCH PROGRAM ({chunkIdx + 1}/{fabricChunks.length})
                    </span>
                    <span>VERSO</span>
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
                  <div className="mb-2 flex items-center justify-between border-b border-[#E5E5E5] pb-2 text-[10px] text-[#737373]">
                    <span className="font-mono">PANTONE TCX &amp; MILL WIDTHS</span>
                    <span>RECTO</span>
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
        return (
          <section key={item.id} className={sheetBaseClass}>
            {config.showCropMarks && <CropAndSpineMarks isLandscape={isLandscape} />}

            <div className={`grid flex-1 ${isLandscape ? 'grid-cols-2' : 'grid-cols-1 gap-6'}`}>
              {/* LEFT PAGE (VERSO): Title, 5-Col Buyer Strip, Hero Silhouette & Swatch/Custom */}
              <div className={versoSafeCls}>
                {config.showSafeZones && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-2 right-6 border border-dashed border-[var(--metallic-soft)]/70"
                  />
                )}

                <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2 text-[10px] text-[#737373]">
                  <div className="flex items-center gap-2">
                    <img src={BRAND_LOGO_PATH} alt="DT" className="h-3.5 w-auto object-contain" />
                    <span className="font-mono font-medium text-[#0A0A0A]">DOT / DT APPAREL</span>
                  </div>
                  <span className="font-mono">
                    {item.gender.toUpperCase()} ({item.genderCode.toUpperCase()}) · {item.category.toUpperCase()}
                  </span>
                </div>

                <div className="my-2.5 flex flex-1 flex-col justify-between gap-2.5">
                  <div>
                    <h3 className="font-sans text-lg font-semibold leading-tight tracking-tight text-[#0A0A0A]">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-[10px] leading-relaxed text-[#525252]">{item.summary}</p>
                  </div>

                  {/* Separate Buyer Identity Strip (No GSM/Width swap) */}
                  <div className="grid grid-cols-5 gap-2 border-t border-b border-[#E5E5E5] py-2 text-[9.5px]">
                    <div>
                      <span className="block text-[#737373]">Style Code</span>
                      <span className="font-mono font-semibold text-[#0A0A0A]">{item.sku}</span>
                    </div>
                    <div>
                      <span className="block text-[#737373]">Swatchbook</span>
                      <span className="font-mono text-[#0A0A0A] truncate block">
                        {item.specs.fabricRollRef}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[#737373]">GSM</span>
                      <span className="font-mono text-[#0A0A0A] tabular-nums">
                        {item.specs.weightGsm}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[#737373]">Width</span>
                      <span className="font-mono text-[#0A0A0A] tabular-nums">
                        {item.specs.fabricWidth}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[#737373]">Colors</span>
                      <span className="font-mono text-[#0A0A0A] tabular-nums">
                        {item.colorCount}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 items-start gap-3">
                    <div className="col-span-8">
                      <PrintPlateBox
                        slot={item.media.hero}
                        label="Primary Silhouette"
                        aspectClass="aspect-[3/4]"
                        showBlankGuides={config.showBlankGuides}
                      />
                    </div>
                    <div className="col-span-4 space-y-2.5">
                      <PrintPlateBox
                        slot={item.media.swatch}
                        label="Fabric Swatch"
                        aspectClass="aspect-square"
                        showBlankGuides={config.showBlankGuides}
                      />
                      <PrintPlateBox
                        slot={item.media.custom}
                        label="Fit / Trim Slot"
                        aspectClass="aspect-[4/3]"
                        showBlankGuides={config.showBlankGuides}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#E5E5E5] pt-2 font-mono text-[9.5px] text-[#737373] tabular-nums">
                  <span>{String(pageCursor).padStart(2, '0')}A</span>
                  <a href={item.productUrl} className="underline underline-offset-2">
                    {item.productUrl}
                  </a>
                </div>
              </div>

              {/* RIGHT PAGE (RECTO): Craftsmanship Close-Ups, Copy, Colorways & B2B Ledger */}
              <div className={rectoSafeCls}>
                {config.showSafeZones && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-6 right-2 border border-dashed border-[var(--metallic-soft)]/70"
                  />
                )}

                <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2 font-mono text-[10px] text-[#737373] tabular-nums">
                  <span className="font-medium text-[#0A0A0A]">STYLE: {item.sku}</span>
                  <span>{item.specs.cmOemOdmScope.toUpperCase()}</span>
                </div>

                <div className="my-2.5 flex flex-1 flex-col justify-between gap-2.5">
                  {item.dataFlags && item.dataFlags.length > 0 && (
                    <div className="border border-[#D4D4D4] bg-[#FAFAFA] px-2.5 py-1.5 text-[9.5px] text-[#404040]">
                      <span className="font-semibold text-[#0A0A0A]">Source Flag: </span>
                      <span>{item.dataFlags.join(' ')}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <PrintPlateBox
                      slot={item.media.pocket}
                      label="Pocket Detail"
                      aspectClass="aspect-[4/3]"
                      showBlankGuides={config.showBlankGuides}
                    />
                    <PrintPlateBox
                      slot={item.media.seam}
                      label="Inner Seam"
                      aspectClass="aspect-[4/3]"
                      showBlankGuides={config.showBlankGuides}
                    />
                  </div>

                  {/* Description & Key Construction Features */}
                  <div className="grid grid-cols-2 gap-4 border-t border-[#E5E5E5] pt-2 text-[9.5px] leading-snug">
                    <div>
                      <p className="font-sans font-semibold text-[#0A0A0A]">
                        Description &amp; Stretch / Feel
                      </p>
                      <p className="mt-0.5 text-[#262626]">{item.specs.stretchFeelNote}</p>
                      <ul className="mt-1 space-y-0.5 text-[#404040]">
                        {item.descriptionBullets.slice(0, 2).map((b, idx) => (
                          <li key={idx}>• {b}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-sans font-semibold text-[#0A0A0A]">
                        Key Construction Features
                      </p>
                      <ul className="mt-1 space-y-0.5 text-[#404040]">
                        {item.keyFeatures.slice(0, 3).map((f, idx) => (
                          <li key={idx}>• {f}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Readable Colorways */}
                  <div className="border-t border-[#EFEFEF] pt-1.5">
                    <p className="mb-1 text-[9.5px] font-semibold text-[#0A0A0A]">
                      Available Colors ({item.colorCount})
                    </p>
                    <div className="grid grid-cols-3 gap-1">
                      {item.colorways.map((c, idx) => {
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

                  {/* B2B Spec Ledger */}
                  <div className="border-t border-[#E5E5E5] pt-1.5 text-[9.5px]">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                      <div className="flex justify-between border-b border-[#F2F2F2] py-0.5">
                        <span className="text-[#737373]">Fabric Content</span>
                        <span className="text-right text-[#0A0A0A]">{item.specs.composition}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#F2F2F2] py-0.5">
                        <span className="text-[#737373]">Stitch Density</span>
                        <span className="font-mono text-[#0A0A0A]">{item.specs.stitchDensity}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#F2F2F2] py-0.5">
                        <span className="text-[#737373]">Inner Seam</span>
                        <span className="text-right text-[#0A0A0A]">{item.specs.seamFinish}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#F2F2F2] py-0.5">
                        <span className="text-[#737373]">Size / MOQ</span>
                        <span className="font-mono text-[#0A0A0A]">
                          {item.specs.sizeRun} · {item.specs.moq}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#E5E5E5] pt-2 font-mono text-[9.5px] text-[#737373] tabular-nums">
                  <span>{meta.season}</span>
                  <span className="text-[#0A0A0A]">
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
