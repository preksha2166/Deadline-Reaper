# Requirements Document

## Introduction

The core grade-rescue calculator is the foundational feature of Deadline Reaper. It enables university students to track their current grade, set a target grade, and determine exactly what they need to achieve on remaining coursework to reach that target. The system provides a clear verdict (Safe, At Risk, or Doomed) based on mathematical analysis of completed and remaining work.

## Glossary

- **System**: The Deadline Reaper grade calculator application
- **Course**: A university course with graded categories and a target grade
- **Category**: A graded component of a course with a name and weight percentage (e.g., "Quizzes 20%")
- **Item**: A specific graded assignment within a category (e.g., "Quiz 1" or "Final Exam")
- **Completed_Item**: An item with both a score and maximum score entered
- **Remaining_Item**: An item with a due date and optional maximum score but no score yet; if no maximum score is given, it defaults to 100
- **Target_Grade**: The percentage grade the student aims to achieve in a course
- **Normalized_Weight**: A category's weight divided by the sum of all non-zero category weights in the course (so normalized weights always sum to 1)
- **Item_Weight**: An item's share of the final grade: its category's Normalized_Weight × (item max score ÷ sum of max scores of all items in that category), expressed in percentage points. A category with no items at all is treated as a single remaining unit carrying the category's full Normalized_Weight
- **Completed_Weight**: The sum of Item_Weight over all Completed_Item entries (percentage points, 0–100)
- **Remaining_Weight**: 100 − Completed_Weight (percentage points), i.e. the part of the final grade not yet graded
- **Earned_Points**: The sum over all Completed_Item entries of Item_Weight × (score ÷ max score); the percentage points of the final grade already locked in
- **Current_Grade**: Earned_Points ÷ Completed_Weight × 100, i.e. the student's average on completed work only
- **Max_Achievable**: Earned_Points + Remaining_Weight, i.e. the final grade if every remaining item scores 100%
- **Required_Average**: (Target_Grade − Earned_Points) ÷ Remaining_Weight × 100, i.e. the uniform percentage needed on all remaining work to reach the target grade
- **Verdict**: A status indicator showing whether the target is Safe, At_Risk, or Doomed
- **Weight**: The percentage contribution of a category to the final course grade
- **Storage**: The browser's localStorage mechanism for persisting course data

## Requirements

### Requirement 1: Project Initialization

**User Story:** As a developer, I want a properly configured React + TypeScript + Vite project, so that I can build the application with modern tooling and testing.

#### Acceptance Criteria

1. THE System SHALL be initialized as a React 18 application using TypeScript and Vite
2. WHEN the build command is executed, THE System SHALL complete without errors and produce output in the dist directory
3. WHEN the development server command is executed, THE System SHALL start without errors
4. THE System SHALL include Vitest and React Testing Library as development dependencies in package.json
5. THE System SHALL include a tsconfig.json file with the "strict" compiler option set to true
6. THE System SHALL include a src/styles/theme.css file defining CSS custom properties for at minimum the primary background color, primary text color, accent color, success indicator color, and warning indicator color
7. THE System SHALL include a src/lib/ directory for pure logic functions
8. THE System SHALL include a src/types.ts file for shared type definitions

### Requirement 2: Course Management

**User Story:** As a student, I want to create and manage multiple courses, so that I can track grades across all my classes.

#### Acceptance Criteria

1. WHEN the student creates a course with a name containing 1 to 100 non-whitespace characters, THE System SHALL add a new course with a unique identifier
2. IF the student attempts to create a course with an empty name or a name containing only whitespace, THEN THE System SHALL reject the creation and display an error message indicating the name is invalid
3. WHEN the student renames a course with a name containing 1 to 100 non-whitespace characters, THE System SHALL update the course name
4. IF the student attempts to rename a course with an empty name or a name containing only whitespace, THEN THE System SHALL reject the rename and display an error message indicating the name is invalid
5. WHEN the student deletes a course, THE System SHALL remove the course, its categories, and all items within those categories
6. WHEN the student creates, renames, or deletes a course, THE System SHALL persist the change to Storage immediately

### Requirement 3: Category Weight Management

**User Story:** As a student, I want to define grading categories with weights, so that I can model my course's grading structure.

#### Acceptance Criteria

