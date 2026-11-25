import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  ExternalLink,
  Film,
  Printer,
  SlidersHorizontal,
} from 'lucide-react';
import type { GarmentItem, ImageCrop, MediaSlot, MediaSlotKey } from '../types/catalogue';
import { MediaPlate } from './MediaPlate';
import { ColorSwatchList } from './ColorSwatchList';
import { ProductSpecStrip } from './ProductSpecStrip';
import { SizeRunChips } from './SizeRunChips';
import { RunningHeader } from './CatalogueNavigation';
import {
  formatSpreadPageCode,
  getFabricFamilyName,
  type CatalogueNavigationMap,
} from '../utils/catalogueOrder';
import {
  conciseSourceNote,
  displayBuyerProductTitle,
  displayMoq,
  getBuyerVisibleValue,
} from '../utils/productDisplay';

export type SpreadLeafSide = 'full' | 'verso' | 'recto';

interface GarmentSpreadProps {
  garment: GarmentItem;
  allGarments: GarmentItem[];
  spreadNumber?: number; // 1-based spread number matching TOC & Fabric Library
  navMap?: CatalogueNavigationMap;
  editMode: boolean;
  classicMode?: boolean;
  isShortlisted: boolean;
  embeddedInFlipbook?: boolean;
  side?: SpreadLeafSide;
  showSafeZones?: boolean;
  isPreviewLayer?: boolean;
  onPrev: () => void;
  onNext: () => void;
  onJumpToIndex: (index: number) => void;
  onJumpToGarmentId?: (garmentId: string) => void;
  onToggleShortlist: (id: string) => void;
  onReplaceFile: (garmentId: string, slotKey: MediaSlotKey, dataUrl: string) => void;
  onUpdateCrop: (garmentId: string, slotKey: MediaSlotKey, crop: ImageCrop) => void;
  onInspectMedia: (slot: MediaSlot, titleLabel: string, garmentTitle: string) => void;
  onOpenEditor: (focusSlot?: MediaSlotKey) => void;
  onOpenVideo: (garment: GarmentItem) => void;
  onExportCurrentPdf: () => void;
  onSelectFabricCode: (fabricCode: string) => void;
  onOpenFabricColorPicker?: (garment: GarmentItem) => void;
}

