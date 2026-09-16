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

## Ce qui reste à brancher (rien n'a été inventé)

- **Formspree du formulaire de réservation** (`assets/js/reservation.js`, constante `FORMSPREE_ENDPOINT`) : aucun endpoint n'existe encore pour `pages/reserver.html`, le formulaire ne peut donc pas être envoyé tant qu'un vrai endpoint Formspree n'est pas collé à la place de la valeur actuelle. Le formulaire de contact d'`index.html` a lui déjà un endpoint fonctionnel.
- **Hébergeur du site** (`pages/mentions-legales.html`, section « Hébergement ») : mention légalement obligatoire, actuellement vide — nom, adresse et contact de l'hébergeur à renseigner une fois le site mis en ligne.
- **Politique de confidentialité complète** (`pages/mentions-legales.html`, section « Cookies & données personnelles ») : durée de conservation des données, droits d'accès et de suppression RGPD à détailler.
- **Certifications** (Qualifelec IRVE, habilitations) : à afficher uniquement une fois réellement obtenues et vérifiables — ne pas réintroduire de mention non vérifiée.
- **Nombre d'interventions réalisées** : donnée chiffrée à ajouter si utile, une fois disponible.

## Notes techniques

- Le tag Google Ads (`AW-18027130698`) n'est chargé qu'après acceptation du bandeau de consentement RGPD.
- Les liens `tel:` ne sont jamais bloqués par le suivi de conversion (fire-and-forget).
- Le panneau du menu mobile est un frère du `<header>`, pas un enfant : le `backdrop-blur` du header crée un containing block CSS qui casserait un `position: fixed` placé à l'intérieur.
