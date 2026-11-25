import React, { useMemo, useRef, useState } from 'react';
import { Check, Copy, Download, RotateCcw, Upload, X } from 'lucide-react';
import type { GarmentItem } from '../types/catalogue';
import {
  buildFramingBundle,
  countCustomFramingEdits,
  parseFramingBundle,
  type CatalogueFramingBundle,
} from '../utils/cropPresetIo';

interface CropPresetModalProps {
  open: boolean;
  garments: GarmentItem[];
  onClose: () => void;
  onApplyBundle: (bundle: CatalogueFramingBundle, mode: 'merge' | 'replace') => void;
  onResetAllCrops: () => void;
}

export const CropPresetModal: React.FC<CropPresetModalProps> = ({
  open,
  garments,
  onClose,
  onApplyBundle,
  onResetAllCrops,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pasteText, setPasteText] = useState('');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const stats = useMemo(() => countCustomFramingEdits(garments), [garments]);
  const bundle = useMemo(() => buildFramingBundle(garments), [garments]);
  const bundleJson = useMemo(() => JSON.stringify(bundle, null, 2), [bundle]);

  if (!open) return null;

  const handleDownload = () => {
    const blob = new Blob([bundleJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dt-catalogue-crops.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bundleJson);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setErrorText('Clipboard access was blocked. Use Download JSON or copy from the preview below.');
    }
  };

  const handleApplyRaw = (raw: string) => {
    setErrorText(null);
    if (!raw.trim()) {
      setErrorText('Paste or upload a framing JSON preset first.');
      return;
    }
    try {
      const parsed = parseFramingBundle(raw);
      onApplyBundle(parsed, importMode);
      setPasteText('');
      onClose();
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : 'Unable to parse JSON preset.');
    }
  };

  const handleFileUpload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      handleApplyRaw(String(reader.result || ''));
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Import and export crop and zoom values"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col border border-[#E5E5E5] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#E5E5E5] px-6 py-4">
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--metallic-strong)]">
              Workbench Framing Presets
            </p>
            <h3 className="mt-0.5 font-serif text-2xl font-normal tracking-tight text-[#0A0A0A]">
              Import &amp; Export Crop / Zoom Edits
            </h3>
            <p className="mt-1 text-xs text-[#55534E]">
              Save lightweight crop, pan, and zoom values (plus switched fabric swatch colors) as JSON to share with your team.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close framing presets dialog"
            className="shrink-0 p-1.5 text-[#525252] transition-colors hover:text-[#0A0A0A] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {/* Active Framing Summary */}
          <div className="grid grid-cols-3 gap-3 border border-[#E6E4DE] bg-[#FAF9F5] p-3.5 text-center">
            <div>
              <span className="block font-mono text-lg font-semibold text-[#111111] tabular-nums">
                {stats.cropCount}
              </span>
              <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#66645F]">
                Framed Plates
              </span>
            </div>
            <div>
              <span className="block font-mono text-lg font-semibold text-[#111111] tabular-nums">
                {stats.styleCount}
              </span>
              <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#66645F]">
                Styles Edited
              </span>
            </div>
            <div>
              <span className="block font-mono text-lg font-semibold text-[#111111] tabular-nums">
                {stats.swatchCount}
              </span>
              <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#66645F]">
                Swatch Overrides
              </span>
            </div>
          </div>

          {/* Export Section */}
          <section className="space-y-3 border-b border-[#EFEFEF] pb-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-semibold text-[#0A0A0A]">Export Current Framing</h4>
                <p className="text-[11px] text-[#66645F]">
                  Exports only modified crop/zoom values and selected swatch colors—no heavy image files.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 border border-[#DCDAD3] bg-white px-3 py-1.5 text-xs font-medium text-[#111111] transition-colors hover:border-[#0A0A0A] cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 bg-[#0A0A0A] px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#262626] cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download .json</span>
                </button>
              </div>
            </div>

            <details className="border border-[#ECEAE4] bg-[#FCFCFA]">
              <summary className="cursor-pointer px-3 py-2 font-mono text-[10.5px] text-[#55534E]">
                Preview export JSON ({bundle.totalEditedSlots} crop entries)
              </summary>
              <pre className="max-h-36 overflow-auto border-t border-[#ECEAE4] p-3 font-mono text-[10px] leading-relaxed text-[#292824]">
                {bundleJson}
              </pre>
            </details>
          </section>

          {/* Import Section */}
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-semibold text-[#0A0A0A]">Import Framing JSON</h4>
                <p className="text-[11px] text-[#66645F]">
                  Load a teammate&apos;s crop JSON file or paste the JSON payload below.
                </p>
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(e) => {
                    handleFileUpload(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 border border-[#0A0A0A] bg-white px-3 py-1.5 text-xs font-medium text-[#0A0A0A] transition-colors hover:bg-[#0A0A0A] hover:text-white cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload .json File</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#404040]">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="crop-import-mode"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="accent-[#0A0A0A]"
                />
                <span>Merge with current edits</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="crop-import-mode"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="accent-[#0A0A0A]"
                />
                <span>Replace all crops across catalogue</span>
              </label>
            </div>

            <textarea
              rows={5}
              value={pasteText}
              onChange={(e) => {
                setPasteText(e.target.value);
                if (errorText) setErrorText(null);
              }}
              placeholder='Paste framing JSON here (e.g. { "format": "dream-tomorrow-framing-v1", "crops": { ... } })'
              className="w-full border border-[#DCDAD3] bg-white p-3 font-mono text-[11px] leading-relaxed text-[#0A0A0A] placeholder:text-[#99968E] focus:border-[#0A0A0A] focus:outline-none"
            />

            {errorText && (
              <p className="border border-[#B91C1C]/30 bg-[#FEF2F2] px-3 py-2 text-xs text-[#991B1B]">
                {errorText}
              </p>
            )}

            <div className="flex items-center justify-between gap-3 pt-1">
              {stats.cropCount > 0 ? (
                confirmReset ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#991B1B]">Reset all {stats.cropCount} crops?</span>
                    <button
                      type="button"
                      onClick={() => {
                        onResetAllCrops();
                        setConfirmReset(false);
                      }}
                      className="border border-[#991B1B] bg-[#991B1B] px-2.5 py-1 text-[11px] font-medium text-white cursor-pointer"
                    >
                      Confirm Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="text-[11px] text-[#55534E] underline cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmReset(true)}
                    className="inline-flex items-center gap-1 text-[11px] text-[#77756F] hover:text-[#0A0A0A] cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset All Crops</span>
                  </button>
                )
              ) : (
                <span />
              )}

              <button
                type="button"
                disabled={!pasteText.trim()}
                onClick={() => handleApplyRaw(pasteText)}
                className="bg-[#0A0A0A] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#262626] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                Apply Pasted JSON
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
