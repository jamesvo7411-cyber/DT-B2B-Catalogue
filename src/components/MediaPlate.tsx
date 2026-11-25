import React, { useEffect, useRef, useState } from 'react';
import { Crop, Maximize2, Move, Palette, Replace, RotateCcw, Upload } from 'lucide-react';
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
  allowReframe?: boolean;
  showBlankGuides?: boolean;
  compact?: boolean;
  fullHeight?: boolean;
  displayScale?: number;
  topOverlay?: React.ReactNode;
  imageOverlay?: React.ReactNode;
  overlayMode?: 'gradient' | 'card';
  customActionLabel?: string;
  onCustomClick?: () => void;
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
  allowReframe = false,
  showBlankGuides = true,
  compact = false,
  fullHeight = false,
  displayScale = 1,
  topOverlay,
  imageOverlay,
  overlayMode = 'gradient',
  customActionLabel,
  onCustomClick,
  onReplaceFile,
  onUpdateCrop,
  onInspect,
  onOpenEditor,
  onImageUnavailable,
}) => {
  const minScale = Math.max(1, displayScale || 1);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    clientX: number;
    clientY: number;
    width: number;
    height: number;
    naturalWidth: number;
    naturalHeight: number;
    crop: Required<ImageCrop>;
  } | null>(null);
  const cropDraftRef = useRef(normalizeImageCrop(slot.crop, minScale));
  const [isDragging, setIsDragging] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [cropMode, setCropMode] = useState(false);
  const [cropDraft, setCropDraft] = useState(() => normalizeImageCrop(slot.crop, minScale));

  useEffect(() => {
    setImgError(false);
    setUseFallback(false);
  }, [slot.url, slot.fallbackUrl]);

  useEffect(() => {
    const crop = normalizeImageCrop(slot.crop, minScale);
    cropDraftRef.current = crop;
    setCropDraft(crop);
  }, [slot.crop, minScale]);

  useEffect(() => {
    if (!editMode && !allowReframe) setCropMode(false);
  }, [editMode, allowReframe]);

  const activeUrl = useFallback && slot.fallbackUrl ? slot.fallbackUrl : slot.url;
  const hasImage = Boolean(activeUrl && !imgError);
  const isSessionLocal = slot.isSessionDrop || activeUrl.startsWith('data:');
  const canReframe = Boolean(interactive && (allowReframe || (editMode && editable)) && onUpdateCrop && hasImage);
  const currentCrop = normalizeImageCrop(cropMode ? cropDraft : slot.crop, minScale);
  const displayedImageStyle = imageCropStyle(currentCrop, minScale);

  const hasCustomFraming =
    Math.abs(currentCrop.scale - minScale) >= 0.01 ||
    Math.abs(currentCrop.x) >= 0.2 ||
    Math.abs(currentCrop.y) >= 0.2 ||
    Math.abs(currentCrop.posX - 50) >= 0.5 ||
    Math.abs(currentCrop.posY - 50) >= 0.5;

  const setDraft = (crop: Partial<ImageCrop>) => {
    const normalized = normalizeImageCrop(crop, minScale);
    cropDraftRef.current = normalized;
    setCropDraft(normalized);
  };

  const commitCrop = () => {
    onUpdateCrop?.(slotKey, cropDraftRef.current);
  };

  const handleCropPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !hasImage) return;
    if (event.target instanceof HTMLElement && event.target.closest('[data-crop-controls]')) return;

    event.preventDefault();
    event.stopPropagation();
    const bounds = event.currentTarget.getBoundingClientRect();
    const imgEl = imgRef.current;
    dragRef.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      width: Math.max(1, bounds.width),
      height: Math.max(1, bounds.height),
      naturalWidth: imgEl?.naturalWidth || Math.max(1, bounds.width),
      naturalHeight: imgEl?.naturalHeight || Math.max(1, bounds.height),
      crop: cropDraftRef.current,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleCropPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const dx = event.clientX - drag.clientX;
    const dy = event.clientY - drag.clientY;

    const coverScale = Math.max(drag.width / drag.naturalWidth, drag.height / drag.naturalHeight);
    const renderedW = drag.naturalWidth * coverScale;
    const renderedH = drag.naturalHeight * coverScale;
    const slackX = Math.max(0, renderedW - drag.width);
    const slackY = Math.max(0, renderedH - drag.height);

    let nextScale = drag.crop.scale;
    let nextPosX = drag.crop.posX;
    let nextPosY = drag.crop.posY;
    let nextX = drag.crop.x;
    let nextY = drag.crop.y;

    const atMinScale = drag.crop.scale <= minScale + 0.005;
    if (atMinScale) {
      // Shift natural aspect-ratio overflow via object-position first so 1x framing works seamlessly
      if (slackX > 4) {
        nextPosX = Math.min(100, Math.max(0, drag.crop.posX - (dx / slackX) * 100));
      }
      if (slackY > 4) {
        nextPosY = Math.min(100, Math.max(0, drag.crop.posY - (dy / slackY) * 100));
      }
      // If user drags along a flush edge with zero overflow slack, ease zoom slightly so movement stays responsive
      const needsHorizontalPan = Math.abs(dx) > 4 && slackX <= 4;
      const needsVerticalPan = Math.abs(dy) > 4 && slackY <= 4;
      if (needsHorizontalPan || needsVerticalPan) {
        nextScale = Math.min(3.5, Math.max(minScale, Number((drag.crop.scale * 1.18).toFixed(2))));
      }
    }

    if (nextScale > 1.005) {
      nextX = drag.crop.x + (dx / drag.width) * (100 / nextScale);
      nextY = drag.crop.y + (dy / drag.height) * (100 / nextScale);
    }

    setDraft({
      scale: nextScale,
      x: nextX,
      y: nextY,
      posX: nextPosX,
      posY: nextPosY,
    });
  };

  const handleCropPointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) return;
    dragRef.current = null;
    commitCrop();
  };

  const handleCropWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!cropMode) return;
    event.preventDefault();
    event.stopPropagation();
    const delta = event.deltaY < 0 ? 0.08 : -0.08;
    const next = normalizeImageCrop(
      { ...cropDraftRef.current, scale: cropDraftRef.current.scale + delta },
      minScale
    );
    setDraft(next);
    onUpdateCrop?.(slotKey, next);
  };

  const handleCropKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!cropMode) return;
    const step = event.shiftKey ? 5 : 1.5;
    let handled = true;
    const cur = cropDraftRef.current;
    let next = { ...cur };

    if (event.key === 'ArrowLeft') {
      if (cur.scale > 1.005) next.x -= step;
      else next.posX += step * 2;
    } else if (event.key === 'ArrowRight') {
      if (cur.scale > 1.005) next.x += step;
      else next.posX -= step * 2;
    } else if (event.key === 'ArrowUp') {
      if (cur.scale > 1.005) next.y -= step;
      else next.posY += step * 2;
    } else if (event.key === 'ArrowDown') {
      if (cur.scale > 1.005) next.y += step;
      else next.posY -= step * 2;
    } else if (event.key === 'Escape' || event.key === 'Enter') {
      commitCrop();
      setCropMode(false);
    } else {
      handled = false;
    }

    if (handled) {
      event.preventDefault();
      event.stopPropagation();
      const normalized = normalizeImageCrop(next, minScale);
      setDraft(normalized);
      onUpdateCrop?.(slotKey, normalized);
    }
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
    if (onCustomClick) {
      onCustomClick();
      return;
    }
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

  const canTriggerPlateAction = interactive && (editable || hasImage || Boolean(onCustomClick));

  return (
    <figure className={`flex flex-col ${fullHeight ? 'h-full w-full flex-1' : ''}`}>
      <div
        role="group"
        aria-label={titleLabel}
        onDragOver={
          interactive && editable && onReplaceFile
            ? (e) => {
                e.preventDefault();
                if (!isDragging) setIsDragging(true);
              }
            : undefined
        }
        onDragLeave={interactive && editable && onReplaceFile ? () => setIsDragging(false) : undefined}
        onDrop={interactive && editable && onReplaceFile ? handleDrop : undefined}
        className={`group relative w-full overflow-hidden transition-colors duration-200 ${
          fullHeight ? 'h-full flex-1' : ''
        } ${
          canTriggerPlateAction
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
        {interactive && editable && onReplaceFile && (
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
        )}

        {canTriggerPlateAction && !cropMode && (
          <button
            type="button"
            onClick={handlePlateClick}
            aria-label={
              onCustomClick
                ? `${customActionLabel || 'Select color'} for ${titleLabel}`
                : !editable
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
          <img
            ref={imgRef}
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
            className={`h-full w-full object-cover select-none ${
              cropMode ? 'transition-none' : 'transition-transform duration-300 ease-out'
            }`}
          />
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
                <span>
                  {onCustomClick
                    ? customActionLabel || 'Choose swatch color'
                    : isDragging
                      ? 'Release to preview in session'
                      : 'Drop or click to place image'}
                </span>
              </div>
            )}
          </div>
        )}

        {topOverlay && (
          <div className="pointer-events-none absolute inset-x-4 top-4 z-10 sm:inset-x-5 sm:top-5">
            {topOverlay}
          </div>
        )}

        {imageOverlay && (
          overlayMode === 'card' ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#F7F6F2]/94 via-[#F7F6F2]/76 via-58% to-transparent px-4 pb-3.5 pt-20 text-[#0A0A0A] sm:px-5 sm:pb-4">
              <div className="pointer-events-auto">{imageOverlay}</div>
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

        {/* Active Crop / Move Guides & Toolbar */}
        {cropMode && (
          <>
            {/* Rule-of-thirds visual crop grid */}
            <div
              aria-hidden="true"
              className="no-print pointer-events-none absolute inset-0 z-20 ring-2 ring-[#0A0A0A] ring-inset"
            >
              <span className="absolute inset-y-0 left-1/3 w-px bg-black/15" />
              <span className="absolute inset-y-0 left-2/3 w-px bg-black/15" />
              <span className="absolute inset-x-0 top-1/3 h-px bg-black/15" />
              <span className="absolute inset-x-0 top-2/3 h-px bg-black/15" />
            </div>

            {/* Interactive Pointer Pan & Wheel Zoom Surface */}
            <div
              tabIndex={0}
              role="application"
              aria-label={`Drag to move or scroll to zoom ${titleLabel}. Use arrow keys for fine positioning, Enter when done.`}
              className="no-print absolute inset-0 z-[25] touch-none cursor-grab active:cursor-grabbing focus:outline-none"
              onPointerDown={handleCropPointerDown}
              onPointerMove={handleCropPointerMove}
              onPointerUp={handleCropPointerEnd}
              onPointerCancel={handleCropPointerEnd}
              onWheel={handleCropWheel}
              onKeyDown={handleCropKeyDown}
            />

            {/* Floating Crop & Zoom Controls Bar */}
            <div
              data-crop-controls
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
              className={`no-print absolute z-30 flex flex-wrap items-center gap-1.5 border border-[#DCDAD3] bg-white/96 px-2.5 py-1.5 text-[#111111] shadow-md backdrop-blur-sm ${
                overlayMode === 'card' ? 'top-3 right-3' : 'top-2 left-2 right-2 justify-between'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Move className="h-3 w-3 shrink-0 text-[#55534E]" />
                <label className="flex items-center gap-1.5">
                  <span className="font-mono text-[9px] text-[#55534E]">ZOOM</span>
                  <input
                    type="range"
                    min={minScale}
                    max="3.5"
                    step="0.01"
                    value={cropDraft.scale}
                    aria-label={`Zoom ${titleLabel} image`}
                    onChange={(event) =>
                      setDraft({ ...cropDraftRef.current, scale: Number(event.target.value) })
                    }
                    onPointerUp={commitCrop}
                    onKeyUp={commitCrop}
                    onBlur={commitCrop}
                    className="w-16 sm:w-20 accent-[#111111]"
                  />
                  <span className="w-8 font-mono text-[9px] tabular-nums">
                    {cropDraft.scale.toFixed(2)}×
                  </span>
                </label>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const resetCrop: ImageCrop = { scale: minScale, x: 0, y: 0, posX: 50, posY: 50 };
                    setDraft(resetCrop);
                    onUpdateCrop?.(slotKey, resetCrop);
                  }}
                  aria-label={`Reset crop for ${titleLabel}`}
                  title="Reset framing"
                  className="inline-flex items-center gap-1 px-1.5 py-1 text-[9px] text-[#404040] hover:bg-[#F0EFEC] cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    commitCrop();
                    setCropMode(false);
                  }}
                  className="bg-[#0A0A0A] px-2 py-1 text-[9px] font-semibold text-white hover:bg-[#262626] cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </>
        )}

        {/* Non-overlapping Workbench Action Pill Group (when not actively cropping) */}
        {interactive && hasImage && !cropMode && (
          <div
            className={`no-print absolute z-20 flex items-center gap-1.5 transition-opacity duration-200 ${
              overlayMode === 'card'
                ? 'top-3 right-3 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100'
                : 'top-2 left-2 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100'
            }`}
          >
            {canReframe && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setDraft(normalizeImageCrop(slot.crop, minScale));
                  setCropMode(true);
                }}
                aria-label={`Move and crop ${titleLabel}`}
                className="inline-flex items-center gap-1 border border-[#DCDAD3] bg-white/95 px-2 py-1 text-[9.5px] font-medium text-[#111111] shadow-xs transition-colors hover:border-[#0A0A0A] hover:bg-white cursor-pointer"
              >
                <Crop className="h-3 w-3" />
                <span>{hasCustomFraming ? 'Framed' : 'Move / Crop'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handlePlateClick();
              }}
              className="inline-flex items-center gap-1 border border-[#DCDAD3] bg-white/95 px-2 py-1 text-[9.5px] font-medium text-[#111111] shadow-xs transition-colors hover:border-[#0A0A0A] hover:bg-white cursor-pointer"
            >
              {onCustomClick ? (
                <>
                  <Palette className="h-3 w-3" />
                  <span>{customActionLabel || 'Switch color'}</span>
                </>
              ) : editMode && editable ? (
                <>
                  <Replace className="h-3 w-3" />
                  <span>Replace</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-3 w-3" />
                  <span>Inspect</span>
                </>
              )}
            </button>
          </div>
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

