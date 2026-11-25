import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import type { GarmentItem, ImageCrop, MediaSlotKey } from '../types/catalogue';
import { getColorSwatchHex } from '../data/garments';
import { getFactoryFabricColors } from '../data/factoryFabricColors';
import {
  formatSpreadPageCode,
  getFabricFamilyName,
  SECTION_THEME,
  type CatalogueNavigationMap,
  type SectionId,
} from '../utils/catalogueOrder';
import {
  conciseSourceNote,
  displayBuyerProductTitle,
  displayFabricComposition,
  displayMoq,
  getBuyerVisibleValue,
} from '../utils/productDisplay';
import { RunningHeader } from './CatalogueNavigation';
import { MediaPlate } from './MediaPlate';
import { SizeRunChips } from './SizeRunChips';

interface MobileCatalogueViewProps {
  garments: GarmentItem[];
  navMap?: CatalogueNavigationMap;
  activeSection?: SectionId;
  demoMode?: boolean;
  onToggleDemoMode?: () => void;
  bookPage: number;
  totalSpreads: number;
  productOffset: number;
  isWorkbench: boolean;
  editMode: boolean;
  customFramingCount?: number;
  getSpreadLabel: (page: number) => string;
  renderStaticPage: (page: number) => React.ReactNode;
  onChangeBookPage: (page: number) => void;
  onToggleEditMode: () => void;
  onReplaceFile: (garmentId: string, slotKey: MediaSlotKey, dataUrl: string) => void;
  onUpdateCrop: (garmentId: string, slotKey: MediaSlotKey, crop: ImageCrop) => void;
  onInspectMedia: (slot: GarmentItem['media'][MediaSlotKey], titleLabel: string, garmentTitle: string) => void;
  onOpenEditor: (garmentIndex: number, focusSlot?: MediaSlotKey) => void;
  onSelectFabricCode: (fabricCode: string) => void;
  onOpenFabricColorPicker?: (garment: GarmentItem) => void;
  onOpenCropPresetModal?: () => void;
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
  navMap,
  activeSection = 'introduction',
  demoMode = false,
  onToggleDemoMode,
  bookPage,
  totalSpreads,
  productOffset,
  isWorkbench,
  editMode,
  customFramingCount = 0,
  getSpreadLabel,
  renderStaticPage,
  onChangeBookPage,
  onToggleEditMode,
  onReplaceFile,
  onUpdateCrop,
  onInspectMedia,
  onOpenEditor,
  onSelectFabricCode,
  onOpenFabricColorPicker,
  onOpenCropPresetModal,
}) => {
  const garment =
    bookPage >= productOffset && bookPage < productOffset + garments.length
      ? garments[bookPage - productOffset]
      : null;
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [activeColorway, setActiveColorway] = useState(garment?.colorways[0] ?? '');
  const isMobileWorkbench = isWorkbench;
  const buyerMoq = garment ? getBuyerVisibleValue(garment.specs.moq) : undefined;
  const mobileSpecFields = garment
    ? [
        { label: 'Style Code', value: garment.sku },
        { label: 'Fabric Code', value: garment.specs.fabricRollRef },
        {
          label: 'Fabric Content',
          value: displayFabricComposition(garment.specs.composition),
        },
        { label: 'GSM', value: garment.specs.weightGsm.replace(/\s*GSM\b/i, '') },
        { label: 'Width', value: garment.specs.fabricWidth },
        { label: 'Colors', value: String(garment.colorCount) },
      ]
    : [];
  const compositionIsIncomplete =
    garment?.dataFlags?.some(
      (flag) =>
        /fabric content|composition/i.test(flag) &&
        /truncat|incomplete|partial/i.test(flag)
    ) ?? false;
  const visibleMobileSpecFields = isMobileWorkbench
    ? mobileSpecFields
    : mobileSpecFields.filter(
        ({ label, value }) =>
          getBuyerVisibleValue(value) &&
          !(label === 'Fabric Content' && compositionIsIncomplete)
      );
  const spreadPadded = String(bookPage + 1).padStart(2, '0');
  const fabricSpreadIdx = garment ? navMap?.fabricPageByCode.get(garment.specs.fabricRollRef) : undefined;
  const fabricPageLabel =
    fabricSpreadIdx !== undefined ? formatSpreadPageCode(fabricSpreadIdx) : undefined;
  const factoryColorLookup = useMemo(() => {
    const map = new Map<string, { reference: string; shadeCode: string }>();
    if (!garment) return map;
    getFactoryFabricColors(garment.specs.fabricRollRef).forEach((entry) => {
      const refInfo = {
        reference: entry.reference.trim(),
        shadeCode: entry.shadeCode.trim(),
      };
      map.set(entry.colorName.trim().toLowerCase(), refInfo);
      if (entry.factoryColorName.trim()) {
        map.set(entry.factoryColorName.trim().toLowerCase(), refInfo);
      }
    });
    return map;
  }, [garment]);

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
      <header className="sticky top-0 z-40 border-b border-[#E8E6E0] bg-white/95 px-3 py-2 backdrop-blur">
        <div className="mx-auto max-w-xl">
          <div className="flex min-w-0 items-center gap-1.5">
            <label className="sr-only" htmlFor="mobile-spread-select">Choose catalogue style</label>
            <select
              id="mobile-spread-select"
              value={bookPage}
              onChange={(event) => setSpread(Number(event.target.value))}
              className="min-w-0 flex-1 appearance-none border border-[#DAD8D2] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#111111] focus:border-[#111111] focus:outline-none"
            >
              {Array.from({ length: totalSpreads }, (_, index) => (
                <option key={index} value={index}>{getSpreadLabel(index)}</option>
              ))}
            </select>
            {onToggleDemoMode && (
              <button
                type="button"
                onClick={onToggleDemoMode}
                aria-pressed={demoMode}
                className={`inline-flex shrink-0 items-center gap-1 border px-2 py-1.5 text-[10px] font-medium ${
                  demoMode
                    ? 'border-[#111111] bg-[#111111] text-white'
                    : 'border-[#DAD8D2] bg-white text-[#4A4843]'
                }`}
              >
                <Sparkles className="h-3 w-3" />
                <span>Demo</span>
              </button>
            )}
            <span className="shrink-0 font-mono text-[10px] font-semibold tabular-nums text-[#111111]">
              {pageIndicator}
            </span>
          </div>
          <nav aria-label="Mobile section shortcuts" className="mt-1.5 grid grid-cols-5 gap-1">
            {(navMap
              ? navMap.sections
              : [
                  { ...SECTION_THEME.introduction, id: 'introduction' as SectionId, startSpreadPage: 0, endSpreadPage: 1 },
                  { ...SECTION_THEME.fabrics, id: 'fabrics' as SectionId, startSpreadPage: 2, endSpreadPage: Math.max(2, productOffset - 1) },
                  { ...SECTION_THEME.men, id: 'men' as SectionId, startSpreadPage: productOffset, endSpreadPage: totalSpreads - 2 },
                  { ...SECTION_THEME.women, id: 'women' as SectionId, startSpreadPage: productOffset, endSpreadPage: totalSpreads - 2 },
                  { ...SECTION_THEME.technical, id: 'technical' as SectionId, startSpreadPage: totalSpreads - 1, endSpreadPage: totalSpreads - 1 },
                ]
            ).map((sec) => {
              const isSelected = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setSpread(sec.startSpreadPage)}
                  aria-current={isSelected ? 'page' : undefined}
                  style={{ borderTopColor: sec.markerColor, borderTopWidth: '2px' }}
                  className={`border-x border-b px-1 py-1 text-[9.5px] font-semibold transition-colors truncate ${
                    isSelected
                      ? 'border-[#111111] bg-[#111111] text-white'
                      : 'border-[#E8E6E0] bg-white text-[#55534E]'
                  }`}
                >
                  {sec.shortLabel}
                </button>
              );
            })}
          </nav>
          {isMobileWorkbench && (
            <div className="mt-1.5 flex items-center justify-between gap-2 border-t border-[#EFEDE8] pt-1.5">
              <span className="font-mono text-[9px] font-semibold uppercase tracking-wide text-[#55534E]">
                Workbench · image tools
              </span>
              <div className="flex items-center gap-3">
                {onOpenCropPresetModal && (
                  <button
                    type="button"
                    onClick={onOpenCropPresetModal}
                    className="text-[10px] font-semibold text-[#111111] underline underline-offset-2"
                  >
                    {customFramingCount > 0 ? `Crops I/O (${customFramingCount})` : 'Crops I/O'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={onToggleEditMode}
                  aria-pressed={editMode}
                  className="text-[10px] font-semibold text-[#111111] underline underline-offset-2"
                >
                  Replace: {editMode ? 'On' : 'Off'}
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {garment ? (
        <div className="mx-auto max-w-xl px-4 pb-8 pt-4">
          <div className="mb-4 space-y-2.5">
            <RunningHeader
              sectionId={garment.gender === 'Women' ? 'women' : 'men'}
              categoryLabel={garment.category}
              pageLabel={`P.${spreadPadded}`}
              rightContext={garment.sku}
            />
            <div className="flex items-start justify-between gap-3">
              <h1 className="font-sans text-2xl font-extrabold leading-tight tracking-tight text-[#111111]">
                {displayBuyerProductTitle(garment.title)}
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
                    allowReframe={isMobileWorkbench}
                    interactive
                    compact
                    showBlankGuides={isMobileWorkbench}
                    displayScale={key === 'swatch' ? 1.65 : 1}
                    customActionLabel={key === 'swatch' && isMobileWorkbench ? 'Switch color' : undefined}
                    onCustomClick={
                      key === 'swatch' && isMobileWorkbench && onOpenFabricColorPicker
                        ? () => onOpenFabricColorPicker(garment)
                        : undefined
                    }
                    onReplaceFile={(slotKey, dataUrl) =>
                      key !== 'swatch' && onReplaceFile(garment.id, slotKey, dataUrl)
                    }
                    onUpdateCrop={(slotKey, crop) =>
                      isMobileWorkbench && onUpdateCrop(garment.id, slotKey, crop)
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
          ) : isMobileWorkbench ? (
            <p className="border-y border-[#DAD8D2] bg-white px-3 py-5 text-xs text-[#55534E]">
              No product photography is supplied for this style.
            </p>
          ) : null}

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
              {visibleMobileSpecFields.map(({ label, value }) => (
                <div key={label} className="min-w-0 border border-[#E6E4DE] bg-white p-3">
                  <dt className="text-[9px] font-semibold uppercase tracking-wide text-[#62605A]">
                    {label}
                  </dt>
                  <dd className="mt-1 break-words text-sm font-bold leading-snug text-[#111111]">
                    {label === 'Fabric Code' ? (
                      <div className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => onSelectFabricCode(garment.specs.fabricRollRef)}
                          className="text-left underline decoration-[#B8B5AD] underline-offset-2"
                        >
                          {value || (isMobileWorkbench ? 'Not provided' : '')}
                        </button>
                        <p className="font-sans text-[10px] font-normal text-[#66645F]">
                          {getFabricFamilyName(garment.specs.fabricRollRef)}
                        </p>
                        {fabricPageLabel && (
                          <button
                            type="button"
                            onClick={() => onSelectFabricCode(garment.specs.fabricRollRef)}
                            className="block font-mono text-[9.5px] font-semibold text-[#33322F] underline decoration-[#C8C5BE] underline-offset-2"
                          >
                            See Fabric Library {fabricPageLabel} →
                          </button>
                        )}
                      </div>
                    ) : (
                      value || (isMobileWorkbench ? 'Not provided' : '')
                    )}
                  </dd>
                </div>
              ))}
              <div className="col-span-2 min-w-0 border border-[#E6E4DE] bg-white p-3">
                <dt className="text-[9px] font-semibold uppercase tracking-wide text-[#62605A]">
                  Size Run{isMobileWorkbench || buyerMoq ? ' · MOQ' : ''}
                </dt>
                <dd className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
                  <SizeRunChips sizeRun={garment.specs.sizeRun} size="md" />
                  {(isMobileWorkbench || buyerMoq) && (
                    <span className="font-mono text-[10px] font-semibold text-[#55534E] tabular-nums">
                      {isMobileWorkbench ? displayMoq(garment.specs.moq) : buyerMoq}
                    </span>
                  )}
                </dd>
              </div>
            </dl>
            <div className="mt-3 border border-[#E6E4DE] bg-white p-3.5">
              <p className="font-serif text-base italic leading-snug text-[#1F1E1B]">
                {garment.summary}
              </p>
              <ul className="mt-2.5 space-y-1.5 text-xs leading-relaxed text-[#404040]">
                {garment.descriptionBullets.slice(0, 3).map((bullet, idx) => (
                  <li key={idx} className="flex items-baseline gap-2">
                    <span className="font-mono text-[9px] text-[var(--metallic-strong)] tabular-nums">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
            {isMobileWorkbench && conciseSourceNote(garment.dataFlags) && (
              <p className="mt-2 border-t border-[#DAD8D2] pt-2 text-xs leading-relaxed text-[#55534E]">
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
              {garment.colorways
                .filter(
                  (colorway) =>
                    isMobileWorkbench ||
                    (getBuyerVisibleValue(colorway) &&
                      !colorway.toLowerCase().includes('pending'))
                )
                .map((colorway) => {
                const colorHex = getColorSwatchHex(colorway);
                const isSelected = activeColorway === colorway;
                const refData = factoryColorLookup.get(colorway.trim().toLowerCase());
                const refLine =
                  getBuyerVisibleValue(refData?.reference) ||
                  getBuyerVisibleValue(refData?.shadeCode);
                return (
                  <button
                    key={colorway}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setActiveColorway(colorway)}
                    className={`inline-flex items-center gap-2 border px-2.5 py-2 text-left text-[11px] font-semibold transition-colors ${
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
                    <span className="leading-tight">
                      <span className="block">{colorway}</span>
                      {refLine && (
                        <span
                          className={`block font-mono text-[8.5px] font-normal ${
                            isSelected ? 'text-white/75' : 'text-[#77756F]'
                          }`}
                        >
                          {refLine}
                        </span>
                      )}
                    </span>
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
