import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Upload, Replace } from 'lucide-react';
import type { MediaSlot, MediaSlotKey } from '../types/catalogue';
import { STAGE_LABELS } from '../data/garments';
import { readImageFileAsDataUrl } from '../utils/media';

interface MediaPlateProps {
  slotKey: MediaSlotKey;
  slot: MediaSlot;
  aspectClass: string;
  titleLabel: string;
  editMode: boolean;
  showBlankGuides?: boolean;
  compact?: boolean;
  onReplaceFile?: (slotKey: MediaSlotKey, dataUrl: string) => void;
  onInspect?: (slot: MediaSlot, titleLabel: string) => void;
  onOpenEditor?: (slotKey: MediaSlotKey) => void;
}

export const MediaPlate: React.FC<MediaPlateProps> = ({
  slotKey,
  slot,
  aspectClass,
  titleLabel,
  editMode,
  showBlankGuides = true,
  compact = false,
  onReplaceFile,
  onInspect,
  onOpenEditor,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [slot.url]);

  const hasImage = Boolean(slot.url && !imgError);
  const isSessionLocal = slot.isSessionDrop || slot.url.startsWith('data:');

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
    if (hasImage && !editMode && onInspect) {
      onInspect(slot, titleLabel);
      return;
    }
    if (onReplaceFile) {
      fileInputRef.current?.click();
    } else if (onOpenEditor) {
      onOpenEditor(slotKey);
    }
  };

  return (
    <figure className="flex flex-col">
      <div
        role="button"
        tabIndex={0}
        onClick={handlePlateClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handlePlateClick();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!isDragging) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        aria-label={
          hasImage
            ? editMode
              ? `Replace ${titleLabel} image`
              : `Inspect ${titleLabel} image`
            : `Drop or upload image for ${titleLabel}`
        }
        className={`group relative w-full overflow-hidden border transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A] ${aspectClass} ${
          isDragging
            ? 'border-[#0A0A0A] bg-[#F2F2F2]'
            : hasImage
              ? 'border-[#E5E5E5] bg-[#FAFAFA]'
              : 'border-[#E5E5E5] plate-blueprint-bg hover:border-[var(--metallic)]'
        }`}
      >
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

        {/* Subtle metallic architectural corner registration ticks */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-2.5 left-2.5 h-2.5 w-2.5 border-t border-l metallic-frame-tick z-10"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-2.5 right-2.5 h-2.5 w-2.5 border-t border-r metallic-frame-tick z-10"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-2.5 left-2.5 h-2.5 w-2.5 border-b border-l metallic-frame-tick z-10"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-2.5 right-2.5 h-2.5 w-2.5 border-b border-r metallic-frame-tick z-10"
        />

        {hasImage ? (
          <>
            <img
              src={slot.url}
              alt={`${titleLabel} — ${slot.caption}`}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.015]"
            />
            {/* Measured hover affordance bar */}
            <div className="no-print pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/75 via-black/40 to-transparent px-4 py-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <span className="text-xs font-medium text-white tracking-wide">
                {editMode ? 'Drop or click to replace asset' : 'Inspect macro detail (drop to replace)'}
              </span>
              {editMode ? (
                <Replace className="h-3.5 w-3.5 text-white" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5 text-white" />
              )}
            </div>
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center px-5 text-center">
            {/* Whisper-thin architectural crosshair */}
            <div
              aria-hidden="true"
              className="mb-3 flex h-8 w-8 items-center justify-center"
            >
              <span className="relative block h-6 w-6">
                <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[var(--metallic-hairline)]" />
                <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[var(--metallic-hairline)]" />
                <span className="absolute top-1/2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 border border-[var(--metallic-soft)] bg-white" />
              </span>
            </div>

            {showBlankGuides && (
              <>
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

            <div className="no-print mt-4 inline-flex items-center gap-1.5 border-b border-transparent pb-0.5 text-[11px] font-medium text-[#525252] transition-colors duration-200 group-hover:border-[#0A0A0A] group-hover:text-[#0A0A0A]">
              <Upload className="h-3 w-3" />
              <span>{isDragging ? 'Release to preview in session' : 'Drop or click to place image'}</span>
            </div>
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
