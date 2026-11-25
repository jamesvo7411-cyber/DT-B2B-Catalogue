import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { GarmentItem, MediaSlot, MediaSlotKey } from '../types/catalogue';
import { getColorSwatchHex } from '../data/garments';
import { conciseSourceNote, displayFabricComposition } from '../utils/productDisplay';
import { MediaPlate } from './MediaPlate';

interface ProductShowcasePageProps {
  garment: GarmentItem;
  garments: GarmentItem[];
  onSelectGarment: (index: number) => void;
  onSelectFabricCode: (fabricCode: string) => void;
  onInspectMedia: (slot: MediaSlot, titleLabel: string, garmentTitle: string) => void;
}

export const ProductShowcasePage: React.FC<ProductShowcasePageProps> = ({
  garment,
  garments,
  onSelectGarment,
  onSelectFabricCode,
  onInspectMedia,
}) => {
  const media = (
    slotKey: MediaSlotKey,
    titleLabel: string,
    aspectClass: string,
    imageOverlay?: React.ReactNode,
    displayScale = 1
  ) => (
    <MediaPlate
      slotKey={slotKey}
      slot={garment.media[slotKey]}
      aspectClass={aspectClass}
      titleLabel={titleLabel}
      editMode={false}
      compact
      displayScale={displayScale}
      editable={false}
      showBlankGuides={false}
      imageOverlay={imageOverlay}
      onInspect={(slot, label) => onInspectMedia(slot, label, garment.title)}
    />
  );

  const detailSlots: { key: MediaSlotKey; label: string }[] = [
    { key: 'pocket', label: 'Detail 01' },
    { key: 'seam', label: 'Detail 02' },
    { key: 'swatch', label: 'Fabric Image' },
    { key: 'custom', label: 'Detail 03' },
  ];
  const specs = [
    { label: 'Fabric', value: displayFabricComposition(garment.specs.composition) },
    { label: 'Weight', value: garment.specs.weightGsm },
    { label: 'Width', value: garment.specs.fabricWidth },
    { label: 'Sizes', value: garment.specs.sizeRun },
    { label: 'Stitching', value: garment.specs.stitchDensity },
    { label: 'MOQ', value: garment.specs.moq },
  ].filter(({ value }) => value && !value.toLowerCase().includes('(placeholder)'));
  const sourceNote = conciseSourceNote(garment.dataFlags);

  return (
    <section className="min-h-[calc(100vh-9rem)] bg-[#F4F3EF] px-3 py-5 sm:px-6 sm:py-8 lg:px-10">
      <div className="mx-auto max-w-[1380px]">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectGarment(garment.index === 1 ? garments.length : garment.index - 1)}
              aria-label="Previous product"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#E3E3E9] bg-white text-[#34343A] transition-colors hover:border-[#BFC2FF]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <label className="sr-only" htmlFor="showcase-product-select">Choose product</label>
            <select
              id="showcase-product-select"
              value={garment.index}
              onChange={(event) => onSelectGarment(Number(event.target.value))}
              className="max-w-[min(60vw,360px)] rounded-full border border-[#E3E3E9] bg-white px-3 py-2 text-[11px] text-[#42424A] focus:border-[#AEB3FF] focus:outline-none"
            >
              {garments.map((item) => (
                <option key={item.id} value={item.index}>
                  {String(item.index).padStart(2, '0')} · {item.sku} — {item.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onSelectGarment(garment.index === garments.length ? 1 : garment.index + 1)}
              aria-label="Next product"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#E3E3E9] bg-white text-[#34343A] transition-colors hover:border-[#BFC2FF]"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <span className="font-mono text-[10px] text-[#777783] tabular-nums">
            {String(garment.index).padStart(2, '0')} / {String(garments.length).padStart(2, '0')}
          </span>
        </div>

        <article className="grid overflow-hidden border border-[#E2E0DA] bg-white shadow-[0_18px_54px_rgba(25,24,21,0.08)] md:min-h-[min(76vh,900px)] md:grid-cols-2">
          <div className="flex min-w-0 flex-col border-b border-[#E8E6E0] p-5 sm:p-8 md:border-b-0 md:border-r lg:p-9">
            {media('hero', 'Front on model', 'aspect-[4/5] w-full bg-[#F5F4F0]')}
            <p className="mt-2 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-[#5D5B56]">
              Front · On model
            </p>
            <div className="mt-auto pt-6">
              <div className="mb-2 flex items-center justify-between gap-3 border-t border-[#E8E6E0] pt-3">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-[#55534E]">
                  {garment.gender}, {garment.category}
                </span>
                <span className="font-mono text-xs font-bold text-[#111111]">{garment.sku}</span>
              </div>
              <h1 className="font-sans text-2xl font-extrabold leading-tight tracking-tight text-[#111111] sm:text-3xl">
                {garment.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                <div className="flex items-center gap-1.5" aria-label="Available colors">
                  {garment.colorways.map((color, index) => (
                    <span
                      key={`${color}-${index}`}
                      title={color}
                      aria-label={color}
                      className="h-6 w-6 rounded-full border border-black/15"
                      style={{
                        backgroundColor: getColorSwatchHex(color) ?? '#D8D8DE',
                        backgroundImage: getColorSwatchHex(color)
                          ? undefined
                          : 'repeating-linear-gradient(45deg, #F0F0F0, #F0F0F0 3px, #FFFFFF 3px, #FFFFFF 6px)',
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs text-[#55534E]">{garment.colorways.join(', ')}</span>
              </div>
            </div>
          </div>

          <div className="flex min-w-0 flex-col p-5 sm:p-8 lg:p-9">
            <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-[#E8E6E0] pb-3">
              <h2 className="font-sans text-2xl font-extrabold tracking-tight text-[#111111]">
                Details
              </h2>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-[#55534E]">
                4 panels
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-3">
              {detailSlots.map(({ key, label }) => (
                <div key={key} className="min-w-0">
                  {garment.media[key].url ? (
                    media(
                      key,
                      `${garment.sku} ${label}`,
                      'aspect-[4/3] w-full bg-[#F5F4F0]',
                      undefined,
                      key === 'swatch' ? 1.65 : 1
                    )
                  ) : (
                    <div className="flex aspect-[4/3] w-full flex-col items-center justify-center border border-dashed border-[#D8D6D0] bg-[#F7F6F2] px-2 text-center">
                      <span className="font-mono text-[8px] font-semibold uppercase tracking-wide text-[#55534E]">
                        {key === 'swatch' ? 'Fabric image not supplied' : 'Detail image not supplied'}
                      </span>
                      {key === 'swatch' && (
                        <span className="mt-1 text-[8px] leading-snug text-[#77756F]">
                          Add a {garment.specs.fabricRollRef} image in the Fabric Library.
                        </span>
                      )}
                    </div>
                  )}
                  <p className="mt-1.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-[#33322F]">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <dl className="mt-5 grid grid-cols-2 border-t border-[#E8E6E0]">
              {specs.map(({ label, value }) => (
                <div key={label} className="min-w-0 border-b border-[#EEEEF2] py-2">
                  <dt className="text-[10px] font-semibold text-[#55534E]">{label}</dt>
                  <dd className="mt-0.5 break-words text-[13px] font-bold leading-snug text-[#111111]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="flex items-center justify-between gap-3 border-b border-[#E8E6E0] py-2">
              <span className="text-[10px] font-semibold text-[#55534E]">Fabric code</span>
              <button
                type="button"
                onClick={() => onSelectFabricCode(garment.specs.fabricRollRef)}
                className="font-mono text-[12px] font-bold text-[#111111] underline decoration-[#B8B5AD] underline-offset-2"
              >
                {garment.specs.fabricRollRef}
              </button>
            </div>
            {sourceNote && (
              <p className="mt-3 border-l-2 border-[#A6A39B] pl-3 text-xs leading-relaxed text-[#55534E]">
                {sourceNote}
              </p>
            )}
          </div>
        </article>
      </div>
    </section>
  );
};
