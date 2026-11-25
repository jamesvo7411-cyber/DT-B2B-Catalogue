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
  ImageCrop,
  MediaSlot,
  MediaSlotKey,
  MetallicTheme,
} from '../types/catalogue';
import {
  buildFabricSwatchPrograms,
  BRAND_LOGO_PATH,
  CATEGORIES,
  CM_OEM_ODM_PILLARS,
  COVER_ATELIER_ILLUSTRATION,
  METALLIC_THEMES,
  PRINT_PRODUCTION_SPEC,
  getFabricSwatchSpreadCount,
  getProductSpreadOffset,
} from '../data/garments';
import {
  getFactoryColorImageKey,
  getPreferredFactoryFabricImage,
} from '../data/factoryFabricColors';
import { readImageFileAsDataUrl } from '../utils/media';
import { FabricColorwayTile } from './FabricColorwayTile';
import { GarmentSpread, type SpreadLeafSide } from './GarmentSpread';

export interface SpreadPagesProps {
  pageIndex: number; // 0..totalSpreads-1
  totalSpreads: number;
  garments: GarmentItem[];
  meta: CatalogueMetadata;
  metallicTheme: MetallicTheme;
  editMode: boolean;
  classicMode: boolean;
  shortlist: string[];
  coverCustomImage: string;
  showSafeZones?: boolean;
  side?: SpreadLeafSide;
  isPreviewLayer?: boolean;
  onGoToPage: (page: number) => void;
  onChangeMetallicTheme: (theme: MetallicTheme) => void;
  onDropCoverImage: (dataUrl: string) => void;
  onReplaceFile: (garmentId: string, slotKey: MediaSlotKey, dataUrl: string) => void;
  onUpdateCrop: (garmentId: string, slotKey: MediaSlotKey, crop: ImageCrop) => void;
  fabricColorImages: Record<string, string>;
  onReplaceFabricColorImage?: (imageKey: string, dataUrl: string) => void;
  onImageUploadError?: (message: string) => void;
  onToggleShortlist: (id: string) => void;
  onInspectMedia: (slot: MediaSlot, titleLabel: string, garmentTitle: string) => void;
  onOpenEditor: (garmentIndex: number, focusSlot?: MediaSlotKey) => void;
  onOpenVideo: (garment: GarmentItem) => void;
  onExportCurrentPdf: (garmentIndex: number) => void;
  onSelectFabricCode: (fabricCode: string) => void;
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
      className={`relative flex h-full min-h-[660px] flex-col justify-between ${bgClass} ${
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
  classicMode,
  shortlist,
  coverCustomImage,
  showSafeZones = false,
  side = 'full',
  isPreviewLayer = false,
  onGoToPage,
  onChangeMetallicTheme,
  onDropCoverImage,
  onReplaceFile,
  onUpdateCrop,
  fabricColorImages,
  onReplaceFabricColorImage,
  onImageUploadError,
  onToggleShortlist,
  onInspectMedia,
  onOpenEditor,
  onOpenVideo,
  onExportCurrentPdf,
  onSelectFabricCode,
  onExportCsv,
  onExportJson,
  onTriggerImportCsv,
  onTriggerImportJson,
}) => {
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const [coverDragging, setCoverDragging] = useState(false);
  const showGuides = Boolean(showSafeZones && !classicMode);

  const swatchPrograms = buildFabricSwatchPrograms(garments);
  const swatchSpreadCount = getFabricSwatchSpreadCount(garments);
  const productOffset = getProductSpreadOffset(garments);
  const menItems = garments.filter((g) => g.gender === 'Men');
  const womenItems = garments.filter((g) => g.gender === 'Women');

  const handleCoverDropFiles = async (files: FileList | null) => {
    if (isPreviewLayer || classicMode || !files || files.length === 0) return;
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
    const activeCoverSrc = coverCustomImage || COVER_ATELIER_ILLUSTRATION;

    const coverVerso = (
      <LeafShell
        side="verso"
        showSafeZones={showGuides}
        headerLeft="DREAM TOMORROW · DT"
        headerRight="CM · OEM · ODM MONOGRAPH"
        footerLeft="SPREAD 01A"
        footerRight="MANUFACTURING SCOPE"
      >
        <div className="flex flex-1 flex-col justify-between py-1">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[var(--metallic-strong)]">
                  B2B Apparel &amp; Textile Portfolio
                </p>
                <h1 className="mt-1.5 font-serif text-4xl font-normal tracking-tight text-[#0A0A0A] sm:text-[42px] lg:leading-[1.02]">
                  Dream Tomorrow
                </h1>
              </div>
              <img
                src={BRAND_LOGO_PATH}
                alt="Dream Tomorrow DT Monogram"
                className="mt-1 h-9 w-auto shrink-0 object-contain opacity-90"
              />
            </div>

            <div className="mt-3.5 flex items-center gap-3">
              <div className="h-px w-14 metallic-rule" />
              <p className="font-mono text-[10px] tracking-wide text-[#525252]">
                {meta.edition}
              </p>
            </div>

            <p className="mt-3 max-w-[60ch] text-[12px] leading-relaxed text-[#404040]">
              {meta.subtitle}
            </p>

            {/* Illustrated CM / OEM / ODM Manufacturing Engagement Models */}
            <div className="mt-5 border-t border-[#E6E4DE] pt-4">
              <div className="mb-3 flex items-baseline justify-between gap-2">
                <h2 className="font-serif text-lg font-normal tracking-tight text-[#141412]">
                  Three Manufacturing Models
                </h2>
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#737373]">
                  CM · OEM · ODM
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {CM_OEM_ODM_PILLARS.map((p) => (
                  <article key={p.code} className="flex flex-col">
                    <div className="aspect-[4/3] w-full overflow-hidden border border-[#E6E4DE] bg-[#FAF9F5]">
                      <img
                        src={p.illustration}
                        alt={`${p.code} — ${p.title} editorial illustration`}
                        referrerPolicy="no-referrer"
                        className={`h-full w-full object-cover ${p.cropScaleClass}`}
                      />
                    </div>

                    <div className="mt-2.5 flex items-baseline justify-between gap-1 border-b border-[#EFECE6] pb-1.5">
                      <span className="font-mono text-[10.5px] font-semibold tracking-wide text-[#0A0A0A]">
                        {p.index} · {p.code}
                      </span>
                      <span className="truncate font-mono text-[8.5px] text-[var(--metallic-strong)]">
                        {p.subtitle}
                      </span>
                    </div>

                    <h3 className="mt-1.5 font-sans text-[12px] font-semibold tracking-tight text-[#0A0A0A]">
                      {p.title}
                    </h3>
                    <p className="mt-1 text-[10.5px] leading-relaxed text-[#525252]">
                      {p.detail}
                    </p>

                    <dl className="mt-auto space-y-1 border-t border-[#EFECE6] pt-2 text-[9.5px] leading-snug">
                      <div>
                        <dt className="inline font-mono text-[8.5px] uppercase tracking-wider text-[#737373]">
                          Client:{' '}
                        </dt>
                        <dd className="inline text-[#292824]">{p.buyerSupplies}</dd>
                      </div>
                      <div>
                        <dt className="inline font-mono text-[8.5px] uppercase tracking-wider text-[#737373]">
                          DT:{' '}
                        </dt>
                        <dd className="inline font-medium text-[#0A0A0A]">{p.dtDelivers}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[#EAE8E3] pt-4">
            {!classicMode && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-[11px] text-[#737373]">Finish:</span>
                {METALLIC_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    disabled={isPreviewLayer || classicMode}
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
            )}

            {!isPreviewLayer && (
              <button
                type="button"
                onClick={() => onGoToPage(1)}
                className="ml-auto inline-flex items-center gap-2 bg-[#0A0A0A] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#262626] whitespace-nowrap cursor-pointer"
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
        bgClass="bg-[#FAF9F5]"
        showSafeZones={showGuides}
        headerLeft="COVER FOLIO · PLATE 00"
        headerRight={`${garments.length} STYLES · ${swatchPrograms.length} FABRICS`}
        footerLeft="ATELIER MONOGRAPH"
        footerRight="SPREAD 01B"
      >
        <div className="flex flex-1 flex-col justify-between gap-4">
          <div
            role={isPreviewLayer || classicMode ? undefined : 'button'}
            tabIndex={isPreviewLayer || classicMode ? undefined : 0}
            onClick={isPreviewLayer || classicMode ? undefined : () => coverInputRef.current?.click()}
            onKeyDown={
              isPreviewLayer || classicMode
                ? undefined
                : (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      coverInputRef.current?.click();
                    }
                  }
            }
            onDragOver={
              isPreviewLayer || classicMode
                ? undefined
                : (e) => {
                    e.preventDefault();
                    setCoverDragging(true);
                  }
            }
            onDragLeave={isPreviewLayer || classicMode ? undefined : () => setCoverDragging(false)}
            onDrop={
              isPreviewLayer || classicMode
                ? undefined
                : (e) => {
                    e.preventDefault();
                    setCoverDragging(false);
                    handleCoverDropFiles(e.dataTransfer.files);
                  }
            }
            className={`group relative flex min-h-[430px] flex-1 flex-col items-center justify-center overflow-hidden border transition-colors ${
              isPreviewLayer || classicMode ? '' : 'cursor-pointer'
            } ${
              coverDragging
                ? 'border-[#0A0A0A] bg-[#F0EFEA]'
                : 'border-[#E6E4DE] bg-[#FAF9F5] hover:border-[var(--metallic)]'
            }`}
          >
            {!isPreviewLayer && !classicMode && (
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

            <img
              src={activeCoverSrc}
              alt={
                coverCustomImage
                  ? 'Dream Tomorrow Custom Cover'
                  : 'Dream Tomorrow Knitwear & Woven Atelier Monograph Illustration'
              }
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full object-cover"
            />

            {!classicMode && !isPreviewLayer && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center justify-between bg-gradient-to-t from-black/60 via-black/25 to-transparent px-4 pb-3 pt-10 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <span className="font-mono text-[10px] tracking-wide">
                  {coverCustomImage
                    ? 'Session cover active · Drop or click to replace'
                    : 'Atelier cover plate · Drop custom photo to override'}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-baseline justify-between gap-3 pt-0.5">
            <span className="font-serif text-sm italic text-[#404040]">
              Fig. 00 — Knitwear &amp; Woven Manufacturing Monograph
            </span>
            <span className="font-mono text-[9.5px] text-[#737373] tabular-nums">
              DT Atelier
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-[#E6E4DE] pt-3 text-center">
            <div>
              <p className="font-mono text-sm font-medium text-[#0A0A0A] tabular-nums">
                {menItems.length}
              </p>
              <p className="text-[11px] text-[#66645F]">Men&apos;s (Nam)</p>
            </div>
            <div>
              <p className="font-mono text-sm font-medium text-[#0A0A0A] tabular-nums">
                {womenItems.length}
              </p>
              <p className="text-[11px] text-[#66645F]">Women&apos;s (Nữ)</p>
            </div>
            <div>
              <p className="font-mono text-sm font-medium text-[#0A0A0A] tabular-nums">
                {swatchPrograms.length}
              </p>
              <p className="text-[11px] text-[#66645F]">Fabric Rolls</p>
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
        showSafeZones={showGuides}
        headerLeft="THE COLLECTION"
        headerRight={`${garments.length} STYLES · 5 CHAPTERS`}
        footerLeft="P. 02A"
        footerRight="DREAM TOMORROW"
      >
        <div>
          <div className="mb-4">
            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-[var(--metallic-strong)]">
              A guide to the pieces
            </p>
            <h2 className="mt-1 font-serif text-3xl font-normal leading-none tracking-tight text-[#171715]">
              Find your next favourite.
            </h2>
          </div>

          <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1.5 border-y border-[#EAE8E3] py-2 text-[9px] text-[#77736D]">
            <button
              type="button"
              disabled={isPreviewLayer}
              onClick={() => onGoToPage(0)}
              className="transition-colors hover:text-[#171715] cursor-pointer"
            >
              The introduction <span className="ml-1 font-mono">01</span>
            </button>
            <button
              type="button"
              disabled={isPreviewLayer}
              onClick={() => onGoToPage(2)}
              className="transition-colors hover:text-[#171715] cursor-pointer"
            >
              Fabrics &amp; colour{' '}
              <span className="ml-1 font-mono">
                03–{String(productOffset).padStart(2, '0')}
              </span>
            </button>
            <button
              type="button"
              disabled={isPreviewLayer}
              onClick={() => onGoToPage(totalSpreads - 1)}
              className="transition-colors hover:text-[#171715] cursor-pointer"
            >
              Production notes <span className="ml-1 font-mono">{totalSpreads}</span>
            </button>
          </div>

          <div className="divide-y divide-[#EEECE7]">
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
                  className="group flex w-full items-center justify-between gap-3 py-2 text-left transition-colors hover:bg-[#F8F7F4] cursor-pointer"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="font-serif text-xl italic text-[var(--metallic-strong)]">{c.numeral}</span>
                    <span className="truncate text-[11px] font-medium text-[#292824]">{c.name}</span>
                    <span className="shrink-0 text-[9px] text-[#8A877F]">{c.count} styles</span>
                  </span>
                  <span className="shrink-0 font-mono text-[9px] text-[#8A877F] group-hover:text-[#171715]">
                    {String(startNum).padStart(2, '0')}–{String(endNum).padStart(2, '0')}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 border-t border-[#EAE8E3] pt-3">
            <h3 className="mb-1.5 flex items-baseline justify-between gap-2">
              <span className="font-serif text-xl text-[#171715]">Men&apos;s line</span>
              <span className="text-[9px] uppercase tracking-[0.14em] text-[#8A877F]">
                Nam · {menItems.length} styles
              </span>
            </h3>
            {menItems.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={isPreviewLayer}
                onClick={() => onGoToPage(productOffset + item.index - 1)}
                className="flex w-full items-baseline justify-between gap-2 border-b border-[#F2F0EB] py-1 text-left text-[10px] transition-colors hover:bg-[#F8F7F4] cursor-pointer"
              >
                <span className="flex min-w-0 items-baseline gap-2 truncate">
                  <span className="font-mono text-[9px] text-[#8A877F]">{String(item.index).padStart(2, '0')}</span>
                  <span className="font-medium text-[#292824]">{item.title}</span>
                </span>
                <span className="shrink-0 font-mono text-[9px] text-[#8A877F] tabular-nums">
                  p. {String(productOffset + item.index).padStart(2, '0')}
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
        showSafeZones={showGuides}
        headerLeft="THE COLLECTION"
        headerRight="WOMEN'S LINE"
        footerLeft="DREAM TOMORROW · DT"
        footerRight="P. 02B"
      >
        <div className="flex h-full flex-col">
          <div className="mb-5 border-b border-[#EAE8E3] pb-4">
            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-[var(--metallic-strong)]">
              The women&apos;s edit
            </p>
            <h3 className="mt-1 font-serif text-4xl font-normal leading-none tracking-tight text-[#171715]">
              Women&apos;s line<span className="text-[var(--metallic-strong)]">.</span>
            </h3>
            <p className="mt-2 text-[10px] leading-relaxed text-[#77736D]">
              {womenItems.length} styles to browse. Choose a piece to turn straight to its story.
            </p>
          </div>
          <div className="divide-y divide-[#EEECE7] border-t border-[#EAE8E3]">
            {womenItems.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={isPreviewLayer}
                onClick={() => onGoToPage(productOffset + item.index - 1)}
                className="flex w-full items-baseline justify-between gap-3 py-2.5 text-left text-[11px] transition-colors hover:bg-[#F8F7F4] cursor-pointer"
              >
                <span className="flex min-w-0 items-baseline gap-3 truncate">
                  <span className="font-mono text-[9px] text-[#8A877F]">{String(item.index).padStart(2, '0')}</span>
                  <span className="font-serif text-xs leading-tight text-[#292824]">{item.title}</span>
                </span>
                <span className="shrink-0 font-mono text-[9px] text-[#8A877F] tabular-nums">
                  p. {String(productOffset + item.index).padStart(2, '0')}
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
     FABRIC LIBRARY: ONE TWO-PAGE SPREAD PER FABRIC FAMILY
     ======================================================================== */
  if (pageIndex >= 2 && pageIndex < productOffset) {
    const swatchSpreadNum = pageIndex - 1;
    const program = swatchPrograms[pageIndex - 2];
    if (!program) return null;

    const heroImage = getPreferredFactoryFabricImage(program.fabricCode, fabricColorImages);
    const linkedProducts = program.linkedIndices.flatMap((styleIndex, linkedIndex) => {
      const garment = garments.find((item) => item.index === styleIndex);
      return garment ? [{ garment, sku: program.linkedSkus[linkedIndex] }] : [];
    });
    const uniqueLotGsm = new Set(
      program.factoryColors.map((color) => color.lotWeightGsm.trim()).filter(Boolean)
    );
    const uniqueLotWidths = new Set(
      program.factoryColors.map((color) => color.lotWidth.trim()).filter(Boolean)
    );
    const hasLotVariation = uniqueLotGsm.size > 1 || uniqueLotWidths.size > 1;
    const programCategories = Array.from(
      new Set(linkedProducts.map(({ garment }) => garment.category))
    ).join(' · ');
    const programGenders = Array.from(
      new Set(linkedProducts.map(({ garment }) => garment.gender))
    ).join(' / ');
    const shadeCount = program.factoryColors.length;
    const colorwayGridClass =
      shadeCount <= 6
        ? 'grid flex-1 grid-cols-2 content-start gap-3 sm:gap-3.5'
        : shadeCount <= 12
          ? 'grid flex-1 grid-cols-3 content-start gap-2.5'
          : 'grid flex-1 grid-cols-3 sm:grid-cols-4 content-start gap-2';
    const tileAspectClass =
      shadeCount <= 4
        ? 'aspect-[5/4]'
        : shadeCount <= 12
          ? 'aspect-[4/3]'
          : 'aspect-square';
    const isExpandedTile = shadeCount <= 6;

    const renderFabricLeaf = (leafSide: 'verso' | 'recto') => (
      <LeafShell
        side={leafSide}
        showSafeZones={showGuides}
        headerLeft={`SWATCHBOOK TEXTILES · SPREAD ${String(swatchSpreadNum).padStart(2, '0')}/${String(swatchSpreadCount).padStart(2, '0')}`}
        headerRight={`${program.fabricCode} · ${program.colorCount} COLORWAYS`}
        footerLeft={`P. ${String(pageIndex + 1).padStart(2, '0')}${leafSide === 'verso' ? 'A' : 'B'}`}
        footerRight={leafSide === 'verso' ? 'FABRIC SPECIFICATION' : 'COLORWAY GALLERY'}
      >
        {leafSide === 'verso' ? (
          <div className="flex flex-1 flex-col gap-3">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--metallic-strong)]">
                  Fabric family
                </p>
                <h2 className="mt-1 font-serif text-4xl font-normal leading-none tracking-tight text-[#111111]">
                  {program.fabricCode}
                </h2>
              </div>
              {programGenders && (
                <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-[#66645F]">
                  {programGenders}
                </span>
              )}
            </div>

            {heroImage ? (
              <div>
                <div className="aspect-[4/3] w-full overflow-hidden bg-[#F5F4F0]">
                  <img
                    src={heroImage.imageUrl}
                    alt={`${program.fabricCode} close-up fabric texture`}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="h-full w-full scale-[1.65] object-cover"
                  />
                </div>
                <div className="mt-1.5 flex items-baseline justify-between gap-2 font-mono text-[9px] font-semibold uppercase tracking-wide text-[#33322F]">
                  <span>Fabric Image</span>
                  <span className="text-[8px] font-medium text-[#77756F]">
                    Macro Weave · {heroImage.colorName}
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex aspect-[4/3] w-full flex-col items-center justify-center border border-dashed border-[#D8D6D0] bg-[#FAF9F5] px-4 text-center">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-[#33322F]">
                    Fabric hero image not supplied
                  </p>
                  <p className="mt-1 max-w-[36ch] text-[10px] leading-relaxed text-[#68665F]">
                    Add a verified {program.fabricCode} fabric drape in the Fabric Library.
                  </p>
                </div>
                <p className="mt-1.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-[#33322F]">
                  Fabric Image
                </p>
              </div>
            )}

            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-y border-[#EAE8E3] py-2.5 text-[10px]">
              <div className="col-span-2">
                <dt className="font-mono text-[8px] font-semibold uppercase tracking-wide text-[#77756F]">
                  Fabric content
                </dt>
                <dd className="mt-0.5 text-[11px] font-semibold leading-snug text-[#111111]">
                  {program.composition || 'Not listed'}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[8px] font-semibold uppercase tracking-wide text-[#77756F]">
                  Weight
                </dt>
                <dd className="mt-0.5 font-mono text-[12px] font-bold text-[#111111] tabular-nums">
                  {program.weightGsm || 'Not listed'}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[8px] font-semibold uppercase tracking-wide text-[#77756F]">
                  Roll width
                </dt>
                <dd className="mt-0.5 font-mono text-[12px] font-bold text-[#111111] tabular-nums">
                  {program.fabricWidth || 'Not listed'}
                </dd>
              </div>
            </dl>

            <div className="grid grid-cols-3 gap-2 border-b border-[#EAE8E3] pb-2.5 text-[9.5px]">
              <div className="col-span-2">
                <p className="font-mono text-[8px] font-semibold uppercase tracking-wide text-[#77756F]">
                  Program coverage
                </p>
                <p className="mt-0.5 truncate font-medium text-[#111111]">
                  {programCategories || 'Core garment line'}
                </p>
              </div>
              <div>
                <p className="font-mono text-[8px] font-semibold uppercase tracking-wide text-[#77756F]">
                  Verified shades
                </p>
                <p className="mt-0.5 font-mono font-bold text-[#111111] tabular-nums">
                  {shadeCount} {shadeCount === 1 ? 'shade' : 'shades'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-mono text-[9px] font-bold uppercase tracking-wide text-[#33322F]">
                Fabric characteristics
              </h3>
              <p className="mt-1 text-[10px] leading-relaxed text-[#55534E]">
                {program.stretchFeelNote || 'No fabric characteristic note supplied.'}
              </p>
              {hasLotVariation && (
                <p className="mt-2 border-t border-[#EAE8E3] pt-1.5 text-[9px] leading-snug text-[#68665F]">
                  Factory color-lot GSM or width entries vary; confirm the selected shade and lot before ordering.
                </p>
              )}
              {program.dataFlags[0] && (
                <p className="mt-1.5 border-t border-[#EAE8E3] pt-1.5 text-[9px] leading-snug text-[#68665F]">
                  {program.dataFlags[0]}
                </p>
              )}
            </div>

            <section className="mt-auto border-t border-[#EAE8E3] pt-2.5">
              <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <h3 className="font-mono text-[9px] font-bold uppercase tracking-wide text-[#33322F]">
                  Styles using this fabric
                </h3>
                <span className="font-mono text-[8px] text-[#77756F] tabular-nums">
                  {linkedProducts.length} linked
                </span>
              </div>
              <div className="flex max-h-32 flex-wrap content-start gap-x-3 gap-y-1.5 overflow-y-auto">
                {linkedProducts.map(({ garment, sku }) => (
                  <button
                    key={garment.id}
                    type="button"
                    disabled={isPreviewLayer}
                    onClick={() => onGoToPage(productOffset + garment.index - 1)}
                    className="text-left text-[9.5px] leading-snug text-[#292824] underline decoration-[#B8B5AD] underline-offset-2 hover:decoration-[#111111] disabled:cursor-default cursor-pointer"
                  >
                    {garment.title} <span className="font-mono font-bold">({sku})</span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="flex flex-1 flex-col">
            <div className="mb-3 flex items-end justify-between gap-3 border-b border-[#EAE8E3] pb-2.5">
              <div>
                <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--metallic-strong)]">
                  All shades · same fabric family
                </p>
                <h2 className="mt-1 font-sans text-2xl font-extrabold tracking-tight text-[#111111]">
                  {program.fabricCode} colorways
                </h2>
              </div>
              <span className="shrink-0 font-mono text-[9px] font-semibold text-[#33322F] tabular-nums">
                {shadeCount} {shadeCount === 1 ? 'shade' : 'shades'}
              </span>
            </div>
            <div className={colorwayGridClass}>
              {program.factoryColors.map((color, colorIndex) => {
                const imageKey = getFactoryColorImageKey(program.fabricCode, color.colorName);
                const imageUrl = fabricColorImages[imageKey] || color.swatchImageUrl || '';
                return (
                  <FabricColorwayTile
                    key={`${program.fabricCode}-${color.colorName}-${colorIndex}`}
                    color={color}
                    imageUrl={imageUrl}
                    aspectClass={tileAspectClass}
                    expanded={isExpandedTile}
                    interactive={!classicMode && !isPreviewLayer}
                    onReplace={onReplaceFabricColorImage}
                    onError={onImageUploadError}
                  />
                );
              })}
            </div>
            <p className="mt-2 border-t border-[#EAE8E3] pt-2 text-[9px] leading-relaxed text-[#68665F]">
              Pantone TCX and chart references identify listed shades; confirm current availability, MOQ, lead time, and final lot specifications with the factory.
            </p>
          </div>
        )}
      </LeafShell>
    );

    return renderSpreadPair(renderFabricLeaf('verso'), renderFabricLeaf('recto'));
  }

  /* ========================================================================
     PRODUCT SPREADS
     ======================================================================== */
  if (pageIndex >= productOffset && pageIndex < productOffset + garments.length) {
    const product = garments[pageIndex - productOffset];
    return (
      <GarmentSpread
        garment={product}
        allGarments={garments}
        editMode={editMode}
        classicMode={classicMode}
        isShortlisted={shortlist.includes(product.id)}
        embeddedInFlipbook
        side={side}
        showSafeZones={showGuides}
        isPreviewLayer={isPreviewLayer}
        onPrev={() => onGoToPage(pageIndex <= 0 ? totalSpreads - 1 : pageIndex - 1)}
        onNext={() => onGoToPage(pageIndex >= totalSpreads - 1 ? 0 : pageIndex + 1)}
        onJumpToIndex={(idx) => onGoToPage(productOffset + idx - 1)}
        onToggleShortlist={onToggleShortlist}
        onReplaceFile={onReplaceFile}
        onUpdateCrop={onUpdateCrop}
        onInspectMedia={onInspectMedia}
        onOpenEditor={(focusSlot) => onOpenEditor(product.index, focusSlot)}
        onOpenVideo={onOpenVideo}
        onExportCurrentPdf={() => onExportCurrentPdf(product.index)}
        onSelectFabricCode={onSelectFabricCode}
      />
    );
  }

  /* ========================================================================
     FINAL SPREAD: ASSET READINESS, PRINT PRODUCTION SPECS & CSV / JSON SWAP
     ======================================================================== */
  const backVerso = (
    <LeafShell
      side="verso"
      showSafeZones={showGuides}
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

        {!classicMode && (
          <div className="space-y-2.5 border-t border-[#EFEFEF] pt-3 text-[11.5px]">
            <p className="font-semibold text-[#0A0A0A]">Session Drag-and-Drop vs. Saved Project Assets</p>
            <p className="text-[#525252]">
              Images dragged onto any product or swatch plate preview immediately in the browser and carry through to <strong>Print / Export PDF</strong>, remaining scoped to your browser session until committed to project assets or exported via CSV/JSON.
            </p>
          </div>
        )}
      </div>
    </LeafShell>
  );

  const backRecto = (
    <LeafShell
      side="recto"
      showSafeZones={showGuides}
      headerLeft={classicMode ? 'DREAM TOMORROW · DT' : 'STRUCTURED DATA SWAP'}
      headerRight={classicMode ? meta.edition : 'CSV / JSON MANIFEST'}
      footerLeft="FLAT @MEDIA PRINT READY"
      footerRight={`P. ${totalSpreads}B`}
    >
      <div className="flex flex-1 flex-col justify-between">
        {classicMode ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <img src={BRAND_LOGO_PATH} alt="DT" className="h-20 w-auto object-contain" />
            <p className="mt-5 font-serif text-2xl tracking-tight text-[#24231F]">
              Dream Tomorrow
            </p>
            <p className="mt-2 font-mono text-[10px] tracking-wide text-[#77756F]">
              {meta.edition}
            </p>
          </div>
        ) : (
          <>
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
              Download the structured CSV or JSON blueprint containing all 43 Dream Tomorrow styles (with separated <span className="font-mono">weightGsm</span> and <span className="font-mono">fabricWidth</span> columns, image URL paths, and <span className="font-mono">dataFlags</span>), update in Sheets/Excel, and re-import to refresh the catalogue.
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
              disabled={isPreviewLayer || classicMode}
              onClick={onTriggerImportCsv}
              className="inline-flex items-center justify-center gap-2 border border-[#0A0A0A] bg-white px-4 py-2.5 text-xs font-medium text-[#0A0A0A] hover:bg-[#FAFAFA] cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Import Updated CSV</span>
            </button>
            <button
              type="button"
              disabled={isPreviewLayer || classicMode}
              onClick={onExportJson}
              className="inline-flex items-center justify-center gap-2 border border-[#E5E5E5] bg-white px-4 py-2.5 text-xs font-medium text-[#404040] hover:border-[#0A0A0A] hover:text-[#0A0A0A] cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export JSON Blueprint</span>
            </button>
            <button
              type="button"
              disabled={isPreviewLayer || classicMode}
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
          </>
        )}
      </div>
    </LeafShell>
  );

  return renderSpreadPair(backVerso, backRecto);
};
