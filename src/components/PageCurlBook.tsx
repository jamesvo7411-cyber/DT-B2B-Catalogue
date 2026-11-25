import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SpreadLeafSide } from './GarmentSpread';

interface Pt {
  x: number;
  y: number;
}

interface TurnRequest {
  dir: 'next' | 'prev';
  nonce: number;
}

interface PageCurlBookProps {
  bookPage: number;
  totalSpreads: number;
  zoom: number;
  classicMode: boolean;
  curlEnabled: boolean;
  turnRequest: TurnRequest | null;
  onCommitPage: (nextPage: number) => void;
  renderSpread: (
    pageIndex: number,
    side: SpreadLeafSide,
    isPreviewLayer: boolean
  ) => React.ReactNode;
}

interface CurlSession {
  side: 'right' | 'left';
  cornerY: number;
  targetPage: number;
  pointer: Pt;
  target: Pt;
  mode: 'hover' | 'dragging' | 'animating';
  animStart?: Pt;
  animEnd?: Pt;
  animStartTime?: number;
  animDuration?: number;
  commitOnFinish?: boolean;
}

function clampToSpine(
  p: Pt,
  W: number,
  H: number,
  side: 'right' | 'left',
  cornerY: number
): Pt {
  const halfW = W / 2;
  let x = p.x;
  let y = p.y;
  const s1 = { x: halfW, y: cornerY };
  const r1 = halfW;
  const s2 = { x: halfW, y: H - cornerY };
  const r2 = Math.hypot(halfW, H);

  for (let i = 0; i < 4; i++) {
    const d1 = Math.hypot(x - s1.x, y - s1.y);
    if (d1 > r1 && d1 > 0.001) {
      x = s1.x + ((x - s1.x) / d1) * r1;
      y = s1.y + ((y - s1.y) / d1) * r1;
    }
    const d2 = Math.hypot(x - s2.x, y - s2.y);
    if (d2 > r2 && d2 > 0.001) {
      x = s2.x + ((x - s2.x) / d2) * r2;
      y = s2.y + ((y - s2.y) / d2) * r2;
    }
  }

  x = Math.max(0, Math.min(W, x));
  if (side === 'right' && x > W - 0.5) x = W - 0.5;
  if (side === 'left' && x < 0.5) x = 0.5;
  return { x, y };
}

function clipPolyHalfPlane(
  poly: Pt[],
  M: Pt,
  N: Pt,
  keepPositive: boolean
): Pt[] {
  if (poly.length === 0) return [];
  const signed = (p: Pt) => (p.x - M.x) * N.x + (p.y - M.y) * N.y;
  const isInside = (d: number) => (keepPositive ? d >= -1e-5 : d <= 1e-5);

  const out: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const da = signed(a);
    const db = signed(b);
    const aIn = isInside(da);
    const bIn = isInside(db);

    if (aIn && bIn) {
      out.push(b);
    } else if (aIn && !bIn) {
      const t = da / (da - db || 1e-6);
      out.push({ x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) });
    } else if (!aIn && bIn) {
      const t = da / (da - db || 1e-6);
      out.push({ x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) });
      out.push(b);
    }
  }
  return out;
}

function polyToCssPct(poly: Pt[], w: number, h: number, offsetX = 0): string {
  if (poly.length < 3 || w <= 0 || h <= 0) return 'polygon(0 0, 0 0, 0 0)';
  const coords = poly
    .map((p) => {
      const px = (((p.x - offsetX) / w) * 100).toFixed(3);
      const py = ((p.y / h) * 100).toFixed(3);
      return `${px}% ${py}%`;
    })
    .join(', ');
  return `polygon(${coords})`;
}

