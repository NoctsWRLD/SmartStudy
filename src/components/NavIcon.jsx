import {
  BookIcon,
  CalendarIcon,
  CardIcon,
  ChatIcon,
  ExamIcon,
  GearIcon,
  HomeIcon,
  TaskIcon,
  UserIcon,
  UsersIcon,
} from './icons';

const ICONS = {
  home: HomeIcon,
  task: TaskIcon,
  exam: ExamIcon,
  card: CardIcon,
  calendar: CalendarIcon,
  book: BookIcon,
  chat: ChatIcon,
  users: UsersIcon,
  user: UserIcon,
  gear: GearIcon,
};

export default function NavIcon({ name, className = 'h-4.5 w-4.5' }) {
  const Icon = ICONS[name] || TaskIcon;
  return <Icon className={className} />;
}
