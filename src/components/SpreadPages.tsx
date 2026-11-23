import React, { useRef, useState } from 'react';
import {
  ArrowRight,
  Download,
  FileSpreadsheet,
  HardDrive,
  Layers,
  Upload,
} from 'lucide-react';
import type {
  CatalogueMetadata,
  GarmentItem,
  MediaSlot,
  MediaSlotKey,
  MetallicTheme,
} from '../types/catalogue';
import {
  BRAND_LOGO_PATH,
  CATEGORIES,
  CM_OEM_ODM_PILLARS,
  METALLIC_THEMES,
  PRINT_PRODUCTION_SPEC,
} from '../data/garments';
import { readImageFileAsDataUrl } from '../utils/media';
import { FabricSwatchBoard } from './FabricSwatchBoard';
import { GarmentSpread, type SpreadLeafSide } from './GarmentSpread';

export interface SpreadPagesProps {
  pageIndex: number; // 0..totalSpreads-1
  totalSpreads: number;
  garments: GarmentItem[];
  meta: CatalogueMetadata;
  metallicTheme: MetallicTheme;
  editMode: boolean;
  shortlist: string[];
  coverCustomImage: string;
  showSafeZones?: boolean;
  side?: SpreadLeafSide;
  isPreviewLayer?: boolean;
  onGoToPage: (page: number) => void;
  onChangeMetallicTheme: (theme: MetallicTheme) => void;
  onDropCoverImage: (dataUrl: string) => void;
  onReplaceFile: (garmentId: string, slotKey: MediaSlotKey, dataUrl: string) => void;
  onReplaceFabricSwatch: (fabricCode: string, dataUrl: string) => void;
  onToggleShortlist: (id: string) => void;
  onInspectMedia: (slot: MediaSlot, titleLabel: string, garmentTitle: string) => void;
  onOpenEditor: (garmentIndex: number, focusSlot?: MediaSlotKey) => void;
  onOpenVideo: (garment: GarmentItem) => void;
  onExportCurrentPdf: (garmentIndex: number) => void;
  onExportCsv: () => void;
  onExportJson: () => void;
  onTriggerImportCsv: () => void;
  onTriggerImportJson: () => void;
}

