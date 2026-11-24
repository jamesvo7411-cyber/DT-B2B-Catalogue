import React from 'react';
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
import { conciseSourceNote } from '../utils/productDisplay';

export type SpreadLeafSide = 'full' | 'verso' | 'recto';

interface GarmentSpreadProps {
  garment: GarmentItem;
  allGarments: GarmentItem[];
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
  onToggleShortlist: (id: string) => void;
  onReplaceFile: (garmentId: string, slotKey: MediaSlotKey, dataUrl: string) => void;
  onUpdateCrop: (garmentId: string, slotKey: MediaSlotKey, crop: ImageCrop) => void;
  onInspectMedia: (slot: MediaSlot, titleLabel: string, garmentTitle: string) => void;
  onOpenEditor: (focusSlot?: MediaSlotKey) => void;
  onOpenVideo: (garment: GarmentItem) => void;
  onExportCurrentPdf: () => void;
}

export const GarmentSpread: React.FC<GarmentSpreadProps> = ({
  garment,
  allGarments,
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
  onToggleShortlist,
  onReplaceFile,
  onUpdateCrop,
  onInspectMedia,
  onOpenEditor,
  onOpenVideo,
  onExportCurrentPdf,
}) => {
  const paddedNumber = String(garment.index).padStart(2, '0');
  const paddedTotal = String(allGarments.length).padStart(2, '0');
  const versoPage = String(garment.index * 2 - 1).padStart(2, '0');
  const rectoPage = String(garment.index * 2).padStart(2, '0');
  const mediaKeys: MediaSlotKey[] = ['hero', 'pocket', 'seam', 'swatch', 'custom'];
  const populatedCount = mediaKeys.filter((key) => Boolean(garment.media[key]?.url)).length;
  const fabricSiblings = allGarments.filter(
    (item) =>
      item.id !== garment.id &&
      item.specs.fabricRollRef.toLowerCase() === garment.specs.fabricRollRef.toLowerCase()
  );
  const sourceNote = conciseSourceNote(garment.dataFlags);

  const renderMedia = (
    slotKey: MediaSlotKey,
    titleLabel: string,
    aspectClass: string,
    compact = false,
    imageOverlay?: React.ReactNode
  ) => (
    <MediaPlate
      slotKey={slotKey}
      slot={garment.media[slotKey]}
      aspectClass={aspectClass}
      titleLabel={titleLabel}
      editMode={editMode && !isPreviewLayer && !classicMode}
      interactive={!classicMode}
      compact={compact}
      imageOverlay={imageOverlay}
      onReplaceFile={
        isPreviewLayer || classicMode
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
          : (slot, label) => onInspectMedia(slot, label, garment.title)
      }
      onOpenEditor={isPreviewLayer || classicMode ? undefined : (key) => onOpenEditor(key)}
    />
  );

  const leafShell = (leafSide: 'verso' | 'recto', children: React.ReactNode) => {
    const verso = leafSide === 'verso';
    return (
      <div
        className={`relative flex h-full min-h-[700px] flex-col bg-white py-6 sm:py-7 lg:py-8 ${
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

  const versoLeaf = leafShell(
    'verso',
    <>
      <header className="relative z-10 mb-4 flex items-center justify-between gap-3 border-b border-[#EFEDE8] pb-2.5 font-mono text-[9px] tracking-wide text-[#77756F]">
        <span>DREAM TOMORROW</span>
        <span className="text-right">
          {garment.gender.toUpperCase()} · {garment.category.toUpperCase()}
        </span>
      </header>

      <main className="relative z-10 flex flex-1 flex-col gap-4">
        {renderMedia(
          'hero',
          'Primary image',
          'aspect-[5/4]',
          false,
          <div className="max-w-[38ch]">
            <p className="font-mono text-[9px] tracking-[0.16em]">
              {garment.sku} <span className="mx-1.5 opacity-70">/</span>{' '}
              {garment.category.toUpperCase()}
            </p>
            <h1 className="mt-1 font-serif text-3xl leading-[0.98] tracking-tight sm:text-4xl">
              {garment.title}
            </h1>
          </div>
        )}

        <ProductSpecStrip item={garment} />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFEDE8] pb-3">
          {sourceNote ? (
            <p className="flex max-w-[65ch] items-start gap-1.5 text-[9px] leading-relaxed text-[#77756F]">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              <span>{sourceNote}</span>
            </p>
          ) : (
            <span />
          )}
          {embeddedInFlipbook && !isPreviewLayer && !classicMode && (
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={() => onToggleShortlist(garment.id)}
                className="inline-flex items-center gap-1.5 text-[10px] text-[#55534E] transition-colors hover:text-[#111]"
              >
                {isShortlisted ? <Check className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
                <span>{isShortlisted ? 'Saved' : 'Save style'}</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenEditor()}
                className="inline-flex items-center gap-1.5 text-[10px] text-[#55534E] transition-colors hover:text-[#111]"
              >
                <SlidersHorizontal className="h-3 w-3" />
                <span>Edit</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] text-[#696761]">
          <div className="flex items-center gap-4">
            {garment.videoUrl && !classicMode && (
              <button
                type="button"
                disabled={isPreviewLayer}
                onClick={() => onOpenVideo(garment)}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-[#111]"
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
          {!classicMode && (
            <span className="font-mono text-[9px] text-[#8A8882]">
              {populatedCount}/5 images
            </span>
          )}
        </div>
      </main>

      <footer className="relative z-10 mt-4 flex items-center justify-between border-t border-[#EFEDE8] pt-2.5 font-mono text-[9px] text-[#8A8882] tabular-nums">
        <span>P. {versoPage}</span>
        <span>{paddedNumber}.A · {garment.productGroupVi.toUpperCase()}</span>
      </footer>
    </>
  );

  const rectoLeaf = leafShell(
    'recto',
    <>
      <header className="relative z-10 mb-4 flex items-center justify-between gap-3 border-b border-[#EFEDE8] pb-2.5 font-mono text-[9px] tracking-wide text-[#77756F]">
        <span>DETAILS</span>
        <span>{garment.sku}</span>
      </header>

      <main className="relative z-10 flex flex-1 flex-col gap-4">
        <div>
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <h2 className="font-serif text-xl tracking-tight text-[#24231F]">In close view</h2>
            <span className="font-mono text-[8px] tracking-[0.12em] text-[#8A8882]">
              IMAGE DETAILS
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {renderMedia('pocket', 'Detail 01', 'aspect-[4/3]')}
            {renderMedia('seam', 'Detail 02', 'aspect-[4/3]')}
          </div>
        </div>

        <div className="border-t border-[#EFEDE8] pt-3">
          <h3 className="mb-2 font-mono text-[9px] tracking-[0.12em] text-[#77756F]">COLORWAYS</h3>
          <ColorSwatchList colorways={garment.colorways} compact editorial />
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-4 border-t border-[#EFEDE8] pt-3">
          <div>
            <p className="mb-1.5 font-mono text-[8px] tracking-[0.1em] text-[#77756F]">
              FABRIC IMAGE
            </p>
            {renderMedia('swatch', 'Fabric image', 'aspect-[4/3]')}
          </div>
          <div>
            <p className="mb-1.5 font-mono text-[8px] tracking-[0.1em] text-[#77756F]">
              DETAIL 03
            </p>
            {renderMedia('custom', 'Detail 03', 'aspect-[4/3]')}
          </div>
        </div>

        {fabricSiblings.length > 0 && !classicMode && (
          <div className="border-t border-[#EFEDE8] pt-2.5 text-[9px] text-[#77756F]">
            <span>More styles in {garment.specs.fabricRollRef}: </span>
            {fabricSiblings.map((sibling, index) => (
              <React.Fragment key={sibling.id}>
                {index > 0 && <span className="mx-1">·</span>}
                <button
                  type="button"
                  onClick={() => onJumpToIndex(sibling.index)}
                  className="font-mono text-[#33322F] underline decoration-[#D4D1CA] underline-offset-2"
                >
                  {sibling.sku}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}
      </main>

      <footer className="relative z-10 mt-4 flex items-center justify-between border-t border-[#EFEDE8] pt-2.5 font-mono text-[9px] text-[#8A8882] tabular-nums">
        <span>{paddedNumber}.B–E</span>
        <span>P. {rectoPage}</span>
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
