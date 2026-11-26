# Requirements Document

## Introduction

The what-if simulator extends ResultsPanel so a student can type a hypothetical score for each remaining item and immediately see how it changes their projected final grade and verdict. Grade math is delegated entirely to the existing `calcGrades` function; this feature adds no new math.

## Glossary

- **Hypothetical_Score**: A temporary score entered by the student for a RemainingItem in what-if mode; it is never persisted to the course.
- **Projected_Result**: The `GradeResult` produced by `calcGrades` when each RemainingItem that has a Hypothetical_Score is treated as a CompletedItem with that score.
- **What-If_Mode**: The active state in ResultsPanel where the simulator inputs are visible and Projected_Result is displayed.

## Requirements

### Requirement 1: Enter what-if mode

**User Story:** As a student, I want to toggle a what-if simulator in the results panel, so that I can explore hypothetical scores without changing my real data.

#### Acceptance Criteria

1. WHEN the course has at least one RemainingItem (an Item with a `dueDate` field), THE System SHALL display a "What-if simulator" toggle button in ResultsPanel.
2. WHEN the student activates the toggle, THE System SHALL show a numeric input for each RemainingItem sourced directly from the course's categories, with an empty value and a placeholder showing the item's required score from `perItemRequired` rounded to 1 decimal place (or "0.0" if the item has no entry in `perItemRequired`).
3. WHEN the student deactivates the toggle, THE System SHALL hide all simulator inputs and restore the normal ResultsPanel display.
4. WHEN the course has no RemainingItems, THE System SHALL not display the toggle.
5. THE System SHALL NOT use `perItemRequired` entries with ids ending in `__empty` as the source of simulator inputs; inputs are built from the course's actual RemainingItems only.

### Requirement 2: Live projected result

**User Story:** As a student, I want the projected grade and verdict to update as I type, so that I get immediate feedback.

#### Acceptance Criteria

1. WHEN the student types a value into any Hypothetical_Score input, THE System SHALL recompute Projected_Result by calling `calcGrades` with a copy of the course in which every RemainingItem that has a valid Hypothetical_Score is replaced by a CompletedItem carrying that score and the item's max.
2. THE System SHALL display Projected_Result's earnedPoints, maxAchievable, and verdict alongside the normal results, clearly labelled "Projected".
3. THE System SHALL update the display on every keystroke without debounce — `calcGrades` is a pure synchronous function so the cost is negligible.
4. THE System SHALL NOT persist Hypothetical_Score values to localStorage.

### Requirement 3: Input validation

**User Story:** As a student, I want the simulator to reject nonsense scores, so that the projection stays meaningful.

#### Acceptance Criteria

1. THE System SHALL accept Hypothetical_Score values from 0 to 2x the item's max inclusive.
2. WHEN a Hypothetical_Score input is empty or non-numeric, THE System SHALL treat that item as still remaining (exclude it from the projected completed set) and show no error message.
3. WHEN a Hypothetical_Score exceeds 2x the item's max, THE System SHALL display an inline error on that input and exclude that item from Projected_Result.

### Requirement 4: Reset

**User Story:** As a student, I want to reset all what-if inputs at once, so that I can start a fresh scenario.

#### Acceptance Criteria

1. WHEN What-If_Mode is active, THE System SHALL display a "Reset" button.
2. WHEN the student clicks Reset, THE System SHALL clear all Hypothetical_Score inputs to empty and revert Projected_Result to the state with no hypotheticals applied.

### Requirement 5: Accessibility

**User Story:** As a student using assistive technology, I want the simulator inputs to be labelled, so that I know which item each input belongs to.

#### Acceptance Criteria

1. EACH Hypothetical_Score input SHALL have an accessible label containing the item name and category name.
2. THE projected verdict SHALL be announced to screen readers when it changes via an `aria-live` region.

### Requirement 6: No new grade math

**User Story:** As a developer, I want the simulator to reuse `calcGrades` unchanged, so that the codebase has one source of truth for grade logic.

#### Acceptance Criteria

1. THE System SHALL derive Projected_Result exclusively by calling `calcGrades(projectedCourse, targetGrade)` where `projectedCourse` is a deep copy of the course with Hypothetical_Scores applied, produced by `applyHypotheticals` in `src/lib/whatIf.ts`.
2. THE System SHALL NOT reimplement any formula from `src/lib/grades.ts` in component code or in any new file.
3. THE System SHALL implement `applyHypotheticals` as a pure exported function in `src/lib/whatIf.ts` with no React imports, and cover it with unit tests in `src/lib/whatIf.test.ts`.
