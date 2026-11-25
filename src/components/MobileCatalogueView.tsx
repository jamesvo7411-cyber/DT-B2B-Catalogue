import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { GarmentItem, ImageCrop, MediaSlotKey } from '../types/catalogue';
import { getColorSwatchHex } from '../data/garments';
import { conciseSourceNote, displayFabricComposition } from '../utils/productDisplay';
import { MediaPlate } from './MediaPlate';

interface MobileCatalogueViewProps {
  garments: GarmentItem[];
  bookPage: number;
  totalSpreads: number;
  productOffset: number;
  isWorkbench: boolean;
  editMode: boolean;
  getSpreadLabel: (page: number) => string;
  renderStaticPage: (page: number) => React.ReactNode;
  onChangeBookPage: (page: number) => void;
  onToggleEditMode: () => void;
  onReplaceFile: (garmentId: string, slotKey: MediaSlotKey, dataUrl: string) => void;
  onUpdateCrop: (garmentId: string, slotKey: MediaSlotKey, crop: ImageCrop) => void;
  onInspectMedia: (slot: GarmentItem['media'][MediaSlotKey], titleLabel: string, garmentTitle: string) => void;
  onOpenEditor: (garmentIndex: number, focusSlot?: MediaSlotKey) => void;
  onSelectFabricCode: (fabricCode: string) => void;
}

const SLOT_LABELS: Record<MediaSlotKey, string> = {
  hero: 'Front on model',
  pocket: 'Pocket detail',
  seam: 'Stitching detail',
  swatch: 'Fabric texture',
  custom: 'Additional detail',
};

