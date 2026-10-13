# Instructions : Scènes Three.js

- **Chargement** : Utiliser `useGLTF` de `@react-three/drei`.
- **Animation Voiture/Fusée** : 
  - Utiliser `useFrame` pour interpoler la position de l'objet (voiture ou fusée) le long d'une courbe (CatmullRomCurve3) ou de points d'arrêt définis (waypoints).
  - Lier le mouvement à un état global dans Zustand (ex: `currentStopIndex`).
- **Événement Start** : Un bouton UI en HTML (superposé via CSS ou `<Html>`) déclenche le démarrage.
- **Transition de Scène** : Lors du clic sur "Certifications" dans la navbar, le composant `<ExperienceScene />` doit être retiré de l'arbre React, et `<CertificationsScene />` doit être monté.
