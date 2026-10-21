import { useTasks } from '../hooks/useFirestore';
import { getSlovenianDateKey } from '../utils/dates';
import { countedNoun } from '../utils/slovenian';

/**
 * The count of open tasks for today. It is a separate module so the top bar
 * does not pull the database SDK into the first paint of the public page.
 */
export default function TodayCount() {
  const { tasks } = useTasks();
  const today = getSlovenianDateKey();
  const open = tasks.filter((task) => !task.completed && task.dueDate === today).length;
  if (open === 0) return null;
  return (
    <span className="chip chip-accent whitespace-nowrap">
      <span className="h-1.5 w-1.5 rounded-full bg-rp-accent" aria-hidden="true" />
      <span className="hidden sm:inline">
        {countedNoun(open, 'naloga danes', 'nalogi danes', 'naloge danes', 'nalog danes')}
      </span>
      <span className="sm:hidden">{countedNoun(open, 'danes', 'dani', 'dani', 'dani')}</span>
    </span>
  );
}
