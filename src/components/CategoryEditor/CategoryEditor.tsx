import { useState } from 'react';
import type { Course, Category } from '../../types';
import { isCompletedItem, isRemainingItem } from '../../types';
import type { UseCourses } from '../../hooks/useCourses';
import styles from './CategoryEditor.module.css';

interface Props {
  course: Course;
  actions: Pick<UseCourses, 'addCategory' | 'updateCategory' | 'deleteCategory' | 'addCompletedItem' | 'addRemainingItem' | 'deleteItem'>;
}

function WeightWarning({ categories }: { categories: Category[] }) {
  const total = categories.reduce((s, c) => s + c.weight, 0);
  if (Math.abs(total - 100) < 0.001) return null;
  return (
    <p className={styles.warning} role="alert">
      ⚠ Weights total {total.toFixed(1)}% — must sum to exactly 100%
    </p>
  );
}

type ItemMode = 'completed' | 'remaining';

function AddItemForm({ courseId, catId, actions }: {
  courseId: string;
  catId: string;
  actions: Pick<UseCourses, 'addCompletedItem' | 'addRemainingItem'>;
}) {
  const [mode, setMode] = useState<ItemMode>('completed');
  const [name, setName] = useState('');
  const [score, setScore] = useState('');
  const [max, setMax] = useState('100');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let err: string | null = null;
    if (mode === 'completed') {
      err = actions.addCompletedItem(courseId, catId, name, parseFloat(score), parseFloat(max));
    } else {
      const maxVal = max ? parseFloat(max) : undefined;
      err = actions.addRemainingItem(courseId, catId, name, dueDate, maxVal);
    }
    if (err) {
      setError(err);
    } else {
      setName(''); setScore(''); setMax('100'); setDueDate(''); setError(null); setOpen(false);
    }
  }

  if (!open) {
    return (
      <button className={styles.smallBtn} onClick={() => setOpen(true)}>+ Add item</button>
    );
  }

  return (
    <form className={styles.addItemForm} onSubmit={handleSubmit}>
      <div className={styles.formRow}>
        <button
          type="button"
          className={mode === 'completed' ? `${styles.smallBtn} ${styles.active}` : styles.smallBtn}
          onClick={() => setMode('completed')}
          aria-pressed={mode === 'completed'}
        >
          Completed
        </button>
        <button
          type="button"
          className={mode === 'remaining' ? `${styles.smallBtn} ${styles.active}` : styles.smallBtn}
          onClick={() => setMode('remaining')}
          aria-pressed={mode === 'remaining'}
        >
          Remaining
        </button>
      </div>
      <div className={styles.formRow}>
        <label htmlFor={`item-name-${catId}`} className={styles.formLabel}>Name</label>
        <input
          id={`item-name-${catId}`}
          className={styles.itemInput}
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Item name"
          required
        />
      </div>
      {mode === 'completed' ? (
        <div className={styles.formRow}>
          <label className={styles.formLabel}>Score</label>
          <input className={styles.itemSmall} type="number" min={0} step={0.01} value={score} onChange={e => setScore(e.target.value)} placeholder="Score" required />
          <span className={styles.formLabel}>/</span>
          <input className={styles.itemSmall} type="number" min={0} step={0.01} value={max} onChange={e => setMax(e.target.value)} placeholder="Max" required />
        </div>
      ) : (
        <div className={styles.formRow}>
          <label className={styles.formLabel}>Due</label>
          <input className={styles.itemInput} type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
          <label className={styles.formLabel}>Max</label>
          <input className={styles.itemSmall} type="number" min={0} step={0.01} value={max} onChange={e => setMax(e.target.value)} placeholder="100" />
        </div>
      )}
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.formRow}>
        <button type="submit" className={styles.accentBtn}>Save</button>
        <button type="button" className={styles.smallBtn} onClick={() => { setOpen(false); setError(null); }}>Cancel</button>
      </div>
    </form>
  );
}

export default function CategoryEditor({ course, actions }: Props) {
  const [catName, setCatName] = useState('');
  const [catWeight, setCatWeight] = useState('');
  const [catError, setCatError] = useState<string | null>(null);

  function handleAddCat(e: React.FormEvent) {
    e.preventDefault();
    const err = actions.addCategory(course.id, catName, parseFloat(catWeight));
    if (err) {
      setCatError(err);
    } else {
      setCatName(''); setCatWeight(''); setCatError(null);
    }
  }

  return (
    <section className={styles.section} aria-label="Categories">
      <WeightWarning categories={course.categories} />

      {course.categories.map(cat => (
        <article key={cat.id} className={styles.catCard}>
          <div className={styles.catHeader}>
            <span className={styles.catWeight}>{cat.name}</span>
            <span className={styles.catWeight}>({cat.weight}%)</span>
            <button
              className={styles.deleteBtn}
              onClick={() => actions.deleteCategory(course.id, cat.id)}
              aria-label={`Delete category ${cat.name}`}
            >
              ✕
            </button>
          </div>
          <ul className={styles.itemList}>
            {cat.items.map(item => (
              <li key={item.id} className={styles.itemRow}>
                <span className={styles.itemName}>{item.name}</span>
                {isCompletedItem(item) && (
                  <span className={styles.itemMeta}>{item.score} / {item.max}</span>
                )}
                {isRemainingItem(item) && (
                  <span className={styles.itemMeta}>due {item.dueDate} · max {item.max ?? 100}</span>
                )}
                <button
                  className={styles.deleteBtn}
                  onClick={() => actions.deleteItem(course.id, cat.id, item.id)}
                  aria-label={`Delete item ${item.name}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <AddItemForm courseId={course.id} catId={cat.id} actions={actions} />
        </article>
      ))}

      <form className={styles.addCatForm} onSubmit={handleAddCat}>
        <label htmlFor="new-cat-name" className={styles.formLabel}>Category</label>
        <input
          id="new-cat-name"
          className={styles.catNameInput}
          value={catName}
          onChange={e => setCatName(e.target.value)}
          placeholder="Name"
          required
        />
        <label htmlFor="new-cat-weight" className={styles.formLabel}>Weight</label>
        <input
          id="new-cat-weight"
          className={styles.catWeightInput}
          type="number"
          min={0.1}
          max={100}
          step={0.1}
          value={catWeight}
          onChange={e => setCatWeight(e.target.value)}
          placeholder="%"
          required
        />
        <span className={styles.catWeight}>%</span>
        <button type="submit" className={styles.accentBtn}>Add category</button>
      </form>
      {catError && <p className={styles.error} role="alert">{catError}</p>}
    </section>
  );
}
