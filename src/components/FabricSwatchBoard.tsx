import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, ArrowUpRight, Upload } from 'lucide-react';
import type { FabricSwatchProgram, GarmentItem } from '../types/catalogue';
import { buildFabricSwatchPrograms } from '../data/garments';
import { readImageFileAsDataUrl } from '../utils/media';
import { ColorSwatchList } from './ColorSwatchList';

interface FabricSwatchBoardProps {
  garments: GarmentItem[];
  onReplaceFabricSwatch: (fabricCode: string, dataUrl: string) => void;
  onSelectStyleIndex: (index: number) => void;
  sliceRange?: [number, number];
  embeddedInFlipbook?: boolean;
  compactLeaf?: boolean;
  isPreviewLayer?: boolean;
}

const FabricSwatchTile: React.FC<{
  program: FabricSwatchProgram;
  onDropImage: (dataUrl: string) => void;
  isPreviewLayer?: boolean;
}> = ({ program, onDropImage, isPreviewLayer = false }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [program.swatchImageUrl]);

  const hasImage = Boolean(program.swatchImageUrl && !imgError);

  const handleFiles = async (files: FileList | null) => {
    if (isPreviewLayer || !files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;
    const dataUrl = await readImageFileAsDataUrl(file);
    setImgError(false);
    onDropImage(dataUrl);
  };

  return (
    <div
      role={isPreviewLayer ? undefined : 'button'}
      tabIndex={isPreviewLayer ? undefined : 0}
      onClick={isPreviewLayer ? undefined : () => inputRef.current?.click()}
      onKeyDown={
        isPreviewLayer
          ? undefined
          : (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                inputRef.current?.click();
              }
            }
      }
      onDragOver={
        isPreviewLayer
          ? undefined
          : (e) => {
              e.preventDefault();
              setDragging(true);
            }
      }
      onDragLeave={isPreviewLayer ? undefined : () => setDragging(false)}
      onDrop={
        isPreviewLayer
          ? undefined
          : (e) => {
              e.preventDefault();
              setDragging(false);
              handleFiles(e.dataTransfer.files);
            }
      }
      className={`group relative aspect-square w-full overflow-hidden border transition-colors ${
        isPreviewLayer ? '' : 'cursor-pointer'
      } ${
        dragging
          ? 'border-[#0A0A0A] bg-[#F2F2F2]'
          : hasImage
            ? 'border-[#E5E5E5] bg-[#FAFAFA]'
            : 'border-[#E5E5E5] plate-blueprint-bg hover:border-[var(--metallic)]'
      }`}
    >
      {!isPreviewLayer && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
      )}

      <span aria-hidden="true" className="pointer-events-none absolute top-2 left-2 h-2 w-2 border-t border-l metallic-frame-tick z-10" />
      <span aria-hidden="true" className="pointer-events-none absolute top-2 right-2 h-2 w-2 border-t border-r metallic-frame-tick z-10" />
      <span aria-hidden="true" className="pointer-events-none absolute bottom-2 left-2 h-2 w-2 border-b border-l metallic-frame-tick z-10" />
      <span aria-hidden="true" className="pointer-events-none absolute bottom-2 right-2 h-2 w-2 border-b border-r metallic-frame-tick z-10" />

      {hasImage ? (
        <>
          <img
            src={program.swatchImageUrl}
            alt={`${program.fabricCode} fabric swatch`}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="text-[11px] font-medium text-white">
              {program.isSessionDrop ? 'Session Drop · Replace' : 'Drop to Replace Swatch'}
            </span>
          </div>
        </>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center px-3 text-center">
          <Upload className="h-4 w-4 text-[var(--metallic-strong)]" />
          <p className="mt-1.5 font-mono text-[10px] font-medium text-[#0A0A0A]">
            {program.fabricCode}
          </p>
          <p className="mt-0.5 text-[9.5px] text-[#737373]">
            Drop 1:1 scan
          </p>
        </div>
      )}
    </div>
  );
};

