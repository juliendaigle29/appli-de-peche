# Carnet de pêche Québec — projet Android (Capacitor)

Vraie application Android de l'appli de pêche de Julien, prête à compiler.
L'application web (carte des plans d'eau du Québec, boîte à leurres, prises,
mode sortie, statistiques, guide d'identification hors ligne) est embarquée
dans l'appli : elle fonctionne **hors ligne** et les données restent
sauvegardées **sur le téléphone**.

- **Nom de l'appli :** Carnet de pêche Québec
- **ID d'application :** `com.julien.applidepeche`
- **Version de l'appli web :** 10 (25 novembre 2026) — voir « Mise à jour v10 » plus bas
- **Version Android :** 1.0 (versionCode 1)
- **Icône :** coffre à pêche vert (déjà générée dans toutes les tailles)
- **Permissions demandées au premier lancement :** appareil photo, images,
  localisation (précise et approximative)

## Contenu du projet

| Dossier / fichier | Rôle |
|---|---|
| `www/` | Le code web de l'appli, version 10 (`index.html` + dossier `assets/` : `guides.js`, `sw.js` cache `peche-v10`, `manifest.webmanifest`, icônes, `fonts/`, `vendor/leaflet/`, `assets/knots/` avec les schémas des nœuds, `version.json`) |
| `android/` | Le projet Android natif (à ouvrir dans Android Studio) |
| `capacitor.config.json` | Nom, ID et dossier web de l'appli |
| `android/app/src/main/assets/public/` | Copie synchronisée de `www/` dans l'appli Android |

## Mise à jour v10 (version actuelle)

- **Vrais schémas de corde** (dessinés, pas des photos) pour 5 nœuds courants : clinch amélioré, Uni, Trilene, Albright et nail knot. Fil principal en bleu, bout libre en orange, flèches et légendes. Les autres nœuds gardent leurs étapes écrites : un schéma faux serait pire que pas de schéma.
- **Bouton vidéo** sur chaque nœud (recherche YouTube, internet requis). Les anciennes images du v9 ont été retirées.

## Mise à jour v9

- **Schémas de corde pour les nœuds** : les 96 étapes des 21 nœuds sont
  illustrées par un schéma de corde (ce ne sont pas de vraies photos),
  une par étape, dans `www/assets/knots/` — intégrées à l'appli, donc
  consultables hors ligne. Elles remplacent les anciens schémas dessinés.
- **Onglet Guides dans la barre du bas** : les Guides (Nœuds de pêche,
  Manger le poisson, Permis de bateau) ont leur propre onglet « Guides »
  dans la barre de navigation du bas, avec Accueil, Carte, Prises, Leurres
  et Stats. La section Guides ne se trouve plus sur la page d'accueil.
