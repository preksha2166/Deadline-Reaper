# Design Document: core-grade-calculator

## Overview

Pure-function grade engine backed by localStorage, rendered by React components. No routing, no UI library, no backend.

## Architecture

```
App
├── CourseList          (left panel)
└── CourseEditor        (right panel)
    ├── TargetInput
    ├── CategoryEditor
    └── ResultsPanel
```

Data flows down as props; mutations go up via callbacks. `useCourses` hook owns state and calls `storage.ts`.

## Components and Interfaces

| Component | Responsibility |
|---|---|
| `App` | Two-column layout; holds selected course id |
| `CourseList` | Lists courses; add / delete buttons |
| `CourseEditor` | Renders the three child panels for the selected course |
| `TargetInput` | Controlled input for target grade (0–100, 1 dp) |
| `CategoryEditor` | Add / edit / delete categories and their items |
| `ResultsPanel` | Displays verdict, currentGrade, earnedPoints, requiredAverage, maxAchievable per-item requirements |

## Data Models

### `src/types.ts`

```ts
export interface CompletedItem {
  id: string;
  name: string;
  score: number;      // ≥ 0
  max: number;        // ≥ 0
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
  weight: number;     // 0–100 (percentage points)
  items: Item[];
}

export interface Course {
  id: string;
  name: string;
  targetGrade: number;  // 0.0–100.0, 1 dp
  categories: Category[];
}

export type Verdict = 'Safe' | 'AtRisk' | 'Doomed';

export interface PerItemRequired {
  itemId: string;
  required: number;   // score needed out of item max, clamped ≥ 0
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
```

### `src/lib/storage.ts`

```ts
export interface StorageData {
  version: "1";
  courses: Course[];
}

const KEY = "deadline-reaper:v1";

export function loadCourses(): Course[]        // parse + validate; returns [] on any failure
export function saveCourses(courses: Course[]): void  // JSON.stringify({ version:"1", courses })
```

## `src/lib/grades.ts` Signatures and Formulas

```ts
export function calcGrades(course: Course, targetGrade: number): GradeResult
```

Internal steps (no rounding until display):

1. **Normalize weights** — `nw(cat) = cat.weight / sum(weights of all non-zero-weight cats)`  
   If all weights are 0, return an error-state GradeResult with `verdict: 'Doomed'`.

2. **Item_Weight** — `nw(cat) × (item.max / sumMax(cat))` where `sumMax` treats a category with no items as a single unit of weight `nw(cat)` with max 100.

3. **Earned_Points** — `Σ Item_Weight(i) × (i.score / i.max)` over completed items.

4. **Completed_Weight** — `Σ Item_Weight(i)` over completed items.

5. **Remaining_Weight** — `100 − Completed_Weight`.

6. **Current_Grade** — `Earned_Points / Completed_Weight × 100`; `null` when `Completed_Weight === 0`.

7. **Max_Achievable** — `Earned_Points + Remaining_Weight`.

8. **Required_Average** — `(targetGrade − Earned_Points) / Remaining_Weight × 100`; `null` when `Remaining_Weight === 0`.

9. **Verdict** — `Safe` if `Earned_Points >= targetGrade`; `Doomed` if `Max_Achievable < targetGrade`; otherwise `AtRisk`.

10. **perItemRequired** — for each remaining item: `Required_Average / 100 × item.max`, clamped to `≥ 0`.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — a formal statement about what the system should do.*

### Property 1: Normalized weights sum to 1

*For any* course whose categories have at least one non-zero weight, the sum of all `nw(cat)` values equals 1.

**Validates: Requirements 9.1**

### Property 2: Grade formula identity

*For any* course with at least one completed item, `calcGrades` returns `earnedPoints` and `completedWeight` that satisfy `currentGrade === earnedPoints / completedWeight × 100` (within floating-point tolerance).

**Validates: Requirements 6.1, 6.4**

### Property 3: Required_Average formula identity

*For any* course where `remainingWeight > 0`, `requiredAverage === (targetGrade − earnedPoints) / remainingWeight × 100`.

**Validates: Requirements 7.1**

### Property 4: Verdict partition

*For any* valid `GradeResult`, exactly one of the following holds: `earnedPoints >= targetGrade` → Safe; `maxAchievable < targetGrade` → Doomed; otherwise → AtRisk.

**Validates: Requirements 8.1, 8.2, 8.3**

### Property 5: Storage round-trip

*For any* array of valid `Course` objects, `loadCourses()` after `saveCourses(courses)` returns a structurally equivalent array.

**Validates: Requirements 10.3**

## Error Handling

| Condition | Behaviour |
|---|---|
| All category weights are 0 | Return error GradeResult; display "Cannot calculate — all weights are zero" |
| `Completed_Weight === 0` | `currentGrade` is `null`; display "No graded work yet" |
| `Remaining_Weight === 0` | `requiredAverage` is `null`; no per-item requirements shown |
| Score > max | Included as-is (extra credit); no capping |
| localStorage parse failure | Silently return `[]`; app starts fresh |

## Testing Strategy

**Unit tests** (`src/lib/grades.test.ts`, `src/lib/storage.test.ts`):
- Concrete examples from Requirement 12 (target 94 → Doomed, target 90 → AtRisk, target 50 → Safe)
- Edge cases: all weights 0, one weight 0, category with no items, no remaining work, score > max

**Property tests** (Vitest + [fast-check](https://github.com/dubzzz/fast-check), minimum 100 runs each):
- Property 1 — arbitrary positive weight arrays
- Property 2 — arbitrary courses with ≥ 1 completed item
- Property 3 — arbitrary `(earned, remaining, target)` triples where `remaining > 0`
- Property 4 — arbitrary GradeResult inputs covering all three verdict regions
- Property 5 — arbitrary `Course[]` arrays serialized then deserialized

Component tests use React Testing Library for interaction (add course, enter score, verify displayed verdict).
