import type { Course } from '../../types';
import type { UseCourses } from '../../hooks/useCourses';
import { calcGrades } from '../../lib/grades';
import TargetInput from '../TargetInput/TargetInput';
import CategoryEditor from '../CategoryEditor/CategoryEditor';
import ResultsPanel from '../ResultsPanel/ResultsPanel';
import styles from './CourseEditor.module.css';

interface Props {
  course: Course | null;
  actions: UseCourses;
}

export default function CourseEditor({ course, actions }: Props) {
  if (!course) {
    return <div className={styles.empty}>The reaper is waiting…</div>;
  }

  const result = calcGrades(course, course.targetGrade);

  return (
    <article className={styles.editor} aria-label={`Editing ${course.name}`}>
      <header className={styles.header}>
        <h2 className={styles.courseName}>{course.name}</h2>
        <TargetInput
          value={course.targetGrade}
          onChange={v => actions.setTargetGrade(course.id, v)}
        />
      </header>
      <ResultsPanel result={result} course={course} />
      <CategoryEditor
        course={course}
        actions={{
          addCategory: actions.addCategory,
          updateCategory: actions.updateCategory,
          deleteCategory: actions.deleteCategory,
          addCompletedItem: actions.addCompletedItem,
          addRemainingItem: actions.addRemainingItem,
          deleteItem: actions.deleteItem,
        }}
      />
    </article>
  );
}
