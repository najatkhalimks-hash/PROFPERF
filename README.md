# GSMI RMIS — Research Management Information System

Application de gestion de la recherche pour le Geology and Sustainable Mining
Institute (GSMI) / UM6P.

## Principes
- **Saisie unique** : chaque publication, projet ou activité n'est saisie qu'une fois.
- **Réalisations automatiques** : jamais de ressaisie manuelle des résultats — tout
  est calculé depuis les données détaillées (publications, formation, prestations,
  rayonnement, encadrement).
- **DOI = identifiant unique** : dédoublonnage automatique des publications.
- **Fractional Counting** : contribution = 1 / nombre total d'auteurs.
- **4 niveaux d'accès** : Chercheur, Responsable d'Axe, Direction GSMI, Présidence UM6P.

## Démarrage local
```bash
npm install
npm run dev
```

## Build production
```bash
npm run build
```

## Déploiement Vercel
Le fichier `vercel.json` est déjà configuré avec `rootDirectory: gsmi-v2`.
Pousser ce dossier à la racine du repo GitHub, ou ajuster `rootDirectory` selon
votre structure de repo.

## Configuration
Copier `.env.example` en `.env` et définir `VITE_ADMIN_CODE` (code d'accès
Responsable d'Axe / Direction / Présidence).

## Périmètre couvert (réaliste pour une architecture localStorage)
- Base de données relationnelle simulée (chercheurs, affiliés, publications,
  projets, encadrements, prestations, rayonnement, prévisions, révisions, audit log)
- Moteur de KPI : réalisations calculées, taux d'atteinte, score /100
- CV académique automatique (PDF via impression navigateur, FR/EN, complet/court)
- Rapports Excel (individuel, par axe, institutionnel)
- Dashboards par rôle avec code couleur vert/orange/rouge

## Hors périmètre (nécessite un vrai backend serveur)
Authentification réelle multi-utilisateurs, génération PowerPoint automatique,
intégrations Power BI / ORCID / Scopus / SciVal, alertes par email serveur,
support de 10 000+ enregistrements concurrents, reprise après incident.
