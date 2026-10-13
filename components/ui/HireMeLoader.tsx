'use client';

import { useEffect, useState } from 'react';

const TEXT = 'Hire Me Please';

/** Affiche le loader au montage, puis à chaque changement de `key` (ex. onglet actif). */
export function useLoaderOnChange(key: string, ms = 1200) {
  const [loading, setLoading] = useState(true); // true dès le départ = loader au lancement
  useEffect(() => {
    setLoading(true);
    const id = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(id);
  }, [key, ms]);
  return loading;
}

export default function HireMeLoader({ visible }: { visible: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-hidden={!visible}
      className={`fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-[#140021] transition-[opacity,visibility] duration-500 ${
        visible ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'
      }`}
    >
      <style>{`
        @keyframes hmp-rise { from { transform: translateX(60px); opacity: 0 } to { transform: none; opacity: 1 } }
        @keyframes hmp-wave { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-0.18em) } }
        @keyframes hmp-bar  { from { transform: translateX(-100%) } to { transform: translateX(300%) } }
        @media (prefers-reduced-motion: reduce) { .hmp-anim { animation: none !important } }
      `}</style>

      {/* Fond : les mêmes marches que la carte profil */}
      <svg
        viewBox="0 0 800 600"
        preserveAspectRatio="xMaxYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <rect width="800" height="600" fill="#140021" />
        <path
          className="hmp-anim"
          style={{ animation: 'hmp-rise 0.9s ease-out both', animationDelay: '0.1s' }}
          d="M418 600L453 600L453 514L524 514L524 429L535 429L535 343L440 343L440 257L376 257L376 171L543 171L543 86L503 86L503 0L900 0L900 600Z"
          fill="#560090"
        />
        <path
          className="hmp-anim"
          style={{ animation: 'hmp-rise 0.9s ease-out both', animationDelay: '0.25s' }}
          d="M596 600L644 600L644 514L687 514L687 429L547 429L547 343L642 343L642 257L634 257L634 171L585 171L585 86L663 86L663 0L900 0L900 600Z"
          fill="#9900ff"
        />
        <path
          className="hmp-anim"
          style={{ animation: 'hmp-rise 0.9s ease-out both', animationDelay: '0.4s' }}
          d="M758 600L703 600L703 514L790 514L790 429L770 429L770 343L784 343L784 257L760 257L760 171L680 171L680 86L795 86L795 0L900 0L900 600Z"
          fill="#560090"
        />
      </svg>

      <div className="relative flex flex-col items-center gap-6 px-6 text-center">
        <span className="sr-only">Loading, {TEXT}</span>

        <p
          aria-hidden="true"
          className="text-4xl font-semibold tracking-tight text-white drop-shadow-[0_0_24px_rgba(153,0,255,0.55)] sm:text-6xl"
        >
          {TEXT.split('').map((ch, i) => (
            <span
              key={i}
              className="hmp-anim inline-block"
              style={{ animation: 'hmp-wave 1.4s ease-in-out infinite', animationDelay: `${i * 80}ms` }}
            >
              {ch === ' ' ? '\u00A0' : ch}
            </span>
          ))}
        </p>

        <div className="h-1 w-44 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
          <div
            className="hmp-anim h-full w-1/3 rounded-full bg-sky-300"
            style={{ animation: 'hmp-bar 1.2s ease-in-out infinite' }}
          />
        </div>
      </div>
    </div>
  );
}