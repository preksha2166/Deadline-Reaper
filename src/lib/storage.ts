import type { Course, Category, Item } from '../types';

const KEY = 'deadline-reaper:v1';

interface StorageData {
  version: '1';
  courses: Course[];
}

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

function isNumber(v: unknown): v is number {
  return typeof v === 'number' && isFinite(v);
}

function isArray(v: unknown): v is unknown[] {
  return Array.isArray(v);
}

function isIso8601(s: string): boolean {
  // Accept YYYY-MM-DD or full ISO 8601 datetime
  return /^\d{4}-\d{2}-\d{2}(T[\d:.Z+-]+)?$/.test(s);
}

function validateItem(raw: unknown): Item | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (!isString(r.id) || !isString(r.name)) return null;

  const hasScore = 'score' in r;
  const hasDue = 'dueDate' in r;

  if (hasScore) {
    // CompletedItem
    if (!isNumber(r.score) || r.score < 0) return null;
    if (!isNumber(r.max) || r.max < 0) return null;
    return { id: r.id, name: r.name, score: r.score as number, max: r.max as number };
  } else if (hasDue) {
    // RemainingItem
    if (!isString(r.dueDate) || !isIso8601(r.dueDate as string)) return null;
    const item: Item = { id: r.id, name: r.name, dueDate: r.dueDate as string };
    if ('max' in r) {
      if (!isNumber(r.max) || r.max < 0) return null;
      return { ...item, max: r.max as number };
    }
    return item;
  }
  return null;
}

function validateCategory(raw: unknown): Category | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (!isString(r.id) || !isString(r.name)) return null;
  if (!isNumber(r.weight) || r.weight < 0 || r.weight > 100) return null;
  if (!isArray(r.items)) return null;
  const items: Item[] = [];
  for (const rawItem of r.items) {
    const item = validateItem(rawItem);
    if (!item) return null;
    items.push(item);
  }
  return { id: r.id, name: r.name, weight: r.weight as number, items };
}

function validateCourse(raw: unknown): Course | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (!isString(r.id) || !isString(r.name)) return null;
  if (!isNumber(r.targetGrade) || r.targetGrade < 0 || r.targetGrade > 100) return null;
  if (!isArray(r.categories)) return null;
  const categories: Category[] = [];
  for (const rawCat of r.categories) {
    const cat = validateCategory(rawCat);
    if (!cat) return null;
    categories.push(cat);
  }
  return { id: r.id, name: r.name, targetGrade: r.targetGrade as number, categories };
}

export function loadCourses(): Course[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return [];
    const data = parsed as Record<string, unknown>;
    if (data.version !== '1') return [];
    if (!isArray(data.courses)) return [];
    const courses: Course[] = [];
    for (const rawCourse of data.courses) {
      const course = validateCourse(rawCourse);
      if (!course) return [];
      courses.push(course);
    }
    return courses;
  } catch {
    return [];
  }
}

export function saveCourses(courses: Course[]): void {
  const data: StorageData = { version: '1', courses };
  localStorage.setItem(KEY, JSON.stringify(data));
}
