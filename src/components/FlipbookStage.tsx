import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Crop,
  Grid,
  Maximize2,
  Printer,
  Replace,
  Ruler,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type {
  CatalogueMetadata,
  GarmentItem,
  ImageCrop,
  MediaSlot,
  MediaSlotKey,
  MetallicTheme,
} from '../types/catalogue';
import {
  BRAND_LOGO_PATH,
} from '../data/garments';
import { getFactoryColorImageKey, getPreferredFactoryFabricImage } from '../data/factoryFabricColors';
import {
  buildCatalogueNavigationMap,
  getActiveSectionForSpread,
  type CatalogueNavigationMap,
} from '../utils/catalogueOrder';
import { displayBuyerProductTitle } from '../utils/productDisplay';
import { BookThumbIndexRail, SectionWayfinderBar } from './CatalogueNavigation';
import { PageCurlBook } from './PageCurlBook';
import { SpreadPages } from './SpreadPages';
import { MobileCatalogueView } from './MobileCatalogueView';
import type { SpreadLeafSide } from './GarmentSpread';

interface FlipbookStageProps {
  garments: GarmentItem[];
  navMap?: CatalogueNavigationMap;
  demoMode?: boolean;
  onToggleDemoMode?: () => void;
  isMobile: boolean;
  isWorkbench: boolean;
  meta: CatalogueMetadata;
  metallicTheme: MetallicTheme;
  bookPage: number;
  editMode: boolean;
  classicMode: boolean;
  shortlist: string[];
  coverCustomImage: string;
  showSafeZones: boolean;
  turnRequest: { dir: 'next' | 'prev'; nonce: number } | null;
  onRequestTurn: (dir: 'next' | 'prev') => void;
  onChangeBookPage: (page: number) => void;
  onToggleEditMode: () => void;
  onChangeMetallicTheme: (theme: MetallicTheme) => void;
  onToggleSafeZones: () => void;
  onDropCoverImage: (dataUrl: string) => void;
  onReplaceFile: (garmentId: string, slotKey: MediaSlotKey, dataUrl: string) => void;
  onUpdateCrop: (garmentId: string, slotKey: MediaSlotKey, crop: ImageCrop) => void;
  fabricColorImages: Record<string, string>;
  onReplaceFabricColorImage?: (imageKey: string, dataUrl: string) => void;
  onImageUploadError?: (message: string) => void;
  onToggleShortlist: (id: string) => void;
  onInspectMedia: (slot: MediaSlot, titleLabel: string, garmentTitle: string) => void;
  onOpenEditor: (garmentIndex: number, focusSlot?: MediaSlotKey) => void;
  onOpenVideo: (garment: GarmentItem) => void;
  onExportCurrentPdf: (garmentIndex: number) => void;
  onSelectFabricCode: (fabricCode: string) => void;
  onOpenFullPrintModal: () => void;
  onExportCsv: () => void;
  onExportJson: () => void;
  onTriggerImportCsv: () => void;
  onTriggerImportJson: () => void;
  customFramingCount?: number;
  onOpenFabricColorPicker?: (garment: GarmentItem) => void;
  onOpenCropPresetModal?: () => void;
}

const ZOOM_STEPS = [0.75, 1, 1.25, 1.5] as const;

