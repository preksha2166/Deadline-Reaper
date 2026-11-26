import { describe, it, expect } from 'vitest';
import { calcGrades } from './grades';
import type { Course } from '../types';

const TOL = 0.01;

function approx(a: number, b: number) {
  return Math.abs(a - b) < TOL;
}

/** Build the Requirement 12 canonical course (Quizzes 70%, Projects 95%, Pres remaining, Final remaining) */
function makeReq12Course(): Course {
  return {
    id: 'c1',
    name: 'Test Course',
    targetGrade: 94,
    categories: [
      {
        id: 'quiz',
        name: 'Quizzes',
        weight: 20,
        items: [
          { id: 'q1', name: 'Quiz 1', score: 70, max: 100 },
        ],
      },
      {
        id: 'proj',
        name: 'Projects',
        weight: 40,
        items: [
          { id: 'p1', name: 'Project 1', score: 95, max: 100 },
        ],
      },
      {
        id: 'pres',
        name: 'Presentation',
        weight: 15,
        items: [
          { id: 'pr1', name: 'Presentation', dueDate: '2024-12-01', max: 100 },
        ],
      },
      {
        id: 'final',
        name: 'Final',
        weight: 25,
        items: [
          { id: 'f1', name: 'Final Exam', dueDate: '2024-12-15', max: 100 },
        ],
      },
    ],
  };
}

// ─── Requirement 12: concrete examples ────────────────────────────────────────

describe('Requirement 12 — canonical test case', () => {
  it('target 94 → Doomed, Earned=52, CompletedWeight=60, CurrentGrade≈86.67, Max=92, Required=105', () => {
    const course = makeReq12Course();
    const r = calcGrades(course, 94);
    expect(approx(r.earnedPoints, 52.0)).toBe(true);
    expect(approx(r.completedWeight, 60.0)).toBe(true);
    expect(r.currentGrade).not.toBeNull();
    expect(approx(r.currentGrade!, 86.67)).toBe(true);
    expect(approx(r.remainingWeight, 40.0)).toBe(true);
    expect(approx(r.maxAchievable, 92.0)).toBe(true);
    expect(r.requiredAverage).not.toBeNull();
    expect(approx(r.requiredAverage!, 105.0)).toBe(true);
    expect(r.verdict).toBe('Doomed');
  });

  it('target 90 → AtRisk, Required≈95', () => {
    const course = makeReq12Course();
    const r = calcGrades(course, 90);
    expect(r.verdict).toBe('AtRisk');
    expect(r.requiredAverage).not.toBeNull();
    expect(approx(r.requiredAverage!, 95.0)).toBe(true);
  });

  it('target 50 → Safe (Earned 52 >= 50)', () => {
    const course = makeReq12Course();
    const r = calcGrades(course, 50);
    expect(r.verdict).toBe('Safe');
  });
});

// ─── Edge cases from Requirement 9 ───────────────────────────────────────────

