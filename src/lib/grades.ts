import type { Course, GradeResult, PerItemRequired, Verdict } from '../types';
import { isCompletedItem } from '../types';

function getItemMax(item: { max?: number }): number {
  return item.max ?? 100;
}

export function calcGrades(course: Course, targetGrade: number): GradeResult {
  const categories = course.categories;

  // Step 1: Normalize weights
  const totalWeight = categories.reduce((s, c) => s + (c.weight > 0 ? c.weight : 0), 0);

  if (totalWeight === 0) {
    // All weights zero — cannot calculate
    return {
      earnedPoints: 0,
      completedWeight: 0,
      remainingWeight: 100,
      currentGrade: null,
      maxAchievable: 0,
      requiredAverage: null,
      verdict: 'Doomed',
      perItemRequired: [],
    };
  }

  // Step 2: Compute Item_Weight for each item in each category
  // A category with no items counts as a single remaining unit carrying nw(cat)
  interface ItemEntry {
    categoryId: string;
    itemId: string;
    isCompleted: boolean;
    score: number;
    max: number;
    itemWeight: number; // share of final grade (0-100)
  }

  const entries: ItemEntry[] = [];

  for (const cat of categories) {
    if (cat.weight <= 0) continue;
    const nw = cat.weight / totalWeight; // normalized weight (0-1)

    if (cat.items.length === 0) {
      // Treat as single remaining unit
      entries.push({
        categoryId: cat.id,
        itemId: cat.id + '__empty',
        isCompleted: false,
        score: 0,
        max: 100,
        itemWeight: nw * 100,
      });
      continue;
    }

    const sumMax = cat.items.reduce((s, item) => s + getItemMax(item), 0);
    // If sumMax is 0, treat each item equally (shouldn't happen with valid data, but guard)
    const divisor = sumMax > 0 ? sumMax : cat.items.length;

    for (const item of cat.items) {
      const itemMax = getItemMax(item);
      const share = sumMax > 0 ? itemMax / divisor : 1 / cat.items.length;
      const itemWeight = nw * share * 100;

      if (isCompletedItem(item)) {
        entries.push({
          categoryId: cat.id,
          itemId: item.id,
          isCompleted: true,
          score: item.score,
          max: item.max,
          itemWeight,
        });
      } else {
        entries.push({
          categoryId: cat.id,
          itemId: item.id,
          isCompleted: false,
          score: 0,
          max: itemMax,
          itemWeight,
        });
      }
    }
  }

  // Step 3: Earned_Points
  const earnedPoints = entries
    .filter(e => e.isCompleted)
    .reduce((s, e) => s + e.itemWeight * (e.score / e.max), 0);

  // Step 4: Completed_Weight
  const completedWeight = entries
    .filter(e => e.isCompleted)
    .reduce((s, e) => s + e.itemWeight, 0);

  // Step 5: Remaining_Weight
  const remainingWeight = 100 - completedWeight;

  // Step 6: Current_Grade
  const currentGrade = completedWeight === 0 ? null : (earnedPoints / completedWeight) * 100;

  // Step 7: Max_Achievable
  const maxAchievable = earnedPoints + remainingWeight;

  // Step 8: Required_Average
  const requiredAverage = remainingWeight === 0
    ? null
    : ((targetGrade - earnedPoints) / remainingWeight) * 100;

  // Step 9: Verdict
  let verdict: Verdict;
  if (earnedPoints >= targetGrade) {
    verdict = 'Safe';
  } else if (maxAchievable < targetGrade) {
    verdict = 'Doomed';
  } else {
    verdict = 'AtRisk';
  }

  // Step 10: Per-item required scores
  const perItemRequired: PerItemRequired[] = [];
  if (requiredAverage !== null) {
    for (const e of entries) {
      if (!e.isCompleted) {
        const required = Math.max(0, (requiredAverage / 100) * e.max);
        perItemRequired.push({ itemId: e.itemId, required });
      }
    }
  }

  return {
    earnedPoints,
    completedWeight,
    remainingWeight,
    currentGrade,
    maxAchievable,
    requiredAverage,
    verdict,
    perItemRequired,
  };
}