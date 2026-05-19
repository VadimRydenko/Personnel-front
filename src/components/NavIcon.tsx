type NavIconProps = {
  name: string
}

export function NavIcon({ name }: NavIconProps) {
  const common = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75 }

  switch (name) {
    case 'home':
      return (
        <svg {...common} aria-hidden>
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" strokeLinejoin="round" />
        </svg>
      )
    case 'staffing':
      return (
        <svg {...common} aria-hidden>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M8 9h8M8 12h8M8 15h5" strokeLinecap="round" />
        </svg>
      )
    case 'personnel':
      return (
        <svg {...common} aria-hidden>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" strokeLinecap="round" />
        </svg>
      )
    case 'vacancies':
      return (
        <svg {...common} aria-hidden>
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" />
          <rect x="6" y="7" width="12" height="13" rx="2" />
          <path d="M10 12h4M10 15h4" strokeLinecap="round" />
        </svg>
      )
    case 'documents':
      return (
        <svg {...common} aria-hidden>
          <path d="M8 4h8l2 2v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
          <path d="M14 4v4h4M9 12h6M9 15h6" strokeLinecap="round" />
        </svg>
      )
    case 'analytics':
      return (
        <svg {...common} aria-hidden>
          <path d="M5 19V9M12 19V5M19 19v-7" strokeLinecap="round" />
        </svg>
      )
    case 'notifications':
      return (
        <svg {...common} aria-hidden>
          <path d="M12 4a5 5 0 0 0-5 5v3l-1.5 3H18.5L17 12V9a5 5 0 0 0-5-5Z" strokeLinejoin="round" />
          <path d="M10 18a2 2 0 0 0 4 0" strokeLinecap="round" />
        </svg>
      )
    case 'directories':
      return (
        <svg {...common} aria-hidden>
          <path d="M4 7h6l2 2h8v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7Z" strokeLinejoin="round" />
        </svg>
      )
    default:
      return (
        <svg {...common} aria-hidden>
          <circle cx="12" cy="12" r="8" />
        </svg>
      )
  }
}
