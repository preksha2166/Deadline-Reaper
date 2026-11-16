---
inclusion: always
---

# Product: Deadline Reaper

## What it is
Deadline Reaper is a Halloween-themed grade-rescue planner for university students. The student tells it how their course is graded, what they have scored so far, and the grade they want. The app works out exactly what they still need, and where it is easiest to get it.

Tagline: **"Escape the Reaper."**

## Who it is for
University students partway through a semester who are worried about a final grade. One example is a master's student aiming for an A (94%) who has weak quiz scores but strong projects and presentations.

## The problem
Syllabi list category weights, but students rarely know:
- what their grade actually is right now
- what score they need on each remaining item to reach their target
- whether the target is still possible at all
- which categories to put effort into for the biggest payoff

## Core features (priority order)
1. **Course setup:** create a course, then add grading categories with weights. Weights must total 100%. Example: Quizzes 20%, Projects 40%, Presentation 15%, Final 25%.
2. **Items:** each category has items. Completed items have a score and a max score. Remaining items have a due date and an optional max score.
3. **Target grade:** the student sets a target percentage (default 94).
4. **Rescue math:**
   - current weighted grade, counting completed work only
   - the minimum average needed on all remaining work to hit the target
   - the minimum needed per remaining item
   - a clear verdict: **Safe**, **At Risk**, or **Doomed** (target impossible even with 100% on everything left)
5. **Strategy view:** shows how scoring higher in strong categories can make up for a weak one. Example: "Each extra 5% on the Final Project offsets 10% lost on quizzes."
6. **Practice plan:** for weak categories, suggest small, gradual daily practice steps leading up to each remaining deadline.
7. **Reaper clock:** a countdown to each upcoming deadline.

## Theme ("Costume Contest" category)
- Dark Halloween look: deep purples, black and pumpkin orange.
- At-risk items glow red, safe items glow green, and Doomed items show a skull.
- The reaper "approaches" as deadlines get closer and the grade gap gets bigger.
- The theme must never get in the way of clarity. Numbers stay readable and accessible: good contrast, and no information shown by colour alone.

## Non-goals
- No accounts, login or backend. All data stays in the user's browser.
- No syncing with an LMS such as Canvas.
- No AI-generated grades or predictions. The math is deterministic and explainable.

## Tone
Playful and spooky in headings and empty states ("The reaper is waiting..."), but plain and precise when showing numbers and advice.
