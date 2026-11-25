export function displayFabricComposition(composition: string): string {
  return composition
    .replace(/\s*\[[^\]]*(?:source truncated|pending|verify)[^\]]*\]/gi, '')
    .replace(/[,\s]+$/, '')
    .trim();
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