export const PageCurlBook: React.FC<PageCurlBookProps> = ({
  bookPage,
  totalSpreads,
  zoom,
  classicMode,
  curlEnabled,
  turnRequest,
  onCommitPage,
  renderSpread,
}) => {
  const outerViewportRef = useRef<HTMLDivElement | null>(null);
  const bookRef = useRef<HTMLDivElement | null>(null);

  const [bookSize, setBookSize] = useState<{ w: number; h: number }>({ w: 1280, h: 720 });
  const [curl, setCurl] = useState<CurlSession | null>(null);
  const curlRef = useRef<CurlSession | null>(null);
  const pointerDownStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isFileDraggingRef = useRef(false);
  const lastTurnNonceRef = useRef<number | null>(null);

  useEffect(() => {
    curlRef.current = curl;
  }, [curl]);

  useEffect(() => {
    if (curlEnabled) return;
    curlRef.current = null;
    setCurl(null);
  }, [curlEnabled]);

  // Measure live unscaled book width & height
  useEffect(() => {
    const el = bookRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        if (cr.width > 100 && cr.height > 100) {
          setBookSize({ w: cr.width, h: cr.height });
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [bookPage, zoom]);

  // Stage gutters reduce a 768px viewport to roughly 720px of book width.
  const isDesktopSpread = bookSize.w >= 680;

  // Trigger programmatic diagonal page curl when Next / Prev / keyboard arrows fire
  useEffect(() => {
    if (!turnRequest || turnRequest.nonce === lastTurnNonceRef.current) return;
    lastTurnNonceRef.current = turnRequest.nonce;

    const targetPage =
      turnRequest.dir === 'next'
        ? bookPage >= totalSpreads - 1
          ? 0
          : bookPage + 1
        : bookPage <= 0
          ? totalSpreads - 1
          : bookPage - 1;

    if (!curlEnabled) return;

    if (!isDesktopSpread) {
      onCommitPage(targetPage);
      return;
    }

    const { w, h } = bookSize;
    const side = turnRequest.dir === 'next' ? 'right' : 'left';
    const cornerY = h;
    const startPt: Pt =
      side === 'right' ? { x: w - 18, y: h - 18 } : { x: 18, y: h - 18 };
    const endPt: Pt = side === 'right' ? { x: 0, y: h } : { x: w, y: h };

    setCurl({
      side,
      cornerY,
      targetPage,
      pointer: startPt,
      target: endPt,
      mode: 'animating',
      animStart: startPt,
      animEnd: endPt,
      animStartTime: performance.now(),
      animDuration: 460,
      commitOnFinish: true,
    });
  }, [turnRequest, bookPage, totalSpreads, isDesktopSpread, bookSize, curlEnabled, onCommitPage]);

  // 60fps animation & spring smoothing loop
  useEffect(() => {
    if (!curl) return;
    let rafId = 0;

    const tick = (now: number) => {
      const current = curlRef.current;
      if (!current) return;

      if (current.mode === 'animating') {
        const startTime = current.animStartTime ?? now;
        const dur = current.animDuration ?? 420;
        const rawT = Math.min(1, (now - startTime) / dur);
        // Cubic ease-out
        const t = 1 - Math.pow(1 - rawT, 3);
        const s = current.animStart ?? current.pointer;
        const e = current.animEnd ?? current.target;

        // Natural mid-turn paper lift arc along Y
        const isBottom = current.cornerY > bookSize.h / 2;
        const liftDir = isBottom ? -1 : 1;
        const arcBump = Math.sin(rawT * Math.PI) * Math.min(72, bookSize.h * 0.11) * liftDir;

        const nextPt = {
          x: s.x + (e.x - s.x) * t,
          y: s.y + (e.y - s.y) * t + arcBump,
        };

        if (rawT >= 1) {
          const commitPage = current.commitOnFinish ? current.targetPage : null;
          curlRef.current = null;
          setCurl(null);
          if (commitPage !== null) {
            onCommitPage(commitPage);
          }
          return;
        }

        const updated: CurlSession = { ...current, pointer: nextPt };
        curlRef.current = updated;
        setCurl(updated);
        rafId = requestAnimationFrame(tick);
        return;
      }

      // Hover or dragging smoothing
      const dx = current.target.x - current.pointer.x;
      const dy = current.target.y - current.pointer.y;
      if (Math.hypot(dx, dy) > 0.35) {
        const factor = current.mode === 'dragging' ? 0.38 : 0.24;
        const updated: CurlSession = {
          ...current,
          pointer: {
            x: current.pointer.x + dx * factor,
            y: current.pointer.y + dy * factor,
          },
        };
        curlRef.current = updated;
        setCurl(updated);
      } else if (
        current.mode === 'hover' &&
        Math.hypot(
          current.target.x - (current.side === 'right' ? bookSize.w : 0),
          current.target.y - current.cornerY
        ) < 2
      ) {
        curlRef.current = null;
        setCurl(null);
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [Boolean(curl), bookSize.h, onCommitPage]);

  const toBookCoords = useCallback(
    (clientX: number, clientY: number): Pt => {
      const el = bookRef.current;
      if (!el) return { x: 0, y: 0 };
      const rect = el.getBoundingClientRect();
      return {
        x: ((clientX - rect.left) / (rect.width || 1)) * bookSize.w,
        y: ((clientY - rect.top) / (rect.height || 1)) * bookSize.h,
      };
    },
    [bookSize.w, bookSize.h]
  );

  // Global pointer listeners during active corner drag
  useEffect(() => {
    if (!curl || curl.mode !== 'dragging') return;

    const handleMove = (e: PointerEvent) => {
      const pt = toBookCoords(e.clientX, e.clientY);
      setCurl((prev) =>
        prev && prev.mode === 'dragging' ? { ...prev, target: pt } : prev
      );
    };

    const handleUp = (e: PointerEvent) => {
      const current = curlRef.current;
      if (!current || current.mode !== 'dragging') return;

      const endPt = toBookCoords(e.clientX, e.clientY);
      const downInfo = pointerDownStartRef.current;
      const distMoved = downInfo
        ? Math.hypot(e.clientX - downInfo.x, e.clientY - downInfo.y)
        : 999;

      const isQuickClick = distMoved < 10;
      const pastCenter =
        current.side === 'right'
          ? endPt.x < bookSize.w * 0.56
          : endPt.x > bookSize.w * 0.44;
      const shouldCommit = isQuickClick || pastCenter;

      const destCorner: Pt = shouldCommit
        ? { x: current.side === 'right' ? 0 : bookSize.w, y: current.cornerY }
        : { x: current.side === 'right' ? bookSize.w : 0, y: current.cornerY };

      setCurl({
        ...current,
        mode: 'animating',
        animStart: current.pointer,
        animEnd: destCorner,
        animStartTime: performance.now(),
        animDuration: shouldCommit ? 360 : 260,
        commitOnFinish: shouldCommit,
      });
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [curl?.mode, bookSize.w, toBookCoords]);

  const startHoverCorner = (side: 'right' | 'left', cornerY: number) => {
    if (!isDesktopSpread || isFileDraggingRef.current) return;
    if (curl && (curl.mode === 'dragging' || curl.mode === 'animating')) return;

    const targetPage =
      side === 'right'
        ? bookPage >= totalSpreads - 1
          ? 0
          : bookPage + 1
        : bookPage <= 0
          ? totalSpreads - 1
          : bookPage - 1;

    const basePt = { x: side === 'right' ? bookSize.w : 0, y: cornerY };
    const peekPt = {
      x: side === 'right' ? bookSize.w - 46 : 46,
      y: cornerY === 0 ? 36 : cornerY - 36,
    };

    setCurl((prev) =>
      prev && prev.side === side && prev.cornerY === cornerY
        ? { ...prev, target: peekPt, mode: 'hover' }
        : {
            side,
            cornerY,
            targetPage,
            pointer: basePt,
            target: peekPt,
            mode: 'hover',
          }
    );
  };

  const clearHoverCorner = (side: 'right' | 'left', cornerY: number) => {
    setCurl((prev) => {
      if (!prev || prev.mode !== 'hover' || prev.side !== side || prev.cornerY !== cornerY) {
        return prev;
      }
      return {
        ...prev,
        target: { x: side === 'right' ? bookSize.w : 0, y: cornerY },
      };
    });
  };

  const startDragCorner = (
    e: React.PointerEvent,
    side: 'right' | 'left',
    cornerY: number
  ) => {
    if (!isDesktopSpread || e.button !== 0 || isFileDraggingRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    const targetPage =
      side === 'right'
        ? bookPage >= totalSpreads - 1
          ? 0
          : bookPage + 1
        : bookPage <= 0
          ? totalSpreads - 1
          : bookPage - 1;

    pointerDownStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: performance.now(),
    };
    const pt = toBookCoords(e.clientX, e.clientY);
    const startPeek = {
      x: side === 'right' ? Math.min(pt.x, bookSize.w - 18) : Math.max(pt.x, 18),
      y: pt.y,
    };

    setCurl({
      side,
      cornerY,
      targetPage,
      pointer: curl?.mode === 'hover' ? curl.pointer : startPeek,
      target: startPeek,
      mode: 'dragging',
    });
  };

  // Compute exact geometric clip-paths, rigid CSS matrix & gradient crease geometry
  const geom = useMemo(() => {
    if (!curl || !isDesktopSpread) return null;
    const W = bookSize.w;
    const H = bookSize.h;
    const halfW = W / 2;

    const P = clampToSpine(curl.pointer, W, H, curl.side, curl.cornerY);
    const C: Pt = { x: curl.side === 'right' ? W : 0, y: curl.cornerY };
    const vx = C.x - P.x;
    const vy = C.y - P.y;
    const dist = Math.hypot(vx, vy);
    if (dist < 2) return null;

    const M: Pt = { x: (C.x + P.x) / 2, y: (C.y + P.y) / 2 };
    const N: Pt = { x: vx / dist, y: vy / dist };

    const pageRect: Pt[] =
      curl.side === 'right'
        ? [
            { x: halfW, y: 0 },
            { x: W, y: 0 },
            { x: W, y: H },
            { x: halfW, y: H },
          ]
        : [
            { x: 0, y: 0 },
            { x: halfW, y: 0 },
            { x: halfW, y: H },
            { x: 0, y: H },
          ];

    const remainingPoly = clipPolyHalfPlane(pageRect, M, N, false);
    const peelPoly = clipPolyHalfPlane(pageRect, M, N, true);
    if (peelPoly.length < 3) return null;

    const flapPoly = peelPoly.map((pt) => {
      const d = (pt.x - M.x) * N.x + (pt.y - M.y) * N.y;
      return { x: pt.x - 2 * d * N.x, y: pt.y - 2 * d * N.y };
    });

    // Rigid 2D transform matrix for the flipped underside leaf
    const a = N.x * N.x - N.y * N.y;
    const b = 2 * N.x * N.y;
    const c = -2 * N.x * N.y;
    const d = a;

    let tx = 0;
    let ty = 0;
    if (curl.side === 'right') {
      const k = (W - M.x) * N.x - M.y * N.y;
      tx = W - 2 * N.x * k;
      ty = -2 * N.y * k;
    } else {
      const k = (halfW - M.x) * N.x - M.y * N.y;
      tx = halfW - 2 * N.x * k;
      ty = -2 * N.y * k;
    }

    const foldAngleRad = Math.atan2(N.y, N.x);
    const foldLength = Math.hypot(W, H) * 2;
    const curlProgress = Math.min(1, dist / W);

    return {
      W,
      H,
      halfW,
      M,
      N,
      foldAngleDeg: (foldAngleRad * 180) / Math.PI,
      foldLength,
      curlProgress,
      remainingClip: polyToCssPct(
        remainingPoly,
        halfW,
        H,
        curl.side === 'right' ? halfW : 0
      ),
      peelClip: polyToCssPct(peelPoly, W, H, 0),
      flapClip: polyToCssPct(flapPoly, W, H, 0),
      flapMatrix: `matrix(${a.toFixed(6)}, ${b.toFixed(6)}, ${c.toFixed(6)}, ${d.toFixed(6)}, ${tx.toFixed(2)}, ${ty.toFixed(2)})`,
    };
  }, [curl, isDesktopSpread, bookSize]);

  const cornerHitZones = isDesktopSpread && curlEnabled
    ? [
        { side: 'right' as const, cornerY: bookSize.h, pos: 'bottom-0 right-0', label: 'Drag or click bottom-right corner to turn forward' },
        { side: 'right' as const, cornerY: 0, pos: 'top-0 right-0', label: 'Drag or click top-right corner to turn forward' },
        { side: 'left' as const, cornerY: bookSize.h, pos: 'bottom-0 left-0', label: 'Drag or click bottom-left corner to turn back' },
        { side: 'left' as const, cornerY: 0, pos: 'top-0 left-0', label: 'Drag or click top-left corner to turn back' },
      ]
    : [];

  return (
    <div
      ref={outerViewportRef}
      onDragEnter={(e) => {
        if (e.dataTransfer?.types?.includes('Files')) {
          isFileDraggingRef.current = true;
        }
      }}
      onDragOver={(e) => {
        if (e.dataTransfer?.types?.includes('Files')) {
          isFileDraggingRef.current = true;
        }
      }}
      onDrop={() => {
        isFileDraggingRef.current = false;
      }}
      onDragEnd={() => {
        isFileDraggingRef.current = false;
      }}
      className={`relative w-full ${
        zoom > 1 ? 'overflow-auto pb-4' : 'overflow-visible'
      }`}
    >
      {/* Scaled Container for Zoom Support */}
      <div
        className="mx-auto transition-[width] duration-200 ease-out"
        style={{
          width: zoom === 1 ? '100%' : `${Math.round(1280 * zoom)}px`,
          maxWidth: zoom === 1 ? '1320px' : 'none',
        }}
      >
        {/* Physical Open-Book Frame */}
        <div
          ref={bookRef}
          className={`relative border border-[#DEDEDE] bg-white shadow-[0_12px_36px_rgba(0,0,0,0.06)] ${
            curlEnabled && curl?.mode === 'dragging' ? 'cursor-grabbing select-none' : ''
          }`}
        >
          {/* Architectural outer frame corner registration ticks */}
          {curlEnabled && !classicMode && (
            <>
              <span aria-hidden="true" className="pointer-events-none absolute -top-1.5 -left-1.5 z-40 h-3 w-3 border-t border-l metallic-frame-tick" />
              <span aria-hidden="true" className="pointer-events-none absolute -top-1.5 -right-1.5 z-40 h-3 w-3 border-t border-r metallic-frame-tick" />
              <span aria-hidden="true" className="pointer-events-none absolute -bottom-1.5 -left-1.5 z-40 h-3 w-3 border-b border-l metallic-frame-tick" />
              <span aria-hidden="true" className="pointer-events-none absolute -bottom-1.5 -right-1.5 z-40 h-3 w-3 border-b border-r metallic-frame-tick" />
            </>
          )}

          {/* ================================================================
              PERSISTENT TWO-PAGE SPREAD (ZERO UNMOUNTING ON HOVER/DRAG)
              Left Page (Verso) | Center Spine | Right Page (Recto)
              ================================================================ */}
          <div className="relative grid grid-cols-1 bg-white md:grid-cols-2">
            {/* LEFT HALF (VERSO) */}
            <div className="relative overflow-hidden bg-white">
              {geom && curl && curl.side === 'left' && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-0 isolate overflow-hidden bg-white"
                >
                  {renderSpread(curl.targetPage, 'verso', true)}
                </div>
              )}

              <div
                className="relative z-10 isolate h-full bg-white"
                style={
                  geom && curl && curl.side === 'left'
                    ? { clipPath: geom.remainingClip }
                    : undefined
                }
              >
                {renderSpread(bookPage, 'verso', false)}
              </div>
            </div>

            {/* RIGHT HALF (RECTO) */}
            <div className="relative overflow-hidden bg-white">
              {geom && curl && curl.side === 'right' && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-0 isolate overflow-hidden bg-white"
                >
                  {renderSpread(curl.targetPage, 'recto', true)}
                </div>
              )}

              <div
                className="relative z-10 isolate h-full bg-white"
                style={
                  geom && curl && curl.side === 'right'
                    ? { clipPath: geom.remainingClip }
                    : undefined
                }
              >
                {renderSpread(bookPage, 'recto', false)}
              </div>
            </div>

            {/* Persistent Center Binding Spine Crease */}
            <div
              aria-hidden="true"
              className="book-spine-crease pointer-events-none absolute inset-y-0 left-1/2 z-20 hidden w-1.5 -translate-x-1/2 md:block"
            />
          </div>

          {/* ================================================================
              CAST SHADOW ON REVEALED UNDERNEATH PAGE ALONG FOLD LINE
              ================================================================ */}
          {geom && curl && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
              style={{ clipPath: geom.peelClip }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: `${geom.M.x}px`,
                  top: `${geom.M.y}px`,
                  width: '68px',
                  height: `${geom.foldLength}px`,
                  transformOrigin: '0 50%',
                  transform: `translate(0, -50%) rotate(${geom.foldAngleDeg}deg)`,
                  background: `linear-gradient(to right, rgba(0, 0, 0, ${
                    0.14 + geom.curlProgress * 0.16
                  }) 0%, rgba(0, 0, 0, 0.06) 38%, transparent 100%)`,
                }}
              />
            </div>
          )}

          {/* ================================================================
              LIFTED CURLED FLAP (TRANSFORMED OPPOSITE PAGE BACKSIDE + SHADING)
              ================================================================ */}
          {geom && curl && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-30 isolate overflow-hidden"
              style={{
                filter: `drop-shadow(${
                  curl.side === 'right' ? '-6px' : '6px'
                } 6px 14px rgba(0, 0, 0, ${0.14 + geom.curlProgress * 0.12}))`,
              }}
            >
              <div
                className="absolute inset-0 isolate overflow-hidden bg-white"
                style={{ clipPath: geom.flapClip }}
              >
                <div
                  className="bg-white"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${geom.halfW}px`,
                    height: `${geom.H}px`,
                    transformOrigin: '0 0',
                    transform: geom.flapMatrix,
                  }}
                >
                  {renderSpread(
                    curl.targetPage,
                    curl.side === 'right' ? 'verso' : 'recto',
                    true
                  )}
                </div>

                {/* Cylindrical Fold Crease Highlight & Paper Curl Gradient */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${geom.M.x}px`,
                    top: `${geom.M.y}px`,
                    width: '56px',
                    height: `${geom.foldLength}px`,
                    transformOrigin: '100% 50%',
                    transform: `translate(-100%, -50%) rotate(${geom.foldAngleDeg}deg)`,
                    background:
                      'linear-gradient(to left, rgba(0,0,0,0.16) 0%, rgba(255,255,255,0.48) 16%, rgba(0,0,0,0.04) 55%, transparent 100%)',
                  }}
                />
              </div>
            </div>
          )}

          {/* ================================================================
              CORNER-PEEL INTERACTIVE HOT ZONES (MOUSE DRAG & CLICK TO FLIP)
              ================================================================ */}
          {cornerHitZones.map((zone) => {
            const isTop = zone.cornerY === 0;
            const isRight = zone.side === 'right';
            return (
              <div
                key={`${zone.side}-${zone.cornerY}`}
                role="button"
                tabIndex={0}
                aria-label={zone.label}
                onPointerEnter={() => startHoverCorner(zone.side, zone.cornerY)}
                onPointerLeave={() => clearHoverCorner(zone.side, zone.cornerY)}
                onPointerDown={(e) => startDragCorner(e, zone.side, zone.cornerY)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const target =
                      isRight
                        ? bookPage >= totalSpreads - 1
                          ? 0
                          : bookPage + 1
                        : bookPage <= 0
                          ? totalSpreads - 1
                          : bookPage - 1;
                    onCommitPage(target);
                  }
                }}
                className={`group/corner absolute ${zone.pos} z-40 h-20 w-20 cursor-grab active:cursor-grabbing`}
              >
                {/* Whisper-subtle diagonal corner curl affordance indicator */}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute h-5 w-5 border-[#CCCCCC] opacity-55 transition-opacity group-hover/corner:opacity-100 ${
                    isTop && isRight
                      ? 'top-0 right-0 bg-gradient-to-bl from-[#EFEFEF] via-white to-transparent border-b border-l'
                      : !isTop && isRight
                        ? 'bottom-0 right-0 bg-gradient-to-tl from-[#EFEFEF] via-white to-transparent border-t border-l'
                        : isTop && !isRight
                          ? 'top-0 left-0 bg-gradient-to-br from-[#EFEFEF] via-white to-transparent border-b border-r'
                          : 'bottom-0 left-0 bg-gradient-to-tr from-[#EFEFEF] via-white to-transparent border-t border-r'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

