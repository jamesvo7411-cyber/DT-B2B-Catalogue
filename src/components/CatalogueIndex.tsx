import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
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

interface CatalogueIndexProps {
  garments: GarmentItem[];
  activeCategory: GarmentCategory | 'All';
  onCategoryChange: (cat: GarmentCategory | 'All') => void;
  shortlist: string[];
  onToggleShortlist: (id: string) => void;
  onSelectGarment: (index: number) => void;
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
      <img
        src={item.media.hero.url}
        alt={`${item.sku} ${item.title}`}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
      />
    );
  }

  return (
    <div className="plate-blueprint-bg flex h-full w-full flex-col items-center justify-center px-6 text-center">
      <span className="font-mono text-xs tracking-widest text-[var(--metallic-strong)] tabular-nums">
        {item.sku}
      </span>
      <span className="mt-3 h-px w-8 metallic-rule" />
      <span className="mt-3 font-sans text-sm font-medium text-[#262626]">
        {item.specs.fabricRollRef}
      </span>
      <span className="mt-1 font-mono text-[11px] text-[#8A8A8A]">
        {item.specs.weightGsm} · {item.colorCount} Colors
      </span>
    </div>
  );
};

export const CatalogueIndex: React.FC<CatalogueIndexProps> = ({
  garments,
  activeCategory,
  onCategoryChange,
  shortlist,
  onToggleShortlist,
  onSelectGarment,
  onEditGarment,
}) => {
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<'All' | GarmentGender>('All');
  const [fabricFilter, setFabricFilter] = useState<string>('All');
  const [stageFilter, setStageFilter] = useState<'all' | AssetStage>('all');
  const [shortlistOnly, setShortlistOnly] = useState(false);
  const [displayMode, setDisplayMode] = useState<'grid' | 'table'>('grid');

  const fabricCodes = useMemo(() => {
    const set = new Set<string>();
    garments.forEach((g) => set.add(g.specs.fabricRollRef));
    return Array.from(set);
  }, [garments]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return garments.filter((g) => {
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
  }, [garments, activeCategory, genderFilter, fabricFilter, search, stageFilter, shortlistOnly, shortlist]);

  const totalPlates = garments.length * 4;
  const placedPlates = garments.reduce(
    (sum, g) => sum + SLOT_KEYS.filter((k) => Boolean(g.media[k].url)).length,
    0
  );

  const menCount = garments.filter((g) => g.gender === 'Men').length;
  const womenCount = garments.filter((g) => g.gender === 'Women').length;

  return (
    <section aria-label="43-Style Collection Index" className="mx-auto max-w-[1360px] px-6 py-10 lg:px-10 lg:py-14">
      {/* Section Header */}
      <div className="flex flex-col justify-between gap-6 border-b border-[#E5E5E5] pb-8 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-xs tracking-wider text-[var(--metallic-strong)]">
            Complete Portfolio Index · DOT Line Sheet
          </p>
          <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-[#0A0A0A] sm:text-4xl">
            {garments.length} Apparel Architecture
          </h1>
          <p className="mt-2 max-w-[64ch] text-sm text-[#525252]">
            Filter by gender line, garment category, or swatchbook fabric roll. Select any style to inspect its facing two-page catalogue spread.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-[#525252]">
          <div>
            <span className="block text-[11px] text-[#737373]">Total Styles</span>
            <span className="font-mono text-sm text-[#0A0A0A] tabular-nums">
              {garments.length} ({menCount} Men · {womenCount} Women)
            </span>
          </div>
          <span aria-hidden="true" className="h-7 w-px bg-[#E5E5E5]" />
          <div>
            <span className="block text-[11px] text-[#737373]">Visual Plates Placed</span>
            <span className="font-mono text-sm text-[#0A0A0A] tabular-nums">
              {placedPlates} / {totalPlates}
            </span>
          </div>
          <span aria-hidden="true" className="h-7 w-px bg-[#E5E5E5]" />
          <div>
            <span className="block text-[11px] text-[#737373]">Sample Shortlist</span>
            <span className="font-mono text-sm text-[#0A0A0A] tabular-nums">
              {shortlist.length} Selected
            </span>
          </div>
        </div>
      </div>

      {/* Category, Gender & Swatchbook Filter Control Bar */}
      <div className="flex flex-col gap-4 border-b border-[#F0F0F0] py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Category Segmented Filter */}
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => onCategoryChange('All')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeCategory === 'All'
                  ? 'bg-[#0A0A0A] text-white'
                  : 'text-[#525252] hover:bg-[#F5F5F5] hover:text-[#0A0A0A]'
              }`}
            >
              All ({garments.length})
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => onCategoryChange(cat.name)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeCategory === cat.name
                    ? 'bg-[#0A0A0A] text-white'
                    : 'text-[#525252] hover:bg-[#F5F5F5] hover:text-[#0A0A0A]'
                }`}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>

          {/* Gender Division Toggle */}
          <div className="flex items-center border border-[#E5E5E5] bg-white">
            {(
              [
                { id: 'All', label: 'All Lines' },
                { id: 'Men', label: "Men's (Nam)" },
                { id: 'Women', label: "Women's (Nữ)" },
              ] as const
            ).map((gOpt) => (
              <button
                key={gOpt.id}
                type="button"
                onClick={() => setGenderFilter(gOpt.id)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  genderFilter === gOpt.id
                    ? 'bg-[#0A0A0A] text-white'
                    : 'text-[#525252] hover:text-[#0A0A0A]'
                }`}
              >
                {gOpt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Second Sub-Row: Search, Fabric Code, Stage, Shortlist, Grid/Table Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#737373]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search style code, fabric, color..."
                className="w-60 border border-[#E5E5E5] bg-white py-1.5 pr-3 pl-8 text-xs text-[#0A0A0A] placeholder:text-[#A3A3A3] focus:border-[#0A0A0A] focus:outline-none"
              />
            </div>

            <select
              aria-label="Filter by swatchbook fabric code"
              value={fabricFilter}
              onChange={(e) => setFabricFilter(e.target.value)}
              className="border border-[#E5E5E5] bg-white px-2.5 py-1.5 font-mono text-xs text-[#404040] focus:border-[#0A0A0A] focus:outline-none cursor-pointer"
            >
              <option value="All">All Swatchbook Fabrics</option>
              {fabricCodes.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by asset stage"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value as 'all' | AssetStage)}
              className="border border-[#E5E5E5] bg-white px-2.5 py-1.5 text-xs text-[#404040] focus:border-[#0A0A0A] focus:outline-none cursor-pointer"
            >
              <option value="all">All Asset Stages</option>
              <option value="blank">Blank Slots</option>
              <option value="ai-concept">AI Concept</option>
              <option value="studio-final">Studio Final</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShortlistOnly((v) => !v)}
              className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                shortlistOnly
                  ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white'
                  : 'border-[#E5E5E5] bg-white text-[#525252] hover:border-[#0A0A0A] hover:text-[#0A0A0A]'
              }`}
            >
              <Bookmark className="h-3 w-3" />
              <span>Shortlist ({shortlist.length})</span>
            </button>

            <div className="flex items-center border border-[#E5E5E5] bg-white">
              <button
                type="button"
                onClick={() => setDisplayMode('grid')}
                aria-label="Gallery grid view"
                className={`p-1.5 transition-colors cursor-pointer ${
                  displayMode === 'grid'
                    ? 'bg-[#0A0A0A] text-white'
                    : 'text-[#525252] hover:text-[#0A0A0A]'
                }`}
              >
                <Grid2X2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode('table')}
                aria-label="Line sheet table view"
                className={`p-1.5 transition-colors cursor-pointer ${
                  displayMode === 'table'
                    ? 'bg-[#0A0A0A] text-white'
                    : 'text-[#525252] hover:text-[#0A0A0A]'
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
        <div className="my-16 border border-[#E5E5E5] py-16 text-center">
          <p className="font-sans text-lg font-semibold text-[#0A0A0A]">No matching garments in view</p>
          <p className="mt-2 text-xs text-[#737373]">
            Adjust your category, gender, swatchbook fabric, or search query to display items from the {garments.length}-style archive.
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
            className="mt-5 border border-[#0A0A0A] px-4 py-2 text-xs font-medium text-[#0A0A0A] transition-colors hover:bg-[#0A0A0A] hover:text-white cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : displayMode === 'grid' ? (
        /* ARCHITECTURAL CONTACT SHEET GALLERY GRID */
        <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const isShortlisted = shortlist.includes(item.id);
            const filledCount = SLOT_KEYS.filter((k) => Boolean(item.media[k].url)).length;

            return (
              <article key={item.id} className="group flex flex-col">
                {/* Primary Silhouette Frame */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectGarment(item.index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectGarment(item.index);
                    }
                  }}
                  className="relative aspect-[3/4] w-full overflow-hidden border border-[#E5E5E5] transition-colors duration-200 group-hover:border-[#0A0A0A] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]"
                >
                  {/* Subtle metallic corner ticks */}
                  <span aria-hidden="true" className="pointer-events-none absolute top-2.5 left-2.5 h-2 w-2 border-t border-l metallic-frame-tick z-10" />
                  <span aria-hidden="true" className="pointer-events-none absolute top-2.5 right-2.5 h-2 w-2 border-t border-r metallic-frame-tick z-10" />
                  <span aria-hidden="true" className="pointer-events-none absolute bottom-2.5 left-2.5 h-2 w-2 border-b border-l metallic-frame-tick z-10" />
                  <span aria-hidden="true" className="pointer-events-none absolute bottom-2.5 right-2.5 h-2 w-2 border-b border-r metallic-frame-tick z-10" />

                  <IndexHeroImage item={item} />

                  {/* Quick Hover Bar */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 via-black/30 to-transparent px-4 py-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <span className="text-xs font-medium text-white">Open Catalogue Spread</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>

                {/* Unboxed Card Metadata — Zero Pill Clutter */}
                <div className="mt-4 flex items-baseline justify-between gap-3">
                  <div className="flex items-center gap-2 text-[11px] text-[#737373] min-w-0">
                    <span className="font-mono font-medium text-[#0A0A0A] tabular-nums shrink-0">
                      {item.sku}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="shrink-0">{item.gender}</span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate font-mono">{item.specs.fabricRollRef}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleShortlist(item.id)}
                    aria-label={isShortlisted ? 'Remove from sample shortlist' : 'Add to sample shortlist'}
                    className={`p-1 transition-colors shrink-0 cursor-pointer ${
                      isShortlisted ? 'text-[#0A0A0A]' : 'text-[#A3A3A3] hover:text-[#0A0A0A]'
                    }`}
                  >
                    {isShortlisted ? <Check className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectGarment(item.index)}
                  className="mt-1 text-left font-sans text-base font-semibold leading-snug tracking-tight text-[#0A0A0A] transition-colors hover:text-[var(--metallic-strong)] cursor-pointer"
                >
                  {item.title}
                </button>

                <p className="mt-1.5 text-xs text-[#666666] line-clamp-1">
                  {item.specs.composition} · {item.specs.weightGsm}
                </p>

                {/* Minimal 4-Plate Readiness & Edit Footer */}
                <div className="mt-3 flex items-center justify-between border-t border-[#F0F0F0] pt-2.5 text-[11px] text-[#737373]">
                  <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                    <span>
                      pp. {String(item.index * 2 - 1).padStart(2, '0')}–{String(item.index * 2).padStart(2, '0')} · {filledCount}/4 Plates
                    </span>
                    {item.dataFlags && item.dataFlags.length > 0 && (
                      <span title={item.dataFlags[0]} className="text-[var(--metallic-strong)]">
                        <AlertTriangle className="h-3 w-3" />
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => onEditGarment(item.index)}
                    className="font-medium text-[#525252] underline-offset-4 hover:text-[#0A0A0A] hover:underline cursor-pointer"
                  >
                    Edit Spread
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
                    <td className="py-3.5 pr-4 font-mono text-[11px] text-[#0A0A0A] whitespace-nowrap">
                      {item.specs.fabricRollRef}
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
