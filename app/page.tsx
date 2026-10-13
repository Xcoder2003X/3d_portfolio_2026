'use client';

import { CertificationScene } from '@/components/3d/CertificationScene';
import { ExperienceScene } from '@/components/3d/ExperienceScene';
import { NavBar } from '@/components/ui/NavBar';
import { useSceneStore } from '@/store/scene-store';

export default function HomePage() {
  const activeScene = useSceneStore((state) => state.activeScene);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),_transparent_40%),linear-gradient(135deg,_#020817_0%,_#0f172a_40%,_#111827_100%)] text-white">
      <NavBar />
      {activeScene === 'experience' ? <ExperienceScene /> : <CertificationScene />}
    </main>
  );
}
