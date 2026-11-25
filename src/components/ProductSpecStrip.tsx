import React from 'react';
import type { GarmentItem } from '../types/catalogue';
import { displayFabricComposition } from '../utils/productDisplay';

interface ProductSpecStripProps {
  item: GarmentItem;
  compact?: boolean;
  overlay?: boolean;
  onSelectFabricCode?: (fabricCode: string) => void;
  disabled?: boolean;
}

export const ProductSpecStrip: React.FC<ProductSpecStripProps> = ({
  item,
  compact = false,
  overlay = false,
  onSelectFabricCode,
  disabled = false,
}) => {
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
  ];

  return (
    <div
      aria-label="Product specifications"
      className={`grid ${
        overlay
          ? 'grid-cols-[minmax(0,1.05fr)_minmax(0,1.05fr)_minmax(0,0.85fr)_minmax(0,0.7fr)] gap-x-3 gap-y-2 border-t border-[#E2E0DA]/90 pt-2'
          : compact
            ? 'grid-cols-3 gap-x-2 gap-y-1 border-y border-[#E8E6E0] py-1.5'
            : 'grid-cols-[minmax(0,1.05fr)_minmax(0,1.05fr)_minmax(0,0.85fr)_minmax(0,0.7fr)] gap-x-4 gap-y-2 border-y border-[#E8E6E0] py-2.5'
      }`}
    >
      {fields.map((field) => (
        <div
          key={field.label}
          className={`min-w-0 ${field.spanClass} ${overlay ? 'py-0.5' : 'py-0.5'}`}
        >
          <span
            className={`block ${
              overlay
                ? 'font-mono text-[8px] uppercase tracking-wider text-[#66645F]'
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
              className={`mt-0.5 block max-w-full text-left leading-snug text-[#111111] underline decoration-[#9E9B93] underline-offset-2 hover:decoration-[#111111] disabled:no-underline cursor-pointer ${
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
              className={`mt-0.5 block leading-snug text-[#111111] ${
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
  );
};