const LeafShell: React.FC<{
  side: 'verso' | 'recto';
  showSafeZones?: boolean;
  headerLeft: React.ReactNode;
  headerRight: React.ReactNode;
  footerLeft: React.ReactNode;
  footerRight: React.ReactNode;
  bgClass?: string;
  children: React.ReactNode;
}> = ({
  side,
  showSafeZones = false,
  headerLeft,
  headerRight,
  footerLeft,
  footerRight,
  bgClass = 'bg-white',
  children,
}) => {
  const isVerso = side === 'verso';

  return (
    <div
      className={`relative flex h-full min-h-[700px] flex-col justify-between ${bgClass} ${
        isVerso
          ? 'py-6 pl-6 pr-8 sm:py-7 sm:pl-8 sm:pr-11 lg:py-8 lg:pl-9 lg:pr-14'
          : 'py-6 pl-8 pr-6 sm:py-7 sm:pl-11 sm:pr-8 lg:py-8 lg:pl-14 lg:pr-9'
      }`}
    >
      {/* Physical Binding Spine Crease Shadow */}
      <div
        aria-hidden="true"
        className={`${
          isVerso ? 'spine-verso-shadow right-0' : 'spine-recto-shadow left-0'
        } pointer-events-none absolute inset-y-0 w-14`}
      />

      {/* Optional Print Safe-Zone Guide (14mm outer / 18mm inner spine gutter) */}
      {showSafeZones && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute top-4 bottom-4 border border-dashed border-[var(--metallic-soft)]/70 ${
            isVerso ? 'left-4 right-8' : 'left-8 right-4'
          }`}
        />
      )}

      {/* Leaf Running Header */}
      <div className="relative z-10 mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#EFEFEF] pb-2.5 font-mono text-[10.5px] text-[#737373]">
        <span>{headerLeft}</span>
        <span>{headerRight}</span>
      </div>

      {/* Leaf Main Safe Zone Content */}
      <div className="relative z-10 flex flex-1 flex-col justify-start">{children}</div>

      {/* Leaf Outer Folio Footer */}
      <div className="relative z-10 mt-4 flex items-center justify-between border-t border-[#EFEFEF] pt-2.5 font-mono text-[10px] text-[#8A8A8A] tabular-nums">
        <span>{footerLeft}</span>
        <span>{footerRight}</span>
      </div>
    </div>
  );
};

export const SpreadPages: React.FC<SpreadPagesProps> = ({
  pageIndex,
  totalSpreads,
  garments,
  meta,
  metallicTheme,
  editMode,
  shortlist,
  coverCustomImage,
  showSafeZones = false,
  side = 'full',
  isPreviewLayer = false,
  onGoToPage,
  onChangeMetallicTheme,
  onDropCoverImage,
  onReplaceFile,
  onReplaceFabricSwatch,
  onToggleShortlist,
  onInspectMedia,
  onOpenEditor,
  onOpenVideo,
  onExportCurrentPdf,
  onExportCsv,
  onExportJson,
  onTriggerImportCsv,
  onTriggerImportJson,
}) => {
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const [coverDragging, setCoverDragging] = useState(false);

  const productOffset = 6; // 0=Cover, 1=TOC, 2..5=Swatches (4 spreads), 6..48=43 Products, 49=Asset/Data
  const menItems = garments.filter((g) => g.gender === 'Men');
  const womenItems = garments.filter((g) => g.gender === 'Women');

  const handleCoverDropFiles = async (files: FileList | null) => {
    if (isPreviewLayer || !files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;
    const dataUrl = await readImageFileAsDataUrl(file);
    onDropCoverImage(dataUrl);
  };

  const renderSpreadPair = (verso: React.ReactNode, recto: React.ReactNode) => {
    if (side === 'verso') return verso;
    if (side === 'recto') return recto;
    return (
      <div className="relative grid grid-cols-1 bg-white lg:grid-cols-2">
        {verso}
        {recto}
        <div
          aria-hidden="true"
          className="book-spine-crease pointer-events-none absolute inset-y-0 left-1/2 hidden w-1.5 -translate-x-1/2 lg:block"
        />
      </div>
    );
  };

  /* ========================================================================
     SPREAD 01: COVER & CM / OEM / ODM CAPABILITY OVERVIEW
     ======================================================================== */
  if (pageIndex === 0) {
    const coverVerso = (
      <LeafShell
        side="verso"
        showSafeZones={showSafeZones}
        headerLeft="DOT / DT APPAREL · DREAM TOMORROW"
        headerRight="CM · OEM · ODM B2B PORTFOLIO"
        footerLeft="SPREAD 01A"
        footerRight="B2B LINE MONOGRAPH"
      >
        <div className="flex flex-1 flex-col justify-between py-2">
          <div>
            <h1 className="mt-2 font-sans text-4xl font-semibold tracking-tight text-[#0A0A0A] sm:text-5xl lg:leading-[1.04]">
              Dream Tomorrow
            </h1>
            <p className="mt-2 font-mono text-xs tracking-wide text-[var(--metallic-strong)]">
              {meta.edition}
            </p>
            <div className="mt-5 h-px w-20 metallic-rule" />
            <p className="mt-5 max-w-[56ch] text-sm leading-relaxed text-[#404040]">
              {meta.subtitle}
            </p>

            {/* CM / OEM / ODM Manufacturing Capabilities */}
            <div className="mt-7 grid grid-cols-1 gap-5 border-t border-[#EFEFEF] pt-6 sm:grid-cols-3">
              {CM_OEM_ODM_PILLARS.map((p) => (
                <div key={p.code} className="space-y-1.5">
                  <span className="font-mono text-[11px] font-semibold text-[var(--metallic-strong)]">
                    {p.code}
                  </span>
                  <h2 className="font-sans text-xs font-semibold text-[#0A0A0A]">{p.title}</h2>
                  <p className="text-[11px] leading-relaxed text-[#525252]">{p.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#EFEFEF] pt-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-[11px] text-[#737373]">Accent:</span>
              {METALLIC_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  disabled={isPreviewLayer}
                  onClick={() => onChangeMetallicTheme(theme.id)}
                  className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[11px] font-medium cursor-pointer ${
                    metallicTheme === theme.id
                      ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white'
                      : 'border-[#E5E5E5] bg-white text-[#404040] hover:border-[#0A0A0A]'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 border border-black/15"
                    style={{ backgroundColor: theme.swatch }}
                  />
                  <span>{theme.label}</span>
                </button>
              ))}
            </div>

            {!isPreviewLayer && (
              <button
                type="button"
                onClick={() => onGoToPage(1)}
                className="inline-flex items-center gap-2 bg-[#0A0A0A] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#262626] whitespace-nowrap cursor-pointer"
              >
                <span>Open Table of Contents</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </LeafShell>
    );

    const coverRecto = (
      <LeafShell
        side="recto"
        bgClass="bg-[#FCFCFC]"
        showSafeZones={showSafeZones}
        headerLeft="COVER FOLIO"
        headerRight="43 STYLES · 15 FABRICS"
        footerLeft="PRINT-READY SPINE MARGIN"
        footerRight="SPREAD 01B"
      >
        <div className="flex flex-1 flex-col justify-between gap-5">
          <div
            role={isPreviewLayer ? undefined : 'button'}
            tabIndex={isPreviewLayer ? undefined : 0}
            onClick={isPreviewLayer ? undefined : () => coverInputRef.current?.click()}
            onKeyDown={
              isPreviewLayer
                ? undefined
                : (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      coverInputRef.current?.click();
                    }
                  }
            }
            onDragOver={
              isPreviewLayer
                ? undefined
                : (e) => {
                    e.preventDefault();
                    setCoverDragging(true);
                  }
            }
            onDragLeave={isPreviewLayer ? undefined : () => setCoverDragging(false)}
            onDrop={
              isPreviewLayer
                ? undefined
                : (e) => {
                    e.preventDefault();
                    setCoverDragging(false);
                    handleCoverDropFiles(e.dataTransfer.files);
                  }
            }
            className={`group relative flex min-h-[400px] flex-1 flex-col items-center justify-center overflow-hidden border p-6 text-center transition-colors ${
              isPreviewLayer ? '' : 'cursor-pointer'
            } ${
              coverDragging
                ? 'border-[#0A0A0A] bg-[#F2F2F2]'
                : 'border-[#E5E5E5] bg-white hover:border-[var(--metallic)]'
            }`}
          >
            {!isPreviewLayer && (
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  handleCoverDropFiles(e.target.files);
                  e.target.value = '';
                }}
              />
            )}

            {coverCustomImage ? (
              <>
                <img
                  src={coverCustomImage}
                  alt="Dream Tomorrow Custom Cover"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="relative z-10 bg-white/90 px-4 py-2 text-xs font-medium text-[#0A0A0A]">
                  Session Cover Preview · Drop image to replace
                </div>
              </>
            ) : (
              <>
                <img
                  src={BRAND_LOGO_PATH}
                  alt="Dream Tomorrow DT Monogram"
                  className="h-24 w-auto object-contain"
                />
                <div className="mt-6 h-px w-14 metallic-rule" />
                <p className="mt-4 font-serif text-lg italic text-[#404040]">
                  Knitwear &amp; Woven Manufacturing Monograph
                </p>
                <p className="mt-2 font-mono text-[11px] text-[#737373]">
                  Drop cover campaign image here (optional)
                </p>
              </>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-[#EAEAEA] pt-3 text-center">
            <div>
              <p className="font-mono text-sm font-medium text-[#0A0A0A] tabular-nums">
                {menItems.length}
              </p>
              <p className="text-[11px] text-[#737373]">Men&apos;s (Nam)</p>
            </div>
            <div>
              <p className="font-mono text-sm font-medium text-[#0A0A0A] tabular-nums">
                {womenItems.length}
              </p>
              <p className="text-[11px] text-[#737373]">Women&apos;s (Nữ)</p>
            </div>
            <div>
              <p className="font-mono text-sm font-medium text-[#0A0A0A] tabular-nums">15</p>
              <p className="text-[11px] text-[#737373]">Fabric Rolls</p>
            </div>
          </div>
        </div>
      </LeafShell>
    );

    return renderSpreadPair(coverVerso, coverRecto);
  }

  /* ========================================================================
     SPREAD 02: TABLE OF CONTENTS & PAGE JUMP DIRECTORY
     ======================================================================== */
  if (pageIndex === 1) {
    const tocVerso = (
      <LeafShell
        side="verso"
        showSafeZones={showSafeZones}
        headerLeft="TABLE OF CONTENTS"
        headerRight="PORTFOLIO CHAPTERS"
        footerLeft="P. 02A"
        footerRight="MEN'S DIVISION (NAM)"
      >
        <div>
          <h2 className="font-sans text-lg font-semibold tracking-tight text-[#0A0A0A]">
            Catalogue Architecture
          </h2>
          <div className="mt-3 divide-y divide-[#EFEFEF] border-t border-b border-[#E5E5E5] text-[11.5px]">
            <button
              type="button"
              disabled={isPreviewLayer}
              onClick={() => onGoToPage(0)}
              className="flex w-full items-center justify-between py-2 text-left hover:bg-[#FAFAFA] cursor-pointer"
            >
              <span>01. Cover &amp; CM / OEM / ODM Capabilities</span>
              <span className="font-mono text-[#737373]">Spread 01</span>
            </button>
            <button
              type="button"
              disabled={isPreviewLayer}
              onClick={() => onGoToPage(2)}
              className="flex w-full items-center justify-between py-2 text-left hover:bg-[#FAFAFA] cursor-pointer"
            >
              <span>02. Fabric &amp; Color Swatch Program (15 Rolls)</span>
              <span className="font-mono text-[#737373]">Spreads 03–06</span>
            </button>
            {CATEGORIES.map((c) => {
              const firstInCat = garments.find((g) => g.category === c.name);
              const startNum = productOffset + Number(c.range.split(' ')[0]);
              const endNum = productOffset + Number(c.range.split(' ').pop());
              return (
                <button
                  key={c.name}
                  type="button"
                  disabled={isPreviewLayer}
                  onClick={() => firstInCat && onGoToPage(productOffset + firstInCat.index - 1)}
                  className="flex w-full items-center justify-between py-2 text-left hover:bg-[#FAFAFA] cursor-pointer"
                >
                  <span>
                    Ch. {c.numeral}. {c.name} ({c.count} styles)
                  </span>
                  <span className="font-mono text-[#737373]">
                    Spreads {String(startNum).padStart(2, '0')}–{String(endNum).padStart(2, '0')}
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              disabled={isPreviewLayer}
              onClick={() => onGoToPage(totalSpreads - 1)}
              className="flex w-full items-center justify-between py-2 text-left hover:bg-[#FAFAFA] cursor-pointer"
            >
              <span>03. Print Specs, Compression &amp; CSV / JSON Swap</span>
              <span className="font-mono text-[#737373]">Spread {totalSpreads}</span>
            </button>
          </div>

          <h3 className="mt-5 font-sans text-xs font-semibold tracking-wide text-[#0A0A0A]">
            Men&apos;s Division (Nam — {menItems.length} Styles)
          </h3>
          <div className="mt-2 divide-y divide-[#F2F2F2] border-t border-b border-[#EFEFEF]">
            {menItems.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={isPreviewLayer}
                onClick={() => onGoToPage(productOffset + item.index - 1)}
                className="flex w-full items-baseline justify-between gap-2 py-1 text-left text-[10.5px] hover:bg-[#FAFAFA] cursor-pointer"
              >
                <span className="truncate">
                  <span className="mr-2 font-mono font-medium text-[#0A0A0A]">{item.sku}</span>
                  <span className="text-[#404040]">{item.title}</span>
                </span>
                <span className="shrink-0 font-mono text-[10px] text-[#737373] tabular-nums">
                  {item.specs.fabricRollRef} · Sp.{String(productOffset + item.index).padStart(2, '0')}
                </span>
              </button>
            ))}
          </div>
        </div>
      </LeafShell>
    );

    const tocRecto = (
      <LeafShell
        side="recto"
        showSafeZones={showSafeZones}
        headerLeft="INDEX DIRECTORY"
        headerRight="WOMEN'S LINE (NỮ)"
        footerLeft="DOT / DT APPAREL"
        footerRight="P. 02B"
      >
        <div>
          <h3 className="font-sans text-xs font-semibold tracking-wide text-[#0A0A0A]">
            Women&apos;s Division (Nữ — {womenItems.length} Styles)
          </h3>
          <div className="mt-2.5 divide-y divide-[#F2F2F2] border-t border-b border-[#EFEFEF]">
            {womenItems.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={isPreviewLayer}
                onClick={() => onGoToPage(productOffset + item.index - 1)}
                className="flex w-full items-baseline justify-between gap-2 py-1.5 text-left text-[10.5px] hover:bg-[#FAFAFA] cursor-pointer"
              >
                <span className="truncate">
                  <span className="mr-2 font-mono font-medium text-[#0A0A0A]">{item.sku}</span>
                  <span className="text-[#404040]">{item.title}</span>
                </span>
                <span className="shrink-0 font-mono text-[10px] text-[#737373] tabular-nums">
                  {item.specs.fabricRollRef} · Sp.{String(productOffset + item.index).padStart(2, '0')}
                </span>
              </button>
            ))}
          </div>
        </div>
      </LeafShell>
    );

    return renderSpreadPair(tocVerso, tocRecto);
  }

  /* ========================================================================
     SPREADS 03–06: DEDICATED FABRIC & COLOR SWATCH SPREADS (2 VERSO + 2 RECTO)
     ======================================================================== */
  if (pageIndex >= 2 && pageIndex <= 5) {
    const swatchSpreadNum = pageIndex - 1; // 1..4
    const baseRollIdx = (pageIndex - 2) * 4;

    const swatchVerso = (
      <LeafShell
        side="verso"
        showSafeZones={showSafeZones}
        headerLeft={`FABRIC & COLOR SWATCHES · PART ${swatchSpreadNum}/4`}
        headerRight="LEFT LEAF (VERSO)"
        footerLeft={`P. 0${swatchSpreadNum + 2}A`}
        footerRight="SWATCHBOOK TEXTILES"
      >
        <div>
          <div className="mb-3">
            <h2 className="font-sans text-lg font-semibold tracking-tight text-[#0A0A0A]">
              Swatchbook Textiles &amp; Pantone TCX Palette
            </h2>
            <p className="mt-0.5 font-serif text-xs italic text-[#737373]">
              Drop 1:1 fabric scans onto any tile to propagate across linked styles
            </p>
          </div>
          <FabricSwatchBoard
            garments={garments}
            onReplaceFabricSwatch={onReplaceFabricSwatch}
            onSelectStyleIndex={(idx) => onGoToPage(productOffset + idx - 1)}
            sliceRange={[baseRollIdx, baseRollIdx + 2]}
            embeddedInFlipbook
            compactLeaf
            isPreviewLayer={isPreviewLayer}
          />
        </div>
      </LeafShell>
    );

    const swatchRecto = (
      <LeafShell
        side="recto"
        showSafeZones={showSafeZones}
        headerLeft="PANTONE TCX & ROLL WIDTH SPECS"
        headerRight="RIGHT LEAF (RECTO)"
        footerLeft="GSM & WIDTH SEPARATED"
        footerRight={`P. 0${swatchSpreadNum + 2}B`}
      >
        <div className="flex flex-1 flex-col justify-between">
          <FabricSwatchBoard
            garments={garments}
            onReplaceFabricSwatch={onReplaceFabricSwatch}
            onSelectStyleIndex={(idx) => onGoToPage(productOffset + idx - 1)}
            sliceRange={[baseRollIdx + 2, baseRollIdx + 4]}
            embeddedInFlipbook
            compactLeaf
            isPreviewLayer={isPreviewLayer}
          />

          {pageIndex === 5 && (
            <div className="mt-4 border border-[#E5E5E5] bg-[#FAFAFA] p-4 text-[11px] leading-relaxed text-[#404040]">
              <p className="font-mono text-[10.5px] font-semibold text-[#0A0A0A]">
                Lab-Dip &amp; Custom Mill Dyeing Notes
              </p>
              <p className="mt-1">
                Pantone TCX &amp; Chart codes shown above correspond to approved showroom swatchbook lots. Truncated fiber compositions from the source line sheet (`A82`, `A28`, `A29`, `FTR76SAM`) are flagged for mill spec confirmation prior to bulk PO issuance.
              </p>
            </div>
          )}
        </div>
      </LeafShell>
    );

    return renderSpreadPair(swatchVerso, swatchRecto);
  }

  /* ========================================================================
     SPREADS 07–49: 43 PRODUCT SPREADS (SYMMETRIC 50/50 VERSO | RECTO)
     ======================================================================== */
  if (pageIndex >= productOffset && pageIndex < productOffset + garments.length) {
    const product = garments[pageIndex - productOffset];
    return (
      <GarmentSpread
        garment={product}
        allGarments={garments}
        editMode={editMode}
        isShortlisted={shortlist.includes(product.id)}
        embeddedInFlipbook
        side={side}
        showSafeZones={showSafeZones}
        isPreviewLayer={isPreviewLayer}
        onPrev={() => onGoToPage(pageIndex <= 0 ? totalSpreads - 1 : pageIndex - 1)}
        onNext={() => onGoToPage(pageIndex >= totalSpreads - 1 ? 0 : pageIndex + 1)}
        onJumpToIndex={(idx) => onGoToPage(productOffset + idx - 1)}
        onToggleShortlist={onToggleShortlist}
        onReplaceFile={onReplaceFile}
        onInspectMedia={onInspectMedia}
        onOpenEditor={(focusSlot) => onOpenEditor(product.index, focusSlot)}
        onOpenVideo={onOpenVideo}
        onExportCurrentPdf={() => onExportCurrentPdf(product.index)}
      />
    );
  }

  /* ========================================================================
     SPREAD 50: ASSET READINESS, PRINT PRODUCTION SPECS & CSV / JSON SWAP
     ======================================================================== */
  const backVerso = (
    <LeafShell
      side="verso"
      showSafeZones={showSafeZones}
      headerLeft="ASSET & PRINT PRODUCTION SPECS"
      headerRight="STATIC / PRE-PRESS READY"
      footerLeft={`P. ${totalSpreads}A`}
      footerRight="300 DPI & CMYK READY"
    >
      <div className="space-y-5">
        <div>
          <div className="flex items-center gap-2 text-[var(--metallic-strong)]">
            <HardDrive className="h-4 w-4" />
            <span className="font-mono text-xs">4–5 GB Shared Drive Optimization</span>
          </div>
          <h2 className="mt-1.5 font-sans text-xl font-semibold tracking-tight text-[#0A0A0A]">
            Web Asset Compression &amp; Print Production Spec
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-[#525252]">
            Convert 4–5 GB raw studio TIFF/PNG drives to <span className="font-mono">WebP (q=82)</span> / <span className="font-mono">JPEG (q=85)</span> inside <code className="font-mono text-[#0A0A0A]">public/assets/catalogue/</code> for instant flipbook turning, while preserving modular layout tokens for future print production.
          </p>
        </div>

        {/* Modular Physical Binding & Pre-Press Geometry Box */}
        <div className="border border-[#E5E5E5] bg-[#FAFAFA] p-4 space-y-2 text-[11px]">
          <div className="flex items-center gap-1.5 font-mono text-[10.5px] font-semibold text-[#0A0A0A]">
            <Layers className="h-3.5 w-3.5 text-[var(--metallic-strong)]" />
            <span>MODULAR PRINT PRODUCTION PROFILE</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-[#E5E5E5] pt-2">
            <div>
              <span className="text-[#737373] block text-[9.5px]">Format</span>
              <span className="font-mono text-[#0A0A0A]">{PRINT_PRODUCTION_SPEC.pageFormat}</span>
            </div>
            <div>
              <span className="text-[#737373] block text-[9.5px]">Binding</span>
              <span className="font-mono text-[#0A0A0A]">{PRINT_PRODUCTION_SPEC.bindingMethod}</span>
            </div>
            <div>
              <span className="text-[#737373] block text-[9.5px]">Inner Spine Gutter / Outer Safe</span>
              <span className="font-mono text-[#0A0A0A] tabular-nums">
                {PRINT_PRODUCTION_SPEC.innerGutterMm}mm spine · {PRINT_PRODUCTION_SPEC.outerMarginMm}mm outer
              </span>
            </div>
            <div>
              <span className="text-[#737373] block text-[9.5px]">Trim / Bleed Spec</span>
              <span className="font-mono text-[#0A0A0A] tabular-nums">
                {PRINT_PRODUCTION_SPEC.trimMarginMm}mm trim · {PRINT_PRODUCTION_SPEC.bleedMm}mm bleed
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-[#737373] block text-[9.5px]">Print Raster &amp; Color Target</span>
              <span className="font-mono text-[#0A0A0A]">
                {PRINT_PRODUCTION_SPEC.targetDpi} DPI · {PRINT_PRODUCTION_SPEC.colorProfile}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2.5 border-t border-[#EFEFEF] pt-3 text-[11.5px]">
          <p className="font-semibold text-[#0A0A0A]">Session Drag-and-Drop vs. Saved Project Assets</p>
          <p className="text-[#525252]">
            Images dragged onto any product or swatch plate preview immediately in the browser and carry through to <strong>Print / Export PDF</strong>, remaining scoped to your browser session until committed to project assets or exported via CSV/JSON.
          </p>
        </div>
      </div>
    </LeafShell>
  );

  const backRecto = (
    <LeafShell
      side="recto"
      showSafeZones={showSafeZones}
      headerLeft="STRUCTURED DATA SWAP"
      headerRight="CSV / JSON MANIFEST"
      footerLeft="FLAT @MEDIA PRINT READY"
      footerRight={`P. ${totalSpreads}B`}
    >
      <div className="flex flex-1 flex-col justify-between">
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 text-[var(--metallic-strong)]">
              <FileSpreadsheet className="h-4 w-4" />
              <span className="font-mono text-xs">Swap 43-Item Dataset Live</span>
            </div>
            <h2 className="mt-1.5 font-sans text-xl font-semibold tracking-tight text-[#0A0A0A]">
              Import &amp; Export Line Sheet Data
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-[#525252]">
              Download the structured CSV or JSON blueprint containing all 43 DOT styles (with separated <span className="font-mono">weightGsm</span> and <span className="font-mono">fabricWidth</span> columns, image URL paths, and <span className="font-mono">dataFlags</span>), update in Sheets/Excel, and re-import to refresh all 50 spreads.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={isPreviewLayer}
              onClick={onExportCsv}
              className="inline-flex items-center justify-center gap-2 border border-[#0A0A0A] bg-[#0A0A0A] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#262626] cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download 43-Style CSV</span>
            </button>
            <button
              type="button"
              disabled={isPreviewLayer}
              onClick={onTriggerImportCsv}
              className="inline-flex items-center justify-center gap-2 border border-[#0A0A0A] bg-white px-4 py-2.5 text-xs font-medium text-[#0A0A0A] hover:bg-[#FAFAFA] cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Import Updated CSV</span>
            </button>
            <button
              type="button"
              disabled={isPreviewLayer}
              onClick={onExportJson}
              className="inline-flex items-center justify-center gap-2 border border-[#E5E5E5] bg-white px-4 py-2.5 text-xs font-medium text-[#404040] hover:border-[#0A0A0A] hover:text-[#0A0A0A] cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export JSON Blueprint</span>
            </button>
            <button
              type="button"
              disabled={isPreviewLayer}
              onClick={onTriggerImportJson}
              className="inline-flex items-center justify-center gap-2 border border-[#E5E5E5] bg-white px-4 py-2.5 text-xs font-medium text-[#404040] hover:border-[#0A0A0A] hover:text-[#0A0A0A] cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Load JSON Blueprint</span>
            </button>
          </div>
        </div>

        <div className="mt-6 border-t border-[#EFEFEF] pt-4 font-mono text-[10px] leading-relaxed text-[#737373]">
          SKU Naming: <span className="text-[#0A0A0A]">SKU_hero.webp</span>, <span className="text-[#0A0A0A]">SKU_pocket.webp</span>, <span className="text-[#0A0A0A]">SKU_seam.webp</span>, <span className="text-[#0A0A0A]">swatch_CODE.webp</span> · Flat @media print mode strips all page-curl transforms.
        </div>
      </div>
    </LeafShell>
  );

  return renderSpreadPair(backVerso, backRecto);
};
