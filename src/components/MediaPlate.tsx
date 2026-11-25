import React, { useEffect, useRef, useState } from 'react';
import { Crop, Maximize2, RotateCcw, Upload, Replace } from 'lucide-react';
import type { ImageCrop, MediaSlot, MediaSlotKey } from '../types/catalogue';
import { STAGE_LABELS } from '../data/garments';
import { imageCropStyle, normalizeImageCrop, readImageFileAsDataUrl } from '../utils/media';

interface MediaPlateProps {
  slotKey: MediaSlotKey;
  slot: MediaSlot;
  aspectClass: string;
  titleLabel: string;
  editMode: boolean;
  interactive?: boolean;
  editable?: boolean;
  showBlankGuides?: boolean;
  compact?: boolean;
  fullHeight?: boolean;
  displayScale?: number;
  topOverlay?: React.ReactNode;
  imageOverlay?: React.ReactNode;
  overlayMode?: 'gradient' | 'card';
  onReplaceFile?: (slotKey: MediaSlotKey, dataUrl: string) => void;
  onUpdateCrop?: (slotKey: MediaSlotKey, crop: ImageCrop) => void;
  onInspect?: (slot: MediaSlot, titleLabel: string) => void;
  onOpenEditor?: (slotKey: MediaSlotKey) => void;
  onImageUnavailable?: (slotKey: MediaSlotKey) => void;
}