- **Cache `peche-v10`** : le service worker passe en version `peche-v10`
  (réseau d'abord) et `version.json` affiche la version 9, pour que le
  téléphone charge bien les nouvelles images au lieu de l'ancienne copie.
- **Compilation : comme avant** — rien ne change de ce côté. Soit avec
  GitHub Actions (voir `COMPILER-SANS-ANDROID-STUDIO.md` et
  `.github/workflows/build-apk.yml`, le plus simple), soit en ouvrant le
  dossier `android/` dans Android Studio (voir la section ci-dessous).

- **Vidéo** : chaque nœud a un bouton « Regarder une vidéo » qui ouvre une recherche YouTube (internet requis).

## Compiler l'APK (sur un ordinateur avec Android Studio)

> **Avant d'ouvrir `android/` dans Android Studio** (une seule fois, avec Node.js 22) :
> `npm install` puis `npx cap sync android`. Cela télécharge Capacitor et ses plugins
> (Sauvegarde/Partage, Notifications) et les branche dans le projet Android.
> La compilation GitHub (`.github/workflows/build-apk.yml`) le fait toute seule.

> Le projet a été préparé dans un environnement où la compilation Gradle est
> bloquée par une règle réseau (voir `BUILD-NOTES.md`). Sur un ordinateur
> normal, la compilation fonctionne.

1. **Installer Android Studio** (gratuit) : https://developer.android.com/studio
   - À la première ouverture, laisser Android Studio télécharger le SDK Android
     et le JDK (tout est automatique).
2. **Ouvrir le projet** : dans Android Studio, `File > Open`, choisir le
   dossier `android/` de ce projet.
3. **Attendre la synchronisation Gradle** (premier lancement : quelques minutes,
   Android Studio télécharge les dépendances).
4. **Compiler l'APK** : menu `Build > Build App Bundle(s) / APK(s) > Build APK(s)`.
5. **Récupérer l'APK** : quand la compilation est terminée, cliquer sur
   `locate` dans la notification. Le fichier est :
   `android/app/build/outputs/apk/debug/app-debug.apk`
   (on peut le renommer `Appli-de-peche.apk`).

### En ligne de commande (alternative, sans Android Studio)

```bash
# Prérequis : JDK 21 et Android SDK (API 36 + build-tools 36.0.0)
export JAVA_HOME=<chemin vers JDK 21>
export ANDROID_HOME=<chemin vers le SDK Android>
cd android
./gradlew assembleDebug
# APK : app/build/outputs/apk/debug/app-debug.apk
```

## Installer l'APK sur le Samsung Galaxy S24+

1. **Envoyer l'APK sur le téléphone** (par courriel, Drive, câble USB…).
2. Sur le téléphone, **autoriser l'installation d'applis inconnues** :
   `Paramètres > Sécurité et confidentialité > Installer des applis inconnues`,
   puis activer pour l'appli utilisée pour ouvrir le fichier
   (Chrome, Mes fichiers, Gmail…).
3. **Ouvrir le fichier APK** et toucher `Installer`.
4. L'icône **coffre à pêche** « Carnet de pêche Québec » apparaît sur l'écran d'accueil.

## Après l'installation

- Au premier lancement, l'appli demande l'accès à la **caméra** et à la
  **localisation** : accepter pour prendre des photos de leurres/poissons et
  se repérer sur la carte.
- **La pince doit être étalonnée une fois** dans l'appli (photo avec un gallon
  à mesurer à côté) : les grandeurs des poissons seront ensuite estimées
  automatiquement.
- Les données (leurres, prises, albums) sont stockées **sur le téléphone** :
  rien n'est envoyé sur internet, l'appli marche sans réseau.
- Pour mettre à jour l'appli plus tard : remplacer les fichiers dans `www/`,
  puis lancer `npx cap sync android` et recompiler.

## Caractéristiques techniques

- Capacitor 8.6.2, compileSdk / targetSdk 36, minSdk 24 (Android 7.0+).
- Leaflet 1.9.4 vendu en local (aucune dépendance CDN) : la carte marche hors ligne.
- Service worker `sw.js` pour le hors-ligne.
- Saisie photo : `<input type="file" accept="image/*" capture="environment">`.
- Géolocalisation : `navigator.geolocation`.


## Nouveautés de cette version

- **Stockage IndexedDB** : plus de limite de ~5 Mo, les photos ne saturent plus l'appli.
  Au premier lancement, les données de l'ancienne version sont copiées puis vérifiées avant d'être effacées.
- **Sauvegarde par la feuille « Partager » d'Android** (Drive, courriel, Téléchargements…) +
  rappel sur l'accueil (jamais sauvegardé, 10 changements, ou 30 jours).
