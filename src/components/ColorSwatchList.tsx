import React from 'react';
import { getColorSwatchHex } from '../data/garments';
import { getFactoryFabricColors } from '../data/factoryFabricColors';

interface ColorSwatchListProps {
  colorways: string[];
  fabricCode?: string;
  compact?: boolean;
  editorial?: boolean;
}

function splitColorCode(raw: string): { name: string; code: string | null; isPending: boolean } {
  const isPending = raw.toLowerCase().includes('pending');
  const match = raw.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (match) {
    const leadingValue = match[1].trim();
    const parentheticalValue = match[2].trim();
    if (/^[A-Z]{1,2}\d{2,4}$/i.test(leadingValue) && !/^(TCX|Chart)\b/i.test(parentheticalValue)) {
      return { name: parentheticalValue, code: leadingValue, isPending };
    }
    return { name: match[1].trim(), code: match[2].trim(), isPending };
  }
  return { name: raw.trim(), code: null, isPending };
}

export const ColorSwatchList: React.FC<ColorSwatchListProps> = ({
  colorways,
  fabricCode,
  compact = false,
  editorial = false,
}) => {
  const factoryColors = fabricCode ? getFactoryFabricColors(fabricCode) : [];

  return (
    <div
      className={`grid gap-2 ${
        editorial
          ? 'grid-cols-2 sm:grid-cols-4'
          : compact
            ? 'grid-cols-2 sm:grid-cols-3'
            : 'grid-cols-2 sm:grid-cols-4'
      }`}
    >
      {colorways.map((color, idx) => {
        const hex = getColorSwatchHex(color);
        const { name, code, isPending } = splitColorCode(color);
        const matchedFactory = factoryColors.find(
          (fc) =>
            fc.colorName.toLowerCase() === name.toLowerCase() ||
            color.toLowerCase().includes(fc.colorName.toLowerCase())
        );
        const subline = [
          code || matchedFactory?.reference || null,
          matchedFactory?.shadeCode &&
          matchedFactory.shadeCode.toLowerCase() !== name.toLowerCase() &&
          matchedFactory.shadeCode !== code
            ? matchedFactory.shadeCode
            : null,
        ]
          .filter(Boolean)
          .join(' · ');

        return (
          <div
            key={`${color}-${idx}`}
            className={`flex min-w-0 items-center gap-2.5 ${
              editorial
                ? 'border-0 bg-transparent px-0 py-0'
                : `border px-2.5 py-1.5 ${
                    isPending
                      ? 'border-dashed border-[#B0B0B0] bg-[#FAFAFA]'
                      : 'border-[#E8E8E8] bg-white'
                  }`
            }`}
          >
            <span
              aria-hidden="true"
              className={`shrink-0 border border-black/15 ${editorial ? 'h-4 w-5' : 'h-5 w-7'}`}
              style={
                hex
                  ? { backgroundColor: hex }
                  : {
                      backgroundImage:
                        'repeating-linear-gradient(45deg, #F0F0F0, #F0F0F0 3px, #FFFFFF 3px, #FFFFFF 6px)',
                    }
              }
            />
            <div className="min-w-0 leading-tight">
              <p
                className={`truncate font-medium text-[#0A0A0A] ${
                  editorial ? 'text-[10px]' : 'text-[11px]'
                }`}
                title={color}
              >
                {name}
              </p>
              {subline && (
                <p
                  className={`truncate font-mono text-[#737373] ${
                    editorial ? 'text-[8.5px]' : 'text-[9.5px]'
                  }`}
                >
                  {subline}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

