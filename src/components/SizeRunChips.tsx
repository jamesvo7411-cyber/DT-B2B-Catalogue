import React from 'react';

interface SizeRunChipsProps {
  sizeRun: string;
  compact?: boolean;
  size?: 'xs' | 'sm' | 'md';
  tone?: 'light' | 'muted';
}

export const SizeRunChips: React.FC<SizeRunChipsProps> = ({
  sizeRun,
  compact = false,
  size,
  tone = 'light',
}) => {
  const tokens = sizeRun
    .split(/[/,|]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  const resolvedSize = size ?? (compact ? 'xs' : 'sm');

  const circleClasses =
    resolvedSize === 'xs'
      ? 'h-[19px] min-w-[19px] px-1 text-[7.5px]'
      : resolvedSize === 'md'
        ? 'h-6 min-w-6 px-1.5 text-[9px]'
        : 'h-[22px] min-w-[22px] px-1 text-[8px]';

  const toneClasses =
    tone === 'muted'
      ? 'border-[#D1CFC8] bg-[#E5E3DD] text-[#171715]'
      : 'border-[#D7D5CE] bg-[#EEEDE8] text-[#141412]';

  if (tokens.length === 0) {
    return <span className="font-mono text-[9.5px] text-[#55534E]">—</span>;
  }

  return (
    <span
      className="inline-flex flex-wrap items-center gap-1"
      aria-label={`Available sizes: ${tokens.join(', ')}`}
    >
      {tokens.map((token, idx) => (
        <span
          key={`${token}-${idx}`}
          className={`inline-flex items-center justify-center rounded-full border font-mono font-semibold leading-none tracking-tight tabular-nums select-none ${circleClasses} ${toneClasses}`}
        >
          {token}
        </span>
      ))}
    </span>
  );
};
