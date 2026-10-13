# Instructions : Performance & Optimisation

- **Compression des Modèles** : Ne pas utiliser de fichiers `.zip` au runtime. Les modèles doivent être pré-compressés au format `.glb` en utilisant **Draco** ou **Meshopt**.
- Au chargement, utiliser le Draco loader avec `useGLTF`:
  ```javascript
  useGLTF('model.glb', '/draco-gltf/')
  ```
- **Gestion de la Mémoire (Crucial)** :
  - L'application switchant entre deux grosses scènes, il faut impérativement que React démonte (unmount) la première scène.
  - Three.js garde parfois les géométries en mémoire. S'assurer d'utiliser les bonnes pratiques R3F où le démontage du composant libère la mémoire.
- **Suspense** : Utiliser `<Suspense>` avec un loader UI stylisé pendant le chargement des scènes 3D.
