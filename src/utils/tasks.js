/**
 * Filtering and sorting for the task list, kept out of the component so it
 * can be tested without a browser.
 */
export function filterTasks(tasks, subjects, options = {}) {
  const { status = 'pending', subjectId = '', search = '', sort = 'dueDate' } = options;
  const term = search.trim().toLocaleLowerCase('sl');
  const subjectNames = new Map(subjects.map((subject) => [subject.id, subject.name]));

  const list = tasks.filter((task) => {
    if (status === 'pending' && task.completed) return false;
    if (status === 'completed' && !task.completed) return false;
    if (subjectId && task.subjectId !== subjectId) return false;
    if (!term) return true;
    const subjectName = subjectNames.get(task.subjectId) || '';
    return `${task.title} ${task.description || ''} ${subjectName}`
      .toLocaleLowerCase('sl')
      .includes(term);
  });

  return list.sort((a, b) => {
    if (sort === 'createdAt') {
      return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    }
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  });
}

/** The counts the summary row shows, all from the same list. */
export function summarizeTasks(tasks, today, threeDaysFromNow) {
  const pending = tasks.filter((task) => !task.completed);
  const completed = tasks.filter((task) => task.completed);
  const overdue = pending.filter((task) => task.dueDate && task.dueDate < today);
  const dueSoon = pending.filter(
    (task) => task.dueDate && task.dueDate >= today && task.dueDate <= threeDaysFromNow,
  );
  return {
    pending: pending.length,
    completed: completed.length,
    overdue: overdue.length,
    dueSoon: dueSoon.length,
    completion: tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0,
  };
}
