import React from 'react';
import type { GarmentItem } from '../types/catalogue';
import { displayFabricComposition } from '../utils/productDisplay';

interface ProductSpecStripProps {
  item: GarmentItem;
  compact?: boolean;
}

export const ProductSpecStrip: React.FC<ProductSpecStripProps> = ({ item, compact = false }) => {
  const fields = [
    { label: 'Style Code', value: item.sku, mono: true },
    { label: 'Fabric Code', value: item.specs.fabricRollRef, mono: true },
    { label: 'Fabric Content', value: displayFabricComposition(item.specs.composition), mono: false },
    { label: 'GSM', value: item.specs.weightGsm.replace(/\s*GSM\b/i, ''), mono: true },
    { label: 'Width', value: item.specs.fabricWidth, mono: true },
    { label: 'Colors', value: String(item.colorCount), mono: true },
  ];

  return (
    <div
      aria-label="Product specifications"
      className={`grid grid-cols-3 border-y border-[#E8E6E0] ${
        compact ? 'gap-x-2 py-1.5' : 'gap-x-3 py-2.5 sm:grid-cols-6'
      }`}
    >
      {fields.map((field) => (
        <div key={field.label} className="min-w-0 py-1">
          <span
            className={`block text-[#85837F] ${
              compact ? 'text-[7.5px]' : 'text-[9px] tracking-wide'
            }`}
          >
            {field.label}
          </span>
          <span
            className={`mt-0.5 block break-words leading-tight text-[#22211F] ${
              field.mono ? 'font-mono tabular-nums' : 'font-sans'
            } ${compact ? 'text-[8px]' : 'text-[10px]'}`}
          >
            {field.value || '—'}
          </span>
        </div>
      ))}
    </div>
  );
};
