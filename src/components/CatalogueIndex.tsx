import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bookmark,
  Check,
  ExternalLink,
  Grid2X2,
  List,
  Search,
} from 'lucide-react';
import type {
  AssetStage,
  GarmentCategory,
  GarmentGender,
  GarmentItem,
  MediaSlotKey,
} from '../types/catalogue';
import { CATEGORIES } from '../data/garments';
import { formatSpreadPageCode, type CatalogueNavigationMap } from '../utils/catalogueOrder';

interface CatalogueIndexProps {
  garments: GarmentItem[];
  navMap?: CatalogueNavigationMap;
  activeCategory: GarmentCategory | 'All';
  onCategoryChange: (cat: GarmentCategory | 'All') => void;
  shortlist: string[];
  onToggleShortlist: (id: string) => void;
  onSelectGarment: (index: number) => void;
  onSelectFabricCode: (fabricCode: string) => void;
  onEditGarment: (index: number) => void;
}

const SLOT_KEYS: MediaSlotKey[] = ['hero', 'pocket', 'seam', 'swatch'];

const IndexHeroImage: React.FC<{ item: GarmentItem }> = ({ item }) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [item.media.hero.url]);

  if (item.media.hero.url && !imgError) {
    return (
      <>
        <img
          src={item.media.hero.url}
          alt={`${item.sku} ${item.title}`}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/60 via-black/15 to-transparent px-5 pb-5 pt-16">
          <span className="font-serif text-2xl italic text-white">{item.category}</span>
          <span className="font-mono text-[10px] tracking-wider text-white/85">
            {String(item.index).padStart(2, '0')}
          </span>
        </div>
      </>
    );
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#F5F4F0]">
      <span aria-hidden="true" className="font-serif text-[clamp(9rem,20vw,16rem)] leading-none text-[#E8E6E0]">
        {String(item.index).padStart(2, '0')}
      </span>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-5 pb-5">
        {item.media.hero.note.startsWith('Expected local image file:') && (
          <span className="absolute bottom-14 left-5 right-5 truncate text-left font-mono text-[9px] text-[#77736D]">
            {item.media.hero.note}
          </span>
        )}
        <span className="font-serif text-2xl italic text-[#363636]">{item.category}</span>
        <span className="font-mono text-[10px] tracking-wider text-[#77736D]">
          {item.specs.fabricRollRef}
        </span>
      </div>
    </div>
  );
};

