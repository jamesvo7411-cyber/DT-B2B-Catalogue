import React from 'react';
import { Sparkles } from 'lucide-react';
import type { GarmentCategory } from '../types/catalogue';
import {
  SECTION_THEME,
  type CatalogueNavigationMap,
  type SectionId,
} from '../utils/catalogueOrder';

interface RunningHeaderProps {
  sectionId: SectionId;
  categoryLabel: string;
  pageLabel: string;
  rightContext?: React.ReactNode;
  overImage?: boolean;
}

export const RunningHeader: React.FC<RunningHeaderProps> = ({
  sectionId,
  categoryLabel,
  pageLabel,
  rightContext,
  overImage = false,
}) => {
  const section = SECTION_THEME[sectionId];

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 pb-2 ${
        overImage
          ? 'border-b border-[#111111]/18 [text-shadow:0_1px_10px_rgba(247,246,242,0.92)]'
          : 'border-b border-[#E8E6E0]'
      }`}
    >
      <div className="flex min-w-0 items-center gap-1.5 font-mono leading-none">
        <span
          aria-hidden="true"
          className="h-2.5 w-[3px] shrink-0"
          style={{ backgroundColor: section.markerColor }}
        />
        <span className="truncate text-[8.5px] font-semibold uppercase tracking-[0.15em] text-[#111111]">
          {section.label}
        </span>
        <span aria-hidden="true" className="text-[8.5px] text-[#9E9B92]">
          /
        </span>
        <span className="truncate text-[8.5px] font-medium uppercase tracking-[0.13em] text-[#55534E]">
          {categoryLabel}
        </span>
        <span aria-hidden="true" className="text-[8.5px] text-[#9E9B92]">
          /
        </span>
        <span className="shrink-0 text-[9.5px] font-bold tracking-[0.06em] text-[#0A0A0A] tabular-nums">
          {pageLabel}
        </span>
      </div>
      {rightContext && (
        <span className="shrink-0 font-mono text-[8.5px] font-medium uppercase tracking-[0.13em] text-[#5F5D57] tabular-nums">
          {rightContext}
        </span>
      )}
    </div>
  );
};

interface SectionWayfinderBarProps {
  activeSection: SectionId;
  activeCategory?: GarmentCategory | null;
  navMap: CatalogueNavigationMap;
  demoMode: boolean;
  onToggleDemoMode: () => void;
  onSelectSpread: (pageIndex: number) => void;
}

const SHORT_CATEGORY_LABEL: Record<GarmentCategory, string> = {
  Trousers: 'Trousers',
  Shorts: 'Shorts',
  Polos: 'Polos',
  'Tees & V-Necks': 'Tees',
  Skirts: 'Skirts',
};

export const SectionWayfinderBar: React.FC<SectionWayfinderBarProps> = ({
  activeSection,
  activeCategory,
  navMap,
  demoMode,
  onToggleDemoMode,
  onSelectSpread,
}) => {
  return (
    <div
      aria-label="Section and category navigation"
      className="mb-3 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-b border-[#E2E0DA] pb-2.5 text-[11px]"
    >
      {/* 5 Understated Color-Coded Sections */}
      <nav aria-label="Catalogue sections" className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {navMap.sections.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelectSpread(section.startSpreadPage)}
              aria-current={isActive ? 'location' : undefined}
              className={`group relative inline-flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap cursor-pointer ${
                isActive ? 'font-semibold text-[#0A0A0A]' : 'text-[#66645F] hover:text-[#0A0A0A]'
              }`}
            >
              <span
                aria-hidden="true"
                className={`h-2.5 w-[2.5px] shrink-0 transition-opacity ${
                  isActive ? 'opacity-100' : 'opacity-45 group-hover:opacity-90'
                }`}
                style={{ backgroundColor: section.markerColor }}
              />
              <span>{section.label}</span>
              <span className="font-mono text-[9px] text-[#8E8B82] tabular-nums">
                {String(section.startSpreadPage + 1).padStart(2, '0')}
              </span>
              {isActive && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-0 -bottom-[11px] left-0 h-[1.5px]"
                  style={{ backgroundColor: section.markerColor }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Category Quick Jump + Pilot Demo Mode Toggle */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <div
          role="navigation"
          aria-label="Garment categories"
          className="hidden sm:flex items-center gap-3 border-r border-[#E2E0DA] pr-4"
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#8E8B82]">
            Categories
          </span>
          {navMap.categoryRanges.map((cat) => {
            const isCatActive = activeCategory === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                title={`${cat.name} (${cat.count} styles · ${cat.label})`}
                onClick={() => onSelectSpread(cat.firstPage)}
                className={`border-b py-0.5 text-[11px] transition-colors whitespace-nowrap cursor-pointer ${
                  isCatActive
                    ? 'border-[#0A0A0A] font-semibold text-[#0A0A0A]'
                    : 'border-transparent text-[#66645F] hover:border-[#BDBAB2] hover:text-[#0A0A0A]'
                }`}
              >
                {SHORT_CATEGORY_LABEL[cat.name]}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onToggleDemoMode}
          aria-pressed={demoMode}
          title="Demo Mode prioritizes image-complete fabric and product pages, then places pages with missing images last"
          className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[10.5px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            demoMode
              ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white'
              : 'border-[#DCDAD3] bg-white text-[#4A4843] hover:border-[#0A0A0A] hover:text-[#0A0A0A]'
          }`}
        >
          <Sparkles className="h-3 w-3" />
          <span>{demoMode ? 'Demo Mode: On' : 'Demo Mode'}</span>
        </button>
      </div>
    </div>
  );
};

interface BookThumbIndexRailProps {
  activeSection: SectionId;
  navMap: CatalogueNavigationMap;
  onSelectSpread: (pageIndex: number) => void;
}

export const BookThumbIndexRail: React.FC<BookThumbIndexRailProps> = ({
  activeSection,
  navMap,
  onSelectSpread,
}) => {
  return (
    <aside
      aria-label="Thumb index navigation"
      className="hidden xl:flex flex-col justify-start gap-1.5 pt-8 select-none"
    >
      {navMap.sections.map((section, idx) => {
        const isActive = activeSection === section.id;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelectSpread(section.startSpreadPage)}
            aria-current={isActive ? 'location' : undefined}
            title={`${section.label} · Starts on P.${String(section.startSpreadPage + 1).padStart(2, '0')}`}
            className={`group relative flex w-[92px] flex-col items-start border-y border-r px-2.5 py-2.5 text-left transition-all cursor-pointer ${
              isActive
                ? '-ml-px z-10 border-[#CFCBC2] bg-white text-[#0A0A0A] shadow-[4px_4px_14px_rgba(0,0,0,0.05)]'
                : 'border-[#E6E4DE] bg-[#FAF9F5]/90 text-[#6B6860] hover:bg-white hover:text-[#0A0A0A]'
            }`}
          >
            <span
              aria-hidden="true"
              className={`absolute inset-y-0 left-0 transition-all ${
                isActive ? 'w-[3.5px]' : 'w-[2px] opacity-60 group-hover:opacity-100'
              }`}
              style={{ backgroundColor: section.markerColor }}
            />
            <span className="pl-1 font-mono text-[8.5px] tracking-[0.12em] text-[#8A877F] tabular-nums">
              0{idx + 1} · P.{String(section.startSpreadPage + 1).padStart(2, '0')}
            </span>
            <span className="mt-0.5 pl-1 text-[10px] font-medium leading-tight">
              {section.shortLabel === 'Tech Info' ? 'Technical' : section.label.replace(' Collection', '')}
            </span>
          </button>
        );
      })}
    </aside>
  );
};
