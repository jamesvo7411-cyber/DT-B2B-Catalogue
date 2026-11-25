import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { GarmentItem, MediaSlot, MediaSlotKey } from '../types/catalogue';
import {
  displayBuyerProductTitle,
  getBuyerVisibleValue,
} from '../utils/productDisplay';
import {
  formatSpreadPageCode,
  getFabricFamilyName,
  type CatalogueNavigationMap,
} from '../utils/catalogueOrder';
import { RunningHeader, SectionWayfinderBar } from './CatalogueNavigation';
import { MediaPlate } from './MediaPlate';
import { ProductSpecStrip } from './ProductSpecStrip';
import { ColorSwatchList } from './ColorSwatchList';
import { SizeRunChips } from './SizeRunChips';

interface ProductShowcasePageProps {
  garment: GarmentItem;
  garments: GarmentItem[];
  navMap?: CatalogueNavigationMap;
  demoMode?: boolean;
  onToggleDemoMode?: () => void;
  onSelectSpread?: (pageIndex: number) => void;
  onSelectGarment: (index: number) => void;
  onSelectFabricCode: (fabricCode: string) => void;
  onInspectMedia: (slot: MediaSlot, titleLabel: string, garmentTitle: string) => void;
}

export const ProductShowcasePage: React.FC<ProductShowcasePageProps> = ({
  garment,
  garments,
  navMap,
  demoMode = false,
  onToggleDemoMode,
  onSelectSpread,
  onSelectGarment,
  onSelectFabricCode,
  onInspectMedia,
}) => {
  const orderedGarments = navMap?.orderedGarments ?? garments;
  const currentPos = Math.max(
    0,
    orderedGarments.findIndex((item) => item.id === garment.id)
  );
  const spreadIdx = navMap?.garmentPageById.get(garment.id);
  const spreadPadded =
    spreadIdx !== undefined
      ? String(spreadIdx + 1).padStart(2, '0')
      : String(garment.index).padStart(2, '0');
  const sectionId = garment.gender === 'Women' ? 'women' : 'men';
  const fabricSpreadIdx = navMap?.fabricPageByCode.get(garment.specs.fabricRollRef);
  const fabricPageLabel =
    fabricSpreadIdx !== undefined ? formatSpreadPageCode(fabricSpreadIdx) : undefined;
  const fabricFamilyName = getFabricFamilyName(garment.specs.fabricRollRef);

  const paddedNumber = String(garment.index).padStart(2, '0');
  const [unavailableSlots, setUnavailableSlots] = useState<Partial<Record<MediaSlotKey, boolean>>>({});
  const buyerMoq = getBuyerVisibleValue(garment.specs.moq);

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

  const detailSlots: { key: MediaSlotKey; label: string }[] = [
    { key: 'pocket', label: 'Detail 01' },
    { key: 'seam', label: 'Detail 02' },
    { key: 'swatch', label: 'Fabric Image' },
    { key: 'custom', label: 'Detail 03' },
  ];
  const visibleDetailSlots = detailSlots.filter(({ key }) => {
    const slot = garment.media[key];
    return Boolean(slot.url || slot.fallbackUrl) && !unavailableSlots[key];
  });
  const hasHeroAsset =
    Boolean(garment.media.hero.url || garment.media.hero.fallbackUrl) &&
    !unavailableSlots.hero;
  const fabricSiblings = orderedGarments.filter(
    (item) =>
      item.id !== garment.id &&
      item.specs.fabricRollRef.toLowerCase() === garment.specs.fabricRollRef.toLowerCase()
  );
  const buyerColorways = garment.colorways.filter(
    (color) =>
      getBuyerVisibleValue(color) && !color.toLowerCase().includes('pending')
  );
  const prevGarment =
    orderedGarments[(currentPos - 1 + orderedGarments.length) % orderedGarments.length] ?? garment;
  const nextGarment =
    orderedGarments[(currentPos + 1) % orderedGarments.length] ?? garment;

  const heroTopLockup = (
    <div className="space-y-2.5">
      <RunningHeader
        sectionId={sectionId}
        categoryLabel={garment.category}
        pageLabel={`P.${spreadPadded}A`}
        rightContext={garment.sku}
        overImage={hasHeroAsset}
      />
      <div className="flex items-start justify-between gap-3 [text-shadow:0_1px_10px_rgba(247,246,242,0.92)]">
        <div className="inline-block">
          <span className="block font-serif text-4xl font-light leading-[0.86] tracking-tight text-[#111111] tabular-nums sm:text-5xl">
            {paddedNumber}
          </span>
          <span className="mt-1.5 inline-block border-t border-[#111111]/25 pt-1 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[#3E3C37]">
            {garment.gender} · {garment.category}
          </span>
        </div>
        <span className="pt-1 font-mono text-[8.5px] font-semibold uppercase tracking-[0.18em] text-[#33322F]">
          {garment.specs.fabricRollRef}
        </span>
      </div>
    </div>
  );

  const heroBottomCard = (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="font-serif text-[26px] font-normal leading-[1.04] tracking-tight text-[#0A0A0A] sm:text-[30px]">
          {displayBuyerProductTitle(garment.title)}
        </h1>
        <span className="shrink-0 font-mono text-[10.5px] font-semibold tracking-[0.14em] text-[#3E3C37] tabular-nums">
          {garment.sku}
        </span>
      </div>
      <div className="mt-2.5">
        <ProductSpecStrip
          item={garment}
          overlay
          showWorkbenchNotes={false}
          showFabricCrossReference={false}
        />
      </div>
    </div>
  );

  return (
    <section className="min-h-[calc(100vh-9rem)] bg-[#F4F3EF] px-3 py-5 sm:px-6 sm:py-6 lg:px-10">
      <div className="mx-auto max-w-[1380px]">
        {navMap && onToggleDemoMode && onSelectSpread && (
          <SectionWayfinderBar
            activeSection={sectionId}
            activeCategory={garment.category}
            navMap={navMap}
            demoMode={demoMode}
            onToggleDemoMode={onToggleDemoMode}
            onSelectSpread={onSelectSpread}
          />
        )}

        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectGarment(prevGarment.index)}
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
              {orderedGarments.map((item) => (
                <option key={item.id} value={item.index}>
                  {String(item.index).padStart(2, '0')} · {item.sku} — {displayBuyerProductTitle(item.title)}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onSelectGarment(nextGarment.index)}
              aria-label="Next product"
              className="inline-flex h-8 w-8 items-center justify-center border border-[#DCDAD3] bg-white text-[#111111] transition-colors hover:border-[#111111] cursor-pointer"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <span className="font-mono text-[10px] text-[#66645F] tabular-nums">
            P.{spreadPadded} · Style {String(currentPos + 1).padStart(2, '0')} / {String(orderedGarments.length).padStart(2, '0')}
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
                    {displayBuyerProductTitle(garment.title)}
                  </p>
                  <p className="mt-1 font-serif text-lg italic text-[#55534E]">
                    {garment.sku} · {garment.specs.fabricRollRef}
                  </p>
                </div>
                <div className="pt-2">{heroBottomCard}</div>
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col justify-between gap-4 p-5 sm:p-8 lg:p-9">
            <RunningHeader
              sectionId={sectionId}
              categoryLabel={`${garment.category} · DETAILS`}
              pageLabel={`P.${spreadPadded}B`}
              rightContext={`STYLE ${garment.sku}`}
            />

            {visibleDetailSlots.length > 0 && (
            <section className="border-b border-[#E8E6E0] pb-4">
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <h2 className="font-serif text-[26px] font-normal leading-none tracking-tight text-[#141412]">
                  Details &amp; Craftsmanship
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                {visibleDetailSlots.map(({ key, label }) => {
                  const slot = garment.media[key];
                  const hasLoadedAsset =
                    Boolean(slot.url || slot.fallbackUrl) && !unavailableSlots[key];
                  return hasLoadedAsset ? (
                    <div key={key} className="min-w-0">
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
                      <p className="mt-1.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-[#33322F]">
                        {label}
                      </p>
                    </div>
                  ) : null;
                })}
              </div>
            </section>
            )}

            <section className="border-b border-[#E8E6E0] pb-4">
              <div className="mb-2.5 flex items-baseline justify-between gap-2">
                <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#55534E]">
                  Colorways
                </h3>
                <span className="font-mono text-[10px] text-[#77756F] tabular-nums">
                  {buyerColorways.length} {buyerColorways.length === 1 ? 'shade' : 'shades'}
                </span>
              </div>
              <ColorSwatchList
                colorways={garment.colorways}
                fabricCode={garment.specs.fabricRollRef}
                editorial
                showPendingColorways={false}
              />
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
                {[
                  ['Stitch Density', garment.specs.stitchDensity],
                  ['Seam Finish', garment.specs.seamFinish],
                  ['Pocket & Trim', garment.specs.pocketConstruction],
                ].map(([label, rawValue]) => {
                  const value = getBuyerVisibleValue(rawValue);
                  return value ? (
                    <div key={label}>
                      <dt className="font-mono text-[9px] uppercase tracking-wider text-[#77756F]">
                        {label}
                      </dt>
                      <dd className="mt-0.5 font-semibold text-[#111111]">{value}</dd>
                    </div>
                  ) : null;
                })}
                <div>
                  <dt className="font-mono text-[9px] uppercase tracking-wider text-[#77756F]">
                    Size Run{buyerMoq ? ' · MOQ' : ''}
                  </dt>
                  <dd className="mt-1.5 flex flex-col gap-1.5">
                    <SizeRunChips sizeRun={garment.specs.sizeRun} size="md" />
                    {buyerMoq && (
                      <span className="font-mono text-[10px] font-medium text-[#55534E] tabular-nums">
                        MOQ {buyerMoq}
                      </span>
                    )}
                  </dd>
                </div>
              </dl>

              <div className="border-t border-[#E8E6E0] pt-3 text-xs text-[#66645F]">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span>
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-[#55534E]">
                      Fabric {garment.specs.fabricRollRef}
                    </span>{' '}
                    · {fabricFamilyName}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectFabricCode(garment.specs.fabricRollRef)}
                    className="font-mono text-[10px] font-semibold text-[#111111] underline decoration-[#B8B5AD] underline-offset-2 hover:decoration-[#111111] cursor-pointer"
                  >
                    See Fabric Library {fabricPageLabel ?? ''} →
                  </button>
                </div>
                {fabricSiblings.length > 0 && (
                  <p className="mt-1.5">
                    <span>Related styles: </span>
                    {fabricSiblings.map((sibling, index) => {
                      const siblingSpread = navMap?.garmentPageById.get(sibling.id);
                      const siblingPageLabel =
                        siblingSpread !== undefined
                          ? `P.${String(siblingSpread + 1).padStart(2, '0')}`
                          : '';
                      return (
                        <React.Fragment key={sibling.id}>
                          {index > 0 && <span className="mx-1.5">·</span>}
                          <button
                            type="button"
                            onClick={() => onSelectGarment(sibling.index)}
                            className="font-mono text-[#292824] underline decoration-[#D4D1CA] underline-offset-2 hover:decoration-[#111111] cursor-pointer"
                          >
                            {sibling.sku}
                            {siblingPageLabel ? ` (${siblingPageLabel})` : ''}
                          </button>
                        </React.Fragment>
                      );
                    })}
                  </p>
                )}
              </div>

            </section>
          </div>
        </article>
      </div>
    </section>
  );
};
