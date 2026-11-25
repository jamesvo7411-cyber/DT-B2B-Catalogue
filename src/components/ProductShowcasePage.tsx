import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { GarmentItem, MediaSlot, MediaSlotKey } from '../types/catalogue';
import { conciseSourceNote } from '../utils/productDisplay';
import { MediaPlate } from './MediaPlate';
import { ProductSpecStrip } from './ProductSpecStrip';
import { ColorSwatchList } from './ColorSwatchList';

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
  const paddedNumber = String(garment.index).padStart(2, '0');
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

  const detailSlots: { key: MediaSlotKey; label: string; hint: string }[] = [
    { key: 'pocket', label: 'Detail 01', hint: 'Pocket & trim closeup' },
    { key: 'seam', label: 'Detail 02', hint: 'Collar & seam closeup' },
    { key: 'custom', label: 'Detail 03', hint: 'Fit & construction detail' },
    { key: 'swatch', label: 'Fabric Image', hint: `Swatch ${garment.specs.fabricRollRef}` },
  ];
  const hasHeroAsset =
    Boolean(garment.media.hero.url || garment.media.hero.fallbackUrl) &&
    !unavailableSlots.hero;
  const fabricSiblings = garments.filter(
    (item) =>
      item.id !== garment.id &&
      item.specs.fabricRollRef.toLowerCase() === garment.specs.fabricRollRef.toLowerCase()
  );
  const sourceNote = conciseSourceNote(garment.dataFlags);

  const heroTopLockup = (
    <div className="flex items-start justify-between gap-3">
      <div className="inline-block border border-[#DCDAD3]/85 bg-white/82 px-3 py-2 backdrop-blur-sm">
        <span className="block font-serif text-4xl font-normal leading-none tracking-tight text-[#111111] tabular-nums sm:text-5xl">
          {paddedNumber}
        </span>
        <span className="mt-1 block font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[#55534E]">
          {garment.gender} · {garment.category}
        </span>
      </div>
      <div className="inline-flex items-center border border-[#DCDAD3]/85 bg-white/82 px-2.5 py-1.5 backdrop-blur-sm font-mono text-[8.5px] font-semibold tracking-[0.14em] text-[#33322F]">
        DREAM TOMORROW
      </div>
    </div>
  );

  const heroBottomCard = (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="font-serif text-2xl font-normal leading-[1.08] tracking-tight text-[#0A0A0A] sm:text-[28px]">
          {garment.title}
        </h1>
        <span className="shrink-0 font-mono text-[10.5px] font-semibold tracking-[0.12em] text-[#55534E] tabular-nums">
          {garment.sku}
        </span>
      </div>
      <div className="mt-2.5">
        <ProductSpecStrip
          item={garment}
          overlay
          onSelectFabricCode={onSelectFabricCode}
        />
      </div>
    </div>
  );

  return (
    <section className="min-h-[calc(100vh-9rem)] bg-[#F4F3EF] px-3 py-5 sm:px-6 sm:py-8 lg:px-10">
      <div className="mx-auto max-w-[1380px]">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectGarment(garment.index === 1 ? garments.length : garment.index - 1)}
              aria-label="Previous product"
              className="inline-flex h-8 w-8 items-center justify-center border border-[#DCDAD3] bg-white text-[#111111] transition-colors hover:border-[#111111] cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <label className="sr-only" htmlFor="showcase-product-select">Choose product</label>
            <select
              id="showcase-product-select"
              value={garment.index}
              onChange={(event) => onSelectGarment(Number(event.target.value))}
              className="max-w-[min(60vw,360px)] border border-[#DCDAD3] bg-white px-3 py-1.5 font-mono text-[11px] text-[#111111] focus:border-[#111111] focus:outline-none cursor-pointer"
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
              className="inline-flex h-8 w-8 items-center justify-center border border-[#DCDAD3] bg-white text-[#111111] transition-colors hover:border-[#111111] cursor-pointer"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <span className="font-mono text-[10px] text-[#66645F] tabular-nums">
            {paddedNumber} / {String(garments.length).padStart(2, '0')}
          </span>
        </div>

        <article className="grid overflow-hidden border border-[#E2E0DA] bg-white shadow-[0_18px_54px_rgba(25,24,21,0.08)] md:min-h-[min(78vh,860px)] md:grid-cols-2">
          <div className="relative flex min-h-[540px] min-w-0 flex-col border-b border-[#E8E6E0] bg-[#FAF9F5] md:min-h-full md:border-b-0 md:border-r">
            {hasHeroAsset ? (
              <MediaPlate
                slotKey="hero"
                slot={garment.media.hero}
                aspectClass="h-full w-full flex-1 bg-[#F5F4F0]"
                titleLabel="Primary image"
                editMode={false}
                compact
                fullHeight
                editable={false}
                showBlankGuides={false}
                topOverlay={heroTopLockup}
                imageOverlay={heroBottomCard}
                overlayMode="card"
                onImageUnavailable={markSlotUnavailable}
                onInspect={(slot, label) => onInspectMedia(slot, label, garment.title)}
              />
            ) : (
              <div className="flex h-full w-full flex-1 flex-col justify-between bg-[#FAF9F5] p-5 sm:p-6">
                {heroTopLockup}
                <div className="my-auto py-8 text-center">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#77756F]">
                    Studio Hero Photography Pending
                  </p>
                  <p className="mt-1 font-serif text-lg italic text-[#55534E]">
                    {garment.sku} · {garment.specs.fabricRollRef}
                  </p>
                </div>
                <div className="border border-[#DCDAD3] bg-white/95 px-4 py-3">{heroBottomCard}</div>
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col justify-between gap-4 p-5 sm:p-8 lg:p-9">
            <section className="border-b border-[#E8E6E0] pb-4">
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <h2 className="font-serif text-[26px] font-normal leading-none tracking-tight text-[#141412]">
                  Details &amp; Craftsmanship
                </h2>
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[#66645F]">
                  4 plates
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                {detailSlots.map(({ key, label, hint }) => {
                  const slot = garment.media[key];
                  const hasLoadedAsset =
                    Boolean(slot.url || slot.fallbackUrl) && !unavailableSlots[key];
                  return (
                    <div key={key} className="min-w-0">
                      {hasLoadedAsset ? (
                        <MediaPlate
                          slotKey={key}
                          slot={slot}
                          aspectClass="aspect-[16/10] w-full bg-[#F5F4F0]"
                          titleLabel={`${garment.sku} ${label}`}
                          editMode={false}
                          compact
                          displayScale={key === 'swatch' ? 1.65 : 1}
                          editable={false}
                          showBlankGuides={false}
                          onImageUnavailable={markSlotUnavailable}
                          onInspect={(s, lbl) => onInspectMedia(s, lbl, garment.title)}
                        />
                      ) : (
                        <div className="flex aspect-[16/10] w-full flex-col items-center justify-center border border-dashed border-[#D8D6D0] bg-[#FAF9F5] px-3 text-center">
                          <span aria-hidden="true" className="relative mb-1.5 block h-4 w-4">
                            <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[#C8C5BE]" />
                            <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[#C8C5BE]" />
                          </span>
                          <span className="font-mono text-[8.5px] font-semibold uppercase tracking-[0.12em] text-[#55534E]">
                            {label}
                          </span>
                          <span className="mt-0.5 text-[8.5px] leading-snug text-[#77756F]">
                            {hint}
                          </span>
                        </div>
                      )}
                      <p className="mt-1.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-[#33322F]">
                        {label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="border-b border-[#E8E6E0] pb-4">
              <div className="mb-2.5 flex items-baseline justify-between gap-2">
                <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#55534E]">
                  Colorways
                </h3>
                <span className="font-mono text-[10px] text-[#77756F] tabular-nums">
                  {garment.colorways.length} {garment.colorways.length === 1 ? 'shade' : 'shades'}
                </span>
              </div>
              <ColorSwatchList colorways={garment.colorways} editorial />
            </section>

            <section className="flex flex-1 flex-col justify-between gap-4">
              <div>
                <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#55534E]">
                  Silhouette &amp; Production Notes
                </h3>
                <p className="mt-2 font-serif text-lg italic leading-snug text-[#1F1E1B]">
                  {garment.summary}
                </p>
                <ul className="mt-3 space-y-2 text-xs leading-relaxed text-[#404040]">
                  {garment.descriptionBullets.slice(0, 3).map((bullet, idx) => (
                    <li key={idx} className="flex items-baseline gap-2.5">
                      <span className="font-mono text-[9px] text-[var(--metallic-strong)] tabular-nums">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <dl className="grid grid-cols-2 gap-x-5 gap-y-3 border-t border-[#E8E6E0] pt-4 text-xs">
                <div>
                  <dt className="font-mono text-[9px] uppercase tracking-wider text-[#77756F]">
                    Stitch Density
                  </dt>
                  <dd className="mt-0.5 font-semibold text-[#111111]">
                    {garment.specs.stitchDensity}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[9px] uppercase tracking-wider text-[#77756F]">
                    Seam Finish
                  </dt>
                  <dd className="mt-0.5 font-semibold text-[#111111]">
                    {garment.specs.seamFinish}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[9px] uppercase tracking-wider text-[#77756F]">
                    Pocket &amp; Trim
                  </dt>
                  <dd className="mt-0.5 font-semibold text-[#111111]">
                    {garment.specs.pocketConstruction}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[9px] uppercase tracking-wider text-[#77756F]">
                    Size Run · MOQ
                  </dt>
                  <dd className="mt-0.5 font-mono text-[11px] font-semibold text-[#111111] tabular-nums">
                    {garment.specs.sizeRun} · {garment.specs.moq}
                  </dd>
                </div>
              </dl>

              {fabricSiblings.length > 0 && (
                <div className="border-t border-[#E8E6E0] pt-3 text-xs text-[#66645F]">
                  <span>
                    Shared fabric{' '}
                    <button
                      type="button"
                      onClick={() => onSelectFabricCode(garment.specs.fabricRollRef)}
                      className="font-mono font-semibold text-[#111111] underline decoration-[#B8B5AD] underline-offset-2 hover:decoration-[#111111] cursor-pointer"
                    >
                      {garment.specs.fabricRollRef}
                    </button>
                    :{' '}
                  </span>
                  {fabricSiblings.map((sibling, index) => (
                    <React.Fragment key={sibling.id}>
                      {index > 0 && <span className="mx-1.5">·</span>}
                      <button
                        type="button"
                        onClick={() => onSelectGarment(sibling.index)}
                        className="font-mono text-[#292824] underline decoration-[#D4D1CA] underline-offset-2 hover:decoration-[#111111] cursor-pointer"
                      >
                        {sibling.sku}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              )}

              {sourceNote && (
                <p className="border-t border-[#E8E6E0] pt-2.5 text-xs leading-relaxed text-[#55534E]">
                  {sourceNote}
                </p>
              )}
            </section>
          </div>
        </article>
      </div>
    </section>
  );
};