export const GarmentSpread: React.FC<GarmentSpreadProps> = ({
  garment,
  allGarments,
  spreadNumber,
  navMap,
  editMode,
  classicMode = false,
  isShortlisted,
  embeddedInFlipbook = false,
  side = 'full',
  showSafeZones = false,
  isPreviewLayer = false,
  onPrev,
  onNext,
  onJumpToIndex,
  onJumpToGarmentId,
  onToggleShortlist,
  onReplaceFile,
  onUpdateCrop,
  onInspectMedia,
  onOpenEditor,
  onOpenVideo,
  onExportCurrentPdf,
  onSelectFabricCode,
  onOpenFabricColorPicker,
}) => {
  const paddedNumber = String(garment.index).padStart(2, '0');
  const paddedTotal = String(allGarments.length).padStart(2, '0');
  const effectiveSpread = spreadNumber ?? garment.index;
  const spreadPadded = String(effectiveSpread).padStart(2, '0');
  const versoPage = `P.${spreadPadded}A`;
  const rectoPage = `P.${spreadPadded}B`;
  const sectionId = garment.gender === 'Women' ? 'women' : 'men';
  const fabricSpreadIdx = navMap?.fabricPageByCode.get(garment.specs.fabricRollRef);
  const fabricPageLabel =
    fabricSpreadIdx !== undefined ? formatSpreadPageCode(fabricSpreadIdx) : undefined;
  const fabricFamilyName = getFabricFamilyName(garment.specs.fabricRollRef);
  const mediaKeys: MediaSlotKey[] = ['hero', 'pocket', 'seam', 'swatch', 'custom'];
  const populatedCount = mediaKeys.filter((key) => Boolean(garment.media[key]?.url)).length;
  const fabricSiblings = allGarments.filter(
    (item) =>
      item.id !== garment.id &&
      item.specs.fabricRollRef.toLowerCase() === garment.specs.fabricRollRef.toLowerCase()
  );
  const sourceNote = conciseSourceNote(garment.dataFlags);
  const buyerMoq = getBuyerVisibleValue(garment.specs.moq);
  const [unavailableSlots, setUnavailableSlots] = useState<Partial<Record<MediaSlotKey, boolean>>>({});

  useEffect(() => {
    setUnavailableSlots({});
  }, [
    garment.id,
    garment.media.hero.url,
    garment.media.hero.fallbackUrl,
    garment.media.pocket.url,
    garment.media.seam.url,
    garment.media.swatch.url,
    garment.media.custom.url,
  ]);

  const markSlotUnavailable = (slotKey: MediaSlotKey) => {
    setUnavailableSlots((prev) => (prev[slotKey] ? prev : { ...prev, [slotKey]: true }));
  };

  const productDetailSlots: { key: MediaSlotKey; label: string }[] = [
    { key: 'pocket', label: 'Detail 01' },
    { key: 'seam', label: 'Detail 02' },
    { key: 'swatch', label: 'Fabric Image' },
    { key: 'custom', label: 'Detail 03' },
  ];
  const visibleProductDetailSlots = productDetailSlots.filter(({ key }) => {
    const slot = garment.media[key];
    return Boolean(slot.url || slot.fallbackUrl) && !unavailableSlots[key];
  });
  const buyerColorwayCount = garment.colorways.filter(
    (color) =>
      getBuyerVisibleValue(color) && !color.toLowerCase().includes('pending')
  ).length;
  const hasHeroAsset =
    Boolean(garment.media.hero.url || garment.media.hero.fallbackUrl) &&
    !unavailableSlots.hero;

  const renderMedia = (
    slotKey: MediaSlotKey,
    titleLabel: string,
    aspectClass: string,
    compact = false,
    imageOverlay?: React.ReactNode,
    displayScale = 1,
    topOverlay?: React.ReactNode,
    overlayMode: 'gradient' | 'card' = 'gradient',
    fullHeight = false
  ) => {
    const slot = garment.media[slotKey];
    if (classicMode && !slot.url && !slot.fallbackUrl) return null;
    const isSwatchSlot = slotKey === 'swatch';
    const canEditSlot = !classicMode && !isSwatchSlot;
    const canReframeSlot = !classicMode && !isPreviewLayer;
    const swatchHandler =
      isSwatchSlot && !classicMode && !isPreviewLayer && onOpenFabricColorPicker
        ? () => onOpenFabricColorPicker(garment)
        : undefined;

    return (
      <MediaPlate
        slotKey={slotKey}
        slot={slot}
        aspectClass={aspectClass}
        titleLabel={titleLabel}
        editMode={editMode && !isPreviewLayer && canEditSlot}
        interactive={!classicMode}
        editable={canEditSlot}
        allowReframe={canReframeSlot}
        showBlankGuides={canEditSlot || isSwatchSlot}
        compact={compact || classicMode}
        fullHeight={fullHeight}
        displayScale={displayScale}
        topOverlay={topOverlay}
        imageOverlay={imageOverlay}
        overlayMode={overlayMode}
        customActionLabel={isSwatchSlot ? 'Switch color' : undefined}
        onCustomClick={swatchHandler}
        onImageUnavailable={markSlotUnavailable}
        onReplaceFile={
          isPreviewLayer || !canEditSlot
            ? undefined
            : (key, url) => onReplaceFile(garment.id, key, url)
        }
        onUpdateCrop={
          isPreviewLayer || classicMode
            ? undefined
            : (key, crop) => onUpdateCrop(garment.id, key, crop)
        }
        onInspect={
          isPreviewLayer || classicMode
            ? undefined
            : (s, label) => onInspectMedia(s, label, garment.title)
        }
        onOpenEditor={isPreviewLayer || !canEditSlot ? undefined : (key) => onOpenEditor(key)}
      />
    );
  };

  const renderClassicDetail = (
    slotKey: MediaSlotKey,
    label: string,
    aspectClass = 'aspect-[16/10] w-full'
  ) => {
    const slot = garment.media[slotKey];
    const hasLoadedAsset =
      Boolean(slot.url || slot.fallbackUrl) && !unavailableSlots[slotKey];

    if (!hasLoadedAsset) return null;

    return (
      <div key={slotKey} className="min-w-0">
        {renderMedia(
          slotKey,
          `${garment.sku} ${label}`,
          aspectClass,
          true,
          undefined,
          slotKey === 'swatch' ? 1.65 : 1
        )}
        <div className="mt-1 flex items-baseline justify-between gap-1.5">
          <p className="font-mono text-[8.5px] font-semibold uppercase tracking-wide text-[#33322F]">
            {label}
          </p>
          {slotKey === 'swatch' && fabricPageLabel && (
            <button
              type="button"
              disabled={isPreviewLayer}
              onClick={() => onSelectFabricCode(garment.specs.fabricRollRef)}
              className="font-mono text-[8px] text-[#66645F] underline decoration-[#C2BFB8] underline-offset-2 hover:text-[#111111] hover:decoration-[#111111] cursor-pointer disabled:no-underline"
            >
              {garment.specs.fabricRollRef} · {fabricPageLabel}
            </button>
          )}
        </div>
      </div>
    );
  };

  const leafShell = (leafSide: 'verso' | 'recto', children: React.ReactNode) => {
    const verso = leafSide === 'verso';
    return (
      <div
        className={`relative flex h-full min-h-[660px] flex-col bg-white py-5 sm:py-6 lg:py-7 ${
          verso
            ? 'pl-6 pr-8 sm:pl-8 sm:pr-11 lg:pl-9 lg:pr-14'
            : 'pl-8 pr-6 sm:pl-11 sm:pr-8 lg:pl-14 lg:pr-9'
        }`}
      >
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 w-14 ${
            verso ? 'spine-verso-shadow right-0' : 'spine-recto-shadow left-0'
          }`}
        />
        {showSafeZones && !classicMode && (
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute top-4 bottom-4 border border-dashed border-[var(--metallic-soft)]/70 ${
              verso ? 'left-4 right-8' : 'left-8 right-4'
            }`}
          />
        )}
        {children}
      </div>
    );
  };

  const heroTopLockup = (
    <div className="space-y-2">
      {classicMode && (
        <div className="pointer-events-auto">
          <RunningHeader
            sectionId={sectionId}
            categoryLabel={garment.category}
            pageLabel={versoPage}
            rightContext="DREAM TOMORROW"
            overImage
          />
        </div>
      )}
      <div className="flex items-start justify-between gap-3 [text-shadow:0_1px_10px_rgba(247,246,242,0.92)]">
        <div className="inline-block">
          <span className="block font-serif text-4xl font-light leading-[0.86] tracking-tight text-[#111111] tabular-nums sm:text-[46px]">
            {paddedNumber}
          </span>
          <span className="mt-1.5 inline-block border-t border-[#111111]/25 pt-1 font-mono text-[8.5px] font-semibold uppercase tracking-[0.16em] text-[#3E3C37]">
            {garment.gender} · {garment.category}
          </span>
        </div>
        {!classicMode && (
          <span className="pt-1 font-mono text-[8.5px] font-semibold uppercase tracking-[0.18em] text-[#33322F]">
            Dream Tomorrow
          </span>
        )}
      </div>
    </div>
  );

  const heroBottomCard = (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="font-serif text-[24px] font-normal leading-[1.04] tracking-tight text-[#0A0A0A] sm:text-[27px]">
          {classicMode ? displayBuyerProductTitle(garment.title) : garment.title}
        </h1>
        <span className="shrink-0 font-mono text-[10px] font-semibold tracking-[0.14em] text-[#3E3C37] tabular-nums">
          {garment.sku}
        </span>
      </div>
      <div className="mt-2">
        <ProductSpecStrip
          item={garment}
          overlay
          disabled={isPreviewLayer}
          showWorkbenchNotes={!classicMode}
          showFabricCrossReference={false}
        />
      </div>
      {classicMode && (
        <div className="mt-2 flex items-center justify-between border-t border-[#111111]/15 pt-1.5 font-mono text-[8.5px] font-semibold text-[#4E4C47] tabular-nums">
          <span>{versoPage}</span>
          <span>
            STYLE {paddedNumber} · {garment.productGroupVi.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );

  const versoLeaf = classicMode ? (
    <div className="relative flex h-full min-h-[660px] w-full flex-col overflow-hidden bg-[#FAF9F5]">
      <div
        aria-hidden="true"
        className="spine-verso-shadow pointer-events-none absolute inset-y-0 right-0 z-30 w-14"
      />
      {hasHeroAsset ? (
        <div className="relative flex h-full min-h-[660px] w-full flex-1 flex-col">
          {renderMedia(
            'hero',
            'Primary image',
            'h-full w-full flex-1',
            true,
            heroBottomCard,
            1,
            heroTopLockup,
            'card',
            true
          )}
        </div>
      ) : (
        <div className="relative flex h-full min-h-[660px] w-full flex-1 flex-col justify-between bg-[#FAF9F5] p-5 sm:p-6">
          {heroTopLockup}
          <div className="my-auto px-6 py-10 text-center">
            <p className="font-serif text-3xl font-normal tracking-tight text-[#3E3C37]">
              {displayBuyerProductTitle(garment.title)}
            </p>
            <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[#77756F]">
              {garment.sku} · {garment.specs.fabricRollRef}
            </p>
          </div>
          <div className="pt-2">
            {heroBottomCard}
          </div>
        </div>
      )}
    </div>
  ) : (
    leafShell(
      'verso',
      <>
        <header className="relative z-10 mb-3">
          <RunningHeader
            sectionId={sectionId}
            categoryLabel={garment.category}
            pageLabel={versoPage}
            rightContext={garment.sku}
          />
        </header>

        <main className="relative z-10 flex flex-1 flex-col gap-3">
          {renderMedia(
            'hero',
            'Primary image',
            'min-h-[460px] w-full flex-1',
            false,
            heroBottomCard,
            1,
            heroTopLockup,
            'card',
            true
          )}

          {(sourceNote || (embeddedInFlipbook && !isPreviewLayer)) && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
              {sourceNote ? (
                <p className="flex max-w-[65ch] items-start gap-1.5 text-[9px] leading-relaxed text-[#77756F]">
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                  <span>{sourceNote}</span>
                </p>
              ) : (
                <span />
              )}
              {embeddedInFlipbook && !isPreviewLayer && (
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleShortlist(garment.id)}
                    className="inline-flex items-center gap-1.5 text-[10px] text-[#55534E] transition-colors hover:text-[#111] cursor-pointer"
                  >
                    {isShortlisted ? <Check className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
                    <span>{isShortlisted ? 'Saved' : 'Save style'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenEditor()}
                    className="inline-flex items-center gap-1.5 text-[10px] text-[#55534E] transition-colors hover:text-[#111] cursor-pointer"
                  >
                    <SlidersHorizontal className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E8E6E0] pt-2 text-[10px] text-[#111111]">
            <div className="flex items-center gap-4">
              {garment.videoUrl && (
                <button
                  type="button"
                  disabled={isPreviewLayer}
                  onClick={() => onOpenVideo(garment)}
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-[#111] cursor-pointer"
                >
                  <Film className="h-3 w-3" />
                  <span>{garment.videoTitle || 'View video'}</span>
                </button>
              )}
              {garment.productUrl && (
                <a
                  href={garment.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-[#111]"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Product source</span>
                </a>
              )}
            </div>
            <span className="font-mono text-[9px] font-semibold text-[#111111]">
              {populatedCount}/5 images
            </span>
          </div>
        </main>

        <footer className="relative z-10 mt-3 flex items-center justify-between border-t border-[#E8E6E0] pt-2 font-mono text-[9px] font-semibold text-[#111111] tabular-nums">
          <span>{versoPage}</span>
          <span>STYLE {paddedNumber} · {garment.productGroupVi.toUpperCase()}</span>
        </footer>
      </>
    )
  );

  const rectoLeaf = leafShell(
    'recto',
    <>
      <header className="relative z-10 mb-3">
        <RunningHeader
          sectionId={sectionId}
          categoryLabel={garment.category}
          pageLabel={rectoPage}
          rightContext={`${garment.sku} · FABRIC ${garment.specs.fabricRollRef}`}
        />
      </header>

      <main className="relative z-10 flex flex-1 flex-col justify-between gap-3.5">
        {classicMode ? (
          <>
            {/* 4-Plate Craftsmanship & Fabric Macro Grid (3 Closeup Details + 1 Fabric Image) */}
            {visibleProductDetailSlots.length > 0 && (
            <section className="border-b border-[#E8E6E0] pb-3">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <h2 className="font-serif text-[22px] font-normal leading-none tracking-tight text-[#141412]">
                  Construction &amp; Craftsmanship
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {visibleProductDetailSlots.map(({ key, label }) =>
                  renderClassicDetail(key, label, 'aspect-[16/10] w-full')
                )}
              </div>
            </section>
            )}

            <section className="border-b border-[#E8E6E0] pb-3.5">
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <h3 className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#55534E]">
                  Colorways
                </h3>
                <span className="font-mono text-[9px] text-[#77756F] tabular-nums">
                  {buyerColorwayCount} {buyerColorwayCount === 1 ? 'shade' : 'shades'}
                </span>
              </div>
              <ColorSwatchList
                colorways={garment.colorways}
                fabricCode={garment.specs.fabricRollRef}
                compact
                editorial
                showPendingColorways={!classicMode}
              />
            </section>

            {/* Silhouette Summary, Craft Notes & Production Specs */}
            <section className="flex flex-1 flex-col justify-between gap-3">
              <div>
                <h3 className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#55534E]">
                  Silhouette &amp; Production Notes
                </h3>
                <p className="mt-1.5 font-serif text-[15px] italic leading-snug text-[#1F1E1B]">
                  {garment.summary}
                </p>
                <ul className="mt-2.5 space-y-1.5 text-[10.5px] leading-relaxed text-[#404040]">
                  {garment.descriptionBullets.slice(0, 3).map((bullet, idx) => (
                    <li key={idx} className="flex items-baseline gap-2">
                      <span className="font-mono text-[8.5px] text-[var(--metallic-strong)] tabular-nums">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-[#E8E6E0] pt-3 text-[10px]">
                {[
                  ['Stitch Density', garment.specs.stitchDensity],
                  ['Seam Finish', garment.specs.seamFinish],
                  ['Pocket & Trim', garment.specs.pocketConstruction],
                ].map(([label, rawValue]) => {
                  const value = getBuyerVisibleValue(rawValue);
                  return value ? (
                    <div key={label}>
                      <dt className="font-mono text-[8px] uppercase tracking-wider text-[#77756F]">
                        {label}
                      </dt>
                      <dd className="mt-0.5 font-medium text-[#111111]">{value}</dd>
                    </div>
                  ) : null;
                })}
                <div>
                  <dt className="font-mono text-[8px] uppercase tracking-wider text-[#77756F]">
                    Size Run{buyerMoq ? ' · MOQ' : ''}
                  </dt>
                  <dd className="mt-1 flex flex-col gap-1">
                    <SizeRunChips sizeRun={garment.specs.sizeRun} size="xs" />
                    {buyerMoq && (
                      <span className="font-mono text-[8.5px] font-medium text-[#55534E] tabular-nums">
                        MOQ {buyerMoq}
                      </span>
                    )}
                  </dd>
                </div>
              </dl>

              {/* Cross-Reference Bar: Fabric Library Path + Shared Styles */}
              <div className="space-y-1.5 border-t border-[#E8E6E0] pt-2 text-[9.5px] text-[#66645F]">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span>
                    <span className="font-mono text-[8.5px] uppercase tracking-wider text-[#77756F]">
                      Fabric{' '}
                    </span>
                    <button
                      type="button"
                      disabled={isPreviewLayer}
                      onClick={() => onSelectFabricCode(garment.specs.fabricRollRef)}
                      className="font-mono font-semibold text-[#111111] underline decoration-[#B8B5AD] underline-offset-2 hover:decoration-[#111111] cursor-pointer disabled:no-underline"
                    >
                      {garment.specs.fabricRollRef}
                    </button>
                    <span className="text-[#55534E]"> · {fabricFamilyName}</span>
                  </span>
                  {fabricPageLabel && (
                    <button
                      type="button"
                      disabled={isPreviewLayer}
                      onClick={() => onSelectFabricCode(garment.specs.fabricRollRef)}
                      className="shrink-0 font-mono text-[8.5px] font-semibold text-[#111111] underline decoration-[#B8B5AD] underline-offset-2 hover:decoration-[#111111] cursor-pointer disabled:no-underline tabular-nums"
                    >
                      See Fabric Library {fabricPageLabel} →
                    </button>
                  )}
                </div>

                {fabricSiblings.length > 0 && (
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[9px]">
                    <span className="font-mono text-[8px] uppercase tracking-wider text-[#77756F]">
                      Related styles:
                    </span>
                    {fabricSiblings.map((sibling, index) => {
                      const sibPage = navMap?.garmentPageById.get(sibling.id);
                      const sibPageLabel = sibPage !== undefined ? formatSpreadPageCode(sibPage) : '';
                      return (
                        <React.Fragment key={sibling.id}>
                          {index > 0 && <span className="text-[#BDBAB2]">·</span>}
                          <button
                            type="button"
                            disabled={isPreviewLayer}
                            onClick={() =>
                              onJumpToGarmentId
                                ? onJumpToGarmentId(sibling.id)
                                : onJumpToIndex(sibling.index)
                            }
                            className="font-mono text-[#292824] underline decoration-[#D4D1CA] underline-offset-2 hover:text-[#0A0A0A] hover:decoration-[#111111] cursor-pointer disabled:no-underline tabular-nums"
                          >
                            {sibling.sku}
                            {sibPageLabel ? ` (${sibPageLabel})` : ''}
                          </button>
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          <>
            <div>
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <h2 className="font-serif text-xl tracking-tight text-[#24231F]">In close view</h2>
                <span className="font-mono text-[8px] tracking-[0.12em] text-[#8A8882]">
                  IMAGE DETAILS
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                {renderMedia('pocket', 'Detail 01', 'aspect-[4/3]')}
                {renderMedia('seam', 'Detail 02', 'aspect-[4/3]')}
              </div>
            </div>

            <div className="border-t border-[#E8E6E0] pt-2.5">
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <h3 className="font-mono text-[9px] tracking-[0.12em] text-[#77756F]">
                  COLORWAYS · TCX &amp; SHADE REFS
                </h3>
                <span className="font-mono text-[8.5px] text-[#77756F] tabular-nums">
                  {garment.colorways.length} shades
                </span>
              </div>
              <ColorSwatchList
                colorways={garment.colorways}
                fabricCode={garment.specs.fabricRollRef}
                compact
                editorial
                showPendingColorways={!classicMode}
              />
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-3.5 border-t border-[#E8E6E0] pt-2.5">
              <div>
                <div className="mb-1.5 flex items-baseline justify-between gap-2">
                  <p className="font-mono text-[8px] tracking-[0.1em] text-[#77756F]">
                    FABRIC IMAGE
                  </p>
                  {!isPreviewLayer && onOpenFabricColorPicker && (
                    <button
                      type="button"
                      onClick={() => onOpenFabricColorPicker(garment)}
                      className="font-mono text-[8.5px] font-semibold text-[#111111] underline decoration-[#B8B5AD] underline-offset-2 hover:decoration-[#111111] cursor-pointer"
                    >
                      Switch color ({garment.specs.fabricRollRef})
                    </button>
                  )}
                </div>
                {garment.media.swatch.url ? (
                  renderMedia('swatch', 'Fabric image', 'aspect-[4/3]', false, undefined, 1.65)
                ) : (
                  <button
                    type="button"
                    disabled={isPreviewLayer || !onOpenFabricColorPicker}
                    onClick={() => onOpenFabricColorPicker?.(garment)}
                    className="flex aspect-[4/3] w-full flex-col items-center justify-center border border-dashed border-[#D8D6D0] bg-[#F7F6F2] px-2 text-center transition-colors hover:border-[#0A0A0A] cursor-pointer disabled:cursor-default"
                  >
                    <span className="font-mono text-[8px] font-semibold uppercase tracking-wide text-[#55534E]">
                      Fabric image not supplied
                    </span>
                    <span className="mt-1 text-[8px] leading-snug text-[#77756F]">
                      Click to choose a {garment.specs.fabricRollRef} swatch color.
                    </span>
                  </button>
                )}
              </div>
              <div>
                <p className="mb-1.5 font-mono text-[8px] tracking-[0.1em] text-[#77756F]">
                  DETAIL 03
                </p>
                {renderMedia('custom', 'Detail 03', 'aspect-[4/3]')}
              </div>
            </div>

            <div className="border-t border-[#E8E6E0] pt-2.5">
              <p className="font-serif text-[13px] italic leading-snug text-[#33322F]">
                {garment.summary}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <SizeRunChips sizeRun={garment.specs.sizeRun} size="xs" />
                <span className="font-mono text-[8.5px] text-[#66645F]">
                  {garment.specs.stitchDensity} · {displayMoq(garment.specs.moq)}
                </span>
              </div>
            </div>

            <div className="space-y-1 border-t border-[#E8E6E0] pt-2 text-[9px] text-[#77756F]">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span>
                  Fabric{' '}
                  <button
                    type="button"
                    disabled={isPreviewLayer}
                    onClick={() => onSelectFabricCode(garment.specs.fabricRollRef)}
                    className="font-mono font-semibold text-[#111111] underline decoration-[#D4D1CA] underline-offset-2 disabled:no-underline cursor-pointer"
                  >
                    {garment.specs.fabricRollRef}
                  </button>{' '}
                  · {fabricFamilyName}
                </span>
                {fabricPageLabel && (
                  <button
                    type="button"
                    disabled={isPreviewLayer}
                    onClick={() => onSelectFabricCode(garment.specs.fabricRollRef)}
                    className="font-mono font-semibold text-[#111111] underline decoration-[#B8B5AD] underline-offset-2 cursor-pointer disabled:no-underline"
                  >
                    See Fabric Library {fabricPageLabel} →
                  </button>
                )}
              </div>
              {fabricSiblings.length > 0 && (
                <div>
                  <span>More styles: </span>
                  {fabricSiblings.map((sibling, index) => {
                    const sibPage = navMap?.garmentPageById.get(sibling.id);
                    const sibPageLabel = sibPage !== undefined ? formatSpreadPageCode(sibPage) : '';
                    return (
                      <React.Fragment key={sibling.id}>
                        {index > 0 && <span className="mx-1">·</span>}
                        <button
                          type="button"
                          disabled={isPreviewLayer}
                          onClick={() =>
                            onJumpToGarmentId
                              ? onJumpToGarmentId(sibling.id)
                              : onJumpToIndex(sibling.index)
                          }
                          className="font-mono text-[#33322F] underline decoration-[#D4D1CA] underline-offset-2 cursor-pointer disabled:no-underline tabular-nums"
                        >
                          {sibling.sku}
                          {sibPageLabel ? ` (${sibPageLabel})` : ''}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="relative z-10 mt-3 flex items-center justify-between border-t border-[#E8E6E0] pt-2 font-mono text-[9px] font-semibold text-[#111111] tabular-nums">
        <span>{paddedNumber}.B–E</span>
        <span>{rectoPage}</span>
      </footer>
    </>
  );

  if (side === 'verso') return versoLeaf;
  if (side === 'recto') return rectoLeaf;

  return (
    <div className={embeddedInFlipbook ? '' : 'mx-auto max-w-[1360px] px-6 py-8 lg:px-10 lg:py-10'}>
      {!embeddedInFlipbook && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <button type="button" onClick={onPrev} className="inline-flex items-center gap-1.5 text-[#55534E] hover:text-[#111]">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>
            <label className="flex items-center gap-1.5 font-mono text-xs text-[#24231F]">
              <span className="sr-only">Jump to style code</span>
              <select
                value={garment.index}
                onChange={(event) => onJumpToIndex(Number(event.target.value))}
                className="bg-white py-1 font-mono text-xs text-[#24231F] focus:outline-none"
              >
                {allGarments.map((item) => (
                  <option key={item.id} value={item.index}>
                    {String(item.index).padStart(2, '0')} · {item.sku} ({item.gender})
                  </option>
                ))}
              </select>
              <span className="text-[#77756F]">of {paddedTotal}</span>
            </label>
            <button type="button" onClick={onNext} className="inline-flex items-center gap-1.5 text-[#55534E] hover:text-[#111]">
              <span>Next</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {!classicMode && (
              <span className="font-mono text-[10px] text-[#77756F]">
                {populatedCount}/5 images
              </span>
            )}
            <button
              type="button"
              onClick={() => onToggleShortlist(garment.id)}
              className="inline-flex items-center gap-1.5 text-xs text-[#55534E] hover:text-[#111]"
            >
              {isShortlisted ? <Check className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
              <span>{isShortlisted ? 'Saved' : 'Save style'}</span>
            </button>
            <button type="button" onClick={() => onOpenEditor()} className="inline-flex items-center gap-1.5 text-xs text-[#55534E] hover:text-[#111]">
              <SlidersHorizontal className="h-3 w-3" />
              <span>Edit</span>
            </button>
            <button type="button" onClick={onExportCurrentPdf} className="inline-flex items-center gap-1.5 text-xs text-[#55534E] hover:text-[#111]">
              <Printer className="h-3 w-3" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      )}

      <div className="relative grid grid-cols-1 bg-white lg:grid-cols-2">
        {versoLeaf}
        {rectoLeaf}
        <div
          aria-hidden="true"
          className="book-spine-crease pointer-events-none absolute inset-y-0 left-1/2 hidden w-1.5 -translate-x-1/2 lg:block"
        />
      </div>
    </div>
  );
};
