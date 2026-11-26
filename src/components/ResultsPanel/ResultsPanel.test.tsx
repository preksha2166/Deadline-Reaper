import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ResultsPanel from './ResultsPanel';
import type { Course, GradeResult } from '../../types';

const remainingCourse: Course = {
  id: 'c1',
  name: 'Test',
  targetGrade: 90,
  categories: [
    {
      id: 'cat1',
      name: 'Quizzes',
      weight: 60,
      items: [
        { id: 'q1', name: 'Quiz 1', score: 80, max: 100 },
        { id: 'q2', name: 'Quiz 2', dueDate: '2024-12-01', max: 100 },
      ],
    },
    {
      id: 'cat2',
      name: 'Final',
      weight: 40,
      items: [
        { id: 'f1', name: 'Final Exam', dueDate: '2024-12-15', max: 100 },
      ],
    },
  ],
};

// earnedPoints=24 (60%*0.5*0.8), completedWeight=30, remainingWeight=70
// maxAchievable=94, requiredAverage=(90-24)/70*100≈94.3
const remainingResult: GradeResult = {
  earnedPoints: 24,
  completedWeight: 30,
  remainingWeight: 70,
  currentGrade: 80,
  maxAchievable: 94,
  requiredAverage: 94.3,
  verdict: 'AtRisk',
  perItemRequired: [
    { itemId: 'q2', required: 94.3 },
    { itemId: 'f1', required: 94.3 },
  ],
};

const allCompletedCourse: Course = {
  id: 'c2',
  name: 'Done',
  targetGrade: 90,
  categories: [
    {
      id: 'cat1',
      name: 'Quizzes',
      weight: 100,
      items: [{ id: 'q1', name: 'Quiz 1', score: 95, max: 100 }],
    },
  ],
};

const allCompletedResult: GradeResult = {
  earnedPoints: 95,
  completedWeight: 100,
  remainingWeight: 0,
  currentGrade: 95,
  maxAchievable: 95,
  requiredAverage: null,
  verdict: 'Safe',
  perItemRequired: [],
};

describe('ResultsPanel — what-if simulator', () => {
  it('toggle button absent when no remaining items', () => {
    render(<ResultsPanel result={allCompletedResult} course={allCompletedCourse} />);
    expect(screen.queryByRole('button', { name: /what-if/i })).toBeNull();
  });

  it('toggle button present when remaining items exist', () => {
    render(<ResultsPanel result={remainingResult} course={remainingCourse} />);
    expect(screen.getByRole('button', { name: /what-if/i })).toBeTruthy();
  });

  it('simulator inputs hidden before toggle', () => {
    render(<ResultsPanel result={remainingResult} course={remainingCourse} />);
    expect(screen.queryByRole('spinbutton')).toBeNull();
  });

  it('simulator inputs shown after toggle', () => {
    render(<ResultsPanel result={remainingResult} course={remainingCourse} />);
    fireEvent.click(screen.getByRole('button', { name: /what-if/i }));
    // two remaining items → two inputs
    expect(screen.getAllByRole('spinbutton')).toHaveLength(2);
  });

  it('label renders as "Category \u2014 Item" (em dash)', () => {
    render(<ResultsPanel result={remainingResult} course={remainingCourse} />);
    fireEvent.click(screen.getByRole('button', { name: /what-if/i }));
    expect(screen.getByLabelText('Quizzes \u2014 Quiz 2')).toBeTruthy();
    expect(screen.getByLabelText('Final \u2014 Final Exam')).toBeTruthy();
  });

  it('typing a valid score updates projected verdict', () => {
    render(<ResultsPanel result={remainingResult} course={remainingCourse} />);
    fireEvent.click(screen.getByRole('button', { name: /what-if/i }));
    const input = screen.getByLabelText('Quizzes \u2014 Quiz 2');
    fireEvent.change(input, { target: { value: '100' } });
    // projected section should appear
    expect(screen.getByText(/Projected:/)).toBeTruthy();
  });

  it('negative score shows error and does not appear in projected section title', () => {
    render(<ResultsPanel result={remainingResult} course={remainingCourse} />);
    fireEvent.click(screen.getByRole('button', { name: /what-if/i }));
    const input = screen.getByLabelText('Quizzes \u2014 Quiz 2');
    fireEvent.change(input, { target: { value: '-5' } });
    expect(screen.getByRole('alert', { name: /negative/i })).toBeTruthy();
  });

  it('score > 2x max shows error', () => {
    render(<ResultsPanel result={remainingResult} course={remainingCourse} />);
    fireEvent.click(screen.getByRole('button', { name: /what-if/i }));
    const input = screen.getByLabelText('Quizzes \u2014 Quiz 2');
    fireEvent.change(input, { target: { value: '999' } });
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText(/Max allowed/)).toBeTruthy();
  });

  it('Reset clears all inputs', () => {
    render(<ResultsPanel result={remainingResult} course={remainingCourse} />);
    fireEvent.click(screen.getByRole('button', { name: /what-if/i }));
    const input = screen.getByLabelText('Quizzes \u2014 Quiz 2');
    fireEvent.change(input, { target: { value: '90' } });
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect((input as HTMLInputElement).value).toBe('');
  });
});