1. WHEN the student adds a category to a course, THE System SHALL accept a name and a weight percentage
2. IF the category name is empty or contains only whitespace, THEN THE System SHALL reject the category and display an error message indicating that a name is required
3. IF the weight percentage is less than or equal to 0 or greater than 100, THEN THE System SHALL reject the category and display an error message indicating the valid range is greater than 0 and up to 100
4. THE System SHALL store weight percentages as numbers greater than 0 and up to 100
5. WHEN the student modifies a category name or weight, THE System SHALL apply the same validation rules as category creation
6. WHEN category weights change, THE System SHALL recalculate the weight sum
7. IF the weight sum does not equal 100, THEN THE System SHALL display a warning message indicating the current total and that weights must sum to exactly 100
8. IF the weight sum equals 100, THEN THE System SHALL hide the weight sum warning message
9. WHEN the student deletes a category that contains items, THE System SHALL remove the category and all its items from the course
10. WHEN the student deletes a category, THE System SHALL recalculate the weight sum and display the weight sum warning if the remaining weights do not sum to 100

### Requirement 4: Item Management

**User Story:** As a student, I want to add graded items to categories, so that I can track individual assignments and exams.

#### Acceptance Criteria

1. WHEN the student adds a Completed_Item, THE System SHALL store the item with a name, score, and maximum score
2. WHEN the student adds a Remaining_Item, THE System SHALL store the item with a name, due date, and optional maximum score
3. WHEN the student provides a score or maximum score, THE System SHALL accept numeric values from 0 to 999999.99
4. WHEN the student provides a score that exceeds the maximum score by more than 100 percent of the maximum, THE System SHALL reject the input and display an error message indicating the extra credit limit
5. WHEN the student edits a Completed_Item, THE System SHALL validate the new values using the same rules as item creation and update the item if valid
6. WHEN the student edits a Remaining_Item, THE System SHALL validate the new values using the same rules as item creation and update the item if valid
7. IF validation fails during item creation or editing, THEN THE System SHALL display an error message indicating the validation failure and preserve the previous valid state
8. WHEN the student deletes an item, THE System SHALL remove the item from its category
9. WHEN the student converts a Remaining_Item to a Completed_Item by adding a score, THE System SHALL preserve the item name and maximum score if present, discard the due date, and store the score

### Requirement 5: Target Grade Configuration

**User Story:** As a student, I want to set a target grade for each course, so that I can calculate what I need to achieve.

#### Acceptance Criteria

1. WHEN a course is created, THE System SHALL set the Target_Grade to 94.0 percent
2. WHEN the student submits a Target_Grade modification, THE System SHALL accept values from 0.0 to 100.0 percent inclusive with up to one decimal place
3. IF the student submits a Target_Grade with more than one decimal place, THEN THE System SHALL round the value to one decimal place before storing
4. IF the student submits a Target_Grade less than 0.0 or greater than 100.0, THEN THE System SHALL reject the modification and display an error message indicating the valid range
5. IF the student submits a non-numeric Target_Grade value, THEN THE System SHALL reject the modification and display an error message indicating a numeric value is required
6. WHEN a valid Target_Grade modification is accepted, THE System SHALL store the Target_Grade as a number and persist it to localStorage
7. THE System SHALL store the Target_Grade as a number between 0.0 and 100.0 with up to one decimal place

### Requirement 6: Current Grade Calculation

**User Story:** As a student, I want to see my current grade based on completed work, so that I know where I stand right now.

#### Acceptance Criteria

1. THE System SHALL calculate Earned_Points, Completed_Weight and Current_Grade exactly as defined in the Glossary
2. THE System SHALL apply category weights (as Normalized_Weight) and item max scores (as Item_Weight) when calculating Current_Grade, so that a category with some completed and some remaining items counts only its completed share
3. THE System SHALL display both Current_Grade (average on completed work) and Earned_Points (points of the final grade already locked in), clearly labelled so the student does not confuse them
4. THE System SHALL perform all grade calculations without rounding intermediate values
5. WHEN displaying Current_Grade, THE System SHALL round to 1 decimal place using round-half-up method (0.15 rounds to 0.2, 0.14 rounds to 0.1)
6. THE System SHALL implement Current_Grade calculation as a pure function in src/lib/grades.ts with no React imports
7. THE System SHALL classify an Item as a Completed_Item if and only if both the score field and max field contain numeric values greater than or equal to 0
8. IF a Completed_Item has a score value exceeding its max value, THEN THE System SHALL include the score and max as provided without capping, allowing category scores and Current_Grade to exceed 100
9. IF all categories have zero Completed_Item entries (Completed_Weight is 0), THEN THE System SHALL return Current_Grade as 0 and display it as "No graded work yet"

