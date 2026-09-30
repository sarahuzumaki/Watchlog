# Watchlog

Un site pour suivre les séries et les anime que je regarde, et savoir où j'en suis.

👉 **[Voir le site](https://sarahuzumaki.github.io/Watchlog/)**

## Fonctionnalités

- Deux listes séparées : **Séries** et **Anime**
- Trois onglets : **En cours**, **Pas commencé**, **Terminé**
- Progression par saison et épisode, avec une barre de progression
- Recherche en direct avec affiches et nombre d'épisodes récupérés automatiquement :
  [TMDB](https://www.themoviedb.org/) pour les séries, [AniList](https://anilist.co/) pour les anime
- Liste publique en lecture ; ajout et modification réservés à mon compte
- Thème sombre par défaut, thème clair au choix
- Utilisable sur téléphone

## Technique

- **React + Vite**
- **Supabase** : base de données PostgreSQL et connexion
  - Lecture publique, écriture réservée à mon compte grâce aux règles
    _Row Level Security_ (voir [`supabase/schema.sql`](supabase/schema.sql))
  - Inscriptions désactivées
  - La clé TMDB est stockée dans une table lisible uniquement par mon compte :
    elle n'apparaît jamais dans le code publié
- **GitHub Actions** : construction et mise en ligne automatiques sur **GitHub Pages**

## Lancer le projet en local

1. `npm install`
2. Copier `.env.example` en `.env` et y mettre l'URL et la clé publique (Publishable key) du projet Supabase
3. Créer les tables avec [`supabase/schema.sql`](supabase/schema.sql) dans l'éditeur SQL de Supabase
4. `npm run dev`
