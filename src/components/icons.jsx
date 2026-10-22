function base(className = 'h-4 w-4', strokeWidth = 1.8) {
  return {
    className,
    fill: 'none',
    viewBox: '0 0 24 24',
    stroke: 'currentColor',
    strokeWidth,
    'aria-hidden': true,
  };
}

export function GearIcon({ className }) {
  return (
    <svg {...base(className)}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.869a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.438-.613.431-.992a6.932 6.932 0 010-.255c-.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.298-2.247a1.125 1.125 0 011.369-.491l1.217.456c.356.133.75.072 1.076-.124.074-.044.146-.087.22-.128.331-.183.581-.495.644-.869l.213-1.28c.09-.542.56-.94 1.11-.94Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export function SunIcon({ className }) {
  return (
    <svg {...base(className)}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
      />
    </svg>
  );
}

export function MoonIcon({ className }) {
  return (
    <svg {...base(className)}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0012 21.75a9.753 9.753 0 009.752-6.748z"
      />
    </svg>
  );
}

export function XIcon({ className }) {
  return (
    <svg {...base(className, 2)}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function PlusIcon({ className }) {
  return (
    <svg {...base(className, 2)}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

export function CheckIcon({ className }) {
  return (
    <svg {...base(className, 2.2)}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

export function CopyIcon({ className }) {
  return (
    <svg {...base(className, 2)}>
      <rect x="9" y="9" width="11" height="11" rx="2.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 5.5A2.5 2.5 0 0012.5 3h-6A3.5 3.5 0 003 6.5v6A2.5 2.5 0 005.5 15" />
    </svg>
  );
}

export function SparkIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className || 'h-4 w-4'} aria-hidden="true">
      <path d="M12 2l2.1 6.5L21 11l-6.9 2.5L12 20l-2.1-6.5L3 11l6.9-2.5z" />
    </svg>
  );
}

export function ChevronDownIcon({ className }) {
  return (
    <svg {...base(className, 2.2)}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export function ChevronLeftIcon({ className }) {
  return (
    <svg {...base(className, 2.2)}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

export function ChevronRightIcon({ className }) {
  return (
    <svg {...base(className, 2.2)}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function MenuIcon({ className }) {
  return (
    <svg {...base(className, 2)}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function SearchIcon({ className }) {
  return (
    <svg {...base(className, 2)}>
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m16 16 4 4" />
    </svg>
  );
}

export function TrashIcon({ className }) {
  return (
    <svg {...base(className, 2)}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

export function EditIcon({ className }) {
  return (
    <svg {...base(className, 2)}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );
}

export function HomeIcon({ className }) {
  return (
    <svg {...base(className)}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z"
      />
    </svg>
  );
}

export function TaskIcon({ className }) {
  return (
    <svg {...base(className)}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"
      />
    </svg>
  );
}

export function ExamIcon({ className }) {
  return (
    <svg {...base(className)}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 3v3M16 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1ZM9.5 14l2 2 3.5-4"
      />
    </svg>
  );
}

export function CardIcon({ className }) {
  return (
    <svg {...base(className)}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 10h4M7 14h7" />
    </svg>
  );
}

export function CalendarIcon({ className }) {
  return (
    <svg {...base(className)}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  );
}

export function BookIcon({ className }) {
  return (
    <svg {...base(className)}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15ZM4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5A2.5 2.5 0 0 1 4 20.5Z"
      />
    </svg>
  );
}

export function ChatIcon({ className }) {
  return (
    <svg {...base(className)}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 12a7 7 0 0 1-7 7H8l-4 3v-4.6A7 7 0 0 1 11 5h2a7 7 0 0 1 7 7Z"
      />
    </svg>
  );
}

export function UsersIcon({ className }) {
  return (
    <svg {...base(className)}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20M9.5 10.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM21 20v-1.5a4 4 0 0 0-3-3.87M16 3.63a4 4 0 0 1 0 7.75"
      />
    </svg>
  );
}

export function UserIcon({ className }) {
  return (
    <svg {...base(className)}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
    </svg>
  );
}

export function ClockIcon({ className }) {
  return (
    <svg {...base(className)}>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
    </svg>
  );
}

export function ImageIcon({ className }) {
  return (
    <svg {...base(className)}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16l4.5-4.5 3.5 3.5 2.5-2.5L20 17M4 20h16M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
      />
      <circle cx="9" cy="9" r="1.5" />
    </svg>
  );
}

export function LogOutIcon({ className }) {
  return (
    <svg {...base(className, 2)}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1"
      />
    </svg>
  );
}
