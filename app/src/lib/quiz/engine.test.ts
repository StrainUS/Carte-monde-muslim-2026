import { describe, it, expect } from 'vitest';
import { isCorrect, togglePick, summarize, shuffle } from './engine';
import type { QuizQuestion } from '$data';

const qcu: QuizQuestion = {
  type: 'qcu',
  id: 'q1',
  question: 'Test',
  options: ['a', 'b', 'c', 'd'],
  answer: 2,
  explain: 'because'
};

const qcm: QuizQuestion = {
  type: 'qcm',
  id: 'q2',
  question: 'Test',
  options: ['a', 'b', 'c', 'd'],
  answers: [1, 3],
  explain: 'because'
};

describe('quiz engine', () => {
  it('QCU : bonne réponse unique', () => {
    expect(isCorrect(qcu, [2])).toBe(true);
    expect(isCorrect(qcu, [1])).toBe(false);
    expect(isCorrect(qcu, [2, 3])).toBe(false);
  });

  it('QCM : toutes les bonnes, rien que les bonnes', () => {
    expect(isCorrect(qcm, [1, 3])).toBe(true);
    expect(isCorrect(qcm, [3, 1])).toBe(true);
    expect(isCorrect(qcm, [1])).toBe(false);
    expect(isCorrect(qcm, [1, 2, 3])).toBe(false);
  });

  it('togglePick QCU remplace', () => {
    expect(togglePick(qcu, [1], 2)).toEqual([2]);
  });

  it('togglePick QCM ajoute/retire', () => {
    expect(togglePick(qcm, [1], 3)).toEqual([1, 3]);
    expect(togglePick(qcm, [1, 3], 1)).toEqual([3]);
  });

  it('résumé global', () => {
    const answers = {
      q1: { picks: [2], submitted: true, correct: true },
      q2: { picks: [1], submitted: true, correct: false }
    };
    const s = summarize([qcu, qcm], answers);
    expect(s.correct).toBe(1);
    expect(s.total).toBe(2);
    expect(s.percent).toBe(50);
    expect(s.wrongIds).toEqual(['q2']);
  });

  it('shuffle déterministe avec seed', () => {
    const a = shuffle([1, 2, 3, 4, 5], 42);
    const b = shuffle([1, 2, 3, 4, 5], 42);
    expect(a).toEqual(b);
    expect(a.sort()).toEqual([1, 2, 3, 4, 5]);
  });
});
