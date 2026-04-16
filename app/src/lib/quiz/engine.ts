import type { QuizQuestion } from '$data';

export interface AnswerState {
  picks: number[];
  submitted: boolean;
  correct: boolean;
}

export function shuffle<T>(arr: T[], seed = Date.now()): T[] {
  const rng = mulberry32(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function isCorrect(q: QuizQuestion, picks: number[]): boolean {
  const sorted = [...picks].sort((a, b) => a - b);
  if (q.type === 'qcu') {
    return sorted.length === 1 && sorted[0] === q.answer;
  }
  const expected = [...q.answers].sort((a, b) => a - b);
  if (sorted.length !== expected.length) return false;
  return sorted.every((v, i) => v === expected[i]);
}

export function togglePick(q: QuizQuestion, picks: number[], i: number): number[] {
  if (q.type === 'qcu') return [i];
  if (picks.includes(i)) return picks.filter((p) => p !== i);
  return [...picks, i];
}

export interface QuizSummary {
  total: number;
  correct: number;
  percent: number;
  byType: { qcu: { correct: number; total: number }; qcm: { correct: number; total: number } };
  wrongIds: string[];
  takenAt: string;
}

export function summarize(qs: QuizQuestion[], answers: Record<string, AnswerState>): QuizSummary {
  let correct = 0;
  const byType = {
    qcu: { correct: 0, total: 0 },
    qcm: { correct: 0, total: 0 }
  };
  const wrongIds: string[] = [];
  for (const q of qs) {
    const a = answers[q.id];
    byType[q.type].total += 1;
    if (a?.correct) {
      correct += 1;
      byType[q.type].correct += 1;
    } else if (a?.submitted) {
      wrongIds.push(q.id);
    }
  }
  const total = qs.length;
  return {
    total,
    correct,
    percent: total ? Math.round((correct / total) * 100) : 0,
    byType,
    wrongIds,
    takenAt: new Date().toISOString()
  };
}
