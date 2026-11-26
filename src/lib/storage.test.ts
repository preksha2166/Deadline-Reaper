import { describe, it, expect, beforeEach } from 'vitest';
import { loadCourses, saveCourses } from './storage';
import type { Course } from '../types';

const KEY = 'deadline-reaper:v1';

beforeEach(() => {
  localStorage.clear();
});

const validCourse: Course = {
  id: 'c1',
  name: 'Test Course',
  targetGrade: 90,
  categories: [
    {
      id: 'cat1',
      name: 'Quizzes',
      weight: 50,
      items: [
        { id: 'i1', name: 'Quiz 1', score: 80, max: 100 },
        { id: 'i2', name: 'Quiz 2', dueDate: '2024-12-01', max: 100 },
      ],
    },
    {
      id: 'cat2',
      name: 'Projects',
      weight: 50,
      items: [],
    },
  ],
};

describe('loadCourses', () => {
  it('returns empty array when key missing', () => {
    expect(loadCourses()).toEqual([]);
  });

  it('returns empty array on malformed JSON', () => {
    localStorage.setItem(KEY, '{ not json !!!');
    expect(loadCourses()).toEqual([]);
  });

  it('returns empty array when version field missing', () => {
    localStorage.setItem(KEY, JSON.stringify({ courses: [] }));
    expect(loadCourses()).toEqual([]);
  });

  it('returns empty array when version field wrong', () => {
    localStorage.setItem(KEY, JSON.stringify({ version: '2', courses: [] }));
    expect(loadCourses()).toEqual([]);
  });

  it('returns empty array when courses field missing', () => {
    localStorage.setItem(KEY, JSON.stringify({ version: '1' }));
    expect(loadCourses()).toEqual([]);
  });

  it('returns empty array when courses is not an array', () => {
    localStorage.setItem(KEY, JSON.stringify({ version: '1', courses: 'oops' }));
    expect(loadCourses()).toEqual([]);
  });

  it('returns empty array when course id is missing', () => {
    const bad = { version: '1', courses: [{ name: 'C', targetGrade: 90, categories: [] }] };
    localStorage.setItem(KEY, JSON.stringify(bad));
    expect(loadCourses()).toEqual([]);
  });

  it('returns empty array when course targetGrade is a string', () => {
    const bad = { version: '1', courses: [{ id: 'c1', name: 'C', targetGrade: '90', categories: [] }] };
    localStorage.setItem(KEY, JSON.stringify(bad));
    expect(loadCourses()).toEqual([]);
  });

  it('returns empty array when course targetGrade is negative', () => {
    const bad = { version: '1', courses: [{ id: 'c1', name: 'C', targetGrade: -1, categories: [] }] };
    localStorage.setItem(KEY, JSON.stringify(bad));
    expect(loadCourses()).toEqual([]);
  });

  it('returns empty array when category weight is out of range', () => {
    const bad = {
      version: '1',
      courses: [{
        id: 'c1', name: 'C', targetGrade: 90,
        categories: [{ id: 'cat1', name: 'A', weight: 150, items: [] }],
      }],
    };
    localStorage.setItem(KEY, JSON.stringify(bad));
    expect(loadCourses()).toEqual([]);
  });

  it('returns empty array when item score is negative', () => {
    const bad = {
      version: '1',
      courses: [{
        id: 'c1', name: 'C', targetGrade: 90,
        categories: [{
          id: 'cat1', name: 'A', weight: 100,
          items: [{ id: 'i1', name: 'I1', score: -5, max: 100 }],
        }],
      }],
    };
    localStorage.setItem(KEY, JSON.stringify(bad));
    expect(loadCourses()).toEqual([]);
  });

  it('returns empty array when item has invalid dueDate', () => {
    const bad = {
      version: '1',
      courses: [{
        id: 'c1', name: 'C', targetGrade: 90,
        categories: [{
          id: 'cat1', name: 'A', weight: 100,
          items: [{ id: 'i1', name: 'I1', dueDate: 'not-a-date' }],
        }],
      }],
    };
    localStorage.setItem(KEY, JSON.stringify(bad));
    expect(loadCourses()).toEqual([]);
  });

  it('round-trips valid course data', () => {
    saveCourses([validCourse]);
    const loaded = loadCourses();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe('c1');
    expect(loaded[0].name).toBe('Test Course');
    expect(loaded[0].targetGrade).toBe(90);
    expect(loaded[0].categories).toHaveLength(2);
  });

  it('round-trips course with no categories', () => {
    const course: Course = { id: 'c2', name: 'Empty', targetGrade: 50, categories: [] };
    saveCourses([course]);
    expect(loadCourses()).toEqual([course]);
  });

  it('round-trips multiple courses', () => {
    const course2: Course = { id: 'c3', name: 'Course B', targetGrade: 75, categories: [] };
    saveCourses([validCourse, course2]);
    const loaded = loadCourses();
    expect(loaded).toHaveLength(2);
    expect(loaded[1].name).toBe('Course B');
  });

  it('accepts remaining item with valid ISO 8601 date', () => {
    const course: Course = {
      id: 'c1', name: 'C', targetGrade: 90,
      categories: [{
        id: 'cat1', name: 'A', weight: 100,
        items: [{ id: 'i1', name: 'I1', dueDate: '2024-12-01' }],
      }],
    };
    saveCourses([course]);
    const loaded = loadCourses();
    expect(loaded).toHaveLength(1);
  });
});

describe('saveCourses', () => {
  it('writes correct version and key', () => {
    saveCourses([]);
    const raw = localStorage.getItem(KEY);
    expect(raw).not.toBeNull();
    const data = JSON.parse(raw!);
    expect(data.version).toBe('1');
    expect(data.courses).toEqual([]);
  });
});
