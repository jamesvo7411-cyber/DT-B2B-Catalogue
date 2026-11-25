import React from 'react';
import { getFactoryColorImageKey } from '../data/factoryFabricColors';
import { getColorSwatchHex } from '../data/garments';
import type { FactoryFabricColor } from '../types/catalogue';
import { getBuyerFacingColorNote, getDisplayColorName } from '../utils/fabricDisplay';
import { FabricColorImageTile } from './FabricSwatchBoard';

interface FabricColorwayTileProps {
  color: FactoryFabricColor;
  imageUrl: string;
  interactive: boolean;
  onReplace?: (imageKey: string, dataUrl: string) => void;
  onError?: (message: string) => void;
}

export const FabricColorwayTile: React.FC<FabricColorwayTileProps> = ({
  color,
  imageUrl,
  interactive,
  onReplace,
  onError,
}) => {
  const imageKey = getFactoryColorImageKey(color.fabricCode, color.colorName);
  const colorHex = getColorSwatchHex(color.colorName) ?? '#B8B6B0';
  const sourceNote = getBuyerFacingColorNote(color);

  return (
    <article className="flex min-w-0 flex-col border border-[#E5E3DE] bg-white">
      <FabricColorImageTile
        color={color}
        imageUrl={imageUrl}
        interactive={interactive}
        aspectClass="aspect-[4/3]"
        tightCrop
        onReplace={onReplace ? (dataUrl) => onReplace(imageKey, dataUrl) : undefined}
        onError={onError}
      />
      <div className="flex flex-1 flex-col p-2.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            aria-label={`${getDisplayColorName(color)} color`}
            className="h-3 w-3 shrink-0 rounded-full border border-black/15"
            style={{ backgroundColor: colorHex }}
          />
          <h3 className="min-w-0 break-words text-[11px] font-bold leading-tight text-[#111111]">
            {getDisplayColorName(color)}
          </h3>
        </div>
        <p className="mt-1 break-words font-mono text-[8.5px] font-medium leading-snug text-[#33322F]">
          {color.reference || 'TCX not listed'}
        </p>
        <p className="mt-0.5 break-words font-mono text-[8.5px] leading-snug text-[#68665F]">
          {color.shadeCode || 'Color code not listed'}
        </p>
        {sourceNote && (
          <p className="mt-1.5 line-clamp-2 text-[8px] leading-snug text-[#68665F]">
            {sourceNote}
          </p>
        )}
      </div>
    </article>
  );
};