- **Prises** : position GPS automatique (si la prise est du jour, et cohérente avec le plan d'eau choisi),
  météo avec pression atmosphérique.
- **Statistiques** : espèces, meilleures heures, pression atmosphérique.
- **Rappels du permis** par notification (30 jours et 7 jours avant), sans connexion.
- **Apparence** : Automatique, Clair, Sombre, **Plein soleil** (fort contraste, gros boutons) — dans « Mes réglages ».
- **Carte** : les tuiles regardées sont gardées sur le téléphone (jusqu'à ~5000) et se rafraîchissent toutes seules.
- Le bandeau « Mettre l'icône sur mon écran d'accueil » est masqué dans l'APK.

## Mise à jour v7

- **Nouveau visuel** : polices Bitter et DM Sans intégrées (plus besoin de réseau), courbes de niveau sur la photo d'accueil, pastille En ligne / Hors ligne, barre d'onglets repensée, réglages et sauvegarde rangés dans une section repliable.
- **Mes documents** : permis de pêche et **permis de bateau** (photo, date d'expiration facultative pour le bateau, rappels 30 et 7 jours avant, alerte sur l'accueil). Les photos sont incluses dans les sauvegardes.
- **Nœuds de pêche** : 21 nœuds expliqués étape par étape, filtrables par méthode (mouche, lancer léger, lancer lourd), type de fil (nylon, fluorocarbone, tressé, acier) et usage, avec les types de montage. (À l'époque : texte seulement ; des schémas ont été ajoutés ensuite, puis remplacés en v9 par les photos de vraie corde.)
- **Manger le poisson** : limites générales du Québec (1 repas = 230 g avant cuisson ; 4 repas par mois, 2 repas par mois ou sans restriction selon l'espèce), compteur de repas du mois, rappel sur chaque fiche de prise, conseils de préparation. Source : quebec.ca. Certains plans d'eau ont des limites plus strictes : le guide officiel par plan d'eau (en ligne) reste la référence.

## Mise à jour v6

- **Sauvegarde automatique (APK)** : l'appli copie toute seule tes données dans `Documents/AppliPeche`
  (au démarrage, toutes les 10 minutes, et quand tu quittes l'appli), dès qu'il y a du nouveau.
  Les 5 derniers jours sont gardés. Ce dossier survit à une désinstallation. Pour restaurer sur un
  autre téléphone : « Importer » puis choisir un fichier `sauvegarde-AAAA-MM-JJ.json`.
  Si Android refuse l'accès à Documents, une copie interne de secours est faite et l'appli le signale.
  Interrupteur dans « Mes réglages ».
- **Photo du permis** : « Permis : date et photo » dans Mes réglages (photo ou galerie, 1800 px, incluse dans les sauvegardes).
  Ensuite, « 🪪 Voir mon permis » l'affiche en grand avec la date d'expiration.
- **Bandeau d'installation retiré** partout (APK et version web). Le service worker (cache hors ligne et tuiles de carte) est conservé.

## Mettre à jour l'appli sans effort

Chaque modification envoyée (« commit ») sur la branche `main` du dépôt GitHub relance la compilation :
l'APK à jour apparaît dans l'onglet Actions. Il suffit de l'installer par-dessus l'ancien :
les données sont conservées tant que l'ID (`com.julien.applidepeche`) ne change pas et que la version
est signée avec la même clé (les APK « debug » de GitHub peuvent changer de clé d'une compilation à l'autre :
fais une **sauvegarde** avant de mettre à jour).

## Version signée (Play Store ou installation durable)

1. Créer une clé (une seule fois, à garder précieusement) :
   `keytool -genkeypair -v -keystore release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias peche`
2. Encoder la clé : `base64 -w0 release.jks` (sous macOS : `base64 -i release.jks`).
3. Sur GitHub : Settings → Secrets and variables → Actions → ajouter
   `KEYSTORE_BASE64` (le texte de l'étape 2), `KEYSTORE_PASSWORD`, `KEY_ALIAS` (ex. `peche`), `KEY_PASSWORD`.
4. Onglet Actions → « Construire l'APK signé » → Run workflow → télécharger `app-release.apk`.

Une APK signée avec la même clé se met à jour par-dessus la précédente sans perdre les données.
