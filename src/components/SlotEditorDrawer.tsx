import React, { useState } from 'react';
import { Trash2, Upload, X } from 'lucide-react';
import type {
  AssetStage,
  GarmentItem,
  MediaSlotKey,
} from '../types/catalogue';
import { readImageFileAsDataUrl } from '../utils/media';

interface SlotEditorDrawerProps {
  garment: GarmentItem | null;
  initialFocusSlot?: MediaSlotKey;
  onClose: () => void;
  onUpdateGarment: (updated: GarmentItem) => void;
  onOpenFabricColorPicker?: (garment: GarmentItem) => void;
}

const SLOT_META: { key: MediaSlotKey; label: string; hint: string }[] = [
  { key: 'hero', label: 'Primary Silhouette (3:4)', hint: 'Full front garment shot' },
  { key: 'pocket', label: 'Pocket & Placket Detail (4:3)', hint: 'Welt, bar-tack & placket close-up' },
  { key: 'seam', label: 'Inner Seam & Binding (4:3)', hint: 'Interior stitch & seam durability' },
  { key: 'swatch', label: 'Auto-Linked Fabric Image (1:1)', hint: 'Shared fabric-family image from the Fabric Library' },
  { key: 'custom', label: 'Custom Fit / Label / Trim (4:3)', hint: 'Optional care label, hardware, or fit note' },
];

