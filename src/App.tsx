import { useState } from 'react';
import { useCourses } from './hooks/useCourses';
import CourseList from './components/CourseList/CourseList';
import CourseEditor from './components/CourseEditor/CourseEditor';

const appStyle: React.CSSProperties = {
  display: 'flex',
  height: '100vh',
  overflow: 'hidden',
};

export default function App() {
  const actions = useCourses();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedCourse = actions.courses.find(c => c.id === selectedId) ?? null;

  function handleDelete(id: string) {
    actions.deleteCourse(id);
    if (selectedId === id) setSelectedId(null);
  }

  function handleAdd(name: string): string | null {
    const before = actions.courses.map(c => c.id);
    const err = actions.addCourse(name);
    if (!err) {
      // Select the newly created course
      setTimeout(() => {
        const after = actions.courses.find(c => !before.includes(c.id));
        if (after) setSelectedId(after.id);
      }, 0);
    }
    return err;
  }

  return (
    <div style={appStyle}>
      <CourseList
        courses={actions.courses}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />
      <CourseEditor course={selectedCourse} actions={actions} />
    </div>
  );
}
