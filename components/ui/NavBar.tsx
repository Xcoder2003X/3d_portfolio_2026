'use client';

import type { ReactNode } from 'react';
import { useSceneStore, type ActiveScene } from '@/store/scene-store';

// Put your CV in /public/assets/ : it is then served at /assets/<file name>.
const RESUME_URL = '/assets/Ayoub_Ait_Chikh_CV.pdf';
const RESUME_FILENAME = 'Ayoub_Ait_Chikh_CV.pdf'; // name of the file on the visitor's computer

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  className: 'h-4 w-4 shrink-0',
} as const;

function BriefcaseIcon() {
  return (
    <svg {...iconProps}>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function AwardIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg {...iconProps} className="h-4 w-4 shrink-0 transition-transform group-hover:translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

const tabs: { key: ActiveScene; label: string; icon: ReactNode }[] = [
  { key: 'experience', label: 'Experience', icon: <BriefcaseIcon /> },
  { key: 'certifications', label: 'Certifications', icon: <AwardIcon /> },
];

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200';

export function NavBar() {
  const { activeScene, setActiveScene } = useSceneStore();
  const activeIndex = tabs.findIndex((tab) => tab.key === activeScene);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-4 sm:px-4 sm:pt-5">
      <nav
        aria-label="Primary navigation"
        className="flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/70 p-1.5 shadow-glow backdrop-blur-md sm:gap-2 sm:p-2"
      >
        {/* Scene switcher: a single highlight slides behind the active tab */}
        <div className="relative grid" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
          <span
            aria-hidden="true"
            className={`absolute inset-y-0 left-0 rounded-full bg-sky-400 shadow-lg shadow-sky-500/30 transition-transform duration-300 ease-out motion-reduce:transition-none ${
              activeIndex === -1 ? 'opacity-0' : ''
            }`}
            style={{ width: `${100 / tabs.length}%`, transform: `translateX(${Math.max(activeIndex, 0) * 100}%)` }}
          />

          {tabs.map((tab) => {
            const isActive = activeScene === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveScene(tab.key)}
                className={[
                  'relative z-10 flex items-center justify-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200 motion-reduce:transition-none sm:px-5',
                  focusRing,
                  isActive ? 'text-slate-950' : 'text-slate-200 hover:text-white',
                ].join(' ')}
              >
                <span className="hidden sm:block">{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>

        <span aria-hidden="true" className="mx-0.5 h-6 w-px bg-white/10" />

        {/* Resume download */}
        <a
          href={RESUME_URL}
          download={RESUME_FILENAME}
          aria-label="Download CV as a PDF"
          title="Download CV (PDF)"
          className={`group flex h-9 items-center justify-center gap-2 rounded-full border border-sky-300/30 px-2.5 text-sm font-medium text-sky-200 transition-colors hover:border-sky-300 hover:bg-sky-300 hover:text-slate-950 motion-reduce:transition-none sm:h-10 sm:px-4 ${focusRing}`}
        >
          <DownloadIcon />
          <span className="hidden sm:inline">CV</span>
        </a>
      </nav>
    </header>
  );
}