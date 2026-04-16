export type LayerKey = 'sunni' | 'shia' | 'mixed' | 'ibadi' | 'tensions' | 'hotspots' | 'labels';

const DEFAULTS: Record<LayerKey, boolean> = {
  sunni: true,
  shia: true,
  mixed: true,
  ibadi: true,
  tensions: false,
  hotspots: false,
  labels: true
};

export interface LayerState {
  toggle(k: LayerKey): void;
  set(k: LayerKey, v: boolean): void;
  readonly value: Record<LayerKey, boolean>;
  subscribe(fn: (v: Record<LayerKey, boolean>) => void): () => void;
}

export function createLayerState(): LayerState {
  let state = $state({ ...DEFAULTS });
  const listeners = new Set<(v: Record<LayerKey, boolean>) => void>();

  function notify() {
    for (const l of listeners) l(state);
  }

  return {
    get value() {
      return state;
    },
    toggle(k) {
      state = { ...state, [k]: !state[k] };
      notify();
    },
    set(k, v) {
      state = { ...state, [k]: v };
      notify();
    },
    subscribe(fn) {
      listeners.add(fn);
      fn(state);
      return () => listeners.delete(fn);
    }
  };
}
