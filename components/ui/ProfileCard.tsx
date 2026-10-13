'use client';

import Image from 'next/image';
import { useState, type ReactNode } from 'react';

/* Icons are inline SVG: no extra dependency, and they inherit the text colour. */
const iconClass = 'h-[18px] w-[18px] sm:h-5 sm:w-5';

const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} aria-hidden="true" {...strokeProps}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} aria-hidden="true" {...strokeProps}>
      <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} aria-hidden="true" {...strokeProps}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} aria-hidden="true" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} aria-hidden="true" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-sky-300 sm:h-[18px] sm:w-[18px]" aria-hidden="true" {...strokeProps}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function IconLink({
  href,
  label,
  hint,
  external = false,
  children,
}: {
  href: string;
  label: string; // read by screen readers
  hint: string; // shown on hover
  external?: boolean;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      title={hint}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-sky-200 transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-300 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:h-11 sm:w-11"
    >
      {children}
    </a>
  );
}

/* Fond de la carte : ton SVG « layered steps » (mêmes tracés et couleurs). */
function LayeredSteps() {
  return (
    <svg
      viewBox="0 0 800 600"
      preserveAspectRatio="xMaxYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <rect width="800" height="600" fill="#140021" />
      <path
        d="M418 600L453 600L453 514L524 514L524 429L535 429L535 343L440 343L440 257L376 257L376 171L543 171L543 86L503 86L503 0L900 0L900 600Z"
        fill="#560090"
      />
      <path
        d="M596 600L644 600L644 514L687 514L687 429L547 429L547 343L642 343L642 257L634 257L634 171L585 171L585 86L663 86L663 0L900 0L900 600Z"
        fill="#9900ff"
      />
      <path
        d="M758 600L703 600L703 514L790 514L790 429L770 429L770 343L784 343L784 257L760 257L760 171L680 171L680 86L795 86L795 0L900 0L900 600Z"
        fill="#560090"
      />
    </svg>
  );
}

export default function ProfileCard({ visible = true }: { visible?: boolean }) {
  const [portraitFailed, setPortraitFailed] = useState(false);

  return (
    <aside
      aria-label="Contact Ayoub Ait Chikh"
      aria-hidden={!visible}
      className={`absolute left-3 top-16 z-20 flex w-[min(30rem,calc(100%-8rem))] origin-center flex-col overflow-hidden rounded-3xl border border-sky-200/20 bg-[#140021] shadow-xl shadow-slate-200/30 transition-[transform,opacity,visibility] duration-500 ease-out motion-reduce:transition-none sm:left-16 sm:top-32 sm:min-h-[20rem] sm:flex-row ${
        visible
          ? 'pointer-events-auto visible opacity-100 sm:[transform:perspective(1000px)_rotateZ(10deg)_scale(1)] sm:hover:[transform:perspective(1000px)_rotateZ(0deg)_scale(1.1)] sm:opacity-90 sm:hover:opacity-100'
          : 'pointer-events-none invisible opacity-0 sm:[transform:perspective(1000px)_rotateZ(10deg)_scale(0.92)]'
      }`}
    >
      <LayeredSteps />

      {/* Photo : pleine hauteur, collée aux bords, bord droit en escalier sur desktop */}
      <div className="relative h-44 w-full shrink-0 bg-slate-800 sm:h-auto sm:w-[42%] sm:[clip-path:polygon(0_0,100%_0,100%_14%,92%_14%,92%_28%,100%_28%,100%_42%,94%_42%,94%_57%,100%_57%,100%_71%,91%_71%,91%_86%,98%_86%,98%_100%,0_100%)]">
        {!portraitFailed ? (
          <Image
            src="/assets/ayoub.png"
            alt="Ayoub Ait Chikh"
            fill
            priority
            sizes="(min-width: 640px) 320px, 100vw"
            className="object-cover"
            onError={() => setPortraitFailed(true)}
          />
        ) : (
          <span className="grid h-full place-items-center text-5xl font-semibold text-sky-100" aria-hidden="true">
            AA
          </span>
        )}
      </div>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-center gap-3 p-5 text-left sm:p-7">
        <div>
          <h2 className="truncate text-xl font-semibold tracking-tight text-white sm:text-2xl">Ayoub Ait Chikh</h2>
          <p className="mt-1 flex items-center gap-2 text-sm leading-tight text-white/90">
            <CodeIcon />
            <span>Full-Stack Software Engineer</span>
          </p>
        </div>

        <p className="line-clamp-4 text-xs leading-5 text-white/90 sm:line-clamp-none sm:text-[13px]">
          I love watching series (I recently watched The Mentalist), and I really enjoy walking long distances as much
          as solving problems and contributing. I&apos;m open to any new challenge: part-time or full-time roles in
          software and AI engineering, freelancing, or a specialized master&apos;s outside Morocco.
        </p>

        <nav aria-label="Contact and social links" className="flex gap-1 sm:gap-2">
          <IconLink href="tel:+212718481048" label="Call Ayoub" hint="0718481048">
            <PhoneIcon />
          </IconLink>
          <IconLink href="mailto:ayoub.aitchikh23@ump.ac.ma" label="Email Ayoub" hint="ayoub.aitchikh23@ump.ac.ma">
            <MailIcon />
          </IconLink>
          <IconLink href="https://www.linkedin.com/in/ayoubaitchikh/?isSelfProfile=true" label="LinkedIn" hint="LinkedIn" external>
            <LinkedInIcon />
          </IconLink>
          <IconLink href="https://github.com/Xcoder2003X/AlarmyApp_release" label="GitHub" hint="GitHub" external>
            <GitHubIcon />
          </IconLink>
          <IconLink href="https://www.instagram.com/" label="Instagram" hint="Instagram" external>
            <InstagramIcon />
          </IconLink>
        </nav>
      </div>
    </aside>
  );
}