### Requirement 7: Required Score Calculation

**User Story:** As a student, I want to know what average I need on remaining work, so that I can plan my effort.

#### Acceptance Criteria

1. WHEN Remaining_Weight is greater than 0, THE System SHALL calculate Required_Average exactly as defined in the Glossary, where the result may be negative (target already met) or exceed 100 (target impossible)
2. WHEN Required_Average exceeds 100, THE System SHALL indicate that the target grade is impossible to achieve
3. WHEN Required_Average is less than or equal to 0, THE System SHALL indicate that the target grade is already guaranteed by completed work
4. WHEN calculating the required score for an individual Remaining_Item, THE System SHALL compute Required_Average ÷ 100 × that item's max score (for example, a Required_Average of 105 on an item out of 100 requires 105/100), clamped to a minimum of 0
5. THE System SHALL also display Max_Achievable so the student can see the best possible final grade
6. WHEN calculating required scores, THE System SHALL use Item_Weight so that each Remaining_Item contributes to the overall grade in proportion to its category weight and max score
7. THE System SHALL implement required score calculations as pure functions in src/lib/grades.ts with no React imports
8. WHEN displaying required scores, THE System SHALL round to 1 decimal place

### Requirement 8: Verdict Determination

**User Story:** As a student, I want a clear verdict on my target grade, so that I know if it's achievable.

#### Acceptance Criteria

1. WHEN Earned_Points is greater than or equal to Target_Grade (the target is reached even with 0 on all remaining work), THE System SHALL assign verdict Safe
2. WHEN Earned_Points is less than Target_Grade AND Max_Achievable is greater than or equal to Target_Grade, THE System SHALL assign verdict At_Risk
3. WHEN Max_Achievable is less than Target_Grade, THE System SHALL assign verdict Doomed
4. THE System SHALL base the verdict on Earned_Points and Max_Achievable, never on Current_Grade (Current_Grade ignores ungraded work and would make the student look safer than they are)
5. WHEN there is no remaining work (Remaining_Weight is 0), THE System SHALL assign verdict Safe if Earned_Points meets or exceeds Target_Grade, otherwise Doomed (this follows from criteria 1–3)
6. THE System SHALL implement verdict logic as a pure function in src/lib/grades.ts with no React imports

### Requirement 9: Edge Case Handling

**User Story:** As a developer, I want the grade calculator to handle edge cases correctly, so that the system is reliable under all conditions.

#### Acceptance Criteria

1. WHEN category weights sum to a value other than 100 (less than 100 or greater than 100), THE System SHALL still calculate grades using Normalized_Weight, while showing the weight-sum warning from Requirement 3
2. IF a category weight is 0, THEN THE System SHALL exclude that category from grade calculations
3. WHEN a category has no items at all, THE System SHALL treat it as fully remaining work carrying its full Normalized_Weight (it counts toward Remaining_Weight, not as a score of 0)
4. WHEN Remaining_Weight is 0, THE System SHALL return no Required_Average and include a flag indicating no additional work is required
5. WHEN a Completed_Item has a score exceeding its maximum by any amount, THE System SHALL include the full score value in weighted calculations without capping
6. THE System SHALL include unit tests in src/lib/grades.test.ts covering weights summing to 0, weights summing to 50, weights summing to 99, weights summing to 101, weights summing to 200, a category with zero weight, a category with no items, a category with some completed and some remaining items, a course with no remaining items, and a completed item with score 150% of maximum
7. IF weight normalization would require division by zero (all weights are 0), THEN THE System SHALL treat the overall grade as undefined and return an error indicator

### Requirement 10: Data Persistence and Loading

**User Story:** As a student, I want my course data saved automatically, so that I don't lose my work between sessions.

#### Acceptance Criteria

