import { useState } from 'react';
import type { GradeResult, Course } from '../../types';
import styles from './ResultsPanel.module.css';

interface Props {
  result: GradeResult;
  course: Course;
}

function round1(n: number): string {
  return n.toFixed(1);
}

function getItemName(course: Course, itemId: string): string {
  for (const cat of course.categories) {
    // Handle the empty-category sentinel
    if (itemId === cat.id + '__empty') return cat.name + ' (no items)';
    for (const item of cat.items) {
      if (item.id === itemId) return item.name;
    }
  }
  return itemId;
}

export default function ResultsPanel({ result, course }: Props) {
  const [whatIfMode, setWhatIfMode] = useState(false);
  const { earnedPoints, currentGrade, maxAchievable, requiredAverage, verdict, perItemRequired } = result;

  const verdictClass = verdict === 'Safe' ? styles.safe : verdict === 'AtRisk' ? styles.atRisk : styles.doomed;
  const verdictLabel = verdict === 'Safe' ? 'Safe' : verdict === 'AtRisk' ? 'At Risk' : 'Doomed';
  const verdictIcon = verdict === 'Safe' ? '✅' : verdict === 'AtRisk' ? '⚠️' : '💀';

  return (
    <section className={styles.panel} aria-label="Grade results">
      <div className={`${styles.verdict} ${verdictClass}`} role="status" aria-label={`Verdict: ${verdictLabel}`}>
        <span aria-hidden="true">{verdictIcon}</span>
        <span>{verdictLabel}</span>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Current grade (completed work)</span>
          {currentGrade === null
            ? <span className={styles.noWork}>No graded work yet</span>
            : <span className={styles.statValue}>{round1(currentGrade)}%</span>
          }
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Earned points (final grade)</span>
          <span className={styles.statValue}>{round1(earnedPoints)}%</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Best possible grade</span>
          <span className={styles.statValue}>{round1(maxAchievable)}%</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Required average (remaining)</span>
          {requiredAverage === null
            ? <span className={styles.noWork}>No remaining work</span>
            : requiredAverage > 100
              ? <span className={styles.statValue} style={{ color: 'var(--color-doomed)' }}>Impossible ({round1(requiredAverage)}%)</span>
              : requiredAverage <= 0
                ? <span className={styles.statValue} style={{ color: 'var(--color-safe)' }}>Already guaranteed</span>
                : <span className={styles.statValue}>{round1(requiredAverage)}%</span>
          }
        </div>
      </div>

      {perItemRequired.length > 0 && (
        <button
          className={styles.whatIfBtn}
          onClick={() => setWhatIfMode(!whatIfMode)}
          aria-pressed={whatIfMode}
        >
          {whatIfMode ? 'Hide' : 'Show'} what-if simulator
        </button>
      )}

      {perItemRequired.length > 0 && (
        <>
          <p className={styles.heading}>Required per item</p>
          <ul className={styles.perItem}>
            {perItemRequired.map(p => (
              <li key={p.itemId} className={styles.perItemRow}>
                <span className={styles.perItemName}>{getItemName(course, p.itemId)}</span>
                <span className={styles.perItemScore}>{round1(p.required)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
