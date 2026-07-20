# CRM AVI SEO — synchronisé avec Google Sheets

CRM commercial (Next.js 14 + TypeScript + Tailwind) pour la prospection AVI SEO :
pipeline dédié, fiche prospect complète, WhatsApp, Ringover, Calendly, analyse IA
post-appel, et mode "Commencer la prospection".

## Fonctionnalités

- Vue tableau + vue Kanban (glisser-déposer entre les 10 statuts du pipeline)
- Fiche prospect complète (profession, avis Google, Doctolib, site internet, campagne...)
- Recherche instantanée + filtre par statut
- Boutons Appeler (Ringover), WhatsApp, Calendly, Email directement sur chaque fiche
- Historique des notes et de la conversation WhatsApp
- Analyse IA post-appel : résumé, objections, niveau d'intérêt, probabilité de
  signature, date idéale de relance, suggestion de message WhatsApp/email
- Mode **"Commencer la prospection"** : affiche automatiquement le prochain
  prospect à contacter, avec passage automatique à l'étape suivante du pipeline
- Tableau de bord (nouveaux leads, à contacter, WhatsApp envoyés, appels à
  effectuer, relances du jour, RDV, installations en attente, clients actifs,
  chiffre d'affaires, taux de transformation)
- Statistiques par commercial
- Synchronisation bidirectionnelle avec Google Sheets (polling ~20s en lecture,
  écriture immédiate à chaque action)

## Pipeline

Nouveau lead → WhatsApp envoyé → 1er appel → 2e appel → RDV programmé →
Démonstration → Contrat signé → Installation → Client actif → Perdu

## 1. Ton Google Sheet (déjà en ligne — rien à changer dessus)

Bonne nouvelle : le code retrouve chaque colonne **par son nom d'en-tête**, pas
par sa position. Peu importe l'ordre de tes colonnes actuelles ou si ton Sheet
a des colonnes en plus (id, created_time, etc.) — tant que les noms
correspondent, tout fonctionne.

**Tu n'as qu'une seule chose à faire :** ajoute ces 27 noms d'en-tête **n'importe
où sur la ligne 1**, dans des colonnes vides (peu importe lesquelles — juste à
la suite de tes colonnes actuelles, par exemple) :

```
statut	commercial	ville	profession	siteInternet	googleBusinessUrl	dateEntree	dateDernierContact	dateProchaineRelance	whatsappHistorique	dateDernierWhatsapp	ringoverDureeDernierAppel	ringoverEnregistrementUrl	ringoverTranscription	iaResume	iaObjections	iaNiveauInteret	iaProbabiliteSignature	iaDateIdealeRelance	iaSuggestionWhatsapp	iaSuggestionEmail	installationQrCode	installationQuestionnaire	installationLogoUrl	installationDate	installationStatut	chiffreAffaires
```

**Comment le coller sans erreur :**
1. Clique sur la première cellule **complètement vide** que tu vois sur la
   ligne 1 (fais défiler vers la droite jusqu'à trouver une colonne blanche,
   sans aucun titre).
2. Colle le bloc ci-dessus (Cmd+V / Ctrl+V) directement dans cette cellule.

Si jamais le collage tombe sur une colonne qui contient déjà un titre, annule
(Cmd+Z) et réessaie une colonne plus à droite — il n'y a aucun risque de casser
tes données existantes tant que tu colles sur une zone vide.

Le champ **statut** doit ensuite être rempli avec l'une des 10 valeurs du
pipeline ci-dessus ; tant qu'il est vide, le prospect apparaît comme "Nouveau
lead" dans le CRM.

## 2. Compte de service Google (obligatoire)

1. [Google Cloud Console](https://console.cloud.google.com/) → créer un projet.
2. Activer l'API **Google Sheets API**.
3. Créer un **compte de service** → générer une clé JSON.
4. Partager le Google Sheet avec l'email du compte de service, en droits **Éditeur**.

## 3. Analyse IA (Anthropic) — recommandé, se fait en 5 minutes

1. Va sur [console.anthropic.com](https://console.anthropic.com), crée un compte.
2. Section **API Keys** → **Create Key**.
3. Colle la clé dans `ANTHROPIC_API_KEY`.

C'est de loin l'intégration la plus rapide à mettre en place (pas de
vérification d'entreprise, pas d'attente).

## 4. WhatsApp — fonctionne tout de suite, l'API est optionnelle

**Sans rien configurer**, le bouton WhatsApp de chaque fiche ouvre directement
une conversation `wa.me` pré-remplie — ça fonctionne immédiatement, sans compte
développeur.

Pour l'envoi automatisé de templates et l'historique synchronisé (optionnel) :
1. [developers.facebook.com](https://developers.facebook.com) (⚠️ pas
   `developers.meta.com`, qui est réservé aux apps VR/Quest) → connexion avec
   le compte Facebook de l'entreprise.
2. **Créer une application** → si le choix "Business" n'apparaît pas
   directement, choisir **Other** → **Next** → **Business**.
3. Ajouter le produit **WhatsApp** à l'app.
4. Récupérer `Access Token` et `Phone Number ID` (menu WhatsApp > API Setup).
5. Créer des **templates de message** (obligatoire pour le premier contact,
   validation Meta sous 24-48h).
6. Renseigner `WHATSAPP_ACCESS_TOKEN` et `WHATSAPP_PHONE_NUMBER_ID`.

## 5. Ringover — fonctionne tout de suite, l'API est optionnelle

**Sans rien configurer**, le bouton Appeler ouvre l'app téléphone standard du
commercial (`tel:`) — ça fonctionne immédiatement.

Pour le click-to-call natif, la durée, l'enregistrement et la transcription
automatique (optionnel) :
1. Compte sur [ringover.com](https://www.ringover.com).
2. Paramètres → API → générer une clé, la mettre dans `RINGOVER_API_KEY`.
3. Paramètres → Webhooks → ajouter un webhook "fin d'appel" pointant vers :
   `https://TON-DOMAINE.vercel.app/api/ringover/webhook`
4. Activer l'option transcription (selon le forfait).

Quand un appel se termine et qu'une transcription est reçue, l'analyse IA se
déclenche **automatiquement** si `ANTHROPIC_API_KEY` est configurée.

## 6. Calendly — fonctionne tout de suite, le webhook est optionnel

**Sans rien configurer**, mets ton lien de réservation dans
`NEXT_PUBLIC_CALENDLY_URL` — le bouton Calendly de chaque fiche l'ouvrira,
pré-rempli avec le nom et l'email du prospect.

Pour le passage automatique du statut à "RDV programmé" dès la réservation
(optionnel, nécessite un compte payant Calendly) :
1. Calendly → Paramètres → Intégrations → API & Webhooks → générer un
   **Personal Access Token**.
2. Créer un webhook sur l'événement `invitee.created` pointant vers :
   `https://TON-DOMAINE.vercel.app/api/calendly/webhook`

## 7. Configurer et lancer le projet

```bash
npm install
cp .env.example .env.local
```

Remplis `.env.local` avec au minimum `GOOGLE_SHEET_ID`, `GOOGLE_SHEET_NAME`,
`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` (voir étape 2), et
idéalement `ANTHROPIC_API_KEY` (étape 3). Le reste (WhatsApp/Ringover/Calendly
API) est optionnel — sans elles, les boutons fonctionnent déjà en mode "lien
direct".

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## 8. Déployer sur Vercel

1. Pousse le projet sur GitHub.
2. Importe-le dans [Vercel](https://vercel.com/new).
3. Ajoute toutes les variables de `.env.local` dans Settings → Environment
   Variables (pour `GOOGLE_PRIVATE_KEY`, garde les `\n` littéraux).
4. Déploie.

## 9. Utilisation depuis le téléphone (mode application)

L'app est responsive et installable comme une PWA. Une fois déployée :

**iPhone (Safari)** : icône de partage → "Sur l'écran d'accueil".
**Android (Chrome)** : menu ⋮ → "Ajouter à l'écran d'accueil" / "Installer l'application".

Le manifest et les icônes sont déjà inclus (`public/manifest.json`).

> Le CRM nécessite une connexion internet (comme tout site synchronisé), il
> n'y a pas de mode hors-ligne.

## Migration future vers Supabase

Toute la logique d'accès aux données passe par `lib/googleSheets.ts` (5
fonctions). Pour migrer, réécris ces mêmes fonctions dans `lib/supabase.ts`
avec le client Supabase, puis change les imports dans `app/api/prospects/**`,
`app/api/ringover/webhook`, et `app/api/calendly/webhook`. Aucune autre partie
du code n'a besoin de changer.

## Notes sur les intégrations optionnelles

- **WhatsApp / Ringover / Calendly fonctionnent dès aujourd'hui** en mode
  "lien direct" (wa.me, tel:, lien de réservation Calendly) — aucune de ces
  trois API n'est un prérequis pour utiliser le CRM.
- Les API complètes (historique auto, click-to-call natif, statut auto à la
  réservation) sont des améliorations à ajouter quand tu as le temps ; le
  code est déjà prêt, il ne manque que les clés dans `.env.local`.
- L'IA (résumé, objections, suggestions) est la plus simple à activer : une
  seule clé API Anthropic suffit, pas de vérification d'entreprise.
