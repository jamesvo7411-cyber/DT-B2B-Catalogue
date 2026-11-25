import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, ArrowUpRight, ImagePlus, Search, Sparkles, Upload } from 'lucide-react';
import type { FactoryFabricColor, FabricSwatchProgram, GarmentItem } from '../types/catalogue';
import { buildFabricSwatchPrograms, getColorSwatchHex } from '../data/garments';
import { getFactoryColorImageKey } from '../data/factoryFabricColors';
import {
  formatSpreadPageCode,
  getFabricFamilyName,
  type CatalogueNavigationMap,
} from '../utils/catalogueOrder';
import { getDisplayColorName } from '../utils/fabricDisplay';
import {
  displayBuyerProductTitle,
  getBuyerVisibleValue,
  hasIncompleteFabricComposition,
} from '../utils/productDisplay';
import { readImageFileAsDataUrl } from '../utils/media';
import { RunningHeader } from './CatalogueNavigation';
import { ColorSwatchList } from './ColorSwatchList';

interface FabricSwatchBoardProps {
  garments: GarmentItem[];
  navMap?: CatalogueNavigationMap;
  demoMode?: boolean;
  onToggleDemoMode?: () => void;
  onReplaceFabricSwatch: (fabricCode: string, dataUrl: string) => void;
  onSelectStyleIndex: (index: number) => void;
  fabricColorImages?: Record<string, string>;
  onReplaceFabricColorImage?: (imageKey: string, dataUrl: string) => void;
  onImageUploadError?: (message: string) => void;
  interactive?: boolean;
  sliceRange?: [number, number];
  embeddedInFlipbook?: boolean;
  compactLeaf?: boolean;
  isPreviewLayer?: boolean;
}

export const FabricColorImageTile: React.FC<{
  color: FactoryFabricColor;
  imageUrl: string;
  interactive: boolean;
  aspectClass?: string;
  tightCrop?: boolean;
  onReplace?: (dataUrl: string) => void;
  onError?: (message: string) => void;
}> = ({
  color,
  imageUrl,
  interactive,
  aspectClass = 'aspect-square',
  tightCrop = false,
  onReplace,
  onError,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [imgError, setImgError] = useState(false);
  const canEdit = interactive && Boolean(onReplace);
  const hasImage = Boolean(imageUrl && !imgError);

  useEffect(() => setImgError(false), [imageUrl]);

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onError?.('Choose an image file for the fabric color.');
      return;
    }
    if (!onReplace) return;
    try {
      onReplace(await readImageFileAsDataUrl(file, 720));
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Unable to read the fabric image.');
    }
  };

  return (
    <div
      className={`group relative ${aspectClass} overflow-hidden border ${
        dragging ? 'border-[#111111] bg-[#F0EFEB]' : 'border-[#E5E3DE] bg-[#F7F6F2]'
      }`}
      onDragOver={
        canEdit
          ? (event) => {
              event.preventDefault();
              setDragging(true);
            }
          : undefined
      }
      onDragLeave={canEdit ? () => setDragging(false) : undefined}
      onDrop={
        canEdit
          ? (event) => {
              event.preventDefault();
              setDragging(false);
              void handleFile(event.dataTransfer.files[0]);
            }
          : undefined
      }
    >
      {canEdit && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          aria-label={`Choose fabric image for ${color.colorName}`}
          onChange={(event) => {
            void handleFile(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
      )}
      {hasImage ? (
        <img
          src={imageUrl}
          alt={`${getDisplayColorName(color)} ${color.fabricCode} fabric texture`}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
          className={`h-full w-full object-cover ${tightCrop ? 'scale-[1.65]' : ''}`}
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 px-3 text-center">
          {interactive ? (
            <div
              aria-hidden="true"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D8D6D0] bg-white"
            >
              <ImagePlus className="h-5 w-5 text-[#77756F]" />
            </div>
          ) : (
            <span
              aria-hidden="true"
              className="h-12 w-12 rounded-full border border-black/10"
              style={{ backgroundColor: getColorSwatchHex(color.colorName) ?? '#F3F2EF' }}
            />
          )}
          {interactive && (
            <p className="text-xs font-semibold text-[#302F2B]">
              {imgError ? 'Image could not be loaded' : 'Swatch image not supplied'}
            </p>
          )}
          <p className="text-[10px] text-[#77756F]">
            {getDisplayColorName(color)} · {color.fabricCode}
          </p>
        </div>
      )}
      {canEdit && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute inset-x-2 bottom-2 inline-flex items-center justify-center gap-1.5 border border-white/60 bg-black/75 px-2 py-1.5 text-[10px] font-medium text-white opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Upload className="h-3 w-3" />
          {hasImage ? 'Replace image' : 'Upload image'}
        </button>
      )}
    </div>
  );
};

