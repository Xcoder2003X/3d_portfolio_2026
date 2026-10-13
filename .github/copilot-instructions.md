# Instructions Globales pour GitHub Copilot

- Toujours utiliser TypeScript strict et les Functional Components React.
- Pour la 3D, utiliser `react-three-fiber` et `@react-three/drei`.
- **Modèles** : Ne jamais essayer de générer du code pour construire un modèle 3D de zéro. Utiliser `useGLTF` pour charger les assets existants.
- **Mémoire** : Assurer le nettoyage (dispose) des géométries et matériaux lors du démontage des composants.
- Consulter le dossier `docs/` pour l'architecture et le design.
- Selon le contexte, consulter :
  - `.github/instructions/threejs-scene.instructions.md`
  - `.github/instructions/performance.instructions.md`
  - `.github/instructions/accessibility.instructions.md`
