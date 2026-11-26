import { useState } from 'react';
import type { GradeResult, Course } from '../../types';
import { isRemainingItem } from '../../types';
import { applyHypotheticals } from '../../lib/whatIf';
import { calcGrades } from '../../lib/grades';
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
    if (itemId === cat.id + '__empty') return cat.name + ' (no items)';
    for (const item of cat.items) {
      if (item.id === itemId) return item.name;
    }
  }
  return itemId;
}

function hasRemainingItems(course: Course): boolean {
  return course.categories.some(cat => cat.items.some(isRemainingItem));
}

export default function ResultsPanel({ result, course }: Props) {
  const [whatIfMode, setWhatIfMode] = useState(false);
  const [hypotheticals, setHypotheticals] = useState<Map<string, string>>(new Map());

  const { earnedPoints, currentGrade, maxAchievable, requiredAverage, verdict, perItemRequired } = result;

  // Build valid hyp map (exclude empty/non-numeric, negative, and >2x max)
  const validHyp = new Map<string, number>();
  const inputErrors = new Map<string, string>();

  if (whatIfMode) {
    for (const [id, raw] of hypotheticals) {
      const v = parseFloat(raw);
      if (raw === '' || isNaN(v)) continue; // silently exclude
      // find item max
      let itemMax = 100;
      for (const cat of course.categories) {
        for (const item of cat.items) {
          if (item.id === id && isRemainingItem(item)) {
            itemMax = item.max ?? 100;
          }
        }
      }
      if (v < 0) {
        inputErrors.set(id, 'Score cannot be negative');
      } else if (v > itemMax * 2) {
        inputErrors.set(id, `Max allowed: ${round1(itemMax * 2)}`);
      } else {
        validHyp.set(id, v);
      }
    }
  }

  // Projected result
  const projectedResult = whatIfMode
    ? calcGrades(applyHypotheticals(course, validHyp), course.targetGrade)
    : null;

  const verdictClass = verdict === 'Safe' ? styles.safe : verdict === 'AtRisk' ? styles.atRisk : styles.doomed;
  const verdictLabel = verdict === 'Safe' ? 'Safe' : verdict === 'AtRisk' ? 'At Risk' : 'Doomed';
  const verdictIcon = verdict === 'Safe' ? '\u2705' : verdict === 'AtRisk' ? '\u26a0\ufe0f' : '\ud83d\udc80';

  function projVerdictClass(v: string) {
    return v === 'Safe' ? styles.safe : v === 'AtRisk' ? styles.atRisk : styles.doomed;
  }
  function projVerdictLabel(v: string) {
    return v === 'Safe' ? 'Safe' : v === 'AtRisk' ? 'At Risk' : 'Doomed';
  }
  function projVerdictIcon(v: string) {
    return v === 'Safe' ? '\u2705' : v === 'AtRisk' ? '\u26a0\ufe0f' : '\ud83d\udc80';
  }

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

      {hasRemainingItems(course) && (
        <button
          className={styles.whatIfBtn}
          onClick={() => { setWhatIfMode(!whatIfMode); setHypotheticals(new Map()); }}
          aria-pressed={whatIfMode}
        >
          {whatIfMode ? 'Hide' : 'Show'} what-if simulator
        </button>
      )}

      {whatIfMode && (
        <div className={styles.whatIfSection}>
          <div className={styles.whatIfHeader}>
            <p className={styles.heading}>What-if scores</p>
            <button
              className={styles.resetBtn}
              onClick={() => setHypotheticals(new Map())}
            >
              Reset
            </button>
          </div>

          {course.categories.map(cat =>
            cat.items.filter(isRemainingItem).map(item => {
              const inputId = `whatif-${item.id}`;
              const placeholder = round1(
                perItemRequired.find(p => p.itemId === item.id)?.required ?? 0
              );
              const raw = hypotheticals.get(item.id) ?? '';
              const err = inputErrors.get(item.id);
              return (
                <div key={item.id} className={styles.whatIfRow}>
                  <label htmlFor={inputId} className={styles.whatIfLabel}>
                    {cat.name} {'\u2014'} {item.name}
                  </label>
                  <input
                    id={inputId}
                    type="number"
                    step={0.1}
                    className={styles.whatIfInput}
                    value={raw}
                    placeholder={placeholder}
                    aria-invalid={err ? 'true' : undefined}
                    onChange={e => {
                      const next = new Map(hypotheticals);
                      next.set(item.id, e.target.value);
                      setHypotheticals(next);
                    }}
                  />
                  {err && <span className={styles.inputError} role="alert">{err}</span>}
                </div>
              );
            })
          )}

          {projectedResult && (
            <div className={styles.projectedSection}>
              <p className={styles.heading}>Projected</p>
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Projected earned pts</span>
                  <span className={styles.statValue}>{round1(projectedResult.earnedPoints)}%</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Projected best grade</span>
                  <span className={styles.statValue}>{round1(projectedResult.maxAchievable)}%</span>
                </div>
              </div>
              <div
                aria-live="polite"
                role="status"
                className={`${styles.verdict} ${projVerdictClass(projectedResult.verdict)}`}
                aria-label={`Projected verdict: ${projVerdictLabel(projectedResult.verdict)}`}
              >
                <span aria-hidden="true">{projVerdictIcon(projectedResult.verdict)}</span>
                <span>Projected: {projVerdictLabel(projectedResult.verdict)}</span>
              </div>
            </div>
          )}
        </div>
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
