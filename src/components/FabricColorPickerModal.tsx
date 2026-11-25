import React, { useMemo, useRef } from 'react';
import { Check, ImagePlus, Maximize2, RotateCcw, Upload, X } from 'lucide-react';
import type { FactoryFabricColor, GarmentItem, MediaSlot } from '../types/catalogue';
import { getFactoryColorImageKey, getFactoryFabricColors } from '../data/factoryFabricColors';
import { getColorSwatchHex } from '../data/garments';
import { getDisplayColorName } from '../utils/fabricDisplay';
import { readImageFileAsDataUrl } from '../utils/media';

interface FabricColorPickerModalProps {
  garment: GarmentItem | null;
  fabricColorImages: Record<string, string>;
  onClose: () => void;
  onSelectColor: (garmentId: string, color: FactoryFabricColor, imageUrl: string) => void;
  onResetToDefault: (garmentId: string) => void;
  onUploadCustomSwatch: (garmentId: string, dataUrl: string) => void;
  onInspectSwatch: (slot: MediaSlot, titleLabel: string, garmentTitle: string) => void;
  onError?: (message: string) => void;
}

export const FabricColorPickerModal: React.FC<FabricColorPickerModalProps> = ({
  garment,
  fabricColorImages,
  onClose,
  onSelectColor,
  onResetToDefault,
  onUploadCustomSwatch,
  onInspectSwatch,
  onError,
}) => {
  const customInputRef = useRef<HTMLInputElement | null>(null);

  const fabricColors = useMemo(
    () => (garment ? getFactoryFabricColors(garment.specs.fabricRollRef) : []),
    [garment]
  );

  if (!garment) return null;

  const fabricCode = garment.specs.fabricRollRef;
  const activeUrl = garment.media.swatch.url;
  const styleColorSet = new Set(
    garment.colorways.map((c) => c.trim().toLowerCase())
  );

  const handleCustomFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onError?.('Please choose an image file.');
      return;
    }
    try {
      const dataUrl = await readImageFileAsDataUrl(file, 900);
      onUploadCustomSwatch(garment.id, dataUrl);
      onClose();
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Unable to read image.');
    }
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Select ${fabricCode} fabric color for ${garment.sku}`}
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-3xl flex-col border border-[#E5E5E5] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#E5E5E5] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--metallic-strong)]">
              {garment.sku} · Fabric Roll {fabricCode}
            </p>
            <h3 className="mt-0.5 font-serif text-2xl font-normal tracking-tight text-[#0A0A0A]">
              Switch Fabric Swatch Color
            </h3>
            <p className="mt-1 text-xs text-[#55534E]">
              Choose a shade from <span className="font-mono font-semibold text-[#111111]">{fabricCode}</span> to match{' '}
              <span className="font-medium text-[#111111]">{garment.title}</span>.
              {garment.colorways.length > 0 && (
                <span className="text-[#77756F]">
                  {' '}
                  Style colorways: {garment.colorways.join(', ')}.
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close fabric color selector"
            className="shrink-0 p-1.5 text-[#525252] transition-colors hover:text-[#0A0A0A] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {fabricColors.length > 0 ? (
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4">
              {fabricColors.map((color) => {
                const imageKey = getFactoryColorImageKey(fabricCode, color.colorName);
                const imageUrl = fabricColorImages[imageKey] || color.swatchImageUrl || '';
                const isSelected = Boolean(imageUrl && activeUrl === imageUrl);
                const hex = getColorSwatchHex(color.colorName);
                const displayName = getDisplayColorName(color);
                const inStyleColorways = styleColorSet.has(color.colorName.trim().toLowerCase());

                return (
                  <button
                    key={imageKey}
                    type="button"
                    disabled={!imageUrl}
                    onClick={() => {
                      if (!imageUrl) return;
                      onSelectColor(garment.id, color, imageUrl);
                      onClose();
                    }}
                    className={`group flex flex-col border text-left transition-colors ${
                      isSelected
                        ? 'border-[#0A0A0A] bg-[#FAF9F5] ring-1 ring-[#0A0A0A]'
                        : imageUrl
                          ? 'border-[#E5E3DE] bg-white hover:border-[#0A0A0A] cursor-pointer'
                          : 'border-[#EFECE6] bg-[#FAF9F5] opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F5F4F0]">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={`${displayName} ${fabricCode}`}
                          loading="lazy"
                          className="h-full w-full scale-[1.55] object-cover transition-transform duration-300 group-hover:scale-[1.65]"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 px-2 text-center">
                          <span
                            aria-hidden="true"
                            className="h-5 w-8 border border-black/15"
                            style={{ backgroundColor: hex ?? '#E5E3DE' }}
                          />
                          <span className="font-mono text-[9px] text-[#77756F]">
                            No swatch photo
                          </span>
                        </div>
                      )}
                      {isSelected && (
                        <span className="absolute top-2 right-2 inline-flex h-5 w-5 items-center justify-center bg-[#0A0A0A] text-white">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col justify-between gap-1.5 p-2.5">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            aria-hidden="true"
                            className="h-3 w-3 shrink-0 border border-black/15"
                            style={{ backgroundColor: hex ?? '#E5E3DE' }}
                          />
                          <span className="truncate text-xs font-semibold text-[#111111]">
                            {displayName}
                          </span>
                        </div>
                        <p className="mt-1 font-mono text-[9.5px] text-[#66645F]">
                          {color.shadeCode || color.factoryColorName || 'Chart shade'}
                          {color.reference ? ` · ${color.reference}` : ''}
                        </p>
                      </div>
                      {inStyleColorways && (
                        <span className="font-mono text-[8.5px] uppercase tracking-wider text-[var(--metallic-strong)]">
                          In {garment.sku} palette
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border border-dashed border-[#D8D6D0] bg-[#FAF9F5] px-6 py-10 text-center">
              <ImagePlus className="h-6 w-6 text-[#77756F]" />
              <p className="mt-2 text-sm font-medium text-[#111111]">
                No preset color photos listed for {fabricCode}
              </p>
              <p className="mt-1 max-w-md text-xs text-[#66645F]">
                Upload a custom swatch image below for this style, or add color photos in the Fabrics tab.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E5E5] bg-[#FAFAFA] px-5 py-3.5 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={customInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                void handleCustomFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => customInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 border border-[#DCDAD3] bg-white px-3 py-1.5 text-[11px] font-medium text-[#111111] transition-colors hover:border-[#0A0A0A] cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload Custom Swatch</span>
            </button>
            {garment.media.swatch.url && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onInspectSwatch(
                    garment.media.swatch,
                    `${garment.sku} Fabric Image`,
                    garment.title
                  );
                }}
                className="inline-flex items-center gap-1.5 border border-[#DCDAD3] bg-white px-3 py-1.5 text-[11px] font-medium text-[#404040] transition-colors hover:border-[#0A0A0A] hover:text-[#111111] cursor-pointer"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                <span>Inspect Macro</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onResetToDefault(garment.id);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 border border-[#DCDAD3] bg-white px-3 py-1.5 text-[11px] text-[#55534E] transition-colors hover:border-[#0A0A0A] hover:text-[#111111] cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Use Library Default</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-[#0A0A0A] px-4 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-[#262626] cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
