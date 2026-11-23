import React from 'react';
import { getColorSwatchHex } from '../data/garments';

interface ColorSwatchListProps {
  colorways: string[];
  compact?: boolean;
}

function splitColorCode(raw: string): { name: string; code: string | null; isPending: boolean } {
  const isPending = raw.toLowerCase().includes('pending');
  const match = raw.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (match) {
    return { name: match[1].trim(), code: match[2].trim(), isPending };
  }
  return { name: raw.trim(), code: null, isPending };
}

export const ColorSwatchList: React.FC<ColorSwatchListProps> = ({
  colorways,
  compact = false,
}) => {
  return (
    <div
      className={`grid gap-2 ${
        compact ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'
      }`}
    >
      {colorways.map((color, idx) => {
        const hex = getColorSwatchHex(color);
        const { name, code, isPending } = splitColorCode(color);
        return (
          <div
            key={`${color}-${idx}`}
            className={`flex items-center gap-2.5 border px-2.5 py-1.5 ${
              isPending
                ? 'border-dashed border-[#B0B0B0] bg-[#FAFAFA]'
                : 'border-[#E8E8E8] bg-white'
            }`}
          >
            {/* Readable architectural rectangular swatch chip */}
            <span
              aria-hidden="true"
              className="h-5 w-7 shrink-0 border border-black/15"
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
              <p className="truncate text-[11px] font-medium text-[#0A0A0A]" title={color}>
                {name}
              </p>
              {code && (
                <p className="truncate font-mono text-[10px] text-[#737373]">{code}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