export const CatalogueIndex: React.FC<CatalogueIndexProps> = ({
  garments,
  navMap,
  activeCategory,
  onCategoryChange,
  shortlist,
  onToggleShortlist,
  onSelectGarment,
  onSelectFabricCode,
  onEditGarment,
}) => {
  const orderedGarments = navMap?.orderedGarments ?? garments;
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<'All' | GarmentGender>('All');
  const [fabricFilter, setFabricFilter] = useState<string>('All');
  const [stageFilter, setStageFilter] = useState<'all' | AssetStage>('all');
  const [shortlistOnly, setShortlistOnly] = useState(false);
  const [displayMode, setDisplayMode] = useState<'grid' | 'table'>('grid');

  const fabricCodes = useMemo(() => {
    const set = new Set<string>();
    orderedGarments.forEach((g) => set.add(g.specs.fabricRollRef));
    return Array.from(set);
  }, [orderedGarments]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orderedGarments.filter((g) => {
      if (activeCategory !== 'All' && g.category !== activeCategory) return false;
      if (genderFilter !== 'All' && g.gender !== genderFilter) return false;
      if (fabricFilter !== 'All' && g.specs.fabricRollRef !== fabricFilter) return false;
      if (shortlistOnly && !shortlist.includes(g.id)) return false;
      if (stageFilter !== 'all') {
        const stages = SLOT_KEYS.map((k) => g.media[k].stage);
        if (stageFilter === 'blank' && !stages.every((s) => s === 'blank')) return false;
        if (stageFilter === 'ai-concept' && !stages.includes('ai-concept')) return false;
        if (stageFilter === 'studio-final' && !stages.includes('studio-final')) return false;
      }
      if (!q) return true;
      return (
        g.sku.toLowerCase().includes(q) ||
        g.title.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        g.productGroupVi.toLowerCase().includes(q) ||
        g.specs.composition.toLowerCase().includes(q) ||
        g.specs.fabricRollRef.toLowerCase().includes(q) ||
        g.colorways.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [orderedGarments, activeCategory, genderFilter, fabricFilter, search, stageFilter, shortlistOnly, shortlist]);

  const menCount = orderedGarments.filter((g) => g.gender === 'Men').length;
  const womenCount = orderedGarments.filter((g) => g.gender === 'Women').length;

  return (
    <section aria-label="Collection index" className="mx-auto max-w-[1360px] px-6 py-10 lg:px-10 lg:py-14">
      <div className="relative overflow-hidden border-b border-[#EAE8E3] pb-9 md:pb-12">
        <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#77736D]">
              <span aria-hidden="true" className="h-px w-6 bg-[var(--metallic)]" />
              Dream Tomorrow · Long Xuyen, An Giang
            </p>
            <h1 className="mt-5 font-serif text-5xl font-normal leading-[0.95] tracking-tight text-[#171715] sm:text-6xl lg:text-7xl">
              The collection<span className="text-[var(--metallic-strong)]">.</span>
            </h1>
            <p className="mt-4 max-w-[54ch] text-sm leading-6 text-[#66645F] sm:text-base">
              Browse by category or line, then open a piece to see the full story.
            </p>
          </div>
          <div className="relative flex items-center gap-5 text-xs text-[#66645F]">
            <div>
              <span className="block font-serif text-3xl text-[#171715]">{garments.length}</span>
              <span>styles</span>
            </div>
            <span aria-hidden="true" className="h-9 w-px bg-[#E3E1DC]" />
            <div>
              <span className="block font-serif text-3xl text-[#171715]">{menCount} / {womenCount}</span>
              <span>men / women</span>
            </div>
            <span aria-hidden="true" className="h-9 w-px bg-[#E3E1DC]" />
            <div>
              <span className="block font-serif text-3xl text-[#171715]">{shortlist.length}</span>
              <span>saved</span>
            </div>
          </div>
        </div>
        <p className="mt-4 text-[11px] text-[#8A877F]">
          * Product name not yet matched to the team&apos;s official name.
        </p>
      </div>

      <div className="flex flex-col gap-5 border-b border-[#EAE8E3] py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onCategoryChange('All')}
              className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeCategory === 'All'
                  ? 'border-[#171715] bg-[#171715] text-white'
                  : 'border-[#E5E2DC] text-[#66645F] hover:border-[#AAA69D] hover:text-[#171715]'
              }`}
            >
              Everything <span className="ml-1 opacity-65">{garments.length}</span>
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => onCategoryChange(cat.name)}
                className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeCategory === cat.name
                    ? 'border-[#171715] bg-[#171715] text-white'
                    : 'border-[#E5E2DC] text-[#66645F] hover:border-[#AAA69D] hover:text-[#171715]'
                }`}
              >
                {cat.name} <span className="ml-1 opacity-65">{cat.count}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center rounded-full border border-[#E5E2DC] bg-white p-1">
            {(
              [
                { id: 'All', label: 'All lines' },
                { id: 'Men', label: 'Men' },
                { id: 'Women', label: 'Women' },
              ] as const
            ).map((gOpt) => (
              <button
                key={gOpt.id}
                type="button"
                onClick={() => setGenderFilter(gOpt.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  genderFilter === gOpt.id
                    ? 'bg-[#F1F0EC] text-[#171715]'
                    : 'text-[#77736D] hover:text-[#171715]'
                }`}
              >
                {gOpt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <label className="relative block">
              <span className="sr-only">Search styles</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#8A877F]" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Find a style or colour"
                className="w-64 rounded-full border border-[#E5E2DC] bg-white py-2.5 pr-4 pl-10 text-sm text-[#171715] placeholder:text-[#A09D95] focus:border-[#77736D] focus:outline-none"
              />
            </label>
            <button
              type="button"
              onClick={() => setShortlistOnly((v) => !v)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                shortlistOnly
                  ? 'border-[#171715] bg-[#171715] text-white'
                  : 'border-[#E5E2DC] bg-white text-[#66645F] hover:border-[#AAA69D] hover:text-[#171715]'
              }`}
            >
              <Bookmark className="h-3 w-3" />
              <span>Saved styles · {shortlist.length}</span>
            </button>

            <details className="relative">
              <summary className="cursor-pointer list-none rounded-full border border-[#E5E2DC] px-4 py-2.5 text-xs font-medium text-[#66645F] transition-colors hover:border-[#AAA69D] hover:text-[#171715]">
                More filters
              </summary>
              <div className="absolute left-0 top-full z-20 mt-2 grid min-w-64 gap-3 rounded-2xl border border-[#E5E2DC] bg-white p-4 shadow-lg">
                <label className="grid gap-1.5 text-xs text-[#66645F]">
                  Fabric
                  <select
                    aria-label="Filter by swatchbook fabric code"
                    value={fabricFilter}
                    onChange={(e) => setFabricFilter(e.target.value)}
                    className="rounded-lg border border-[#E5E2DC] bg-white px-3 py-2 font-mono text-xs text-[#404040] focus:border-[#77736D] focus:outline-none cursor-pointer"
                  >
                    <option value="All">All fabrics</option>
                    {fabricCodes.map((code) => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1.5 text-xs text-[#66645F]">
                  Image status
                  <select
                    aria-label="Filter by asset stage"
                    value={stageFilter}
                    onChange={(e) => setStageFilter(e.target.value as 'all' | AssetStage)}
                    className="rounded-lg border border-[#E5E2DC] bg-white px-3 py-2 text-xs text-[#404040] focus:border-[#77736D] focus:outline-none cursor-pointer"
                  >
                    <option value="all">All image statuses</option>
                    <option value="blank">No images yet</option>
                    <option value="ai-concept">Concept images</option>
                    <option value="studio-final">Studio images</option>
                  </select>
                </label>
              </div>
            </details>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#8A877F]">
              Showing {filtered.length} of {garments.length}
            </span>
            <div className="flex items-center rounded-full border border-[#E5E2DC] bg-white p-1">
              <button
                type="button"
                onClick={() => setDisplayMode('grid')}
                aria-label="Gallery view"
                aria-pressed={displayMode === 'grid'}
                className={`rounded-full p-2 transition-colors cursor-pointer ${
                  displayMode === 'grid'
                    ? 'bg-[#F1F0EC] text-[#171715]'
                    : 'text-[#77736D] hover:text-[#171715]'
                }`}
              >
                <Grid2X2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode('table')}
                aria-label="Detailed list view"
                aria-pressed={displayMode === 'table'}
                className={`rounded-full p-2 transition-colors cursor-pointer ${
                  displayMode === 'table'
                    ? 'bg-[#F1F0EC] text-[#171715]'
                    : 'text-[#77736D] hover:text-[#171715]'
                }`}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Empty Filter State */}
      {filtered.length === 0 ? (
        <div className="my-16 rounded-2xl bg-[#F7F6F3] py-16 text-center">
          <p className="font-serif text-3xl text-[#171715]">Nothing here just yet.</p>
          <p className="mt-2 text-sm text-[#77736D]">
            Try a different search or clear a filter to see more styles.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setGenderFilter('All');
              setFabricFilter('All');
              setStageFilter('all');
              setShortlistOnly(false);
              onCategoryChange('All');
            }}
            className="mt-5 rounded-full border border-[#D8D5CE] px-5 py-2.5 text-xs font-medium text-[#171715] transition-colors hover:border-[#171715] cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      ) : displayMode === 'grid' ? (
        <div className="mt-8 grid grid-cols-1 gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const isShortlisted = shortlist.includes(item.id);
            const spreadIdx = navMap?.garmentPageById.get(item.id);
            const spreadLabel =
              spreadIdx !== undefined
                ? formatSpreadPageCode(spreadIdx)
                : `P.${String(item.index).padStart(2, '0')}`;
            const fabricSpreadIdx = navMap?.fabricPageByCode.get(item.specs.fabricRollRef);
            const fabricLabel =
              fabricSpreadIdx !== undefined ? ` · ${formatSpreadPageCode(fabricSpreadIdx)}` : '';

            return (
              <article key={item.id} className="group flex flex-col">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2px] bg-[#F5F4F0] transition-shadow duration-300 group-hover:shadow-[0_12px_30px_rgba(35,32,25,0.10)]">
                  <button
                    type="button"
                    onClick={() => onSelectGarment(item.index)}
                    aria-label={`View ${item.title}`}
                    className="absolute inset-0 block h-full w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#77736D]"
                  >
                    <IndexHeroImage item={item} />
                  </button>
                  <span className="pointer-events-none absolute left-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1.5 font-mono text-[10px] tracking-wider text-[#55524C]">
                    {item.sku}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onToggleShortlist(item.id);
                    }}
                    aria-label={isShortlisted ? 'Remove from saved styles' : 'Save this style'}
                    aria-pressed={isShortlisted}
                    className={`absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 transition-colors cursor-pointer ${
                      isShortlisted ? 'text-[#171715]' : 'text-[#77736D] hover:text-[#171715]'
                    }`}
                  >
                    {isShortlisted ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.15em] text-[#8A877F]">
                  <span>{item.gender}</span>
                  <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[var(--metallic)]" />
                  <span>{item.category}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectGarment(item.index)}
                  className="mt-1 text-left font-serif text-2xl leading-tight tracking-tight text-[#171715] transition-colors hover:text-[var(--metallic-strong)] cursor-pointer"
                >
                  {item.title}
                </button>

                <p className="mt-2 text-xs text-[#77736D] line-clamp-1">
                  {item.specs.composition} <span aria-hidden="true">·</span> {item.specs.weightGsm}
                </p>
                <button
                  type="button"
                  onClick={() => onSelectFabricCode(item.specs.fabricRollRef)}
                  className="mt-2 w-fit font-mono text-[10px] text-[#55534E] underline decoration-[#B8B5AD] underline-offset-2"
                >
                  Fabric {item.specs.fabricRollRef}
                  {fabricLabel}
                </button>

                <div className="mt-4 flex items-center justify-between border-t border-[#EAE8E3] pt-3 text-[11px] text-[#8A877F]">
                  <span className="inline-flex items-center gap-2 tabular-nums">
                    <span className="font-mono font-medium text-[#55534E]">{spreadLabel}</span>
                    {item.dataFlags && item.dataFlags.length > 0 && (
                      <span title={item.dataFlags[0]} className="text-[var(--metallic-strong)]">
                        <AlertTriangle className="h-3 w-3" />
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => onEditGarment(item.index)}
                    className="font-medium text-[#66645F] underline-offset-4 hover:text-[#171715] hover:underline cursor-pointer"
                  >
                    Edit details
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* B2B SWISS LINE SHEET TABLE VIEW */
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#0A0A0A] text-[11px] font-medium text-[#525252]">
                <th className="py-3 pr-4 font-mono">#</th>
                <th className="py-3 pr-4 font-mono">Style Code</th>
                <th className="py-3 pr-4">Line</th>
                <th className="py-3 pr-4">Garment Title</th>
                <th className="py-3 pr-4">Swatchbook Code</th>
                <th className="py-3 pr-4">Fabric Content</th>
                <th className="py-3 pr-4 font-mono">GSM / Width</th>
                <th className="py-3 pr-4 font-mono">Colors</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFEFEF] text-xs">
              {filtered.map((item) => {
                const isShortlisted = shortlist.includes(item.id);
                return (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-[#FAFAFA]"
                  >
                    <td className="py-3.5 pr-4 font-mono text-[#737373] tabular-nums whitespace-nowrap">
                      {String(item.index).padStart(2, '0')}
                    </td>
                    <td className="py-3.5 pr-4 font-mono font-medium text-[#0A0A0A] tabular-nums whitespace-nowrap">
                      {item.sku}
                    </td>
                    <td className="py-3.5 pr-4 text-[#525252] whitespace-nowrap">
                      {item.gender} ({item.genderCode})
                    </td>
                    <td className="py-3.5 pr-4">
                      <button
                        type="button"
                        onClick={() => onSelectGarment(item.index)}
                        className="font-sans text-xs font-semibold text-[#0A0A0A] hover:underline underline-offset-4 text-left cursor-pointer"
                      >
                        {item.title}
                      </button>
                    </td>
                    <td className="py-3.5 pr-4 font-mono text-[11px] whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onSelectFabricCode(item.specs.fabricRollRef)}
                        className="text-[#0A0A0A] underline decoration-[#B8B5AD] underline-offset-2"
                      >
                        {item.specs.fabricRollRef}
                      </button>
                    </td>
                    <td className="py-3.5 pr-4 text-[#404040]">
                      {item.specs.composition}
                    </td>
                    <td className="py-3.5 pr-4 font-mono text-[#0A0A0A] tabular-nums whitespace-nowrap">
                      {item.specs.weightGsm} · {item.specs.fabricWidth}
                    </td>
                    <td className="py-3.5 pr-4 font-mono text-[#525252] tabular-nums whitespace-nowrap">
                      {item.colorCount}
                    </td>
                    <td className="py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => onToggleShortlist(item.id)}
                          className={`text-[11px] font-medium cursor-pointer ${
                            isShortlisted ? 'text-[#0A0A0A]' : 'text-[#737373] hover:text-[#0A0A0A]'
                          }`}
                        >
                          {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                        </button>
                        <a
                          href={item.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`External product link for ${item.sku}`}
                          className="text-[#737373] hover:text-[#0A0A0A]"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => onSelectGarment(item.index)}
                          className="font-medium text-[#0A0A0A] underline-offset-4 hover:underline cursor-pointer"
                        >
                          Spread
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