export const FlipbookStage: React.FC<FlipbookStageProps> = ({
  garments,
  navMap,
  demoMode = false,
  onToggleDemoMode,
  isMobile,
  isWorkbench,
  meta,
  metallicTheme,
  bookPage,
  editMode,
  classicMode,
  shortlist,
  coverCustomImage,
  showSafeZones,
  turnRequest,
  onRequestTurn,
  onChangeBookPage,
  onToggleEditMode,
  onChangeMetallicTheme,
  onToggleSafeZones,
  onDropCoverImage,
  onReplaceFile,
  onUpdateCrop,
  fabricColorImages,
  onReplaceFabricColorImage,
  onImageUploadError,
  onToggleShortlist,
  onInspectMedia,
  onOpenEditor,
  onOpenVideo,
  onExportCurrentPdf,
  onSelectFabricCode,
  onOpenFullPrintModal,
  onExportCsv,
  onExportJson,
  onTriggerImportCsv,
  onTriggerImportJson,
  customFramingCount = 0,
  onOpenFabricColorPicker,
  onOpenCropPresetModal,
}) => {
  const effectiveNavMap =
    navMap ?? buildCatalogueNavigationMap(garments, demoMode, fabricColorImages);
  const orderedGarments = effectiveNavMap.orderedGarments;
  const swatchPrograms = effectiveNavMap.orderedFabrics;
  const swatchSpreadCount = swatchPrograms.length;
  const productOffset = effectiveNavMap.productOffset;
  const totalSpreads = effectiveNavMap.totalSpreads;

  const [zoom, setZoom] = useState<number>(1);
  const [thumbnailView, setThumbnailView] = useState<boolean>(false);

  useEffect(() => {
    if (classicMode) {
      setZoom(1);
      setThumbnailView(false);
    }
  }, [classicMode]);

  useEffect(() => {
    if (isMobile) setThumbnailView(false);
  }, [isMobile]);

  const getSpreadLabel = (page: number): string => {
    if (page === 0) return 'P.01 · Cover & CM / OEM / ODM Overview';
    if (page === 1) return 'P.02 · Table of Contents & Directory';
    if (page >= 2 && page < productOffset) {
      const program = swatchPrograms[page - 2];
      return `P.${String(page + 1).padStart(2, '0')} · Fabric ${program?.fabricCode ?? ''} (${page - 1}/${swatchSpreadCount})`;
    }
    if (page >= productOffset && page < productOffset + orderedGarments.length) {
      const item = orderedGarments[page - productOffset];
      const title = classicMode
        ? displayBuyerProductTitle(item.title)
        : item.title;
      return `P.${String(page + 1).padStart(2, '0')} · ${item.sku} — ${title}`;
    }
    return classicMode
      ? `P.${String(totalSpreads).padStart(2, '0')} · Contact & Colophon`
      : `P.${String(totalSpreads).padStart(2, '0')} · Technical Info & Print Specs`;
  };

  const activeProduct =
    bookPage >= productOffset && bookPage < productOffset + orderedGarments.length
      ? orderedGarments[bookPage - productOffset]
      : null;
  const activeSection = getActiveSectionForSpread(bookPage, effectiveNavMap);

  const stepZoom = (delta: number) => {
    const idx = ZOOM_STEPS.indexOf(zoom as (typeof ZOOM_STEPS)[number]);
    const currentIdx = idx === -1 ? 1 : idx;
    const nextIdx = Math.max(0, Math.min(ZOOM_STEPS.length - 1, currentIdx + delta));
    setZoom(ZOOM_STEPS[nextIdx]);
  };

  const renderSpread = useCallback(
    (pageIndex: number, side: SpreadLeafSide, isPreviewLayer: boolean) => (
      <SpreadPages
        pageIndex={pageIndex}
        totalSpreads={totalSpreads}
        garments={orderedGarments}
        navMap={effectiveNavMap}
        demoMode={demoMode}
        meta={meta}
        metallicTheme={metallicTheme}
        editMode={editMode && isWorkbench}
        classicMode={classicMode || !isWorkbench}
        shortlist={shortlist}
        coverCustomImage={coverCustomImage}
        showSafeZones={showSafeZones}
        side={side}
        isPreviewLayer={isPreviewLayer}
        onGoToPage={onChangeBookPage}
        onChangeMetallicTheme={onChangeMetallicTheme}
        onDropCoverImage={onDropCoverImage}
        onReplaceFile={onReplaceFile}
        onUpdateCrop={onUpdateCrop}
        fabricColorImages={fabricColorImages}
        onReplaceFabricColorImage={onReplaceFabricColorImage}
        onImageUploadError={onImageUploadError}
        onToggleShortlist={onToggleShortlist}
        onInspectMedia={onInspectMedia}
        onOpenEditor={onOpenEditor}
        onOpenVideo={onOpenVideo}
        onExportCurrentPdf={onExportCurrentPdf}
        onSelectFabricCode={onSelectFabricCode}
        onExportCsv={onExportCsv}
        onExportJson={onExportJson}
        onTriggerImportCsv={onTriggerImportCsv}
        onTriggerImportJson={onTriggerImportJson}
        onOpenFabricColorPicker={onOpenFabricColorPicker}
      />
    ),
    [
      totalSpreads,
      orderedGarments,
      effectiveNavMap,
      demoMode,
      isWorkbench,
      meta,
      metallicTheme,
      editMode,
      classicMode,
      shortlist,
      coverCustomImage,
      showSafeZones,
      onChangeBookPage,
      onChangeMetallicTheme,
      onDropCoverImage,
      onReplaceFile,
      onUpdateCrop,
      fabricColorImages,
      onReplaceFabricColorImage,
      onImageUploadError,
      onToggleShortlist,
      onInspectMedia,
      onOpenEditor,
      onOpenVideo,
      onExportCurrentPdf,
      onSelectFabricCode,
      onExportCsv,
      onExportJson,
      onTriggerImportCsv,
      onTriggerImportJson,
      onOpenFabricColorPicker,
    ]
  );

  if (isMobile) {
    return (
      <MobileCatalogueView
        garments={orderedGarments}
        navMap={effectiveNavMap}
        activeSection={activeSection}
        demoMode={demoMode}
        onToggleDemoMode={onToggleDemoMode}
        bookPage={bookPage}
        totalSpreads={totalSpreads}
        productOffset={productOffset}
        isWorkbench={isWorkbench}
        editMode={editMode}
        customFramingCount={customFramingCount}
        getSpreadLabel={getSpreadLabel}
        renderStaticPage={(page) => renderSpread(page, 'full', false)}
        onChangeBookPage={onChangeBookPage}
        onToggleEditMode={onToggleEditMode}
        onReplaceFile={onReplaceFile}
        onUpdateCrop={onUpdateCrop}
        onInspectMedia={onInspectMedia}
        onOpenEditor={onOpenEditor}
        onSelectFabricCode={onSelectFabricCode}
        onOpenFabricColorPicker={onOpenFabricColorPicker}
        onOpenCropPresetModal={onOpenCropPresetModal}
      />
    );
  }

  return (
    <div className={classicMode ? 'min-h-[calc(100vh-4rem)] bg-[#F4F3EF] pb-8 pt-2' : ''}>
    <section
      aria-label={
        classicMode
          ? 'Buyer catalogue spread'
          : 'Workbench page-curl catalogue'
      }
      className={`mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-10 ${
        classicMode ? 'py-2 lg:py-3' : 'py-6 lg:py-7'
      }`}
    >
      {/* ====================================================================
          TOP FLIPBOOK CONTROL BAR (PREV/NEXT + JUMP + ZOOM + THUMBNAILS + GUIDES)
          ==================================================================== */}
      {!classicMode && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5] pb-4 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setThumbnailView(false);
              onRequestTurn('prev');
            }}
            className="inline-flex items-center gap-1.5 border border-[#E5E5E5] bg-white px-3 py-1.5 font-medium text-[#0A0A0A] transition-colors hover:border-[#0A0A0A] whitespace-nowrap cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Prev</span>
          </button>

          <label className="flex items-center gap-2 font-mono text-xs text-[#0A0A0A]">
            <BookOpen className="h-3.5 w-3.5 text-[var(--metallic-strong)]" />
            <span className="sr-only">Jump to catalogue spread</span>
            <select
              value={bookPage}
              onChange={(e) => {
                setThumbnailView(false);
                onChangeBookPage(Number(e.target.value));
              }}
              className="max-w-[230px] sm:max-w-[330px] border border-[#E5E5E5] bg-white px-2.5 py-1.5 font-mono text-xs text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none cursor-pointer"
            >
              {Array.from({ length: totalSpreads }, (_, i) => (
                <option key={i} value={i}>
                  {getSpreadLabel(i)}
                </option>
              ))}
            </select>
            <span className="text-[#737373] tabular-nums whitespace-nowrap">
              / {String(totalSpreads).padStart(2, '0')}
            </span>
          </label>

          <button
            type="button"
            onClick={() => {
              setThumbnailView(false);
              onRequestTurn('next');
            }}
            className="inline-flex items-center gap-1.5 border border-[#E5E5E5] bg-white px-3 py-1.5 font-medium text-[#0A0A0A] transition-colors hover:border-[#0A0A0A] whitespace-nowrap cursor-pointer"
          >
            <span>Next</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          </div>

        {/* Thumbnail Grid + Zoom + Binding Safe-Zone Guides + Print */}
        <div className="flex flex-wrap items-center gap-2">

          {/* Thumbnail Grid View Toggle */}
          <button
            type="button"
            onClick={() => setThumbnailView((v) => !v)}
            className={`inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
              thumbnailView
                ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white'
                : 'border-[#E5E5E5] bg-white text-[#404040] hover:border-[#0A0A0A]'
            }`}
          >
            <Grid className="h-3 w-3" />
            <span>{thumbnailView ? 'Close Grid' : 'Thumbnails'}</span>
          </button>

          {/* Safe-Zone & Inner Binding Gutter Guide Toggle */}
          <button
            type="button"
            onClick={onToggleSafeZones}
            title="Toggle print safe-zone and inner binding gutter guides"
            className={`inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
              showSafeZones
                ? 'border-[#0A0A0A] bg-[#FAFAFA] text-[#0A0A0A]'
                : 'border-[#E5E5E5] bg-white text-[#525252] hover:border-[#0A0A0A]'
            }`}
          >
            <Ruler className="h-3 w-3" />
            <span>Gutter Guides</span>
          </button>

          {/* Workbench Replace Toggle */}
          <button
            type="button"
            onClick={onToggleEditMode}
            title="Click plates to replace images instead of inspecting"
            className={`inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
              editMode
                ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white'
                : 'border-[#E5E5E5] bg-white text-[#525252] hover:border-[#0A0A0A]'
            }`}
          >
            <Replace className="h-3 w-3" />
            <span>{editMode ? 'Replace: On' : 'Replace'}</span>
          </button>

          {/* Import / Export Crop & Zoom Presets */}
          {onOpenCropPresetModal && (
            <button
              type="button"
              onClick={onOpenCropPresetModal}
              title="Import or export crop, pan, and zoom values"
              className="inline-flex items-center gap-1.5 border border-[#E5E5E5] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#404040] transition-colors hover:border-[#0A0A0A] hover:text-[#0A0A0A] whitespace-nowrap cursor-pointer"
            >
              <Crop className="h-3 w-3" />
              <span className="tabular-nums">
                {customFramingCount > 0 ? `Crops I/O (${customFramingCount})` : 'Crops I/O'}
              </span>
            </button>
          )}

          {/* Zoom Controls */}
          <div className="flex items-center border border-[#E5E5E5] bg-white">
            <button
              type="button"
              onClick={() => stepZoom(-1)}
              disabled={zoom <= ZOOM_STEPS[0]}
              aria-label="Zoom out"
              className="p-1.5 text-[#404040] hover:text-[#0A0A0A] disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              title="Reset zoom to 100% Fit"
              className="border-x border-[#EFEFEF] px-2 py-1 font-mono text-[11px] text-[#0A0A0A] tabular-nums hover:bg-[#FAFAFA] cursor-pointer"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={() => stepZoom(1)}
              disabled={zoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1]}
              aria-label="Zoom in"
              className="p-1.5 text-[#404040] hover:text-[#0A0A0A] disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            {zoom !== 1 && (
              <button
                type="button"
                onClick={() => setZoom(1)}
                aria-label="Reset zoom"
                className="border-l border-[#EFEFEF] p-1.5 text-[#525252] hover:text-[#0A0A0A] cursor-pointer"
              >
                <Maximize2 className="h-3 w-3" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              activeProduct ? onExportCurrentPdf(activeProduct.index) : onOpenFullPrintModal()
            }
            className="inline-flex items-center gap-1.5 border border-[#0A0A0A] bg-white px-3 py-1.5 text-[11px] font-medium text-[#0A0A0A] transition-colors hover:bg-[#0A0A0A] hover:text-white whitespace-nowrap cursor-pointer"
          >
            <Printer className="h-3 w-3" />
            <span>{activeProduct ? `Print ${activeProduct.sku}` : 'Print PDF'}</span>
          </button>
        </div>
      </div>
      )}

      {classicMode && (
      <nav
        aria-label="Buyer catalogue controls"
        className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5] pb-3 text-xs"
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onRequestTurn('prev')}
            aria-label="Previous spread"
            className="inline-flex items-center gap-1.5 border border-[#DADADA] bg-white px-3 py-1.5 font-semibold text-[#111111] transition-colors hover:border-[#111111]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Prev
          </button>
          <label className="sr-only" htmlFor="classic-spread-select">Choose catalogue spread</label>
          <select
            id="classic-spread-select"
            value={bookPage}
            onChange={(event) => onChangeBookPage(Number(event.target.value))}
            className="max-w-[min(60vw,420px)] border border-[#DADADA] bg-white px-2.5 py-1.5 font-mono text-[11px] font-medium text-[#111111] focus:border-[#111111] focus:outline-none"
          >
            {Array.from({ length: totalSpreads }, (_, index) => (
              <option key={index} value={index}>{getSpreadLabel(index)}</option>
            ))}
          </select>
          <span className="font-mono text-[10px] text-[#555555] tabular-nums">
            {String(bookPage + 1).padStart(2, '0')} / {String(totalSpreads).padStart(2, '0')}
          </span>
          <button
            type="button"
            onClick={() => onRequestTurn('next')}
            aria-label="Next spread"
            className="inline-flex items-center gap-1.5 border border-[#DADADA] bg-white px-3 py-1.5 font-semibold text-[#111111] transition-colors hover:border-[#111111]"
          >
            Next
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <button
          type="button"
          onClick={() =>
            activeProduct ? onExportCurrentPdf(activeProduct.index) : onOpenFullPrintModal()
          }
          className="inline-flex items-center gap-1.5 bg-[#111111] px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-[#333333]"
        >
          <Printer className="h-3 w-3" />
          {activeProduct ? `Print ${activeProduct.sku}` : 'Print / Export PDF'}
        </button>
      </nav>
      )}

      {onToggleDemoMode && (
        <SectionWayfinderBar
          activeSection={activeSection}
          activeCategory={activeProduct?.category ?? null}
          navMap={effectiveNavMap}
          demoMode={demoMode}
          onToggleDemoMode={onToggleDemoMode}
          onSelectSpread={(page) => {
            setThumbnailView(false);
            onChangeBookPage(page);
          }}
        />
      )}

      {/* ====================================================================
          THUMBNAIL GRID VIEW OR DIAGONAL PAGE-CURL FLIPBOOK STAGE
          ==================================================================== */}
      {!classicMode && thumbnailView ? (
        <div className="border border-[#E5E5E5] bg-[#FAFAFA] p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5] pb-3">
            <div>
              <h2 className="font-sans text-lg font-semibold tracking-tight text-[#0A0A0A]">
                All {totalSpreads} Two-Page Landscape Spreads
              </h2>
              <p className="text-xs text-[#525252]">
                Select any spread thumbnail (Verso | Spine | Recto) to jump directly in the flipbook.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setThumbnailView(false)}
              className="border border-[#0A0A0A] bg-[#0A0A0A] px-3 py-1.5 text-xs font-medium text-white cursor-pointer"
            >
              Return to Flipbook
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: totalSpreads }, (_, i) => {
              const isCurrent = i === bookPage;
              const isProduct = i >= productOffset && i < productOffset + orderedGarments.length;
              const product = isProduct ? orderedGarments[i - productOffset] : null;
              const isSwatch = i >= 2 && i < productOffset;
              const swatchProgram = isSwatch ? swatchPrograms[i - 2] : null;
              const swatchHero = swatchProgram
                ? getPreferredFactoryFabricImage(swatchProgram.fabricCode, fabricColorImages)
                : undefined;
              const firstColor = swatchProgram?.factoryColors[0];
              const colorImage = firstColor
                ? fabricColorImages[getFactoryColorImageKey(swatchProgram.fabricCode, firstColor.colorName)] ??
                  firstColor.swatchImageUrl
                : undefined;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onChangeBookPage(i);
                    setThumbnailView(false);
                  }}
                  className={`group flex flex-col border bg-white p-2 text-left transition-colors cursor-pointer ${
                    isCurrent
                      ? 'border-[#0A0A0A] ring-1 ring-[#0A0A0A]'
                      : 'border-[#E2E2E2] hover:border-[#0A0A0A]'
                  }`}
                >
                  {/* Miniature Two-Page Book Spread Wireframe */}
                  <div className="relative grid aspect-[16/10] w-full grid-cols-2 border border-[#EBEBEB] bg-white overflow-hidden">
                    {/* Left Verso Thumbnail */}
                    <div className="relative flex items-center justify-center border-r border-[#E0E0E0] bg-[#FCFCFC] p-1.5">
                      <div className="spine-verso-shadow pointer-events-none absolute inset-y-0 right-0 w-2" />
                      {i === 0 ? (
                        <span className="font-sans text-[9px] font-semibold text-[#0A0A0A] text-center">
                          DREAM TOMORROW
                        </span>
                      ) : i === 1 ? (
                        <span className="font-mono text-[8px] text-[#525252]">TOC · NAM</span>
                      ) : isSwatch ? (
                        swatchHero ? (
                          <img
                            src={swatchHero.imageUrl}
                            alt={`${swatchProgram?.fabricCode ?? 'Fabric'} swatch`}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="font-mono text-[8px] text-[#525252]">
                            {swatchProgram?.fabricCode ?? 'FABRIC'}
                          </span>
                        )
                      ) : product ? (
                        product.media.hero.url ? (
                          <img
                            src={product.media.hero.url}
                            alt={product.sku}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="font-mono text-[8px] font-medium text-[#525252]">
                            {product.sku}
                          </span>
                        )
                      ) : (
                        <span className="font-mono text-[8px] text-[#525252]">PRINT SPEC</span>
                      )}
                    </div>

                    {/* Right Recto Thumbnail */}
                    <div className="relative flex flex-col items-center justify-center bg-white p-1.5">
                      <div className="spine-recto-shadow pointer-events-none absolute inset-y-0 left-0 w-2" />
                      {i === 0 ? (
                        coverCustomImage ? (
                          <img
                            src={coverCustomImage}
                            alt="Cover"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <img
                            src={BRAND_LOGO_PATH}
                            alt="DT"
                            className="h-5 w-auto object-contain"
                          />
                        )
                      ) : i === 1 ? (
                        <span className="font-mono text-[8px] text-[#525252]">INDEX · NỮ</span>
                      ) : isSwatch ? (
                        colorImage ? (
                          <img
                            src={colorImage}
                            alt={`${swatchProgram?.fabricCode ?? 'Fabric'} colorway`}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="font-mono text-[8px] text-[#737373]">
                            {swatchProgram?.factoryColors.length ?? 0} COLORWAYS
                          </span>
                        )
                      ) : product ? (
                        <div className="w-full space-y-1 px-1">
                          <div className="grid grid-cols-2 gap-1">
                            <div className="aspect-[4/3] border border-[#EAEAEA] bg-[#FAFAFA]" />
                            <div className="aspect-[4/3] border border-[#EAEAEA] bg-[#FAFAFA]" />
                          </div>
                          <div className="h-1 w-3/4 bg-[#E5E5E5]" />
                          <div className="h-1 w-1/2 bg-[#EFEFEF]" />
                        </div>
                      ) : (
                        <span className="font-mono text-[8px] text-[#525252]">CSV / JSON</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 flex items-baseline justify-between gap-1">
                    <span className="font-mono text-[10px] font-semibold text-[#0A0A0A] tabular-nums">
                      Sp. {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="truncate font-mono text-[9.5px] text-[#737373]">
                      {product ? product.sku : i === 0 ? 'COVER' : i === 1 ? 'TOC' : isSwatch ? swatchProgram?.fabricCode ?? 'FABRIC' : 'DATA'}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[10.5px] text-[#404040]">
                    {product
                      ? product.title
                      : i === 0
                        ? 'Brand & CM/OEM/ODM'
                        : i === 1
                          ? 'Style Directory'
                          : isSwatch
                            ? `${swatchProgram?.factoryColors.length ?? 0} colorways · 1 fabric family`
                            : 'Assets & CSV Swap'}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex items-start">
          <div className="min-w-0 flex-1">
            <PageCurlBook
              bookPage={bookPage}
              totalSpreads={totalSpreads}
              zoom={zoom}
              classicMode={classicMode}
              curlEnabled
              turnRequest={turnRequest}
              onCommitPage={onChangeBookPage}
              renderSpread={renderSpread}
            />
          </div>
          <BookThumbIndexRail
            activeSection={activeSection}
            navMap={effectiveNavMap}
            onSelectSpread={(page) => {
              setThumbnailView(false);
              onChangeBookPage(page);
            }}
          />
        </div>
      )}

      {/* ====================================================================
          DIRECT BOOK TURN HINT & BOTTOM 50-SPREAD SPINE SCRUBBER
          ==================================================================== */}
      {!classicMode && (
        <div className="mt-5 border-t border-[#E5E5E5] pt-4">
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#737373]">
          <span>
            Spine Scrubber — <span className="font-mono text-[#0A0A0A]">{getSpreadLabel(bookPage)}</span>
          </span>
          <span className="font-mono tabular-nums">
            Drag any outer page corner with mouse to peel &amp; curl · Click corners or use ← / → keys
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: totalSpreads }, (_, i) => {
            const isActive = i === bookPage;
            return (
              <button
                key={i}
                type="button"
                title={getSpreadLabel(i)}
                onClick={() => {
                  setThumbnailView(false);
                  onChangeBookPage(i);
                }}
                className={`h-7 min-w-[28px] px-1.5 font-mono text-[10px] tabular-nums transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#0A0A0A] text-white'
                    : 'border border-[#EBEBEB] bg-white text-[#525252] hover:border-[#0A0A0A] hover:text-[#0A0A0A]'
                }`}
              >
                {String(i + 1).padStart(2, '0')}
              </button>
            );
          })}
        </div>
      </div>
      )}
    </section>
    </div>
  );
};