export const FabricSwatchBoard: React.FC<FabricSwatchBoardProps> = ({
  garments,
  onReplaceFabricSwatch,
  onSelectStyleIndex,
  sliceRange,
  embeddedInFlipbook = false,
  compactLeaf = false,
  isPreviewLayer = false,
}) => {
  const allPrograms = buildFabricSwatchPrograms(garments);
  const programs = sliceRange
    ? allPrograms.slice(sliceRange[0], sliceRange[1])
    : allPrograms;

  return (
    <div className={embeddedInFlipbook ? '' : 'mx-auto max-w-[1360px] px-6 py-10 lg:px-10 lg:py-14'}>
      {!embeddedInFlipbook && (
        <div className="mb-10 flex flex-col justify-between gap-6 border-b border-[#E5E5E5] pb-8 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs tracking-wider text-[var(--metallic-strong)]">
              Swatchbook Textile Library · {allPrograms.length} Verified Programs
            </p>
            <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-[#0A0A0A] sm:text-4xl">
              Fabric &amp; Color Swatch Matrix
            </h1>
            <p className="mt-2 max-w-[66ch] text-sm text-[#525252]">
              Every swatchbook fabric code separates GSM (weight) and roll width cleanly, pairs readable color swatches with Pantone TCX / Chart references, and flags truncated source specs rather than inventing data.
            </p>
          </div>
          <p className="font-mono text-[11px] text-[#737373]">
            Drop any fabric scan onto a tile to apply across all styles using that roll
          </p>
        </div>
      )}

      <div className="divide-y divide-[#E5E5E5] border-t border-b border-[#E5E5E5]">
        {programs.map((prog) =>
          compactLeaf ? (
            <article key={prog.fabricCode} className="space-y-3 py-4">
              <div className="grid grid-cols-12 items-start gap-3.5">
                <div className="col-span-4 max-w-[124px]">
                  <FabricSwatchTile
                    program={prog}
                    isPreviewLayer={isPreviewLayer}
                    onDropImage={(dataUrl) => onReplaceFabricSwatch(prog.fabricCode, dataUrl)}
                  />
                </div>

                <div className="col-span-8 space-y-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <h2 className="font-mono text-sm font-semibold text-[#0A0A0A]">
                      {prog.fabricCode}
                    </h2>
                    <span className="font-mono text-[10px] text-[#737373]">
                      {prog.genders.join(' / ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t border-[#F0F0F0] pt-1.5 text-[11px]">
                    <div>
                      <span className="block text-[9.5px] text-[#737373]">GSM (Weight)</span>
                      <span className="font-mono font-medium text-[#0A0A0A] tabular-nums">
                        {prog.weightGsm}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9.5px] text-[#737373]">Width (Typical)</span>
                      <span className="font-mono font-medium text-[#0A0A0A] tabular-nums">
                        {prog.fabricWidth}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px]">
                    <span className="text-[#737373]">Content: </span>
                    <span className="text-[#0A0A0A]">{prog.composition}</span>
                  </div>

                  <p className="text-[10.5px] leading-snug text-[#525252]">
                    {prog.stretchFeelNote}
                  </p>
                </div>
              </div>

              {prog.dataFlags.length > 0 && (
                <div className="flex items-start gap-2 border border-[#D4D4D4] bg-[#FAFAFA] px-2.5 py-1.5 text-[10.5px] text-[#404040]">
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-[var(--metallic-strong)]" />
                  <span>{prog.dataFlags[0]}</span>
                </div>
              )}

              <div>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-[11px] font-semibold text-[#0A0A0A]">
                    Colorways ({prog.colorCount})
                  </span>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px]">
                    {prog.linkedSkus.map((sku, idx) => (
                      <button
                        key={sku}
                        type="button"
                        disabled={isPreviewLayer}
                        onClick={() => onSelectStyleIndex(prog.linkedIndices[idx])}
                        className="font-mono text-[#0A0A0A] underline underline-offset-2 decoration-[#D4D4D4] hover:decoration-[#0A0A0A] cursor-pointer"
                      >
                        {sku}
                      </button>
                    ))}
                  </div>
                </div>
                <ColorSwatchList colorways={prog.colorways} compact />
              </div>
            </article>
          ) : (
            <article
              key={prog.fabricCode}
              className="grid grid-cols-1 gap-6 py-6 lg:grid-cols-12 lg:items-start"
            >
              {/* Col 1-2: Drag-and-drop Macro Swatch Image Plate */}
              <div className="lg:col-span-2 max-w-[170px]">
                <FabricSwatchTile
                  program={prog}
                  isPreviewLayer={isPreviewLayer}
                  onDropImage={(dataUrl) => onReplaceFabricSwatch(prog.fabricCode, dataUrl)}
                />
              </div>

              {/* Col 3-6: Swatchbook Code, Composition, Separated GSM & Width, Flags */}
              <div className="lg:col-span-4 space-y-3">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-mono text-base font-semibold text-[#0A0A0A]">
                    {prog.fabricCode}
                  </h2>
                  <span className="font-mono text-[11px] text-[#737373]">
                    {prog.genders.join(' / ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-[#F0F0F0] pt-2.5 text-xs">
                  <div>
                    <span className="block text-[10px] text-[#737373]">GSM (Weight)</span>
                    <span className="font-mono font-medium text-[#0A0A0A] tabular-nums">
                      {prog.weightGsm}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#737373]">Width (Typical)</span>
                    <span className="font-mono font-medium text-[#0A0A0A] tabular-nums">
                      {prog.fabricWidth}
                    </span>
                  </div>
                </div>

                <div className="text-xs">
                  <span className="block text-[10px] text-[#737373]">Fabric Content</span>
                  <p className="mt-0.5 text-[#0A0A0A]">{prog.composition}</p>
                </div>

                <p className="text-[11px] leading-relaxed text-[#525252]">
                  {prog.stretchFeelNote}
                </p>

                {prog.dataFlags.length > 0 && (
                  <div className="flex items-start gap-2 border border-[#D4D4D4] bg-[#FAFAFA] px-2.5 py-2 text-[11px] text-[#404040]">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--metallic-strong)]" />
                    <span>{prog.dataFlags[0]}</span>
                  </div>
                )}

                {/* Linked Style Codes */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-[11px]">
                  <span className="text-[#737373]">Styles ({prog.linkedSkus.length}):</span>
                  {prog.linkedSkus.map((sku, idx) => (
                    <button
                      key={sku}
                      type="button"
                      disabled={isPreviewLayer}
                      onClick={() => onSelectStyleIndex(prog.linkedIndices[idx])}
                      className="inline-flex items-center gap-0.5 font-mono text-[#0A0A0A] underline underline-offset-4 decoration-[#D4D4D4] hover:decoration-[#0A0A0A] cursor-pointer"
                    >
                      <span>{sku}</span>
                      <ArrowUpRight className="h-2.5 w-2.5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Col 7-12: Readable Color Swatches + Pantone TCX Codes */}
              <div className="lg:col-span-6">
                <div className="mb-2.5 flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-[#0A0A0A]">
                    Available Colorways ({prog.colorCount})
                  </span>
                  <span className="font-serif text-xs italic text-[#737373]">
                    Pantone TCX &amp; swatchbook shade references
                  </span>
                </div>
                <ColorSwatchList colorways={prog.colorways} compact />
              </div>
            </article>
          )
        )}
      </div>
    </div>
  );
};

