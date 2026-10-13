# Plan d'action (Tasks)

- [ ] **Phase 1 : Setup & UI**
  - Initialiser Next.js + Tailwind.
  - Créer la NavBar et le layout principal.
  - Configurer Zustand pour gérer `activeScene` ('experience' | 'certifications').

- [ ] **Phase 2 : Scène 1 (Route)**
  - Importer les modèles de route et de voiture (Draco compressed).
  - Créer le bouton "Start".
  - Implémenter le déplacement le long des waypoints.
  - Afficher les popups HTML (`<Html>` de drei) pour chaque expérience.

- [ ] **Phase 3 : Scène 2 (Espace)**
  - Importer les modèles espace, planètes et fusée.
  - Implémenter le vol vertical.
  - Afficher les infos des certifications.

- [ ] **Phase 4 : Optimisation (Performance)**
  - S'assurer que le basculement depuis la NavBar détruit complètement la scène précédente pour éviter les fuites de mémoire (memory leaks).
  - Vérifier la compression des textures.
