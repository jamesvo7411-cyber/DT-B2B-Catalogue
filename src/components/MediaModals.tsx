import React, { useState } from 'react';
import { Printer, X, ZoomIn, ZoomOut, Film, Check } from 'lucide-react';
import type {
  GarmentItem,
  MediaSlot,
  PrintConfig,
  PrintScope,
} from '../types/catalogue';
import { STAGE_LABELS } from '../data/garments';
import { parseVideoUrl } from '../utils/media';

/* ==========================================================================
   1. MACRO LIGHTBOX MODAL (Inspect close-up pocket / seam / swatch plates)
   ========================================================================== */
export const MacroLightboxModal: React.FC<{
  item: { slot: MediaSlot; titleLabel: string; garmentTitle: string } | null;
  onClose: () => void;
}> = ({ item, onClose }) => {
  const [zoomed, setZoomed] = useState(false);

  if (!item) return null;

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-0 sm:bg-black/80 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Macro inspection: ${item.titleLabel}`}
      onClick={onClose}
    >
      <div
        className="relative flex h-full max-h-[100dvh] w-full max-w-none flex-col border border-[#262626] bg-white sm:h-auto sm:max-h-[90vh] sm:max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 border-b border-[#E5E5E5] px-3 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0 pr-4">
            <p className="truncate font-mono text-[9px] text-[#737373] sm:text-[11px]">
              {item.garmentTitle} · {STAGE_LABELS[item.slot.stage]}
            </p>
            <h3 className="truncate font-serif text-base italic text-[#0A0A0A] sm:text-xl">
              {item.slot.caption}
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setZoomed((z) => !z)}
              className="inline-flex shrink-0 items-center gap-1 border border-[#E5E5E5] px-2 py-1.5 text-[10px] font-medium text-[#0A0A0A] hover:border-[#0A0A0A] sm:gap-1.5 sm:px-3 sm:text-xs"
            >
              {zoomed ? <ZoomOut className="h-3.5 w-3.5" /> : <ZoomIn className="h-3.5 w-3.5" />}
              <span>{zoomed ? '100% Fit' : '200% Macro'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close inspection view"
              className="shrink-0 p-2 text-[#525252] hover:text-[#0A0A0A]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          className="min-h-0 flex-1 overflow-auto bg-[#FAFAFA] p-2 sm:p-6"
          style={{ touchAction: 'pan-x pan-y pinch-zoom' }}
        >
          <div className="flex min-h-full items-center justify-center">
            <img
              src={item.slot.url}
              alt={item.slot.caption}
              referrerPolicy="no-referrer"
              className={`transition-transform duration-300 ease-out ${
                zoomed
                  ? 'max-h-none w-auto max-w-none scale-[1.75] cursor-zoom-out'
                  : 'max-h-[calc(100dvh-150px)] max-w-full object-contain cursor-zoom-in sm:max-h-[65vh]'
              }`}
              onClick={() => setZoomed((z) => !z)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#E5E5E5] px-3 py-2 text-[10px] text-[#737373] sm:px-6 sm:py-3 sm:text-xs">
          <span className="min-w-0 truncate">{item.slot.note}</span>
          <span className="shrink-0 font-mono tabular-nums">{item.slot.aspectLabel}</span>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   2. EMBEDDED VIDEO STUDY MODAL (Attach or Play YouTube / Vimeo / MP4)
   ========================================================================== */
export const VideoStudyModal: React.FC<{
  garment: GarmentItem | null;
  onClose: () => void;
  onSaveVideo: (garmentId: string, videoUrl: string, videoTitle: string) => void;
}> = ({ garment, onClose, onSaveVideo }) => {
  const [urlInput, setUrlInput] = useState(garment?.videoUrl ?? '');
  const [titleInput, setTitleInput] = useState(garment?.videoTitle ?? '');

  React.useEffect(() => {
    if (garment) {
      setUrlInput(garment.videoUrl);
      setTitleInput(garment.videoTitle);
    }
  }, [garment]);

  if (!garment) return null;

  const parsed = parseVideoUrl(urlInput);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveVideo(garment.id, urlInput.trim(), titleInput.trim() || `${garment.sku} Motion Study`);
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Motion study for ${garment.sku}`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white border border-[#E5E5E5] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E5E5E5] px-6 py-4">
          <div>
            <p className="font-mono text-[11px] text-[var(--metallic-strong)] tabular-nums">
              {garment.sku} · Online Interactive Element
            </p>
            <h3 className="font-sans text-xl font-semibold tracking-tight text-[#0A0A0A]">
              {titleInput || `${garment.sku} Drape & Movement Study`}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close video modal"
            className="p-2 text-[#525252] hover:text-[#0A0A0A] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video Frame */}
        <div className="aspect-video w-full border-b border-[#E5E5E5] bg-[#FAFAFA]">
          {parsed.type === 'youtube' || parsed.type === 'vimeo' ? (
            <iframe
              src={parsed.embedUrl}
              title={titleInput || garment.sku}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : parsed.type === 'direct' ? (
            <video
              src={parsed.embedUrl}
              controls
              className="h-full w-full bg-black object-contain"
            />
          ) : (
            <div className="plate-blueprint-bg flex h-full w-full flex-col items-center justify-center px-8 text-center">
              <Film className="h-6 w-6 text-[var(--metallic-strong)]" />
              <p className="mt-3 font-sans text-base font-semibold text-[#0A0A0A]">
                16:9 Embedded Motion Frame
              </p>
              <p className="mt-1.5 max-w-[44ch] text-xs leading-relaxed text-[#737373]">
                Attach a YouTube, Vimeo, or direct MP4 link below to embed a fabric drape, seam flex, or runway study directly into this B2B garment spread.
              </p>
            </div>
          )}
        </div>

        {/* Inline Video Attachment Form */}
        <form onSubmit={handleSave} className="space-y-3 px-6 py-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="Video study title"
              className="border border-[#E5E5E5] px-3 py-2 text-xs text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none"
            />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste YouTube, Vimeo, or MP4 URL..."
              className="sm:col-span-2 border border-[#E5E5E5] px-3 py-2 font-mono text-xs text-[#0A0A0A] placeholder:text-[#A3A3A3] focus:border-[#0A0A0A] focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#737373]">
              In printed PDFs, attached video URLs render as clickable motion reference links.
            </span>
            <div className="flex items-center gap-2">
              {garment.videoUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setUrlInput('');
                    onSaveVideo(garment.id, '', titleInput);
                  }}
                  className="border border-[#E5E5E5] px-3 py-1.5 text-xs text-[#525252] hover:border-[#0A0A0A] hover:text-[#0A0A0A] cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 bg-[#0A0A0A] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#262626] cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Save Embed</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ==========================================================================
   3. HIGH-RESOLUTION PDF EXPORT MODAL
   ========================================================================== */
export const ExportPdfModal: React.FC<{
  open: boolean;
  config: PrintConfig;
  totalCount: number;
  categoryName: string;
  categoryCount: number;
  shortlistCount: number;
  currentGarmentSku: string;
  onUpdateConfig: (next: Partial<PrintConfig>) => void;
  onClose: () => void;
  onPreviewSheets: () => void;
  onExecutePrint: () => void;
}> = ({
  open,
  config,
  totalCount,
  categoryName,
  categoryCount,
  shortlistCount,
  currentGarmentSku,
  onUpdateConfig,
  onClose,
  onPreviewSheets,
  onExecutePrint,
}) => {
  if (!open) return null;

  const scopes: { id: PrintScope; label: string; detail: string; disabled?: boolean }[] = [
    {
      id: 'all',
      label: `Complete Catalogue (${totalCount} styles)`,
      detail: `Cover, index, and all ${totalCount} craftsmanship spreads`,
    },
    {
      id: 'category',
      label: `Active Chapter: ${categoryName} (${categoryCount} items)`,
      detail: 'Export only the currently filtered category',
    },
    {
      id: 'shortlist',
      label: `Sample Shortlist (${shortlistCount} items)`,
      detail: shortlistCount > 0 ? 'Bespoke buyer selection sheet' : 'Shortlist items first to enable',
      disabled: shortlistCount === 0,
    },
    {
      id: 'current',
      label: `Single Garment Sheet (${currentGarmentSku})`,
      detail: 'One-page craftsmanship specification sheet',
    },
  ];

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Export High-Resolution PDF"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white border border-[#E5E5E5] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E5E5E5] px-6 py-5">
          <div>
            <p className="font-mono text-[11px] text-[var(--metallic-strong)]">
              Vector Print Engine
            </p>
            <h3 className="mt-0.5 font-sans text-xl font-semibold tracking-tight text-[#0A0A0A]">
              Export High-Resolution PDF
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close export dialog"
            className="p-2 text-[#525252] hover:text-[#0A0A0A] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          {/* Export Scope */}
          <div>
            <p className="mb-2.5 text-xs font-semibold text-[#0A0A0A]">Export Scope</p>
            <div className="space-y-2">
              {scopes.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  disabled={s.disabled}
                  onClick={() => onUpdateConfig({ scope: s.id })}
                  className={`flex w-full items-center justify-between border px-3.5 py-2.5 text-left transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-45 ${
                    config.scope === s.id
                      ? 'border-[#0A0A0A] bg-[#FAFAFA]'
                      : 'border-[#E5E5E5] bg-white hover:border-[#A3A3A3]'
                  }`}
                >
                  <div>
                    <p className="text-xs font-medium text-[#0A0A0A]">{s.label}</p>
                    <p className="text-[11px] text-[#737373]">{s.detail}</p>
                  </div>
                  <span
                    className={`h-3.5 w-3.5 border ${
                      config.scope === s.id
                        ? 'border-[#0A0A0A] bg-[#0A0A0A]'
                        : 'border-[#CCCCCC] bg-white'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Orientation & Print Options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold text-[#0A0A0A]">Page Orientation</p>
              <div className="flex border border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => onUpdateConfig({ orientation: 'landscape' })}
                  className={`flex-1 py-2 text-xs font-medium cursor-pointer ${
                    config.orientation === 'landscape'
                      ? 'bg-[#0A0A0A] text-white'
                      : 'text-[#525252] hover:text-[#0A0A0A]'
                  }`}
                >
                  Landscape
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateConfig({ orientation: 'portrait' })}
                  className={`flex-1 py-2 text-xs font-medium cursor-pointer ${
                    config.orientation === 'portrait'
                      ? 'bg-[#0A0A0A] text-white'
                      : 'text-[#525252] hover:text-[#0A0A0A]'
                  }`}
                >
                  Portrait
                </button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-[#0A0A0A]">Sheet Options</p>
              <div className="space-y-1.5 text-xs text-[#404040]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showCropMarks}
                    onChange={(e) => onUpdateConfig({ showCropMarks: e.target.checked })}
                    className="accent-[#0A0A0A]"
                  />
                  <span>Print crop &amp; spine marks</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showSafeZones}
                    onChange={(e) => onUpdateConfig({ showSafeZones: e.target.checked })}
                    className="accent-[#0A0A0A]"
                  />
                  <span>Show binding safe zones</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.includeCover}
                    onChange={(e) => onUpdateConfig({ includeCover: e.target.checked })}
                    className="accent-[#0A0A0A]"
                  />
                  <span>Include cover &amp; TOC</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.includeFabrics}
                    onChange={(e) => onUpdateConfig({ includeFabrics: e.target.checked })}
                    className="accent-[#0A0A0A]"
                  />
                  <span>Include fabric swatches</span>
                </label>
              </div>
            </div>
          </div>

          <p className="border-t border-[#F0F0F0] pt-4 text-[11px] leading-relaxed text-[#737373]">
            In the print dialog, choose <strong>Save as PDF</strong> and enable <strong>Background graphics</strong> to retain hairline metallic rules, vector typography, and clickable B2B product links at full print resolution.
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-[#E5E5E5] px-6 py-4">
          <button
            type="button"
            onClick={onPreviewSheets}
            className="text-xs font-medium text-[#525252] underline-offset-4 hover:text-[#0A0A0A] hover:underline cursor-pointer"
          >
            Preview Print Sheets
          </button>
          <button
            type="button"
            onClick={onExecutePrint}
            className="inline-flex items-center gap-2 bg-[#0A0A0A] px-5 py-2 text-xs font-medium text-white transition-colors hover:bg-[#262626] cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Save High-Res PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