export const MobileCatalogueView: React.FC<MobileCatalogueViewProps> = ({
  garments,
  bookPage,
  totalSpreads,
  productOffset,
  isWorkbench,
  editMode,
  getSpreadLabel,
  renderStaticPage,
  onChangeBookPage,
  onToggleEditMode,
  onReplaceFile,
  onUpdateCrop,
  onInspectMedia,
  onOpenEditor,
  onSelectFabricCode,
}) => {
  const garment =
    bookPage >= productOffset && bookPage < productOffset + garments.length
      ? garments[bookPage - productOffset]
      : null;
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [activeColorway, setActiveColorway] = useState(garment?.colorways[0] ?? '');
  const isMobileWorkbench = isWorkbench;

  const photos = useMemo(() => {
    if (!garment) return [];

    const keys: MediaSlotKey[] = ['hero', 'pocket', 'seam', 'swatch', 'custom'];
    const seenUrls = new Set<string>();
    return keys.flatMap((key) => {
      const slot = garment.media[key];
      if (!slot.url && (!isMobileWorkbench || key === 'swatch')) return [];
      if (slot.url && !isMobileWorkbench && seenUrls.has(slot.url)) return [];
      if (slot.url) seenUrls.add(slot.url);
      return [{ key, slot, label: SLOT_LABELS[key] }];
    });
  }, [garment, isMobileWorkbench]);

  useEffect(() => {
    setActivePhoto(0);
    setActiveColorway(garment?.colorways[0] ?? '');
    if (galleryRef.current) galleryRef.current.scrollTo({ left: 0 });
  }, [garment?.id]);

  const setSpread = (page: number) => {
    onChangeBookPage(Math.max(0, Math.min(totalSpreads - 1, page)));
  };

  const moveSpread = (direction: -1 | 1) => {
    setSpread((bookPage + direction + totalSpreads) % totalSpreads);
  };

  const updateActivePhoto = (event: React.UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    const containerBounds = container.getBoundingClientRect();
    const viewportCenter = containerBounds.left + containerBounds.width / 2;
    const slides = Array.from(container.children) as HTMLElement[];
    const current = slides.reduce(
      (closestIndex, slide, index) => {
        const slideBounds = slide.getBoundingClientRect();
        const slideCenter = slideBounds.left + slideBounds.width / 2;
        const distance = Math.abs(slideCenter - viewportCenter);
        return distance < closestIndex.distance
          ? { index, distance }
          : closestIndex;
      },
      { index: 0, distance: Number.POSITIVE_INFINITY }
    );
    setActivePhoto(current.index);
  };

  const scrollToPhoto = (index: number) => {
    const slide = galleryRef.current?.children[index];
    if (slide instanceof HTMLElement) {
      slide.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const pageIndicator = `${String(bookPage + 1).padStart(2, '0')} / ${String(totalSpreads).padStart(2, '0')}`;

  return (
    <section
      aria-label="Mobile catalogue"
      className="min-h-[calc(100vh-4rem)] w-full overflow-x-clip bg-[#F4F3EF] pb-28"
    >
      <header className="sticky top-0 z-40 border-b border-[#E8E6E0] bg-white/95 px-3 py-2.5 backdrop-blur">
        <div className="mx-auto max-w-xl">
          <div className="flex min-w-0 items-center gap-2">
            <label className="sr-only" htmlFor="mobile-spread-select">Choose catalogue style</label>
            <select
              id="mobile-spread-select"
              value={bookPage}
              onChange={(event) => setSpread(Number(event.target.value))}
              className="min-w-0 flex-1 appearance-none border border-[#DAD8D2] bg-white px-2.5 py-2 text-[11px] font-semibold text-[#111111] focus:border-[#111111] focus:outline-none"
            >
              {Array.from({ length: totalSpreads }, (_, index) => (
                <option key={index} value={index}>{getSpreadLabel(index)}</option>
              ))}
            </select>
            <span className="shrink-0 font-mono text-[10px] font-semibold tabular-nums text-[#111111]">
              {pageIndicator}
            </span>
          </div>
          <nav aria-label="Mobile catalogue shortcuts" className="mt-2 grid grid-cols-3 gap-1">
            {([
              { label: 'TOC', page: 1 },
              { label: 'Swatches', page: 2 },
              { label: 'Specs', page: totalSpreads - 1 },
            ]).map(({ label, page }) => {
              const isSelected =
                bookPage === page ||
                (label === 'Swatches' && bookPage >= 2 && bookPage < productOffset);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setSpread(page)}
                  aria-current={isSelected ? 'page' : undefined}
                  className={`border px-2 py-1.5 text-[10px] font-semibold transition-colors ${
                    isSelected
                      ? 'border-[#111111] bg-[#111111] text-white'
                      : 'border-[#E8E6E0] bg-white text-[#55534E]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </nav>
          {isMobileWorkbench && (
            <div className="mt-2 flex items-center justify-between border-t border-[#EFEDE8] pt-2">
              <span className="font-mono text-[9px] font-semibold uppercase tracking-wide text-[#55534E]">
                Workbench · image tools
              </span>
              <button
                type="button"
                onClick={onToggleEditMode}
                aria-pressed={editMode}
                className="text-[10px] font-semibold text-[#111111] underline underline-offset-2"
              >
                Replace mode: {editMode ? 'On' : 'Off'}
              </button>
            </div>
          )}
        </div>
      </header>

      {garment ? (
        <div className="mx-auto max-w-xl px-4 pb-8 pt-5">
          <div className="mb-4">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#55534E]">
              {garment.gender} · {garment.category}
            </p>
            <div className="mt-1 flex items-start justify-between gap-3">
              <h1 className="font-sans text-2xl font-extrabold leading-tight tracking-tight text-[#111111]">
                {garment.title}
              </h1>
              <span className="shrink-0 border border-[#DAD8D2] bg-white px-2 py-1 font-mono text-xs font-bold text-[#111111]">
                {garment.sku}
              </span>
            </div>
          </div>

          {photos.length > 0 ? (
            <div
              ref={galleryRef}
              role="region"
              aria-label={`${garment.sku} product images`}
              className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-4 pb-2"
              onScroll={updateActivePhoto}
            >
              {photos.map(({ key, slot, label }, index) => (
                <div key={key} className="w-[86%] max-w-[390px] shrink-0 snap-center">
                  <MediaPlate
                    slotKey={key}
                    slot={slot}
                    aspectClass="aspect-[4/5] w-full"
                    titleLabel={label}
                    editMode={editMode && isMobileWorkbench && key !== 'swatch'}
                    editable={isMobileWorkbench && key !== 'swatch'}
                    interactive
                    compact
                    showBlankGuides={isMobileWorkbench && key !== 'swatch'}
                    displayScale={key === 'swatch' ? 1.65 : 1}
                    onReplaceFile={(slotKey, dataUrl) =>
                      key !== 'swatch' && onReplaceFile(garment.id, slotKey, dataUrl)
                    }
                    onUpdateCrop={(slotKey, crop) =>
                      key !== 'swatch' && onUpdateCrop(garment.id, slotKey, crop)
                    }
                    onInspect={(mediaSlot, titleLabel) =>
                      onInspectMedia(mediaSlot, titleLabel, garment.title)
                    }
                    onOpenEditor={(slotKey) =>
                      key !== 'swatch' && onOpenEditor(garment.index, slotKey)
                    }
                  />
                  <p className="mt-2 flex items-baseline justify-between gap-3 border-t border-[#DAD8D2] pt-1.5">
                    <span className="font-mono text-[10px] font-semibold text-[#111111]">
                      Fig. {String.fromCharCode(65 + index)}
                    </span>
                    <span className="truncate text-right text-[10px] text-[#55534E]">{label}</span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="border-y border-[#DAD8D2] bg-white px-3 py-5 text-xs text-[#55534E]">
              No product photography is supplied for this style.
            </p>
          )}

          {photos.length > 1 && (
            <div className="mt-2 flex justify-center gap-2" aria-label="Image carousel pages">
              {photos.map((photo, index) => (
                <button
                  key={photo.key}
                  type="button"
                  aria-label={`Show image ${index + 1}`}
                  aria-current={activePhoto === index ? 'true' : undefined}
                  onClick={() => scrollToPhoto(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    activePhoto === index ? 'w-5 bg-[#111111]' : 'w-1.5 bg-[#B7B4AD]'
                  }`}
                />
              ))}
            </div>
          )}

          <section aria-labelledby="mobile-specs-heading" className="mt-6">
            <h2
              id="mobile-specs-heading"
              className="mb-2 border-b border-[#DAD8D2] pb-2 font-sans text-lg font-extrabold text-[#111111]"
            >
              Product specifications
            </h2>
            <dl className="grid grid-cols-2 gap-2"            >
              {[
                { label: 'Style Code', value: garment.sku },
                { label: 'Fabric Code', value: garment.specs.fabricRollRef },
                { label: 'Fabric Content', value: displayFabricComposition(garment.specs.composition) },
                { label: 'GSM', value: garment.specs.weightGsm.replace(/\s*GSM\b/i, '') },
                { label: 'Width', value: garment.specs.fabricWidth },
                { label: 'Colors', value: String(garment.colorCount) },
              ].map(({ label, value }) => (
                <div key={label} className="min-w-0 border border-[#E6E4DE] bg-white p-3">
                  <dt className="text-[9px] font-semibold uppercase tracking-wide text-[#62605A]">
                    {label}
                  </dt>
                  <dd className="mt-1 break-words text-sm font-bold leading-snug text-[#111111]">
                    {label === 'Fabric Code' ? (
                      <button
                        type="button"
                        onClick={() => onSelectFabricCode(garment.specs.fabricRollRef)}
                        className="text-left underline decoration-[#B8B5AD] underline-offset-2"
                      >
                        {value || 'Not provided'}
                      </button>
                    ) : (
                      value || 'Not provided'
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            {conciseSourceNote(garment.dataFlags) && (
              <p className="mt-2 border-l-2 border-[#A6A39B] pl-3 text-xs leading-relaxed text-[#55534E]">
                {conciseSourceNote(garment.dataFlags)}
              </p>
            )}
          </section>

          <section aria-labelledby="mobile-colorways-heading" className="mt-6">
            <h2
              id="mobile-colorways-heading"
              className="mb-2 border-b border-[#DAD8D2] pb-2 font-sans text-lg font-extrabold text-[#111111]"
            >
              Colorways
            </h2>
            <div className="flex flex-wrap gap-2">
              {garment.colorways.map((colorway) => {
                const colorHex = getColorSwatchHex(colorway);
                const isSelected = activeColorway === colorway;
                return (
                  <button
                    key={colorway}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setActiveColorway(colorway)}
                    className={`inline-flex items-center gap-2 border px-2.5 py-2 text-[11px] font-semibold transition-colors ${
                      isSelected
                        ? 'border-[#111111] bg-[#111111] text-white'
                        : 'border-[#DAD8D2] bg-white text-[#33312C]'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 rounded-full border border-black/15"
                      style={
                        colorHex
                          ? { backgroundColor: colorHex }
                          : {
                              backgroundImage:
                                'repeating-linear-gradient(45deg, #F0F0F0, #F0F0F0 3px, #FFFFFF 3px, #FFFFFF 6px)',
                            }
                      }
                    />
                    {colorway}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      ) : (
        <div className="mx-auto max-w-xl overflow-x-hidden px-3 pb-8 pt-4">
          {renderStaticPage(bookPage)}
        </div>
      )}

      <nav
        aria-label="Mobile style navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[#DAD8D2] bg-white/95 px-3 pt-2.5 backdrop-blur"
        style={{ paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto flex max-w-xl items-center gap-2">
          <button
            type="button"
            onClick={() => moveSpread(-1)}
            className="inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 border border-[#DAD8D2] bg-white px-2 py-3 text-[11px] font-semibold text-[#111111] active:bg-[#F4F3EF]"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            <span>Prev Style</span>
          </button>
          <span className="w-14 shrink-0 text-center font-mono text-[10px] font-semibold tabular-nums text-[#111111]">
            {pageIndicator}
          </span>
          <button
            type="button"
            onClick={() => moveSpread(1)}
            className="inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 border border-[#111111] bg-[#111111] px-2 py-3 text-[11px] font-semibold text-white active:bg-[#333333]"
          >
            <span>Next Style</span>
            <ArrowRight className="h-4 w-4 shrink-0" />
          </button>
        </div>
      </nav>
    </section>
  );
};
