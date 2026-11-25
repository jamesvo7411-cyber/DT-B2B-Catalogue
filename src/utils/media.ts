import type { CSSProperties } from 'react';
import type { ImageCrop } from '../types/catalogue';

/**
 * Reads an uploaded image File and downscales gently only if huge (> 1600px)
 * so high-resolution print quality is preserved while keeping browser storage responsive.
 */
export function readImageFileAsDataUrl(file: File, maxDimension = 1600): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const rawUrl = String(reader.result || '');
      const img = new Image();
      img.onload = () => {
        const { width, height } = img;
        if (width <= maxDimension && height <= maxDimension) {
          resolve(rawUrl);
          return;
        }
        const scale = Math.min(maxDimension / width, maxDimension / height);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.onerror = () => resolve(rawUrl);
      img.src = rawUrl;
    };
    reader.readAsDataURL(file);
  });
}

export interface ParsedVideo {
  type: 'youtube' | 'vimeo' | 'direct' | 'none';
  embedUrl: string;
}

export function parseVideoUrl(url: string): ParsedVideo {
  const trimmed = url.trim();
  if (!trimmed) {
    return { type: 'none', embedUrl: '' };
  }

  // YouTube
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`,
    };
  }

  // Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  return { type: 'direct', embedUrl: trimmed };
}

export function normalizeImageCrop(
  crop?: Partial<ImageCrop>,
  minScale = 1
): Required<ImageCrop> {
  const safeMin = typeof minScale === 'number' && Number.isFinite(minScale) ? Math.max(1, minScale) : 1;
  const rawScale = crop?.scale;
  const scale =
    typeof rawScale === 'number' && Number.isFinite(rawScale)
      ? Math.min(3.5, Math.max(safeMin, rawScale))
      : safeMin;
  const maxPan = (50 * (scale - 1)) / scale;
  const rawX = crop?.x;
  const rawY = crop?.y;
  const x =
    typeof rawX === 'number' && Number.isFinite(rawX)
      ? Math.min(maxPan, Math.max(-maxPan, rawX))
      : 0;
  const y =
    typeof rawY === 'number' && Number.isFinite(rawY)
      ? Math.min(maxPan, Math.max(-maxPan, rawY))
      : 0;
  const rawPosX = crop?.posX;
  const rawPosY = crop?.posY;
  const posX =
    typeof rawPosX === 'number' && Number.isFinite(rawPosX)
      ? Math.min(100, Math.max(0, rawPosX))
      : 50;
  const posY =
    typeof rawPosY === 'number' && Number.isFinite(rawPosY)
      ? Math.min(100, Math.max(0, rawPosY))
      : 50;

  return { scale, x, y, posX, posY };
}

export function imageCropStyle(
  crop?: Partial<ImageCrop>,
  minScale = 1
): CSSProperties {
  const normalized = normalizeImageCrop(crop, minScale);
  return {
    transform: `translate(${normalized.x}%, ${normalized.y}%) scale(${normalized.scale})`,
    transformOrigin: 'center center',
    objectPosition: `${normalized.posX}% ${normalized.posY}%`,
  };
}
