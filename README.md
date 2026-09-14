# Solazura — page d'accueil

Page d'accueil du site vitrine Solazura (électricien résidentiel, Le Rouret & arrière-pays niçois).

## Structure

```
index.html                  Page d'accueil
pages/mentions-legales.html Mentions légales
src/input.css               Source Tailwind (polices, tokens, composants)
assets/css/output.css       CSS compilé (généré, ne pas éditer à la main)
assets/js/main.js           Menu mobile, dropdown Services, FAQ, tel:, consentement RGPD
assets/fonts/                Fraunces & Public Sans auto-hébergées (woff2)
robots.txt, sitemap.xml
```

## Développement

```bash
npm install
npm run watch:css   # recompile assets/css/output.css à chaque modification
```

Avant mise en production : `npm run build:css` (minifié).

Aucune dépendance CDN (Tailwind compilé, polices auto-hébergées) — le site fonctionne en HTML/CSS/JS statique, sans framework ni backend.

## Système de design

Tokens définis dans `tailwind.config.js` : couleurs (`bone`, `ink`, `line`, `accent`), polices (`Fraunces` en titres, `Public Sans` en corps). Un seul accent (bleu ardoise `#1F3A5C`), pas de dégradés ni d'ombres décoratives.

## Ce qui reste à brancher (placeholders volontaires, rien n'a été inventé)

Cherchez `[PLACEHOLDER` dans `index.html` :

- Note Google, nombre d'avis, 3 avis réels, URL de la fiche Google Business
- Nombre d'interventions réalisées
- Certifications (Qualifelec IRVE, habilitations)
- Photo du tableau électrique (hero) et photo de Victor devant le camion floqué
- Liens réseaux sociaux
- Nom de domaine définitif (à reporter dans `canonical`, `og:url`, `og:image`, `sitemap.xml`, `robots.txt`, JSON-LD)
- Outil de réservation en ligne (actuellement, tous les CTA « Réserver » pointent vers le formulaire de contact en bas de page — le formulaire n'a pas encore de traitement d'envoi côté serveur)
- Offre ponctuelle en cours (bloc promo)
- Hébergeur du site (mentions légales)

## Notes techniques

- Le tag Google Ads (`AW-18027130698`) n'est chargé qu'après acceptation du bandeau de consentement RGPD.
- Les liens `tel:` ne sont jamais bloqués par le suivi de conversion (fire-and-forget).
- Le panneau du menu mobile est un frère du `<header>`, pas un enfant : le `backdrop-blur` du header crée un containing block CSS qui casserait un `position: fixed` placé à l'intérieur.
