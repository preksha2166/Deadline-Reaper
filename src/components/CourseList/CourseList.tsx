import { useState } from 'react';
import type { Course } from '../../types';
import styles from './CourseList.module.css';

interface Props {
  courses: Course[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (name: string) => string | null;
}

export default function CourseList({ courses, selectedId, onSelect, onDelete, onAdd }: Props) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const err = onAdd(input);
    if (err) {
      setError(err);
    } else {
      setInput('');
      setError(null);
    }
  }

  return (
    <nav className={styles.panel} aria-label="Course list">
      <h2 className={styles.heading}>☠ Courses</h2>
      <ul className={styles.list}>
        {courses.map(c => (
          <li key={c.id} className={styles.item}>
            <button
              className={`${styles.nameBtn}${c.id === selectedId ? ' ' + styles.active : ''}`}
              onClick={() => onSelect(c.id)}
              aria-current={c.id === selectedId ? 'page' : undefined}
            >
              {c.name}
            </button>
            <button
              className={styles.deleteBtn}
              onClick={() => onDelete(c.id)}
              aria-label={`Delete ${c.name}`}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <form className={styles.addForm} onSubmit={handleAdd}>
        <label htmlFor="new-course-name" className="sr-only">New course name</label>
        <input
          id="new-course-name"
          className={styles.addInput}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="New course…"
          aria-invalid={error ? 'true' : undefined}
        />
        <button type="submit" className={styles.addBtn}>Add</button>
      </form>
      {error && <p className={styles.error} role="alert">{error}</p>}
    </nav>
  );
}
