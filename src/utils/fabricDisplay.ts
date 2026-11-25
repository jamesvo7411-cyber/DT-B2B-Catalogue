import type { FactoryFabricColor } from '../types/catalogue';

export function getDisplayColorName(color: FactoryFabricColor): string {
  const match = color.colorName.match(/^(.*?)\s*\(([^)]+)\)$/);
  if (!match) return color.colorName;
  const prefix = match[1].trim();
  const suffix = match[2].trim();
  if (prefix.toUpperCase() === color.shadeCode.toUpperCase()) return suffix;
  if (suffix.toUpperCase() === color.shadeCode.toUpperCase()) return prefix;
  if (/^[A-Z]{1,2}\d{2,4}$/i.test(prefix)) return suffix;
  return color.colorName;
}

export function getBuyerFacingColorNote(color: FactoryFabricColor): string | undefined {
  const note = color.sourceNote.toLowerCase();
  if (note.includes('teal')) {
    return 'Factory review says this shade may appear teal rather than grey; confirm against the physical swatch.';
  }
  if (note.includes('suggested') || note.includes('missing in source')) {
    return 'The English shade name is provisional; confirm against the physical swatch.';
  }
  return undefined;
}