export const SlotEditorDrawer: React.FC<SlotEditorDrawerProps> = ({
  garment,
  initialFocusSlot,
  onClose,
  onUpdateGarment,
  onOpenFabricColorPicker,
}) => {
  const [activeTab, setActiveTab] = useState<'media' | 'specs'>(
    initialFocusSlot ? 'media' : 'media'
  );

  if (!garment) return null;

  const updateField = <K extends keyof GarmentItem>(key: K, value: GarmentItem[K]) => {
    onUpdateGarment({ ...garment, [key]: value });
  };

  const updateSpec = <K extends keyof GarmentItem['specs']>(
    key: K,
    value: GarmentItem['specs'][K]
  ) => {
    onUpdateGarment({
      ...garment,
      specs: { ...garment.specs, [key]: value },
    });
  };

  const updateMedia = (
    slotKey: MediaSlotKey,
    patch: Partial<GarmentItem['media'][MediaSlotKey]>
  ) => {
    onUpdateGarment({
      ...garment,
      media: {
        ...garment.media,
        [slotKey]: {
          ...garment.media[slotKey],
          ...patch,
        },
      },
    });
  };

  const handleFileUpload = async (slotKey: MediaSlotKey, file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    const dataUrl = await readImageFileAsDataUrl(file);
    const currentStage = garment.media[slotKey].stage;
    updateMedia(slotKey, {
      url: dataUrl,
      stage: currentStage === 'blank' ? 'ai-concept' : currentStage,
    });
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 flex justify-end bg-black/35 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label={`Edit ${garment.sku}`}
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-xl flex-col bg-white border-l border-[#E5E5E5] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-[#E5E5E5] px-6 py-5">
          <div>
            <p className="font-mono text-[11px] text-[var(--metallic-strong)] tabular-nums">
              {garment.sku} · {garment.category}
            </p>
            <h2 className="mt-0.5 font-sans text-xl font-semibold tracking-tight text-[#0A0A0A]">
              Product Assets &amp; Specifications
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close editor"
            className="p-2 text-[#525252] transition-colors hover:text-[#0A0A0A] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Clean Segmented Tab Switcher */}
        <div className="flex border-b border-[#E5E5E5] px-6">
          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`mr-6 border-b-2 py-3 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'media'
                ? 'border-[#0A0A0A] text-[#0A0A0A]'
                : 'border-transparent text-[#737373] hover:text-[#0A0A0A]'
            }`}
          >
            Visual Plates &amp; Video (5)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`border-b-2 py-3 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'specs'
                ? 'border-[#0A0A0A] text-[#0A0A0A]'
                : 'border-transparent text-[#737373] hover:text-[#0A0A0A]'
            }`}
          >
            Description, Key Features &amp; Specs
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {activeTab === 'media' ? (
            <div className="space-y-8">
              <p className="text-xs leading-relaxed text-[#525252]">
                Upload AI concept renders now for stakeholder review, then swap to physical studio photography later without changing your layout.
              </p>

              {SLOT_META.map(({ key, label, hint }) => {
                const slot = garment.media[key];
                const isFactoryLinked = key === 'swatch';
                return (
                  <div
                    key={key}
                    className={`border-b border-[#EFEFEF] pb-6 ${
                      initialFocusSlot === key ? 'pt-1' : ''
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <div>
                        <h3 className="text-xs font-semibold text-[#0A0A0A]">{label}</h3>
                        <p className="text-[11px] text-[#737373]">{hint}</p>
                      </div>

                      {isFactoryLinked ? (
                        <span className="font-mono text-[9px] font-semibold uppercase tracking-wide text-[#55534E]">
                          Auto-linked
                        </span>
                      ) : (
                        <select
                          aria-label={`${label} asset stage`}
                          value={slot.stage}
                          onChange={(e) =>
                            updateMedia(key, { stage: e.target.value as AssetStage })
                          }
                          className="border border-[#E5E5E5] bg-white px-2 py-1 font-mono text-[11px] text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none cursor-pointer"
                        >
                          <option value="blank">Blank Slot</option>
                          <option value="ai-concept">AI Concept</option>
                          <option value="studio-final">Studio Final</option>
                        </select>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-4">
                      {/* Mini Thumbnail */}
                      <div className="h-16 w-16 shrink-0 overflow-hidden border border-[#E5E5E5] bg-[#FAFAFA]">
                        {slot.url ? (
                          <img
                            src={slot.url}
                            alt={label}
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="plate-blueprint-bg flex h-full w-full items-center justify-center font-mono text-[10px] text-[#999999]">
                            Blank
                          </div>
                        )}
                      </div>

                      {isFactoryLinked ? (
                        <div className="flex-1 space-y-2">
                          <p className="text-[11px] leading-relaxed text-[#55534E]">
                            {slot.url
                              ? `${slot.note || `Shared from the ${garment.specs.fabricRollRef} fabric family.`}`
                              : `No image linked to ${garment.specs.fabricRollRef} yet. Add one in the Fabric Library.`}
                          </p>
                          {onOpenFabricColorPicker && (
                            <button
                              type="button"
                              onClick={() => onOpenFabricColorPicker(garment)}
                              className="inline-flex items-center gap-1.5 border border-[#0A0A0A] bg-white px-3 py-1.5 text-[11px] font-medium text-[#0A0A0A] transition-colors hover:bg-[#0A0A0A] hover:text-white cursor-pointer"
                            >
                              Switch {garment.specs.fabricRollRef} Color Swatch
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <label className="inline-flex items-center gap-1.5 border border-[#0A0A0A] bg-[#0A0A0A] px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-[#262626] cursor-pointer">
                              <Upload className="h-3 w-3" />
                              <span>{slot.url ? 'Replace File' : 'Upload Image'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  handleFileUpload(key, e.target.files?.[0]);
                                  e.target.value = '';
                                }}
                              />
                            </label>

                            {slot.url && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateMedia(key, { url: '', stage: 'blank' })
                                }
                                className="inline-flex items-center gap-1 border border-[#E5E5E5] px-2.5 py-1.5 text-[11px] text-[#525252] transition-colors hover:border-[#0A0A0A] hover:text-[#0A0A0A] cursor-pointer"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span>Revert to Blank</span>
                              </button>
                            )}
                          </div>

                          <input
                            type="url"
                            value={slot.url.startsWith('data:') ? '' : slot.url}
                            onChange={(e) =>
                              updateMedia(key, {
                                url: e.target.value,
                                stage: e.target.value
                                  ? slot.stage === 'blank'
                                    ? 'ai-concept'
                                    : slot.stage
                                  : 'blank',
                              })
                            }
                            placeholder={
                              slot.url.startsWith('data:')
                                ? 'Local image loaded (or paste image URL to replace)'
                                : 'Or paste image URL...'
                            }
                            className="w-full border border-[#E5E5E5] px-2.5 py-1.5 font-mono text-[11px] text-[#0A0A0A] placeholder:text-[#A3A3A3] focus:border-[#0A0A0A] focus:outline-none"
                          />
                        </div>
                      )}
                    </div>

                    {!isFactoryLinked && <div className="mt-2.5">
                      <input
                        type="text"
                        value={slot.caption}
                        onChange={(e) => updateMedia(key, { caption: e.target.value })}
                        placeholder="Figure caption"
                        className="w-full border border-[#EFEFEF] px-2.5 py-1.5 font-serif italic text-xs text-[#404040] focus:border-[#0A0A0A] focus:outline-none"
                      />
                    </div>}
                  </div>
                );
              })}

              {/* Embedded Video Section */}
              <div>
                <h3 className="text-xs font-semibold text-[#0A0A0A]">
                  Embedded Motion Study (Online View)
                </h3>
                <p className="mt-0.5 text-[11px] text-[#737373]">
                  Paste a YouTube, Vimeo, or direct MP4 link to showcase garment drape and seam movement.
                </p>
                <div className="mt-3 space-y-2.5">
                  <input
                    type="text"
                    value={garment.videoTitle}
                    onChange={(e) => updateField('videoTitle', e.target.value)}
                    placeholder="Motion study title"
                    className="w-full border border-[#E5E5E5] px-3 py-2 text-xs text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none"
                  />
                  <input
                    type="url"
                    value={garment.videoUrl}
                    onChange={(e) => updateField('videoUrl', e.target.value)}
                    placeholder="https://vimeo.com/... or https://youtube.com/watch?v=... or .mp4"
                    className="w-full border border-[#E5E5E5] px-3 py-2 font-mono text-xs text-[#0A0A0A] placeholder:text-[#A3A3A3] focus:border-[#0A0A0A] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-[#525252]">
                  Product Title
                </label>
                <input
                  type="text"
                  value={garment.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="mt-1 w-full border border-[#E5E5E5] px-3 py-2 text-xs text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525252]">
                  Product Lead Summary
                </label>
                <textarea
                  rows={2}
                  value={garment.summary}
                  onChange={(e) => updateField('summary', e.target.value)}
                  className="mt-1 w-full border border-[#E5E5E5] px-3 py-2 text-xs leading-relaxed text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525252]">
                  Description Bullet Points (one per line)
                </label>
                <textarea
                  rows={4}
                  value={garment.descriptionBullets.join('\n')}
                  onChange={(e) =>
                    updateField(
                      'descriptionBullets',
                      e.target.value
                        .split('\n')
                        .map((line) => line.trim())
                        .filter(Boolean)
                    )
                  }
                  className="mt-1 w-full border border-[#E5E5E5] px-3 py-2 text-xs leading-relaxed text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525252]">
                  Key Features (one per line)
                </label>
                <textarea
                  rows={4}
                  value={garment.keyFeatures.join('\n')}
                  onChange={(e) =>
                    updateField(
                      'keyFeatures',
                      e.target.value
                        .split('\n')
                        .map((line) => line.trim())
                        .filter(Boolean)
                    )
                  }
                  className="mt-1 w-full border border-[#E5E5E5] px-3 py-2 text-xs leading-relaxed text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525252]">
                  Available Colorways (comma or semicolon separated)
                </label>
                <input
                  type="text"
                  value={garment.colorways.join('; ')}
                  onChange={(e) => {
                    const nextColors = e.target.value
                      .split(/[;,]/)
                      .map((c) => c.trim())
                      .filter(Boolean);
                    onUpdateGarment({
                      ...garment,
                      colorways: nextColors,
                      colorCount: nextColors.length,
                    });
                  }}
                  className="mt-1 w-full border border-[#E5E5E5] px-3 py-2 text-xs text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525252]">
                  Clickable B2B Product / Order URL
                </label>
                <input
                  type="url"
                  value={garment.productUrl}
                  onChange={(e) => updateField('productUrl', e.target.value)}
                  className="mt-1 w-full border border-[#E5E5E5] px-3 py-2 font-mono text-xs text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-medium text-[#525252]">
                    Swatchbook Code
                  </label>
                  <input
                    type="text"
                    value={garment.specs.fabricRollRef}
                    onChange={(e) => updateSpec('fabricRollRef', e.target.value)}
                    className="mt-1 w-full border border-[#E5E5E5] px-2.5 py-2 font-mono text-xs text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#525252]">
                    Weight (GSM)
                  </label>
                  <input
                    type="text"
                    value={garment.specs.weightGsm}
                    onChange={(e) => updateSpec('weightGsm', e.target.value)}
                    className="mt-1 w-full border border-[#E5E5E5] px-2.5 py-2 font-mono text-xs text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#525252]">
                    Width (Typical)
                  </label>
                  <input
                    type="text"
                    value={garment.specs.fabricWidth}
                    onChange={(e) => updateSpec('fabricWidth', e.target.value)}
                    className="mt-1 w-full border border-[#E5E5E5] px-2.5 py-2 font-mono text-xs text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525252]">
                  Stretch / Feel Note
                </label>
                <input
                  type="text"
                  value={garment.specs.stretchFeelNote}
                  onChange={(e) => updateSpec('stretchFeelNote', e.target.value)}
                  className="mt-1 w-full border border-[#E5E5E5] px-3 py-2 text-xs text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525252]">
                  Composition
                </label>
                <input
                  type="text"
                  value={garment.specs.composition}
                  onChange={(e) => updateSpec('composition', e.target.value)}
                  className="mt-1 w-full border border-[#E5E5E5] px-3 py-2 text-xs text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#525252]">
                    Stitch Density (SPI / GG)
                  </label>
                  <input
                    type="text"
                    value={garment.specs.stitchDensity}
                    onChange={(e) => updateSpec('stitchDensity', e.target.value)}
                    className="mt-1 w-full border border-[#E5E5E5] px-3 py-2 font-mono text-xs text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#525252]">
                    Minimum Order (MOQ)
                  </label>
                  <input
                    type="text"
                    value={garment.specs.moq}
                    onChange={(e) => updateSpec('moq', e.target.value)}
                    className="mt-1 w-full border border-[#E5E5E5] px-3 py-2 font-mono text-xs text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525252]">
                  Inner Seam Finish
                </label>
                <input
                  type="text"
                  value={garment.specs.seamFinish}
                  onChange={(e) => updateSpec('seamFinish', e.target.value)}
                  className="mt-1 w-full border border-[#E5E5E5] px-3 py-2 text-xs text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525252]">
                  Pocket Construction
                </label>
                <input
                  type="text"
                  value={garment.specs.pocketConstruction}
                  onChange={(e) => updateSpec('pocketConstruction', e.target.value)}
                  className="mt-1 w-full border border-[#E5E5E5] px-3 py-2 text-xs text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#525252]">
                    Size Run
                  </label>
                  <input
                    type="text"
                    value={garment.specs.sizeRun}
                    onChange={(e) => updateSpec('sizeRun', e.target.value)}
                    className="mt-1 w-full border border-[#E5E5E5] px-2.5 py-2 font-mono text-xs text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#525252]">
                    Lead Time
                  </label>
                  <input
                    type="text"
                    value={garment.specs.leadTime}
                    onChange={(e) => updateSpec('leadTime', e.target.value)}
                    className="mt-1 w-full border border-[#E5E5E5] px-2.5 py-2 font-mono text-xs text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#525252]">
                    Wholesale Ref
                  </label>
                  <input
                    type="text"
                    value={garment.specs.wholesaleRef}
                    onChange={(e) => updateSpec('wholesaleRef', e.target.value)}
                    className="mt-1 w-full border border-[#E5E5E5] px-2.5 py-2 font-mono text-xs text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#E5E5E5] px-6 py-4">
          <span className="text-[11px] text-[#737373]">Changes save automatically locally</span>
          <button
            type="button"
            onClick={onClose}
            className="bg-[#0A0A0A] px-5 py-2 text-xs font-medium text-white transition-colors hover:bg-[#262626] cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
