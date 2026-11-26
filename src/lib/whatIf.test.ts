import { describe, it, expect } from 'vitest';
import { applyHypotheticals } from './whatIf';
import type { Course } from '../types';

const baseCourse: Course = {
  id: 'c1',
  name: 'Test',
  targetGrade: 90,
  categories: [
    {
      id: 'cat1',
      name: 'Quizzes',
      weight: 50,
      items: [
        { id: 'q1', name: 'Quiz 1', score: 80, max: 100 },
        { id: 'q2', name: 'Quiz 2', dueDate: '2024-12-01', max: 100 },
      ],
    },
    {
      id: 'cat2',
      name: 'Final',
      weight: 50,
      items: [
        { id: 'f1', name: 'Final Exam', dueDate: '2024-12-15' },
      ],
    },
  ],
};

describe('applyHypotheticals', () => {
  it('empty map returns structurally identical course', () => {
    const result = applyHypotheticals(baseCourse, new Map());
    expect(result.id).toBe(baseCourse.id);
    expect(result.categories).toHaveLength(2);
    expect(result.categories[0].items).toHaveLength(2);
    const q2 = result.categories[0].items[1];
    expect('dueDate' in q2).toBe(true);
  });

  it('does not mutate the original course', () => {
    const hyp = new Map([['q2', 75]]);
    applyHypotheticals(baseCourse, hyp);
    const origQ2 = baseCourse.categories[0].items[1];
    expect('dueDate' in origQ2).toBe(true);
    expect('score' in origQ2).toBe(false);
  });

  it('converts mapped RemainingItem to CompletedItem with correct score and max', () => {
    const hyp = new Map([['q2', 75]]);
    const result = applyHypotheticals(baseCourse, hyp);
    const q2 = result.categories[0].items[1];
    expect('score' in q2).toBe(true);
    expect('dueDate' in q2).toBe(false);
    if ('score' in q2) {
      expect(q2.score).toBe(75);
      expect(q2.max).toBe(100);
    }
  });

  it('defaults max to 100 when RemainingItem has no max', () => {
    const hyp = new Map([['f1', 90]]);
    const result = applyHypotheticals(baseCourse, hyp);
    const f1 = result.categories[1].items[0];
    expect('score' in f1).toBe(true);
    if ('score' in f1) {
      expect(f1.max).toBe(100);
      expect(f1.score).toBe(90);
    }
  });

  it('unmapped items remain unchanged', () => {
    const hyp = new Map([['q2', 75]]);
    const result = applyHypotheticals(baseCourse, hyp);
    const q1 = result.categories[0].items[0];
    expect('score' in q1).toBe(true);
    if ('score' in q1) expect(q1.score).toBe(80);
    const f1 = result.categories[1].items[0];
    expect('dueDate' in f1).toBe(true);
  });

  it('original categories array is not the same reference', () => {
    const result = applyHypotheticals(baseCourse, new Map());
    expect(result.categories).not.toBe(baseCourse.categories);
    expect(result.categories[0].items).not.toBe(baseCourse.categories[0].items);
  });
});
