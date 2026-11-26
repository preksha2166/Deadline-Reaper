import { useState } from 'react';
import styles from './TargetInput.module.css';

interface Props {
  value: number;
  onChange: (v: number) => string | null;
}

export default function TargetInput({ value, onChange }: Props) {
  const [raw, setRaw] = useState(String(value));
  const [error, setError] = useState<string | null>(null);

  function commit() {
    const n = parseFloat(raw);
    if (isNaN(n)) {
      setError('Enter a number between 0 and 100');
      return;
    }
    const err = onChange(n);
    if (err) {
      setError(err);
    } else {
      setError(null);
      setRaw(String(Math.round(n * 10) / 10));
    }
  }

  return (
    <div className={styles.wrapper}>
      <label htmlFor="target-grade" className={styles.label}>Target grade</label>
      <input
        id="target-grade"
        type="number"
        min={0}
        max={100}
        step={0.1}
        className={styles.input}
        value={raw}
        onChange={e => setRaw(e.target.value)}
        onBlur={commit}
        onKeyDown={e => e.key === 'Enter' && commit()}
        aria-invalid={error ? 'true' : undefined}
      />
      <span className={styles.pct}>%</span>
      {error && <span className={styles.error} role="alert">{error}</span>}
    </div>
  );
}
