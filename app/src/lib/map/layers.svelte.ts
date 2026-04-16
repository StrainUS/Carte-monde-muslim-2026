export type LayerKey = 'sunni' | 'shia' | 'mixed' | 'ibadi' | 'tensions' | 'hotspots' | 'labels';

export const LAYER_DEFAULTS: Record<LayerKey, boolean> = {
  sunni: true,
  shia: true,
  mixed: true,
  ibadi: true,
  tensions: false,
  hotspots: false,
  labels: true
};