describe('Edge cases', () => {
  it('all weights 0 → Doomed error result', () => {
    const course: Course = {
      id: 'c', name: 'C', targetGrade: 50,
      categories: [
        { id: 'a', name: 'A', weight: 0, items: [{ id: 'i1', name: 'I1', score: 80, max: 100 }] },
      ],
    };
    const r = calcGrades(course, 50);
    expect(r.verdict).toBe('Doomed');
    expect(r.earnedPoints).toBe(0);
  });

  it('weights summing to 50 (normalized correctly)', () => {
    const course: Course = {
      id: 'c', name: 'C', targetGrade: 90,
      categories: [
        { id: 'a', name: 'A', weight: 25, items: [{ id: 'i1', name: 'I1', score: 100, max: 100 }] },
        { id: 'b', name: 'B', weight: 25, items: [{ id: 'i2', name: 'I2', dueDate: '2024-12-01', max: 100 }] },
      ],
    };
    const r = calcGrades(course, 90);
    // With equal weights (25+25=50), completed=50%, earned=50
    expect(approx(r.completedWeight, 50)).toBe(true);
    expect(approx(r.earnedPoints, 50)).toBe(true);
    // requiredAverage = (90 - 50) / 50 * 100 = 80
    expect(r.requiredAverage).not.toBeNull();
    expect(approx(r.requiredAverage!, 80)).toBe(true);
    expect(r.verdict).toBe('AtRisk');
  });

  it('weights summing to 99 — same as 100 after normalization', () => {
    const course: Course = {
      id: 'c', name: 'C', targetGrade: 60,
      categories: [
        { id: 'a', name: 'A', weight: 59, items: [{ id: 'i1', name: 'I1', score: 100, max: 100 }] },
        { id: 'b', name: 'B', weight: 40, items: [{ id: 'i2', name: 'I2', dueDate: '2024-12-01', max: 100 }] },
      ],
    };
    const r = calcGrades(course, 60);
    // normalized: a=59/99≈0.5960, b=40/99≈0.4040
    // earnedPoints ≈ 59.60, completedWeight ≈ 59.60
    expect(approx(r.completedWeight, 59.60)).toBe(true);
    expect(r.verdict).toBe('AtRisk'); // earned 59.6 < target 60, max 100 >= 60
    // maxAchievable = 59.60 + 40.40 = 100
    expect(approx(r.maxAchievable, 100)).toBe(true);
  });

  it('weights summing to 101 — normalized correctly', () => {
    const course: Course = {
      id: 'c', name: 'C', targetGrade: 50,
      categories: [
        { id: 'a', name: 'A', weight: 51, items: [{ id: 'i1', name: 'I1', score: 100, max: 100 }] },
        { id: 'b', name: 'B', weight: 50, items: [{ id: 'i2', name: 'I2', score: 80, max: 100 }] },
      ],
    };
    const r = calcGrades(course, 50);
    // All completed, remainingWeight=0
    expect(approx(r.remainingWeight, 0)).toBe(true);
    expect(r.requiredAverage).toBeNull();
    // earnedPoints = (51/101)*100 + (50/101)*80 = 50.495 + 39.604 = 90.099
    expect(r.earnedPoints).toBeGreaterThan(85);
    expect(r.verdict).toBe('Safe');
  });

  it('weights summing to 200 — normalized correctly', () => {
    const course: Course = {
      id: 'c', name: 'C', targetGrade: 70,
      categories: [
        { id: 'a', name: 'A', weight: 100, items: [{ id: 'i1', name: 'I1', score: 70, max: 100 }] },
        { id: 'b', name: 'B', weight: 100, items: [{ id: 'i2', name: 'I2', dueDate: '2024-12-01', max: 100 }] },
      ],
    };
    const r = calcGrades(course, 70);
    // Equal weights: completed=50, earned=35, maxAchievable=85
    expect(approx(r.completedWeight, 50)).toBe(true);
    expect(approx(r.earnedPoints, 35)).toBe(true);
    expect(approx(r.maxAchievable, 85)).toBe(true);
    expect(r.verdict).toBe('AtRisk');
  });

  it('zero-weight category excluded', () => {
    const course: Course = {
      id: 'c', name: 'C', targetGrade: 80,
      categories: [
        { id: 'a', name: 'A', weight: 0, items: [{ id: 'i1', name: 'I1', score: 0, max: 100 }] },
        { id: 'b', name: 'B', weight: 100, items: [{ id: 'i2', name: 'I2', score: 90, max: 100 }] },
      ],
    };
    const r = calcGrades(course, 80);
    // zero-weight cat ignored; b carries full weight
    expect(approx(r.earnedPoints, 90)).toBe(true);
    expect(r.verdict).toBe('Safe');
  });

  it('category with no items treated as fully remaining', () => {
    const course: Course = {
      id: 'c', name: 'C', targetGrade: 90,
      categories: [
        { id: 'a', name: 'A', weight: 60, items: [{ id: 'i1', name: 'I1', score: 100, max: 100 }] },
        { id: 'b', name: 'B', weight: 40, items: [] },
      ],
    };
    const r = calcGrades(course, 90);
    // b has no items → fully remaining, weight 40
    expect(approx(r.completedWeight, 60)).toBe(true);
    expect(approx(r.remainingWeight, 40)).toBe(true);
    expect(r.verdict).toBe('AtRisk');
  });

  it('mixed category — some completed, some remaining', () => {
    const course: Course = {
      id: 'c', name: 'C', targetGrade: 90,
      categories: [
        {
          id: 'a', name: 'A', weight: 100,
          items: [
            { id: 'i1', name: 'I1', score: 80, max: 100 },
            { id: 'i2', name: 'I2', dueDate: '2024-12-01', max: 100 },
          ],
        },
      ],
    };
    const r = calcGrades(course, 90);
    // Each item = 50% weight; earned=40 (50*0.8), completed=50
    expect(approx(r.completedWeight, 50)).toBe(true);
    expect(approx(r.earnedPoints, 40)).toBe(true);
    expect(approx(r.remainingWeight, 50)).toBe(true);
    // requiredAverage = (90-40)/50*100 = 100
    expect(r.requiredAverage).not.toBeNull();
    expect(approx(r.requiredAverage!, 100)).toBe(true);
  });

  it('no remaining items → requiredAverage null, verdict based on earned vs target', () => {
    const course: Course = {
      id: 'c', name: 'C', targetGrade: 90,
      categories: [
        { id: 'a', name: 'A', weight: 100, items: [{ id: 'i1', name: 'I1', score: 95, max: 100 }] },
      ],
    };
    const r = calcGrades(course, 90);
    expect(r.requiredAverage).toBeNull();
    expect(approx(r.remainingWeight, 0)).toBe(true);
    expect(r.verdict).toBe('Safe');
  });

  it('score 150% of max (extra credit) — included as-is', () => {
    const course: Course = {
      id: 'c', name: 'C', targetGrade: 90,
      categories: [
        { id: 'a', name: 'A', weight: 100, items: [{ id: 'i1', name: 'I1', score: 150, max: 100 }] },
      ],
    };
    const r = calcGrades(course, 90);
    // earnedPoints = 100 * (150/100) = 150
    expect(approx(r.earnedPoints, 150)).toBe(true);
    expect(r.verdict).toBe('Safe');
  });
});

// ─── Additional correctness properties ───────────────────────────────────────

describe('Formula identities', () => {
  it('currentGrade = earnedPoints / completedWeight * 100', () => {
    const course = makeReq12Course();
    const r = calcGrades(course, 94);
    expect(r.currentGrade).not.toBeNull();
    const expected = (r.earnedPoints / r.completedWeight) * 100;
    expect(approx(r.currentGrade!, expected)).toBe(true);
  });

  it('maxAchievable = earnedPoints + remainingWeight', () => {
    const course = makeReq12Course();
    const r = calcGrades(course, 94);
    expect(approx(r.maxAchievable, r.earnedPoints + r.remainingWeight)).toBe(true);
  });

  it('requiredAverage = (target - earned) / remaining * 100', () => {
    const course = makeReq12Course();
    const r = calcGrades(course, 90);
    expect(r.requiredAverage).not.toBeNull();
    const expected = ((90 - r.earnedPoints) / r.remainingWeight) * 100;
    expect(approx(r.requiredAverage!, expected)).toBe(true);
  });
});