export const MediaPlate: React.FC<MediaPlateProps> = ({
  slotKey,
  slot,
  aspectClass,
  titleLabel,
  editMode,
  interactive = true,
  editable = true,
  showBlankGuides = true,
  compact = false,
  fullHeight = false,
  displayScale = 1,
  topOverlay,
  imageOverlay,
  overlayMode = 'gradient',
  onReplaceFile,
  onUpdateCrop,
  onInspect,
  onOpenEditor,
  onImageUnavailable,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    clientX: number;
    clientY: number;
    width: number;
    height: number;
    crop: ImageCrop;
  } | null>(null);
  const cropDraftRef = useRef(normalizeImageCrop(slot.crop));
  const [isDragging, setIsDragging] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [cropMode, setCropMode] = useState(false);
  const [cropDraft, setCropDraft] = useState(() => normalizeImageCrop(slot.crop));

  useEffect(() => {
    setImgError(false);
    setUseFallback(false);
  }, [slot.url, slot.fallbackUrl]);

  useEffect(() => {
    const crop = normalizeImageCrop(slot.crop);
    cropDraftRef.current = crop;
    setCropDraft(crop);
  }, [slot.crop]);

  useEffect(() => {
    if (!editMode) setCropMode(false);
  }, [editMode]);

  const activeUrl = useFallback && slot.fallbackUrl ? slot.fallbackUrl : slot.url;
  const hasImage = Boolean(activeUrl && !imgError);
  const isSessionLocal = slot.isSessionDrop || activeUrl.startsWith('data:');
  const currentCrop = normalizeImageCrop(cropMode ? cropDraft : slot.crop);
  const displayedImageStyle = imageCropStyle({
    ...currentCrop,
    scale: Math.max(currentCrop.scale, displayScale),
  });

  const setDraft = (crop: ImageCrop) => {
    const normalized = normalizeImageCrop(crop);
    cropDraftRef.current = normalized;
    setCropDraft(normalized);
  };

  const commitCrop = () => {
    onUpdateCrop?.(slotKey, cropDraftRef.current);
  };

  const handleCropPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !hasImage) return;
    if (event.target instanceof HTMLElement && event.target.closest('[data-crop-controls]')) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    dragRef.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      width: bounds.width,
      height: bounds.height,
      crop: cropDraftRef.current,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleCropPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    setDraft({
      scale: drag.crop.scale,
      x: drag.crop.x + ((event.clientX - drag.clientX) / drag.width) * (100 / drag.crop.scale),
      y: drag.crop.y + ((event.clientY - drag.clientY) / drag.height) * (100 / drag.crop.scale),
    });
  };

  const handleCropPointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) return;
    dragRef.current = null;
    commitCrop();
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !onReplaceFile) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;
    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      setImgError(false);
      onReplaceFile(slotKey, dataUrl);
    } catch {
      // Fallback gracefully if file cannot be decoded
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handlePlateClick = () => {
    if (!interactive) return;
    if (cropMode) return;
    if (hasImage && !editMode && onInspect) {
      onInspect(slot, titleLabel);
      return;
    }
    if (editable && onReplaceFile) {
      fileInputRef.current?.click();
    } else if (editable && onOpenEditor) {
      onOpenEditor(slotKey);
    }
  };

  return (
    <figure className={`flex flex-col ${fullHeight ? 'h-full w-full flex-1' : ''}`}>
      <div
        role="group"
        aria-label={titleLabel}
        onDragOver={
          interactive && editable
            ? (e) => {
                e.preventDefault();
                if (!isDragging) setIsDragging(true);
              }
            : undefined
        }
        onDragLeave={interactive && editable ? () => setIsDragging(false) : undefined}
        onDrop={interactive && editable ? handleDrop : undefined}
        className={`group relative w-full overflow-hidden transition-colors duration-200 ${
          fullHeight ? 'h-full flex-1' : ''
        } ${
          interactive && (editable || hasImage)
            ? 'cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]'
            : 'cursor-default'
        } ${aspectClass} ${
          isDragging
            ? 'bg-[#F2F2F2] ring-2 ring-[#0A0A0A]'
            : hasImage
              ? 'bg-[#F5F4F0]'
              : showBlankGuides
                ? 'plate-blueprint-bg'
                : 'bg-[#FAF9F5]'
        }`}
      >
        {interactive && editable && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = '';
              }}
            />
          </>
        )}

        {interactive && (editable || hasImage) && (
          <button
            type="button"
            onClick={handlePlateClick}
            aria-label={
              !editable
                ? `Inspect ${titleLabel} image`
                : hasImage
                  ? editMode
                    ? `Replace ${titleLabel} image`
                    : `Inspect ${titleLabel} image`
                  : `Drop or upload image for ${titleLabel}`
            }
            className="absolute inset-0 z-10 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-[#0A0A0A]"
          >
            <span className="sr-only">{titleLabel}</span>
          </button>
        )}

        {hasImage ? (
          <>
            <img
              src={activeUrl}
              alt={`${titleLabel} — ${slot.caption}`}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={() => {
                if (!useFallback && slot.fallbackUrl) {
                  setUseFallback(true);
                } else {
                  setImgError(true);
                  onImageUnavailable?.(slotKey);
                }
              }}
              style={displayedImageStyle}
              className={`h-full w-full object-cover ${cropMode ? 'transition-none' : 'transition-transform duration-300 ease-out'}`}
            />
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center px-5 text-center">
            {showBlankGuides && (
              <>
                <div
                  aria-hidden="true"
                  className="mb-3 flex h-8 w-8 items-center justify-center text-[#9A9892]"
                >
                  <span className="relative block h-6 w-6">
                    <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[#C9C6BF]" />
                    <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[#C9C6BF]" />
                    <span className="absolute top-1/2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 border border-[#A9A69E] bg-white" />
                  </span>
                </div>
                <p
                  className={`font-sans font-medium text-[#0A0A0A] tracking-tight ${
                    compact ? 'text-sm' : 'text-[15px]'
                  }`}
                >
                  {titleLabel}
                </p>
                <p className="mt-1 font-mono text-[11px] tracking-wide text-[#737373] tabular-nums">
                  {slot.aspectLabel}
                </p>
                {!compact && (
                  <p className="mt-2 max-w-[28ch] text-xs leading-relaxed text-[#737373]">
                    {slot.note}
                  </p>
                )}
              </>
            )}

            {interactive && showBlankGuides && (
              <div className="no-print mt-4 inline-flex items-center gap-1.5 border-b border-transparent pb-0.5 text-[11px] font-medium text-[#525252] transition-colors duration-200 group-hover:border-[#0A0A0A] group-hover:text-[#0A0A0A]">
                <Upload className="h-3 w-3" />
                <span>{isDragging ? 'Release to preview in session' : 'Drop or click to place image'}</span>
              </div>
            )}
          </div>
        )}

        {topOverlay && (
          <div className="pointer-events-none absolute inset-x-4 top-4 z-10">
            {topOverlay}
          </div>
        )}

        {imageOverlay && (
          overlayMode === 'card' ? (
            <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20">
              <div className="pointer-events-auto border border-[#DCDAD3]/90 bg-white/86 px-4 py-3 text-[#0A0A0A] backdrop-blur-md">
                {imageOverlay}
              </div>
            </div>
          ) : (
            <div
              className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t px-4 pb-4 pt-12 ${
                hasImage ? 'from-black/70 to-transparent text-white' : 'from-white/95 to-transparent text-[#0A0A0A]'
              }`}
            >
              {imageOverlay}
            </div>
          )
        )}

        {editMode && editable && hasImage && (
          <div className="no-print absolute right-2 top-2 z-20">
            {!cropMode ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setDraft(normalizeImageCrop(slot.crop));
                  setCropMode(true);
                }}
                aria-label={`Adjust crop for ${titleLabel}`}
                className="inline-flex items-center gap-1.5 bg-white/95 px-2.5 py-1.5 text-[10px] font-medium text-[#252421] shadow-sm transition-colors hover:bg-white"
              >
                <Crop className="h-3 w-3" />
                <span>Reframe</span>
              </button>
            ) : (
              <div
                className="flex items-center gap-2 bg-white/95 p-2 text-[#252421] shadow-md"
                data-crop-controls
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
              >
                <label className="flex items-center gap-2">
                  <span className="font-mono text-[9px]">ZOOM</span>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.01"
                    value={cropDraft.scale}
                    aria-label={`Zoom ${titleLabel} image`}
                    onChange={(event) =>
                      setDraft({ ...cropDraftRef.current, scale: Number(event.target.value) })
                    }
                    onPointerUp={commitCrop}
                    onKeyUp={commitCrop}
                    onBlur={commitCrop}
                    className="w-20 accent-[#22211F]"
                  />
                  <span className="w-8 font-mono text-[9px] tabular-nums">
                    {cropDraft.scale.toFixed(1)}×
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setDraft({ scale: 1, x: 0, y: 0 });
                    onUpdateCrop?.(slotKey, { scale: 1, x: 0, y: 0 });
                  }}
                  aria-label={`Reset crop for ${titleLabel}`}
                  className="p-1 hover:bg-[#F0EFEC]"
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    commitCrop();
                    setCropMode(false);
                  }}
                  className="px-1.5 py-1 text-[9px] font-semibold hover:bg-[#F0EFEC]"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        )}

        {interactive && hasImage && !cropMode && (
          overlayMode === 'card' ? (
            <div className="no-print pointer-events-none absolute top-3 right-3 z-20 inline-flex items-center gap-1.5 border border-[#DCDAD3] bg-white/90 px-2.5 py-1 text-[10px] font-medium text-[#111111] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <span>{editMode ? 'Replace' : 'Inspect'}</span>
              {editMode ? <Replace className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </div>
          ) : (
            <div className="no-print pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center justify-between bg-gradient-to-t from-black/55 to-transparent px-3 pb-2.5 pt-6 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <span className="text-[10px] font-medium text-white">
                {editMode ? 'Drop or click to replace' : 'Inspect image'}
              </span>
              {editMode ? (
                <Replace className="h-3 w-3 text-white" />
              ) : (
                <Maximize2 className="h-3 w-3 text-white" />
              )}
            </div>
          )
        )}

        {cropMode && (
          <div
            className="no-print absolute inset-0 z-[15] touch-none cursor-grab active:cursor-grabbing"
            onPointerDown={handleCropPointerDown}
            onPointerMove={handleCropPointerMove}
            onPointerUp={handleCropPointerEnd}
            onPointerCancel={handleCropPointerEnd}
          />
        )}
      </div>

      {/* Editorial figure caption — strictly unboxed metadata with typographic separator */}
      {!compact && (
        <figcaption className="mt-2.5 flex items-baseline justify-between gap-4 border-t border-[#F0F0F0] pt-2">
          <span className="font-serif text-[13px] italic text-[#404040] leading-snug">
            {slot.caption}
          </span>
          <span className="shrink-0 font-mono text-[11px] tracking-wide text-[#737373] whitespace-nowrap">
            {isSessionLocal ? 'Session Drop' : STAGE_LABELS[slot.stage]}
          </span>
        </figcaption>
      )}
    </figure>
  );
};
