export interface CompletedItem {
  id: string;
  name: string;
  score: number;      // >= 0
  max: number;        // >= 0
}

export interface RemainingItem {
  id: string;
  name: string;
  dueDate: string;    // ISO 8601
  max?: number;       // defaults to 100 when absent
}

export type Item = CompletedItem | RemainingItem;

export interface Category {
  id: string;
  name: string;
  weight: number;     // 0-100 (percentage points)
  items: Item[];
}

export interface Course {
  id: string;
  name: string;
  targetGrade: number;  // 0.0-100.0, 1 dp
  categories: Category[];
}

export type Verdict = 'Safe' | 'AtRisk' | 'Doomed';

export interface PerItemRequired {
  itemId: string;
  required: number;   // score needed out of item max, clamped >= 0
}

export interface GradeResult {
  earnedPoints: number;
  completedWeight: number;
  remainingWeight: number;
  currentGrade: number | null;   // null when completedWeight === 0
  maxAchievable: number;
  requiredAverage: number | null; // null when remainingWeight === 0
  verdict: Verdict;
  perItemRequired: PerItemRequired[];
}

export function isCompletedItem(item: Item): item is CompletedItem {
  return 'score' in item && 'max' in item;
}

export function isRemainingItem(item: Item): item is RemainingItem {
  return 'dueDate' in item;
}
