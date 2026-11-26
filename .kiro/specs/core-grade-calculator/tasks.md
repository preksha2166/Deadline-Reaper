# Implementation Plan: core-grade-calculator

## Overview

Build the core grade-rescue calculator from scratch: project scaffolding, pure grade logic, localStorage persistence, a React state hook, UI components, and Halloween theming — all wired together into a working single-page app.

## Tasks

- [x] 1. Project setup
  - [x] 1.1 Create `package.json` with React 18, TypeScript, Vite, Vitest, and React Testing Library as dependencies; add `dev`, `build`, `test`, and `lint` scripts matching the commands in the tech rules
    - `"test"` script must invoke `vitest --run` (not watch mode)
    - Do NOT run `npm create vite`; write the file directly
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 1.2 Create `vite.config.ts` configuring the React plugin and Vitest with jsdom environment and React Testing Library setup file
    - _Requirements: 1.1, 1.4_
  - [x] 1.3 Create `tsconfig.json` with `"strict": true`, `"jsx": "react-jsx"`, and paths that satisfy Vite and Vitest
    - _Requirements: 1.5_
  - [x] 1.4 Create `index.html` as the Vite entry point referencing `src/main.tsx`
    - _Requirements: 1.1_
  - [x] 1.5 Create `src/main.tsx` that mounts `<App />` into the root element; create a skeleton `src/App.tsx` that renders a single `<main>` with a placeholder heading so the build succeeds
    - Do NOT delete `.kiro/` or `LICENSE`
    - _Requirements: 1.2, 1.3_

- [x] 2. Types and grade logic
  - [x] 2.1 Create `src/types.ts` with the exact interfaces from the design: `CompletedItem`, `RemainingItem`, `Item`, `Category`, `Course`, `Verdict`, `PerItemRequired`, and `GradeResult`
    - _Requirements: 6.7, 8.6, 9.1_
  - [x] 2.2 Create `src/lib/grades.ts` implementing `calcGrades(course, targetGrade)` following the ten-step algorithm in the design (normalize weights → Item_Weight → Earned_Points → Completed_Weight → Remaining_Weight → Current_Grade → Max_Achievable → Required_Average → Verdict → perItemRequired)
    - No React imports; no rounding in calculations
    - Handle the all-weights-zero edge case by returning a Doomed error GradeResult
    - Handle score > max as extra credit (include as-is)
    - _Requirements: 6.1, 6.2, 6.4, 6.6, 7.1, 7.4, 7.6, 7.7, 8.1, 8.2, 8.3, 8.4, 8.6, 9.1, 9.2, 9.3, 9.4, 9.5, 9.7_
  - [x] 2.3 Create `src/lib/grades.test.ts` with unit tests covering:
    - Requirement 12 concrete examples: target 94 → Doomed (Earned 52.0, Current 86.67, Max 92.0, Required 105.0), target 90 → AtRisk (Required 95.0), target 50 → Safe
    - Edge cases from Requirement 9.6: weights summing to 0, 50, 99, 101, 200; zero-weight category; category with no items; mixed completed/remaining category; course with no remaining items; score 150% of max
    - Use tolerance 0.01 for floating-point comparisons
    - _Requirements: 9.6, 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 3. Storage
  - [x] 3.1 Create `src/lib/storage.ts` exporting `loadCourses(): Course[]` and `saveCourses(courses: Course[]): void`
    - Key: `"deadline-reaper:v1"`; saved format: `{ version: "1", courses: [...] }`
    - `loadCourses` must validate version field, courses array, each Course (string id/name, number targetGrade 0–100, Category array), each Category (string id/name, number weight 0–100, Item array), and each Item (string id/name; Completed_Item has number score and max ≥ 0; Remaining_Item has ISO 8601 dueDate and no score)
    - Return `[]` on any parse or validation failure (never throw)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10, 10.11, 10.12_
  - [x] 3.2 Create `src/lib/storage.test.ts` with unit tests covering: valid round-trip data, missing key, malformed JSON, missing version field, missing courses field, non-array courses, type mismatches for Course/Category/Item fields, negative numbers, and invalid ISO 8601 dueDate
    - _Requirements: 10.13_

- [x] 4. useCourses hook
  - [x] 4.1 Create `src/hooks/useCourses.ts` exporting `useCourses()` which initializes state from `loadCourses()` and returns: `courses`, `addCourse`, `renameCourse`, `deleteCourse`, `addCategory`, `updateCategory`, `deleteCategory`, `addItem`, `updateItem`, `deleteItem`, `setTargetGrade`
    - Every mutating action must call `saveCourses` immediately after updating state
    - `addCourse` / `renameCourse` must reject empty or whitespace-only names and throw or return an error string
    - `setTargetGrade` must reject values outside 0–100 and round to 1 decimal place before storing
    - Course, Category, and Item ids generated with `crypto.randomUUID()`
    - New courses default `targetGrade` to 94.0
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.3, 3.4, 3.5, 3.9, 3.10, 4.1, 4.2, 4.5, 4.6, 4.8, 4.9, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 10.1_

