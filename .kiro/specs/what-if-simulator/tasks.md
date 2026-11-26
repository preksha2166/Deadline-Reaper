# Implementation Plan: what-if-simulator

## Overview

Add a what-if simulator to ResultsPanel so students can enter hypothetical scores for remaining items and immediately see the projected final grade and verdict. Inputs are sourced from the course's actual RemainingItems; course transformation lives in `src/lib/whatIf.ts`; ResultsPanel calls `applyHypotheticals` then `calcGrades`.

## Tasks

- [x] 1. Add `whatIfMode` toggle to ResultsPanel
  - Add `whatIfMode: boolean` state (default false).
  - Render a "What-if simulator" `<button>` in ResultsPanel when at least one RemainingItem exists in the course (iterate `course.categories` to check, do not use `perItemRequired`); clicking it toggles `whatIfMode`.
  - When `whatIfMode` is false, render nothing extra.
  - _Requirements: 1.1, 1.3, 1.4, 1.5_

- [x] 2. Implement `applyHypotheticals` in `src/lib/whatIf.ts`
  - New file `src/lib/whatIf.ts` exporting `applyHypotheticals(course: Course, hyp: Map<string, number>): Course`.
  - Deep-copies course; for each RemainingItem whose id is in `hyp`, replaces it with a CompletedItem `{ id, name, score: hyp.get(id)!, max: item.max ?? 100 }`.
  - Pure function: no React imports, does not mutate the input.
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 3. Unit tests for `applyHypotheticals`
  - New file `src/lib/whatIf.test.ts`.
  - Tests: empty map returns structurally identical course; valid score converts RemainingItem to CompletedItem; unmapped items stay as RemainingItems; original course is not mutated.
  - _Requirements: 6.3_

- [x] 4. Add hypotheticals state and inputs
  - Add `hypotheticals: Map<string, number>` state.
  - When `whatIfMode` is true, iterate `course.categories` -> `isRemainingItem` items and render a labelled `<input type="number">` for each with empty value and placeholder = required score from `perItemRequired` (1 dp), or "0.0" if absent.
  - Each input updates `hypotheticals` on `onChange`.
  - _Requirements: 1.2, 1.5, 5.1_

- [x] 5. Compute and display Projected_Result
  - In the render: if `whatIfMode`, build a validated hyp map (exclude entries > 2x item max), call `applyHypotheticals(course, validHyp)` then `calcGrades(projectedCourse, course.targetGrade)`.
  - Display `projectedResult.earnedPoints`, `projectedResult.maxAchievable`, and verdict labelled "Projected" beneath the real results.
  - Wrap the projected verdict in `<div aria-live="polite" role="status">`.
  - _Requirements: 2.1, 2.2, 2.3, 5.2_

- [x] 6. Input validation
  - On render, for each entry in `hypotheticals`: if value > 2x item max, mark that input invalid, show inline error, and exclude it from the validated hyp map.
  - Empty/non-numeric inputs remain absent from `hypotheticals` (item stays remaining).
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 7. Reset button and CSS
  - When `whatIfMode` is true, render a "Reset" button that calls `setHypotheticals(new Map())`.
  - Add `.whatIfSection`, `.whatIfInput`, `.projectedSection`, `.resetBtn`, `.inputError` classes to `ResultsPanel.module.css`.
  - _Requirements: 4.1, 4.2_

- [x] 8. Component tests
  - Add `src/components/ResultsPanel/ResultsPanel.test.tsx` testing:
    - Toggle button absent when no remaining items.
    - Toggle button present and activates mode when remaining items exist.
    - Typing a valid hypothetical score updates the projected verdict.
    - Invalid score (> 2x item max) shows inline error and does not change projected verdict.
    - Reset clears all inputs.
  - _Requirements: 1.1, 1.4, 2.1, 3.3, 4.2_

## Notes

- Inputs are sourced from `course.categories` RemainingItems -- never from `perItemRequired`, which may contain `__empty` sentinel ids for empty-category placeholders.
- Inputs start empty (no pre-fill); the placeholder shows the required score so the student sees the target but must actively type to apply a hypothetical.
- `applyHypotheticals` is a pure lib function so it can be unit-tested without React.
- Hypotheticals are never persisted; closing or refreshing the app loses what-if state.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2"] },
    { "id": 2, "tasks": ["3", "4"] },
    { "id": 3, "tasks": ["5", "6"] },
    { "id": 4, "tasks": ["7", "8"] }
  ]
}
```
