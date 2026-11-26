import { useState, useCallback } from 'react';
import type { Course, Category, Item, CompletedItem, RemainingItem } from '../types';
import { loadCourses, saveCourses } from '../lib/storage';

function uuid(): string {
  return crypto.randomUUID();
}

function save(courses: Course[]): void {
  saveCourses(courses);
}

function validateName(name: string): string | null {
  if (!name || !name.trim()) return 'Name cannot be empty';
  return null;
}

export interface UseCourses {
  courses: Course[];
  addCourse: (name: string) => string | null;
  renameCourse: (id: string, name: string) => string | null;
  deleteCourse: (id: string) => void;
  addCategory: (courseId: string, name: string, weight: number) => string | null;
  updateCategory: (courseId: string, catId: string, name: string, weight: number) => string | null;
  deleteCategory: (courseId: string, catId: string) => void;
  addCompletedItem: (courseId: string, catId: string, name: string, score: number, max: number) => string | null;
  addRemainingItem: (courseId: string, catId: string, name: string, dueDate: string, max?: number) => string | null;
  updateItem: (courseId: string, catId: string, itemId: string, patch: Partial<CompletedItem & RemainingItem>) => void;
  deleteItem: (courseId: string, catId: string, itemId: string) => void;
  setTargetGrade: (courseId: string, value: number) => string | null;
}

export function useCourses(): UseCourses {
  const [courses, setCourses] = useState<Course[]>(() => loadCourses());

  const update = useCallback((next: Course[]) => {
    setCourses(next);
    save(next);
  }, []);

  const addCourse = useCallback((name: string): string | null => {
    const err = validateName(name);
    if (err) return err;
    const course: Course = { id: uuid(), name: name.trim(), targetGrade: 94.0, categories: [] };
    update([...courses, course]);
    return null;
  }, [courses, update]);

  const renameCourse = useCallback((id: string, name: string): string | null => {
    const err = validateName(name);
    if (err) return err;
    update(courses.map(c => c.id === id ? { ...c, name: name.trim() } : c));
    return null;
  }, [courses, update]);

  const deleteCourse = useCallback((id: string) => {
    update(courses.filter(c => c.id !== id));
  }, [courses, update]);

  const addCategory = useCallback((courseId: string, name: string, weight: number): string | null => {
    const err = validateName(name);
    if (err) return err;
    if (weight <= 0 || weight > 100) return 'Weight must be greater than 0 and at most 100';
    const cat: Category = { id: uuid(), name: name.trim(), weight, items: [] };
    update(courses.map(c => c.id === courseId ? { ...c, categories: [...c.categories, cat] } : c));
    return null;
  }, [courses, update]);

  const updateCategory = useCallback((courseId: string, catId: string, name: string, weight: number): string | null => {
    const err = validateName(name);
    if (err) return err;
    if (weight <= 0 || weight > 100) return 'Weight must be greater than 0 and at most 100';
    update(courses.map(c => c.id === courseId
      ? { ...c, categories: c.categories.map(cat => cat.id === catId ? { ...cat, name: name.trim(), weight } : cat) }
      : c
    ));
    return null;
  }, [courses, update]);

  const deleteCategory = useCallback((courseId: string, catId: string) => {
    update(courses.map(c => c.id === courseId
      ? { ...c, categories: c.categories.filter(cat => cat.id !== catId) }
      : c
    ));
  }, [courses, update]);

  const addCompletedItem = useCallback((courseId: string, catId: string, name: string, score: number, max: number): string | null => {
    const err = validateName(name);
    if (err) return err;
    if (score < 0 || score > 999999.99) return 'Score must be between 0 and 999999.99';
    if (max < 0 || max > 999999.99) return 'Max must be between 0 and 999999.99';
    if (max > 0 && score > max * 2) return 'Score cannot exceed 200% of max';
    const item: CompletedItem = { id: uuid(), name: name.trim(), score, max };
    update(courses.map(c => c.id === courseId
      ? { ...c, categories: c.categories.map(cat => cat.id === catId ? { ...cat, items: [...cat.items, item] } : cat) }
      : c
    ));
    return null;
  }, [courses, update]);

  const addRemainingItem = useCallback((courseId: string, catId: string, name: string, dueDate: string, max?: number): string | null => {
    const err = validateName(name);
    if (err) return err;
    if (max !== undefined && (max < 0 || max > 999999.99)) return 'Max must be between 0 and 999999.99';
    const item: RemainingItem = { id: uuid(), name: name.trim(), dueDate, ...(max !== undefined ? { max } : {}) };
    update(courses.map(c => c.id === courseId
      ? { ...c, categories: c.categories.map(cat => cat.id === catId ? { ...cat, items: [...cat.items, item] } : cat) }
      : c
    ));
    return null;
  }, [courses, update]);

  const updateItem = useCallback((courseId: string, catId: string, itemId: string, patch: Partial<CompletedItem & RemainingItem>) => {
    update(courses.map(c => c.id === courseId
      ? {
          ...c, categories: c.categories.map(cat => cat.id === catId
            ? { ...cat, items: cat.items.map(item => item.id === itemId ? { ...item, ...patch } as Item : item) }
            : cat
          )
        }
      : c
    ));
  }, [courses, update]);

  const deleteItem = useCallback((courseId: string, catId: string, itemId: string) => {
    update(courses.map(c => c.id === courseId
      ? { ...c, categories: c.categories.map(cat => cat.id === catId ? { ...cat, items: cat.items.filter(i => i.id !== itemId) } : cat) }
      : c
    ));
  }, [courses, update]);

  const setTargetGrade = useCallback((courseId: string, value: number): string | null => {
    if (!isFinite(value) || value < 0 || value > 100) return 'Target grade must be between 0 and 100';
    const rounded = Math.round(value * 10) / 10;
    update(courses.map(c => c.id === courseId ? { ...c, targetGrade: rounded } : c));
    return null;
  }, [courses, update]);

  return {
    courses,
    addCourse,
    renameCourse,
    deleteCourse,
    addCategory,
    updateCategory,
    deleteCategory,
    addCompletedItem,
    addRemainingItem,
    updateItem,
    deleteItem,
    setTargetGrade,
  };
}