- [x] 5. UI components
  - [x] 5.1 Create `src/components/CourseList/CourseList.tsx` and `CourseList.module.css` rendering the list of course names with Add and Delete buttons; validate the new-course name on submit and display an inline error on failure
    - _Requirements: 2.1, 2.2, 2.5, 11.7_
  - [x] 5.2 Create `src/components/TargetInput/TargetInput.tsx` and `TargetInput.module.css` with a controlled number input (0–100, step 0.1) that calls `setTargetGrade` on blur/submit and shows an inline error when validation fails
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  - [x] 5.3 Create `src/components/CategoryEditor/CategoryEditor.tsx` and `CategoryEditor.module.css` allowing the student to add, edit, and delete categories; show the running weight sum and the warning message when weights do not sum to 100; for each category render its items with Add/Edit/Delete controls
    - Completed_Item form: name, score, max fields; Remaining_Item form: name, dueDate, optional max field; validate per Requirements 3 and 4
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 4.1, 4.2, 4.3, 4.4, 4.7, 11.7, 11.8_
  - [x] 5.4 Create `src/components/ResultsPanel/ResultsPanel.tsx` and `ResultsPanel.module.css` displaying: Current_Grade (labelled, rounded to 1 dp, or "No graded work yet"), Earned_Points, Max_Achievable, Required_Average (or appropriate message when null), per-item required scores (rounded to 1 dp), and the Verdict badge
    - Verdict badge shows "Safe" / "At Risk" / "Doomed" text; Doomed includes skull (U+1F480); apply verdict CSS classes for colour styling; include non-colour indicators so information is not conveyed by colour alone
    - _Requirements: 6.3, 6.5, 7.2, 7.3, 7.5, 7.8, 8.1, 8.2, 8.3, 11.3, 11.4, 11.5, 11.8_
  - [x] 5.5 Create `src/components/CourseEditor/CourseEditor.tsx` and `CourseEditor.module.css` composing `TargetInput`, `CategoryEditor`, and `ResultsPanel` for the selected course; call `calcGrades` with the current course and target to derive `GradeResult` for `ResultsPanel`
    - _Requirements: 6.1, 6.2, 7.1_
  - [x] 5.6 Update `src/App.tsx` to render a two-column layout using `CourseList` on the left and `CourseEditor` on the right; pass `useCourses()` state and callbacks down as props; show a prompt ("The reaper is waiting...") when no course is selected
    - No routing library; no UI library
    - _Requirements: 11.7_

- [x] 6. Theme and final check
  - [x] 6.1 Create `src/styles/theme.css` defining CSS custom properties: `--color-bg` (deep purple/black, HSL lightness 0–40), `--color-text`, `--color-accent` (pumpkin orange, hue 25–35), `--color-safe` (green, hue 120–150), `--color-at-risk` (red, hue 0–20), `--color-doomed` (red, hue 0–20), plus any spacing and font variables needed by components
    - Import `theme.css` in `src/main.tsx`
    - Verify that all foreground/background pairings meet WCAG AA contrast (4.5:1 for normal text, 3:1 for large text)
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_
  - [x] 6.2 Run `npm install` to install all declared dependencies, then run `npm run build` and confirm it exits without errors; fix any TypeScript or Vite errors found
    - _Requirements: 1.2_
  - [x] 6.3 Run `npx vitest --run` and confirm all tests pass; fix any failing tests
    - _Requirements: 1.4, 9.6, 12.5_

## Notes

- All grade math lives in `src/lib/grades.ts` as pure functions with no React imports; components call these functions and never perform grade calculations inline.
- Percentages are stored as numbers 0–100; rounding to 1 decimal place happens only at display time.
- `crypto.randomUUID()` is available in modern browsers and in Node 15+; no extra dependency needed.
- The design's Correctness Properties map to property-based tests if the team chooses to add `fast-check` later; the current tasks use unit tests only.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["1.4", "1.5"] },
    { "id": 2, "tasks": ["2.1"] },
    { "id": 3, "tasks": ["2.2", "3.1"] },
    { "id": 4, "tasks": ["2.3", "3.2", "4.1"] },
    { "id": 5, "tasks": ["5.1", "5.2", "5.3", "5.4"] },
    { "id": 6, "tasks": ["5.5"] },
    { "id": 7, "tasks": ["5.6"] },
    { "id": 8, "tasks": ["6.1"] },
    { "id": 9, "tasks": ["6.2", "6.3"] }
  ]
}
```
