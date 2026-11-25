import React from 'react';
import type { GarmentItem } from '../types/catalogue';
import {
  displayFabricComposition,
  getBuyerVisibleValue,
  hasIncompleteFabricComposition,
} from '../utils/productDisplay';
import { getFabricFamilyName } from '../utils/catalogueOrder';

interface ProductSpecStripProps {
  item: GarmentItem;
  compact?: boolean;
  overlay?: boolean;
  fabricPageLabel?: string;
  onSelectFabricCode?: (fabricCode: string) => void;
  disabled?: boolean;
  showWorkbenchNotes?: boolean;
  showFabricCrossReference?: boolean;
}

export const ProductSpecStrip: React.FC<ProductSpecStripProps> = ({
  item,
  compact = false,
  overlay = false,
  fabricPageLabel,
  onSelectFabricCode,
  disabled = false,
  showWorkbenchNotes = false,
  showFabricCrossReference = true,
}) => {
  const familyName = getFabricFamilyName(item.specs.fabricRollRef);
  const compositionIsIncomplete = hasIncompleteFabricComposition(item.dataFlags);
  const fields = [
    { label: 'Style Code', value: item.sku, mono: true, spanClass: '' },
    { label: 'Fabric Code', value: item.specs.fabricRollRef, mono: true, spanClass: '' },
    {
      label: 'GSM',
      value: item.specs.weightGsm.replace(/\s*GSM\b/i, ''),
      mono: true,
      spanClass: '',
    },
    { label: 'Colors', value: String(item.colorCount), mono: true, spanClass: '' },
    {
      label: 'Fabric Content',
      value: displayFabricComposition(item.specs.composition),
      mono: false,
      spanClass: compact ? 'col-span-2' : 'col-span-3',
    },
    { label: 'Width', value: item.specs.fabricWidth, mono: true, spanClass: '' },
  ].filter(
    (field) =>
      showWorkbenchNotes ||
      (getBuyerVisibleValue(field.value) &&
        !(field.label === 'Fabric Content' && compositionIsIncomplete))
  );
  const visibleFamilyName = showWorkbenchNotes
    ? familyName
    : getBuyerVisibleValue(familyName);
  const visibleFabricPageLabel =
    showWorkbenchNotes || getBuyerVisibleValue(item.specs.fabricRollRef)
      ? fabricPageLabel
      : undefined;

  return (
    <div aria-label="Product specifications">
      <div
        className={`grid ${
          overlay
            ? 'grid-cols-[minmax(0,1.05fr)_minmax(0,1.05fr)_minmax(0,0.85fr)_minmax(0,0.7fr)] gap-x-3 gap-y-1.5 border-t border-[#111111]/18 pt-2'
            : compact
              ? 'grid-cols-3 gap-x-2 gap-y-1 border-y border-[#E8E6E0] py-1.5'
              : 'grid-cols-[minmax(0,1.05fr)_minmax(0,1.05fr)_minmax(0,0.85fr)_minmax(0,0.7fr)] gap-x-4 gap-y-2 border-y border-[#E8E6E0] py-2.5'
        }`}
      >
        {fields.map((field) => (
          <div
            key={field.label}
            className={`min-w-0 ${field.spanClass} py-0.5`}
          >
            <span
              className={`block ${
                overlay
                  ? 'font-mono text-[7.5px] font-medium uppercase tracking-[0.12em] text-[#4E4C47]'
                  : compact
                    ? 'text-[7.5px] text-[#85837F]'
                    : 'text-[9px] font-semibold tracking-wide text-[#555555]'
              }`}
            >
              {field.label}
            </span>
            {field.label === 'Fabric Code' && onSelectFabricCode ? (
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelectFabricCode(item.specs.fabricRollRef)}
                className={`mt-0.5 block max-w-full text-left leading-snug text-[#0A0A0A] underline decoration-[#6E6C65] underline-offset-2 hover:decoration-[#0A0A0A] disabled:no-underline cursor-pointer ${
                  field.mono ? 'font-mono tabular-nums' : 'font-sans'
                } ${
                  overlay
                    ? 'text-[10.5px] font-semibold'
                    : compact
                      ? 'text-[8px]'
                      : 'text-[12px] font-bold'
                }`}
              >
                {field.value || '—'}
              </button>
            ) : (
              <span
                className={`mt-0.5 block leading-snug text-[#0A0A0A] ${
                  field.mono ? 'font-mono tabular-nums' : 'font-sans'
                } ${
                  overlay
                    ? 'text-[10.5px] font-semibold'
                    : compact
                      ? 'text-[8px]'
                      : 'text-[12px] font-bold'
                }`}
              >
                {field.value || '—'}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Fabric Family & Cross-Reference Path */}
      {showFabricCrossReference && (visibleFamilyName || visibleFabricPageLabel) && (
        <div
          className={`mt-1.5 flex flex-wrap items-center justify-between gap-2 border-t pt-1.5 font-mono text-[8.5px] ${
            overlay
              ? 'border-[#111111]/14 text-[#4E4C47]'
              : 'border-[#E8E6E0] text-[#66645F]'
          }`}
        >
          {visibleFamilyName && <span className="truncate">
            <span className="uppercase tracking-[0.1em] text-[#77756F]">Fabric Family: </span>
            <span className="font-medium text-[#111111]">{visibleFamilyName}</span>
          </span>}
          {visibleFabricPageLabel && (
            onSelectFabricCode ? (
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelectFabricCode(item.specs.fabricRollRef)}
                className="shrink-0 font-semibold text-[#0A0A0A] underline decoration-[#6E6C65] underline-offset-2 hover:decoration-[#0A0A0A] disabled:no-underline cursor-pointer tabular-nums"
              >
                See Fabric Library {visibleFabricPageLabel} →
              </button>
            ) : (
              <span className="shrink-0 font-semibold text-[#0A0A0A] tabular-nums">
                Fabric Library {visibleFabricPageLabel}
              </span>
            )
          )}
        </div>
      )}
    </div>
  );
};

