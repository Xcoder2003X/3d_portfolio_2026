import { create } from 'zustand';

export type ActiveScene = 'experience' | 'certifications';

type SceneStore = {
  activeScene: ActiveScene;
  setActiveScene: (scene: ActiveScene) => void;
};

export const useSceneStore = create<SceneStore>((set) => ({
  activeScene: 'experience',
  setActiveScene: (scene) => set({ activeScene: scene }),
}));
