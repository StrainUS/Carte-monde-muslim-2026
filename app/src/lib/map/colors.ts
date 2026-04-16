import type { Country } from '$data';

export type DominantSect = 'sunni' | 'shia' | 'mixed' | 'ibadi' | 'none';

export interface FillStyle {
  fillColor: string;
  fillOpacity: number;
  color: string;
  weight: number;
  dominant: DominantSect;
}

/** Determine the dominant Islamic branch in a country. */
export function dominant(c: Country): DominantSect {
  if (c.muslimPct < 2) return 'none';
  if (c.ibadiPct >= 60) return 'ibadi';
  const major = Math.max(c.sunniPct, c.shiaPct);
  const diff = Math.abs(c.sunniPct - c.shiaPct);
  if (diff < 20 && c.shiaPct > 20 && c.sunniPct > 20) return 'mixed';
  return c.sunniPct >= c.shiaPct ? 'sunni' : 'shia';
}

/**
 * Opacity scale: the higher the Muslim%, the more saturated.
 * Non-Muslim majority countries remain subtly tinted, not black.
 */
function intensity(muslimPct: number): number {
  if (muslimPct < 2) return 0.04;
  if (muslimPct < 10) return 0.18;
  if (muslimPct < 25) return 0.32;
  if (muslimPct < 50) return 0.48;
  if (muslimPct < 80) return 0.62;
  return 0.78;
}

const PALETTE: Record<DominantSect, { strong: string; soft: string }> = {
  sunni: { strong: '#145c1d', soft: '#1e8a30' },
  shia: { strong: '#0b3d8a', soft: '#1456c8' },
  mixed: { strong: '#4a1478', soft: '#6a1b9a' },
  ibadi: { strong: '#6a1b9a', soft: '#8e24aa' },
  none: { strong: '#262c36', soft: '#2f3642' }
};

export function styleCountry(c: Country | undefined): FillStyle {
  if (!c) {
    return {
      fillColor: 'rgba(255,255,255,0.03)',
      fillOpacity: 0.6,
      color: 'rgba(255,255,255,0.18)',
      weight: 0.4,
      dominant: 'none'
    };
  }
  const d = dominant(c);
  const op = intensity(c.muslimPct);
  const base = PALETTE[d];
  const color = c.muslimPct >= 40 ? base.strong : base.soft;
  return {
    fillColor: color,
    fillOpacity: op,
    color: 'rgba(255,255,255,0.18)',
    weight: 0.5,
    dominant: d
  };
}

export const SECT_LABEL: Record<DominantSect, string> = {
  sunni: 'Sunnite',
  shia: 'Chiite',
  mixed: 'Mixte sunnite/chiite',
  ibadi: 'Ibadi',
  none: 'Peu ou pas de musulmans'
};
