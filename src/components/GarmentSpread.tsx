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
import type { GarmentItem, MediaSlot, MediaSlotKey } from '../types/catalogue';
import { MediaPlate } from './MediaPlate';
import { ColorSwatchList } from './ColorSwatchList';

export type SpreadLeafSide = 'full' | 'verso' | 'recto';

interface GarmentSpreadProps {
  garment: GarmentItem;
  allGarments: GarmentItem[];
  editMode: boolean;
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
  onInspectMedia: (slot: MediaSlot, titleLabel: string, garmentTitle: string) => void;
  onOpenEditor: (focusSlot?: MediaSlotKey) => void;
  onOpenVideo: (garment: GarmentItem) => void;
  onExportCurrentPdf: () => void;
}

export const GarmentSpread: React.FC<GarmentSpreadProps> = ({
  garment,
  allGarments,
  editMode,
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
  onInspectMedia,
  onOpenEditor,
  onOpenVideo,
  onExportCurrentPdf,
}) => {
  const totalCount = allGarments.length;
  const paddedNumber = String(garment.index).padStart(2, '0');
  const paddedTotal = String(totalCount).padStart(2, '0');
  const versoPage = String(garment.index * 2 - 1).padStart(2, '0');
  const rectoPage = String(garment.index * 2).padStart(2, '0');

  const populatedCount = (['hero', 'pocket', 'seam', 'swatch', 'custom'] as MediaSlotKey[]).filter(
    (k) => Boolean(garment.media[k]?.url)
  ).length;

  const fabricSiblings = allGarments.filter(
    (g) =>
      g.id !== garment.id &&
      g.specs.fabricRollRef.toLowerCase() === garment.specs.fabricRollRef.toLowerCase()
  );

  const noop = () => {};

  /* ========================================================================
     LEFT PAGE (VERSO): Title, 5-Col Buyer Strip, Hero + Swatch + Custom + Links
     Asymmetric Physical Binding Margins:
       - Outer Left Margin: pl-6 sm:pl-8 lg:pl-9
       - Inner Spine Gutter: pr-8 sm:pr-11 lg:pr-14
     ======================================================================== */
  const versoLeaf = (
    <div className="relative flex h-full min-h-[700px] flex-col justify-between bg-white py-6 pl-6 pr-8 sm:py-7 sm:pl-8 sm:pr-11 lg:py-8 lg:pl-9 lg:pr-14">
      {/* Physical Spine Crease Shadow on Right (Binding) Edge */}
      <div
        aria-hidden="true"
        className="spine-verso-shadow pointer-events-none absolute inset-y-0 right-0 w-14"
      />

      {/* Optional Print Safe-Zone Guide (14mm outer / 18mm inner spine gutter) */}
      {showSafeZones && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-4 bottom-4 left-4 right-8 border border-dashed border-[var(--metallic-soft)]/70"
        />
      )}

      {/* Verso Running Header */}
      <div className="relative z-10 mb-4 flex items-center justify-between border-b border-[#EFEFEF] pb-2.5 font-mono text-[10.5px] text-[#737373]">
        <span>DOT / DT APPAREL</span>
        <span>
          {garment.gender.toUpperCase()} ({garment.genderCode.toUpperCase()}) · {garment.category.toUpperCase()}
        </span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-start gap-5">
        {/* Product Title + Concise Summary + Shortlist/Edit */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="font-sans text-xl font-semibold tracking-tight text-[#0A0A0A] sm:text-2xl lg:leading-[1.15]">
              {garment.title}
            </h1>
            <div className="mt-2 h-px w-12 metallic-rule" />
            <p className="mt-2 text-xs leading-relaxed text-[#404040]">
              {garment.summary}
            </p>
          </div>

          {embeddedInFlipbook && !isPreviewLayer && (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onToggleShortlist(garment.id)}
                className={`inline-flex items-center gap-1 border px-2 py-1 text-[10.5px] font-medium transition-colors cursor-pointer ${
                  isShortlisted
                    ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white'
                    : 'border-[#E5E5E5] bg-white text-[#404040] hover:border-[#0A0A0A]'
                }`}
              >
                {isShortlisted ? <Check className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
                <span>{isShortlisted ? 'Saved' : 'Shortlist'}</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenEditor()}
                className="inline-flex items-center gap-1 border border-[#E5E5E5] bg-white px-2 py-1 text-[10.5px] font-medium text-[#404040] hover:border-[#0A0A0A] hover:text-[#0A0A0A] cursor-pointer"
              >
                <SlidersHorizontal className="h-3 w-3" />
                <span>Edit</span>
              </button>
            </div>
          )}
        </div>

        {/* 5-Column Buyer Identity Strip (Never swapped GSM / Width) */}
        <div className="grid grid-cols-2 gap-3 border-t border-b border-[#E5E5E5] py-2.5 sm:grid-cols-5">
          <div>
            <span className="block text-[9.5px] text-[#737373]">Style Code</span>
            <span className="mt-0.5 block font-mono text-[11px] font-semibold text-[#0A0A0A]">
              {garment.sku}
            </span>
          </div>
          <div>
            <span className="block text-[9.5px] text-[#737373]">Swatchbook</span>
            <span className="mt-0.5 block font-mono text-[11px] font-medium text-[#0A0A0A] truncate">
              {garment.specs.fabricRollRef}
            </span>
          </div>
          <div>
            <span className="block text-[9.5px] text-[#737373]">GSM (Weight)</span>
            <span className="mt-0.5 block font-mono text-[11px] font-medium text-[#0A0A0A] tabular-nums">
              {garment.specs.weightGsm}
            </span>
          </div>
          <div>
            <span className="block text-[9.5px] text-[#737373]">Width</span>
            <span className="mt-0.5 block font-mono text-[11px] font-medium text-[#0A0A0A] tabular-nums">
              {garment.specs.fabricWidth}
            </span>
          </div>
          <div>
            <span className="block text-[9.5px] text-[#737373]">Colors</span>
            <span className="mt-0.5 block font-mono text-[11px] font-medium text-[#0A0A0A] tabular-nums">
              {garment.colorCount} Shades
            </span>
          </div>
        </div>

        {/* Primary Silhouette + Swatch & Custom Plate */}
        <div className="grid grid-cols-12 items-start gap-4">
          <div className="col-span-8">
            <MediaPlate
              slotKey="hero"
              slot={garment.media.hero}
              aspectClass="aspect-[3/4]"
              titleLabel="Primary Silhouette"
              editMode={editMode}
              onReplaceFile={isPreviewLayer ? noop : (k, url) => onReplaceFile(garment.id, k, url)}
              onInspect={isPreviewLayer ? undefined : (slot, label) => onInspectMedia(slot, label, garment.title)}
              onOpenEditor={isPreviewLayer ? undefined : (k) => onOpenEditor(k)}
            />
          </div>

          <div className="col-span-4 flex flex-col gap-4">
            <MediaPlate
              slotKey="swatch"
              slot={garment.media.swatch}
              aspectClass="aspect-square"
              titleLabel={`Swatch: ${garment.specs.fabricRollRef}`}
              compact
              editMode={editMode}
              onReplaceFile={isPreviewLayer ? noop : (k, url) => onReplaceFile(garment.id, k, url)}
              onInspect={isPreviewLayer ? undefined : (slot, label) => onInspectMedia(slot, label, garment.title)}
              onOpenEditor={isPreviewLayer ? undefined : (k) => onOpenEditor(k)}
            />
            <MediaPlate
              slotKey="custom"
              slot={garment.media.custom}
              aspectClass="aspect-[4/3]"
              titleLabel="Fit / Trim Slot"
              compact
              editMode={editMode}
              onReplaceFile={isPreviewLayer ? noop : (k, url) => onReplaceFile(garment.id, k, url)}
              onInspect={isPreviewLayer ? undefined : (slot, label) => onInspectMedia(slot, label, garment.title)}
              onOpenEditor={isPreviewLayer ? undefined : (k) => onOpenEditor(k)}
            />

            <div className="space-y-2 border-t border-[#EFEFEF] pt-2.5 text-[11px]">
              <button
                type="button"
                disabled={isPreviewLayer}
                onClick={() => onOpenVideo(garment)}
                className="flex w-full items-center gap-1.5 text-left text-[#404040] transition-colors hover:text-[#0A0A0A] cursor-pointer"
              >
                <Film className="h-3.5 w-3.5 shrink-0 text-[var(--metallic-strong)]" />
                <span className="truncate underline underline-offset-4 decoration-[#D4D4D4]">
                  {garment.videoUrl ? garment.videoTitle : 'Motion Study'}
                </span>
              </button>

              <a
                href={garment.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-mono text-[10.5px] text-[#525252] transition-colors hover:text-[#0A0A0A]"
              >
                <ExternalLink className="h-3 w-3 shrink-0 text-[var(--metallic-strong)]" />
                <span className="truncate underline underline-offset-4 decoration-[#D4D4D4]">
                  B2B Spec Link
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Verso Folio Footer (Outer Left Edge) */}
      <div className="relative z-10 mt-4 flex items-center justify-between border-t border-[#EFEFEF] pt-2.5 font-mono text-[10px] text-[#8A8A8A] tabular-nums">
        <span>P. {versoPage}</span>
        <span>PLATE {paddedNumber}.A · {garment.productGroupVi.toUpperCase()}</span>
      </div>
    </div>
  );

  /* ========================================================================
     RIGHT PAGE (RECTO): Pocket & Seam Macro Plates, Notes, Colors & B2B Ledger
     Asymmetric Physical Binding Margins:
       - Inner Spine Gutter: pl-8 sm:pl-11 lg:pl-14
       - Outer Right Margin: pr-6 sm:pr-8 lg:pr-9
     ======================================================================== */
  const rectoLeaf = (
    <div className="relative flex h-full min-h-[700px] flex-col justify-between bg-white py-6 pl-8 pr-6 sm:py-7 sm:pl-11 sm:pr-8 lg:py-8 lg:pl-14 lg:pr-9">
      {/* Physical Spine Crease Shadow on Left (Binding) Edge */}
      <div
        aria-hidden="true"
        className="spine-recto-shadow pointer-events-none absolute inset-y-0 left-0 w-14"
      />

      {/* Optional Print Safe-Zone Guide (18mm inner spine gutter / 14mm outer) */}
      {showSafeZones && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-4 bottom-4 left-8 right-4 border border-dashed border-[var(--metallic-soft)]/70"
        />
      )}

      {/* Recto Running Header */}
      <div className="relative z-10 mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#EFEFEF] pb-2.5 font-mono text-[10.5px] text-[#737373] tabular-nums">
        <span className="font-medium text-[#0A0A0A]">
          STYLE CODE: {garment.sku}
        </span>
        <span>
          {garment.specs.fabricRollRef} · {garment.specs.cmOemOdmScope.toUpperCase()}
        </span>
      </div>

      <div className="relative z-10 flex-1 space-y-4">
        {/* Source Truncation Flag (Honest B2B Reporting) */}
        {garment.dataFlags && garment.dataFlags.length > 0 && (
          <div className="flex items-start gap-2 border border-[#D4D4D4] bg-[#FAFAFA] px-3 py-2 text-[11px] text-[#404040]">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--metallic-strong)]" />
            <div>
              <span className="font-medium text-[#0A0A0A]">Source Flag: </span>
              <span>{garment.dataFlags.join(' ')}</span>
            </div>
          </div>
        )}

        {/* Craftsmanship & Durability Macro Plates (Pocket + Inner Seam) */}
        <div>
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <h2 className="font-sans text-xs font-semibold tracking-wide text-[#0A0A0A]">
              Craftsmanship &amp; Durability Close-Ups
            </h2>
            <span className="font-serif text-[11.5px] italic text-[#737373]">
              Pocket detail &amp; internal seam construction
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <MediaPlate
              slotKey="pocket"
              slot={garment.media.pocket}
              aspectClass="aspect-[4/3]"
              titleLabel="Pocket & Placket Detail"
              editMode={editMode}
              onReplaceFile={isPreviewLayer ? noop : (k, url) => onReplaceFile(garment.id, k, url)}
              onInspect={isPreviewLayer ? undefined : (slot, label) => onInspectMedia(slot, label, garment.title)}
              onOpenEditor={isPreviewLayer ? undefined : (k) => onOpenEditor(k)}
            />
            <MediaPlate
              slotKey="seam"
              slot={garment.media.seam}
              aspectClass="aspect-[4/3]"
              titleLabel="Inner Seam & Binding"
              editMode={editMode}
              onReplaceFile={isPreviewLayer ? noop : (k, url) => onReplaceFile(garment.id, k, url)}
              onInspect={isPreviewLayer ? undefined : (slot, label) => onInspectMedia(slot, label, garment.title)}
              onOpenEditor={isPreviewLayer ? undefined : (k) => onOpenEditor(k)}
            />
          </div>
        </div>

        {/* Openly Typeset Description & Key Construction Features */}
        <div className="grid grid-cols-1 gap-4 border-t border-[#EFEFEF] pt-3.5 sm:grid-cols-2">
          <div>
            <h3 className="font-sans text-xs font-semibold tracking-wide text-[#0A0A0A]">
              Description &amp; Stretch / Feel
            </h3>
            <p className="mt-1 text-[11.5px] font-medium text-[#262626]">
              {garment.specs.stretchFeelNote}
            </p>
            <ul className="mt-1.5 space-y-1 text-[11px] leading-relaxed text-[#404040]">
              {garment.descriptionBullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-1 w-1 shrink-0 bg-[var(--metallic-strong)]"
                  />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-xs font-semibold tracking-wide text-[#0A0A0A]">
              Key Construction Features
            </h3>
            <ul className="mt-1.5 space-y-1 text-[11px] leading-relaxed text-[#404040]">
              {garment.keyFeatures.map((feat, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="mt-0.5 shrink-0 font-mono text-[9.5px] text-[var(--metallic-strong)] tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Readable Color Swatches & Pantone TCX References */}
        <div className="border-t border-[#EFEFEF] pt-3">
          <h3 className="mb-2 font-sans text-xs font-semibold tracking-wide text-[#0A0A0A]">
            Available Colors &amp; Pantone TCX References ({garment.colorCount})
          </h3>
          <ColorSwatchList colorways={garment.colorways} compact />
        </div>

        {/* B2B Buyer Specification Ledger */}
        <div className="border-t border-[#E5E5E5] pt-3">
          <div className="grid grid-cols-1 gap-x-6 gap-y-1 text-[11px] sm:grid-cols-2">
            <div className="flex items-baseline justify-between gap-3 border-b border-[#F2F2F2] py-1">
              <span className="text-[#737373]">Fabric Content</span>
              <span className="text-right text-[#0A0A0A]">{garment.specs.composition}</span>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-b border-[#F2F2F2] py-1">
              <span className="text-[#737373]">Stitch Density</span>
              <span className="font-mono text-[#0A0A0A] tabular-nums">
                {garment.specs.stitchDensity}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-b border-[#F2F2F2] py-1">
              <span className="text-[#737373]">Inner Seam</span>
              <span className="text-right text-[#0A0A0A]">{garment.specs.seamFinish}</span>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-b border-[#F2F2F2] py-1">
              <span className="text-[#737373]">Pocket Spec</span>
              <span className="text-right text-[#0A0A0A]">{garment.specs.pocketConstruction}</span>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-b border-[#F2F2F2] py-1">
              <span className="text-[#737373]">Size / MOQ</span>
              <span className="font-mono text-[#0A0A0A] tabular-nums">
                {garment.specs.sizeRun} · {garment.specs.moq}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-b border-[#F2F2F2] py-1">
              <span className="text-[#737373]">Lead Time</span>
              <span className="font-mono text-[#0A0A0A] tabular-nums">
                {garment.specs.leadTime}
              </span>
            </div>
          </div>

          {fabricSiblings.length > 0 && !isPreviewLayer && (
            <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10.5px] text-[#737373]">
              <span>
                Shared Roll (<span className="font-mono text-[#0A0A0A]">{garment.specs.fabricRollRef}</span>):
              </span>
              {fabricSiblings.map((sib, idx) => (
                <React.Fragment key={sib.id}>
                  {idx > 0 && <span aria-hidden="true">·</span>}
                  <button
                    type="button"
                    onClick={() => onJumpToIndex(sib.index)}
                    className="font-mono text-[#404040] underline underline-offset-4 decoration-[#D4D4D4] transition-colors hover:text-[#0A0A0A] hover:decoration-[#0A0A0A] cursor-pointer"
                  >
                    {sib.sku}
                  </button>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recto Folio Footer (Outer Right Edge) */}
      <div className="relative z-10 mt-4 flex items-center justify-between border-t border-[#EFEFEF] pt-2.5 font-mono text-[10px] text-[#8A8A8A] tabular-nums">
        <span>PLATES {paddedNumber}.B — {paddedNumber}.E</span>
        <span>P. {rectoPage}</span>
      </div>
    </div>
  );

  if (side === 'verso') return versoLeaf;
  if (side === 'recto') return rectoLeaf;

  return (
    <div className={embeddedInFlipbook ? '' : 'mx-auto max-w-[1360px] px-6 py-8 lg:px-10 lg:py-10'}>
      {!embeddedInFlipbook && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onPrev}
              className="inline-flex items-center gap-1.5 py-1 font-medium text-[#525252] transition-colors hover:text-[#0A0A0A] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Prev Spread</span>
            </button>

            <label className="flex items-center gap-1.5 font-mono text-xs text-[#0A0A0A] tabular-nums">
              <span className="sr-only">Jump to style code</span>
              <select
                value={garment.index}
                onChange={(e) => onJumpToIndex(Number(e.target.value))}
                className="border border-[#E5E5E5] bg-white px-2.5 py-1 font-mono text-xs text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none cursor-pointer"
              >
                {allGarments.map((item) => (
                  <option key={item.id} value={item.index}>
                    {String(item.index).padStart(2, '0')} · {item.sku} ({item.gender})
                  </option>
                ))}
              </select>
              <span className="text-[#737373]">of {paddedTotal}</span>
            </label>

            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center gap-1.5 py-1 font-medium text-[#525252] transition-colors hover:text-[#0A0A0A] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Next Spread</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[11px] text-[#737373] tabular-nums mr-1">
              {populatedCount}/5 Plates Placed
            </span>

            <button
              type="button"
              onClick={() => onToggleShortlist(garment.id)}
              className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isShortlisted
                  ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white'
                  : 'border-[#E5E5E5] bg-white text-[#404040] hover:border-[#0A0A0A] hover:text-[#0A0A0A]'
              }`}
            >
              {isShortlisted ? <Check className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
              <span>{isShortlisted ? 'Shortlisted' : 'Shortlist'}</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenEditor()}
              className="inline-flex items-center gap-1.5 border border-[#E5E5E5] bg-white px-3 py-1.5 text-xs font-medium text-[#404040] transition-colors hover:border-[#0A0A0A] hover:text-[#0A0A0A] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <SlidersHorizontal className="h-3 w-3" />
              <span>Edit Spread</span>
            </button>

            <button
              type="button"
              onClick={onExportCurrentPdf}
              className="inline-flex items-center gap-1.5 border border-[#E5E5E5] bg-white px-3 py-1.5 text-xs font-medium text-[#404040] transition-colors hover:border-[#0A0A0A] hover:text-[#0A0A0A] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Printer className="h-3 w-3" />
              <span>Export Spread PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* SYMMETRIC 50/50 TWO-PAGE SPREAD */}
      <div className="relative grid grid-cols-1 border border-[#E2E2E2] bg-white lg:grid-cols-2">
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