const FabricSwatchTile: React.FC<{
  program: FabricSwatchProgram;
  onDropImage: (dataUrl: string) => void;
  interactive?: boolean;
  isPreviewLayer?: boolean;
}> = ({ program, onDropImage, interactive = true, isPreviewLayer = false }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [program.swatchImageUrl]);

  const hasImage = Boolean(program.swatchImageUrl && !imgError);

  const handleFiles = async (files: FileList | null) => {
    if (!interactive || isPreviewLayer || !files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;
    const dataUrl = await readImageFileAsDataUrl(file);
    setImgError(false);
    onDropImage(dataUrl);
  };

  return (
    <div
      role={isPreviewLayer || !interactive ? undefined : 'button'}
      tabIndex={isPreviewLayer || !interactive ? undefined : 0}
      onClick={isPreviewLayer || !interactive ? undefined : () => inputRef.current?.click()}
      onKeyDown={
        isPreviewLayer || !interactive
          ? undefined
          : (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                inputRef.current?.click();
              }
            }
      }
      onDragOver={
        isPreviewLayer || !interactive
          ? undefined
          : (e) => {
              e.preventDefault();
              setDragging(true);
            }
      }
      onDragLeave={isPreviewLayer || !interactive ? undefined : () => setDragging(false)}
      onDrop={
        isPreviewLayer || !interactive
          ? undefined
          : (e) => {
              e.preventDefault();
              setDragging(false);
              handleFiles(e.dataTransfer.files);
            }
      }
      className={`group relative aspect-square w-full overflow-hidden border transition-colors ${
        isPreviewLayer || !interactive ? '' : 'cursor-pointer'
      } ${
        dragging
          ? 'border-[#0A0A0A] bg-[#F2F2F2]'
          : hasImage
            ? 'border-[#E5E5E5] bg-[#FAFAFA]'
            : `border-[#E5E5E5] plate-blueprint-bg ${interactive ? 'hover:border-[var(--metallic)]' : ''}`
      }`}
    >
      {!isPreviewLayer && interactive && (
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
            className={`h-full w-full object-cover ${
              interactive ? 'transition-transform duration-300 group-hover:scale-[1.03]' : ''
            }`}
          />
          {interactive && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="text-[11px] font-medium text-white">
                {program.isSessionDrop ? 'Session Drop · Replace' : 'Drop to Replace Swatch'}
              </span>
            </div>
          )}
        </>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center px-3 text-center">
          {interactive && <Upload className="h-4 w-4 text-[var(--metallic-strong)]" />}
          <p className="mt-1.5 font-mono text-[10px] font-medium text-[#0A0A0A]">
            {program.fabricCode}
          </p>
          {interactive && (
            <p className="mt-0.5 text-[9.5px] text-[#737373]">Drop or upload swatch</p>
          )}
        </div>
      )}
    </div>
  );
};

export const FabricSwatchBoard: React.FC<FabricSwatchBoardProps> = ({
  garments,
  navMap,
  demoMode = false,
  onToggleDemoMode,
  onReplaceFabricSwatch,
  onSelectStyleIndex,
  fabricColorImages = {},
  onReplaceFabricColorImage,
  onImageUploadError,
  interactive = true,
  sliceRange,
  embeddedInFlipbook = false,
  compactLeaf = false,
  isPreviewLayer = false,
}) => {
  const [query, setQuery] = useState('');
  const allPrograms = navMap?.orderedFabrics ?? buildFabricSwatchPrograms(garments);
  const programs = sliceRange
    ? allPrograms.slice(sliceRange[0], sliceRange[1])
    : allPrograms;
  const orderedGarments = navMap?.orderedGarments ?? garments;

  if (!embeddedInFlipbook) {
    const normalizedQuery = query.trim().toLowerCase();
    const visiblePrograms = allPrograms
      .map((program) => {
        const programText = [
          program.fabricCode,
          program.composition,
          program.linkedSkus.join(' '),
          program.genders.join(' '),
        ]
          .join(' ')
          .toLowerCase();
        const programMatches = !normalizedQuery || programText.includes(normalizedQuery);
        const matchingColors = program.factoryColors.filter((color) =>
          [
            color.colorName,
            color.factoryColorName,
            color.shadeCode,
            color.reference,
            color.lotWeightGsm,
            color.lotWidth,
          ]
            .join(' ')
            .toLowerCase()
            .includes(normalizedQuery)
        );
        return {
          program,
          colors: !normalizedQuery || programMatches ? program.factoryColors : matchingColors,
        };
      })
      .filter(({ colors }) => colors.length > 0);
    const totalColorOptions = allPrograms.reduce(
      (total, program) => total + program.factoryColors.length,
      0
    );
    const canEditColorImages = interactive && Boolean(onReplaceFabricColorImage);

    return (
      <div className="mx-auto max-w-[1360px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        <header className="mb-8 border-b border-[#E5E3DE] pb-6">
          <RunningHeader
            sectionId="fabrics"
            categoryLabel="TEXTILE & COLOR ARCHIVE"
            pageLabel={
              navMap
                ? `P.03–${String(navMap.productOffset).padStart(2, '0')}`
                : 'P.03–17'
            }
            rightContext={`${allPrograms.length} FABRIC PROGRAMS`}
          />
          <div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <h1 className="font-sans text-3xl font-semibold tracking-tight text-[#171715] sm:text-4xl">
                Fabric &amp; Color Availability
              </h1>
              <p className="mt-2 max-w-[68ch] text-sm leading-relaxed text-[#55534E]">
                {interactive
                  ? 'Browse factory-listed fabric programs, shade codes, and Pantone or chart references. Some English shade names are provisional, so confirm the physical swatch along with current stock, MOQ, and lead time before placing an order.'
                  : 'Explore our fabric programs, available shades, color references, and fabric specifications.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <div className="border border-[#E5E3DE] bg-white px-4 py-3">
                <span className="block font-mono text-lg font-semibold text-[#171715]">
                  {allPrograms.length}
                </span>
                <span className="text-[10px] uppercase tracking-wide text-[#77756F]">
                  Fabric programs
                </span>
              </div>
              <div className="border border-[#E5E3DE] bg-white px-4 py-3">
                <span className="block font-mono text-lg font-semibold text-[#171715]">
                  {totalColorOptions}
                </span>
                <span className="text-[10px] uppercase tracking-wide text-[#77756F]">
                  Listed colors
                </span>
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <label className="flex min-w-[260px] flex-1 max-w-xl items-center gap-2 border border-[#D8D6D0] bg-white px-3 py-2.5">
              <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-[#77756F]" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search fabric, style, color, shade code, or TCX"
                className="w-full bg-transparent text-sm text-[#171715] outline-none placeholder:text-[#99968E]"
                aria-label="Search fabric programs and colors"
              />
            </label>
            {onToggleDemoMode && (
              <button
                type="button"
                onClick={onToggleDemoMode}
                aria-pressed={demoMode}
                className={`inline-flex items-center gap-1.5 border px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                  demoMode
                    ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white'
                    : 'border-[#DCDAD3] bg-white text-[#4A4843] hover:border-[#0A0A0A]'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{demoMode ? 'Demo Mode: On' : 'Demo Mode'}</span>
              </button>
            )}
          </div>
          {canEditColorImages && (
            <p className="mt-2 text-[11px] text-[#77756F]">
              Workbench: drop or upload a different generated fabric image on each color card.
            </p>
          )}
        </header>

        <div className="space-y-8">
          {visiblePrograms.map(({ program, colors }) => {
            const fabricSpreadIdx = navMap?.fabricPageByCode.get(program.fabricCode);
            const fabricPageCode =
              fabricSpreadIdx !== undefined ? formatSpreadPageCode(fabricSpreadIdx) : undefined;
            return (
            <article
              key={program.fabricCode}
              className="border border-[#E5E3DE] bg-white"
            >
              <div className="border-b border-[#E5E3DE] bg-[#FAF9F6] px-4 py-4 sm:px-6">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#77756F]">
                      {getFabricFamilyName(program.fabricCode)}
                      {fabricPageCode ? ` · Folio ${fabricPageCode}` : ''}
                    </p>
                    <h2 className="mt-1 font-mono text-lg font-semibold text-[#171715]">
                      {program.fabricCode}
                    </h2>
                    {(interactive ||
                      (getBuyerVisibleValue(program.composition) &&
                        !hasIncompleteFabricComposition(program.dataFlags))) && (
                      <p className="mt-1 max-w-[66ch] text-xs leading-relaxed text-[#55534E]">
                        {getBuyerVisibleValue(program.composition) || 'Not listed'}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs lg:min-w-[280px]">
                    {(interactive || getBuyerVisibleValue(program.weightGsm)) && (
                      <div>
                        <span className="block text-[10px] text-[#77756F]">Typical GSM</span>
                        <span className="font-mono font-semibold text-[#171715]">
                          {getBuyerVisibleValue(program.weightGsm) || 'Not listed'}
                        </span>
                      </div>
                    )}
                    {(interactive || getBuyerVisibleValue(program.fabricWidth)) && (
                      <div>
                        <span className="block text-[10px] text-[#77756F]">Typical width</span>
                        <span className="font-mono font-semibold text-[#171715]">
                          {getBuyerVisibleValue(program.fabricWidth) || 'Not listed'}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="block text-[10px] text-[#77756F]">Factory-listed colors</span>
                      <span className="font-mono font-semibold text-[#171715]">
                        {program.factoryColors.length}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-[#77756F]">Linked styles</span>
                      <span className="font-mono font-semibold text-[#171715]">
                        {program.linkedSkus.length}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 border-t border-[#E5E3DE] pt-3">
                  <span className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#55534E]">
                    Used By
                  </span>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
                    {program.linkedSkus.map((sku, index) => {
                      const styleIdx = program.linkedIndices[index];
                      const styleObj = orderedGarments.find((item) => item.index === styleIdx);
                      const spreadIdx = styleObj ? navMap?.garmentPageById.get(styleObj.id) : undefined;
                      const pageTag = spreadIdx !== undefined ? formatSpreadPageCode(spreadIdx) : '';
                      return (
                        <button
                          key={sku}
                          type="button"
                          disabled={isPreviewLayer}
                          onClick={() => onSelectStyleIndex(styleIdx)}
                          className="group flex items-baseline justify-between gap-2 border-b border-[#EAE8E2] pb-1 text-left transition-colors hover:border-[#171715] disabled:cursor-default cursor-pointer"
                        >
                          <span className="min-w-0 truncate text-[11px] text-[#171715]">
                            <span className="font-mono font-bold">{sku}</span>{' '}
                            {styleObj && (
                              <span className="text-[#55534E] group-hover:text-[#171715]">
                                · {interactive
                                  ? styleObj.title
                                  : displayBuyerProductTitle(styleObj.title)}
                              </span>
                            )}
                          </span>
                          <span className="inline-flex shrink-0 items-center gap-0.5 font-mono text-[10px] font-semibold text-[#66645F] tabular-nums group-hover:text-[#171715]">
                            {pageTag}
                            <ArrowUpRight aria-hidden="true" className="h-2.5 w-2.5" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:gap-4 sm:p-5 lg:grid-cols-4 xl:grid-cols-5">
                {colors.map((color) => {
                  const imageKey = getFactoryColorImageKey(program.fabricCode, color.colorName);
                  const imageUrl = fabricColorImages?.[imageKey] || color.swatchImageUrl || '';
                  return (
                    <section
                      key={imageKey}
                      className="min-w-0 border border-[#EAE8E2] bg-white"
                      aria-label={`${color.colorName} in ${program.fabricCode}`}
                    >
                      <FabricColorImageTile
                        color={color}
                        imageUrl={imageUrl}
                        tightCrop
                        interactive={canEditColorImages}
                        onReplace={
                          onReplaceFabricColorImage
                            ? (dataUrl) => onReplaceFabricColorImage(imageKey, dataUrl)
                            : undefined
                        }
                        onError={onImageUploadError}
                      />
                      <div className="space-y-2 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-semibold leading-tight text-[#171715]">
                            {getDisplayColorName(color)}
                          </h3>
                          {(interactive || getBuyerVisibleValue(color.reference)) && (
                            <span className="shrink-0 border border-[#E5E3DE] px-1.5 py-0.5 font-mono text-[9px] text-[#55534E]">
                              {getBuyerVisibleValue(color.reference) ||
                                (interactive ? 'Not listed' : '')}
                            </span>
                          )}
                        </div>
                        {(interactive || getBuyerVisibleValue(color.shadeCode)) && (
                          <div className="flex items-center gap-2 border-t border-[#F0EFEB] pt-2">
                          <span
                            aria-hidden="true"
                            className="h-4 w-6 shrink-0 border border-black/10"
                            style={{ backgroundColor: getColorSwatchHex(color.colorName) ?? '#F3F2EF' }}
                          />
                          <p className="min-w-0 text-[10px] leading-snug text-[#55534E]">
                            <span className="block text-[9px] uppercase tracking-wide text-[#88857D]">
                              Factory shade code
                            </span>
                            <span className="font-mono font-medium text-[#302F2B]">
                              {getBuyerVisibleValue(color.shadeCode) ||
                                (interactive ? 'Not listed' : '')}
                            </span>
                          </p>
                          </div>
                        )}
                        {interactive &&
                          color.factoryColorName &&
                          color.factoryColorName !== color.shadeCode && (
                          <p className="truncate text-[10px] text-[#77756F]" title={color.factoryColorName}>
                            Factory label: {color.factoryColorName}
                          </p>
                        )}
                        {(interactive ||
                          getBuyerVisibleValue(color.lotWeightGsm) ||
                          getBuyerVisibleValue(color.lotWidth)) && (
                          <div className="grid grid-cols-2 gap-2 border-t border-[#F0EFEB] pt-2 text-[10px]">
                            {(interactive || getBuyerVisibleValue(color.lotWeightGsm)) && (
                              <p>
                                <span className="block text-[9px] text-[#88857D]">Lot GSM</span>
                                <span className="font-mono font-medium text-[#302F2B]">
                                  {getBuyerVisibleValue(color.lotWeightGsm) ||
                                    (interactive ? 'Not listed' : '')}
                                </span>
                              </p>
                            )}
                            {(interactive || getBuyerVisibleValue(color.lotWidth)) && (
                              <p>
                                <span className="block text-[9px] text-[#88857D]">Lot width</span>
                                <span className="font-mono font-medium text-[#302F2B]">
                                  {getBuyerVisibleValue(color.lotWidth) ||
                                    (interactive ? 'Not listed' : '')}
                                </span>
                              </p>
                            )}
                          </div>
                        )}
                        {interactive && color.sourceNote && (
                          <p className="border-t border-dashed border-[#E5E3DE] pt-2 text-[9px] leading-snug text-[#6A6253]">
                            Source note: {color.sourceNote}
                          </p>
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>
            </article>
            );
          })}
          {visiblePrograms.length === 0 && (
            <p className="border border-dashed border-[#D8D6D0] bg-white px-4 py-8 text-center text-sm text-[#77756F]">
              No fabric colors match that search.
            </p>
          )}
        </div>
      </div>
    );
  }

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
        {programs.map((prog) => {
          const compositionIsIncomplete = hasIncompleteFabricComposition(prog.dataFlags);
          const composition = compositionIsIncomplete
            ? undefined
            : getBuyerVisibleValue(prog.composition);
          const weight = getBuyerVisibleValue(prog.weightGsm);
          const width = getBuyerVisibleValue(prog.fabricWidth);
          const stretchFeelNote = getBuyerVisibleValue(prog.stretchFeelNote);

          return compactLeaf ? (
            <article key={prog.fabricCode} className="space-y-3 py-4">
              <div className="grid grid-cols-12 items-start gap-3.5">
                <div className="col-span-4 max-w-[124px]">
                  <FabricSwatchTile
                    program={prog}
                    isPreviewLayer={isPreviewLayer}
                    interactive={interactive}
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

                  {(interactive || weight || width) && (
                    <div className="grid grid-cols-2 gap-2 border-t border-[#F0F0F0] pt-1.5 text-[11px]">
                      {(interactive || weight) && (
                        <div>
                          <span className="block text-[9.5px] text-[#737373]">GSM (Weight)</span>
                          <span className="font-mono font-medium text-[#0A0A0A] tabular-nums">
                            {weight || ''}
                          </span>
                        </div>
                      )}
                      {(interactive || width) && (
                        <div>
                          <span className="block text-[9.5px] text-[#737373]">Width (Typical)</span>
                          <span className="font-mono font-medium text-[#0A0A0A] tabular-nums">
                            {width || ''}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {(interactive || composition) && (
                    <div className="text-[11px]">
                      <span className="text-[#737373]">Content: </span>
                      <span className="text-[#0A0A0A]">{composition || ''}</span>
                    </div>
                  )}

                  {(interactive || stretchFeelNote) && (
                    <p className="text-[10.5px] leading-snug text-[#525252]">
                      {stretchFeelNote || ''}
                    </p>
                  )}
                </div>
              </div>

              {interactive && prog.dataFlags.length > 0 && (
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
                    {prog.linkedIndices.map((styleIndex, idx) => {
                      const style = garments.find((item) => item.index === styleIndex);
                      const sku = prog.linkedSkus[idx];
                      return (
                        <button
                          key={sku}
                          type="button"
                          disabled={isPreviewLayer}
                          onClick={() => onSelectStyleIndex(styleIndex)}
                          className="text-left text-[9px] leading-snug text-[#0A0A0A] underline underline-offset-2 decoration-[#D4D4D4] hover:decoration-[#0A0A0A] disabled:cursor-default"
                        >
                          {style
                            ? `${interactive ? style.title : displayBuyerProductTitle(style.title)} (${sku})`
                            : sku}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <ColorSwatchList
                  colorways={prog.colorways}
                  fabricCode={prog.fabricCode}
                  compact
                  showPendingColorways={interactive}
                />
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
                  interactive={interactive}
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

                {(interactive || weight || width) && (
                  <div className="grid grid-cols-2 gap-3 border-t border-[#F0F0F0] pt-2.5 text-xs">
                    {(interactive || weight) && (
                      <div>
                        <span className="block text-[10px] text-[#737373]">GSM (Weight)</span>
                        <span className="font-mono font-medium text-[#0A0A0A] tabular-nums">
                          {weight || ''}
                        </span>
                      </div>
                    )}
                    {(interactive || width) && (
                      <div>
                        <span className="block text-[10px] text-[#737373]">Width (Typical)</span>
                        <span className="font-mono font-medium text-[#0A0A0A] tabular-nums">
                          {width || ''}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {(interactive || composition) && (
                  <div className="text-xs">
                    <span className="block text-[10px] text-[#737373]">Fabric Content</span>
                    <p className="mt-0.5 text-[#0A0A0A]">{composition || ''}</p>
                  </div>
                )}

                {(interactive || stretchFeelNote) && (
                  <p className="text-[11px] leading-relaxed text-[#525252]">
                    {stretchFeelNote || ''}
                  </p>
                )}

                {interactive && prog.dataFlags.length > 0 && (
                  <div className="flex items-start gap-2 border border-[#D4D4D4] bg-[#FAFAFA] px-2.5 py-2 text-[11px] text-[#404040]">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--metallic-strong)]" />
                    <span>{prog.dataFlags[0]}</span>
                  </div>
                )}

                {/* Linked Style Codes */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-[11px]">
                  <span className="text-[#737373]">Used By ({prog.linkedSkus.length}):</span>
                  {prog.linkedIndices.map((styleIndex, idx) => {
                    const style = orderedGarments.find((item) => item.index === styleIndex);
                    const sku = prog.linkedSkus[idx];
                    return (
                      <button
                        key={sku}
                        type="button"
                        disabled={isPreviewLayer}
                        onClick={() => onSelectStyleIndex(styleIndex)}
                        className="inline-flex items-center gap-0.5 text-left text-[10px] text-[#0A0A0A] underline underline-offset-4 decoration-[#D4D4D4] hover:decoration-[#0A0A0A] disabled:cursor-default"
                      >
                        <span>
                          {style
                            ? `${interactive ? style.title : displayBuyerProductTitle(style.title)} (${sku})`
                            : sku}
                        </span>
                        <ArrowUpRight className="h-2.5 w-2.5 shrink-0" />
                      </button>
                    );
                  })}
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
                <ColorSwatchList
                  colorways={prog.colorways}
                  fabricCode={prog.fabricCode}
                  compact
                  showPendingColorways={interactive}
                />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

