# Contexte Global du Projet (Portfolio 3D)

Ce projet est un portfolio interactif en 3D pour Ayoub Ait Chikh, Ingénieur Logiciel Full-Stack.
L'application utilise une stack moderne : Next.js (App Router), React, Three.js, React Three Fiber (R3F), Drei, Zustand et Tailwind CSS.

## Règles Générales pour l'IA (Copilot/Claude)
1. **Modèles 3D** : L'IA ne génère pas les modèles 3D. Les modèles (`.glb`) sont déjà fournis dans le dossier `public/assets/`.
2. **Optimisation** : Prioriser la compression Draco pour réduire la taille des assets 3D.
3. **Architecture à 2 états** :
   - L'application ne charge pas tout en même temps.
   - **Partie 1 (Expériences)** : Route avec une voiture.
   - **Partie 2 (Certifications)** : Espace avec une fusée.
   - Lors de la navigation (via la barre de navigation), la scène active doit être **totalement détruite (unmounted)** pour libérer la mémoire avant de charger la nouvelle.
