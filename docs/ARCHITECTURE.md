# Architecture du Projet

## Stack Technique
- **Framework** : Next.js 14+ (App Router)
- **3D** : Three.js, React Three Fiber (R3F), `@react-three/drei`
- **State Management** : Zustand
- **Styling** : Tailwind CSS

## Structure des Dossiers
- `/app` : Pages Next.js, Navbar globale.
- `/components/3d` : Composants R3F (Voiture, Route, Fusée, Planètes).
- `/components/ui` : Boutons, overlays HTML, textes des expériences.
- `/store` : Store Zustand pour gérer l'état (scène active, arrêt courant).
- `/public/assets` : Fichiers `.glb` compressés (Draco).

## Logique de Rendu
1. L'utilisateur arrive sur `/`.
2. La navbar est rendue en HTML.
3. Le composant `Canvas` charge `<ExperienceScene />`.
4. Si l'utilisateur clique sur "Certifications", l'état change, le composant `Canvas` est vidé de `<ExperienceScene />` et charge `<CertificationsScene />`.
