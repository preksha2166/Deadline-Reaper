# Design Document: what-if-simulator

## Overview

Add what-if simulation to ResultsPanel by holding hypothetical scores in local component state, building inputs from the course's actual RemainingItems, cloning the course with valid scores applied via `applyHypotheticals`, and passing the clone to `calcGrades`. The course-transformation logic lives in `src/lib/whatIf.ts` (pure, tested); ResultsPanel only manages UI state.

## Architecture

```
ResultsPanel
  state: whatIfMode, hypotheticals: Map<itemId, number>
  |
  +- inputs built from course.categories -> RemainingItems (never from perItemRequired ids)
  |
  +- [if whatIfMode] applyHypotheticals(course, hypotheticals)  [src/lib/whatIf.ts]
  |                  -> projectedCourse: Course
  |                  calcGrades(projectedCourse, targetGrade)
  |                  -> projectedResult: GradeResult
  |
  +- WhatIfInputs  (one per RemainingItem, empty value, placeholder = required score)
  +- ProjectedResults  (earnedPoints, maxAchievable, verdict -- aria-live)
  +- Reset button
```

Data flows through React state only. Nothing is written to localStorage.

## Components and Interfaces

### `src/lib/whatIf.ts` (new file)

```ts
import type { Course } from '../types';
import { isRemainingItem } from '../types';

// Returns a deep copy of course where each RemainingItem whose id is a key in hyp
// is replaced by a CompletedItem { id, name, score: hyp.get(id), max: item.max ?? 100 }.
// Items with invalid scores (> 2x max) must be pre-filtered by the caller before passing hyp.
// Pure function -- no React imports, no side effects, does not mutate the input.
export function applyHypotheticals(course: Course, hyp: Map<string, number>): Course
```

### `src/lib/whatIf.test.ts` (new file)

Unit tests covering:
- Empty map returns a course structurally identical to input (no mutation).
- Valid score for a RemainingItem converts it to a CompletedItem with correct score and max.
- Items not in the map remain as RemainingItems.
- Original course is not mutated (reference equality check on categories/items arrays).

### ResultsPanel (modified)

**New state:**
```ts
const [whatIfMode, setWhatIfMode] = useState(false);
const [hypotheticals, setHypotheticals] = useState<Map<string, number>>(new Map());
```

**Source of inputs:** iterate `course.categories` -> `cat.items` -> filter `isRemainingItem(item)`. Never use `perItemRequired` as the item source (its ids may include `__empty` sentinels for empty categories).

**Placeholder per input:** look up `perItemRequired.find(p => p.itemId === item.id)?.required ?? 0`, format to 1 dp.

**Toggle visibility:** shown when `course.categories.some(c => c.items.some(isRemainingItem))`.

**Render additions:**
- Toggle button shown when at least one RemainingItem exists in the course.
- When `whatIfMode`: labelled numeric inputs (empty value, placeholder = required score), projected result section, Reset button.

## Data Models

No new persistent types. Hypotheticals are transient:

```ts
// Ephemeral, lives only in ResultsPanel state
type Hypotheticals = Map<string, number>; // itemId -> hypothetical score (pre-validated)
```

`applyHypotheticals` produces a `Course` (existing type) accepted directly by `calcGrades`.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do.*

### Property 1: No mutation

*For any* course and any hypotheticals map, `applyHypotheticals` never modifies the input course; the original `course` prop passed to ResultsPanel is never mutated.

**Validates: Requirements 6.1, 6.3**

### Property 2: Passthrough

*For any* course, `applyHypotheticals(course, new Map())` returns a structurally identical course, so calling `calcGrades` on it produces the same result as calling `calcGrades` on the original course.

**Validates: Requirements 6.1, 6.2**

## Error Handling

| Condition | Behaviour |
|---|---|
| Hypothetical empty or non-numeric | Item stays remaining in projected course; no error shown |
| Hypothetical > 2x item max | Inline error on that input; item excluded from hyp map passed to `applyHypotheticals` |
| No remaining items | Toggle hidden; whatIfMode cannot be entered |

## Testing Strategy

**Unit tests** (`src/lib/whatIf.test.ts`): pure function tests for `applyHypotheticals` -- no React needed.

**Component tests** (`src/components/ResultsPanel/ResultsPanel.test.tsx`) using React Testing Library:
- Toggle absent with no remaining items; present with remaining items.
- Typing a valid score updates projected verdict.
- Score > 2x max shows inline error and does not update projection.
- Reset clears all inputs.