1. WHEN a course is created, modified, or deleted, THE System SHALL save all course data to Storage under the key "deadline-reaper:v1"
2. WHEN the application starts, THE System SHALL load course data from Storage
3. WHEN saving course data, THE System SHALL serialize it as a JSON object containing a version field with value "1" and a courses field containing an array of Course objects
4. WHEN saved data is missing from Storage, THE System SHALL initialize with an empty array of courses
5. IF Storage contains data under the key "deadline-reaper:v1" but JSON parsing fails, THEN THE System SHALL initialize with an empty array of courses
6. IF parsed data is missing the version field, THEN THE System SHALL initialize with an empty array of courses
7. IF parsed data is missing the courses field or courses is not an array, THEN THE System SHALL initialize with an empty array of courses
8. IF parsed data has type mismatches for required fields, THEN THE System SHALL initialize with an empty array of courses
9. THE System SHALL validate that each Course contains a string id, string name, number targetGrade between 0 and 100, and array of Category objects
10. THE System SHALL validate that each Category contains a string id, string name, number weight between 0 and 100, and array of Item objects
11. THE System SHALL validate that each Item contains a string id and string name; an Item with both a number score and a number maxScore is a Completed_Item, and an Item with a string dueDate in ISO 8601 format and no score is a Remaining_Item
12. THE System SHALL implement storage loading, saving and validation logic in src/lib/storage.ts
13. THE System SHALL include unit tests in src/lib/storage.test.ts covering valid data, missing data, malformed JSON, missing version field, missing required fields, type mismatches, and negative numbers

### Requirement 11: Visual Styling and Theme

**User Story:** As a student, I want a Halloween-themed interface, so that the app is visually engaging.

#### Acceptance Criteria

1. THE System SHALL define CSS custom properties in src/styles/theme.css for primary background, text, accent colors, and verdict states (Safe, At_Risk, Doomed)
2. THE System SHALL use background colors in the range of 0-40 lightness (HSL) with purple (hue 270-290), black (hue 0, lightness 0-10), and orange (hue 25-35) accent colors
3. WHEN verdict is Safe, THE System SHALL display green (hue 120-150) color styling with a text label indicating "Safe"
4. WHEN verdict is At_Risk, THE System SHALL display red (hue 0-20) color styling with a text label indicating "At Risk"
5. WHEN verdict is Doomed, THE System SHALL display red (hue 0-20) color styling, a skull icon (Unicode U+1F480 or equivalent), and a text label indicating "Doomed"
6. THE System SHALL maintain minimum contrast ratio of 4.5:1 for normal text (below 18pt) and 3:1 for large text (18pt and above or 14pt bold and above) between foreground and background colors
7. THE System SHALL use semantic HTML elements (header, nav, main, section, article, form, button, label) for page structure and interactive components
8. THE System SHALL provide non-color indicators (text labels, icons, or patterns) for all information conveyed by color alone

### Requirement 12: Test Example Verification

**User Story:** As a developer, I want to verify the calculator works correctly with a known example, so that I can confirm accuracy.

#### Acceptance Criteria

1. GIVEN test input: Quizzes weight 20 percent with all its items completed at a 70 percent average, Projects weight 40 percent with all its items completed at a 95 percent average, Presentation weight 15 percent with no completed items (fully remaining), Final weight 25 percent with no completed items (fully remaining), WHEN Target_Grade is 94 percent, THE System SHALL produce Earned_Points of 52.0 (20 × 0.70 + 40 × 0.95), Completed_Weight of 60.0, Current_Grade of 86.67, Remaining_Weight of 40.0, Max_Achievable of 92.0, Required_Average of 105.0 ((94 − 52) ÷ 40 × 100), and Verdict of Doomed
2. GIVEN the same input, WHEN Target_Grade is 90 percent, THE System SHALL produce Required_Average of 95.0 ((90 − 52) ÷ 40 × 100) and Verdict of At_Risk
3. GIVEN the same input, WHEN Target_Grade is 50 percent, THE System SHALL produce Verdict of Safe (Earned_Points 52 ≥ 50)
4. WHEN comparing calculated numeric values to expected values in unit tests, THE System SHALL use a tolerance of 0.01 to account for floating-point arithmetic
5. THE System SHALL include unit tests in src/lib/grades.test.ts that verify each case in criteria 1–3
