export function displayFabricComposition(composition: string): string {
  return composition
    .replace(/\s*\[[^\]]*(?:source truncated|pending|verify)[^\]]*\]/gi, '')
    .replace(/[,\s]+$/, '')
    .trim();
}

export function displayMoq(moq: string): string {
  const trimmed = moq.trim();
  if (!trimmed) return '—';
  return trimmed.replace(/\s*\(Placeholder\)\s*$/i, ' · Est.');
}

export function hasIncompleteFabricComposition(dataFlags?: string[]): boolean {
  return Boolean(
    dataFlags?.some(
      (flag) =>
        /fabric content|composition/i.test(flag) &&
        /truncat|incomplete|partial/i.test(flag)
    )
  );
}

export function getBuyerVisibleValue(value?: string | null): string | undefined {
  const trimmed = value?.trim();
  if (
    !trimmed ||
    /\b(?:placeholder|pending|tbd|tbc|provisional|unverified|unconfirmed|truncated|incomplete)\b/i.test(
      trimmed
    ) ||
    /\bnot\s+(?:(?:yet|currently)\s+)?(?:listed|declared|provided|available|supplied|specified)\b/i.test(
      trimmed
    ) ||
    /\bno\s+(?:[\w-]+\s+){0,5}(?:note|data|information|reference|image|photography|specification)\s+(?:supplied|provided|listed|available)\b/i.test(
      trimmed
    ) ||
    /^(?:[-–—]+|n\/a|unknown)$/i.test(trimmed)
  ) {
    return undefined;
  }
  return trimmed;
}

export function displayBuyerProductTitle(title: string): string {
  return title.replace(/\*+$/, '');
}

export function conciseSourceNote(flags?: string[]): string {
  if (!flags?.length) return '';

  const notes: string[] = [];
  if (flags.some((flag) => /fabric content truncated/i.test(flag))) {
    notes.push('Fabric composition is incomplete in the source; confirm the full blend.');
  }
  if (flags.some((flag) => /colorway name truncated/i.test(flag))) {
    notes.push('A colorway name is truncated in the source.');
  }

  const remaining = flags.filter(
    (flag) =>
      !/fabric content truncated|colorway name truncated/i.test(flag)
  );
  return [...notes, ...remaining].join(' ');
}
