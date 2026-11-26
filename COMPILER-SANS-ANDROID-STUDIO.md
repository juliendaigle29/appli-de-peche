# Compiler l'APK sans Android Studio (avec GitHub, gratuit)

C'est la procédure la plus simple : pas besoin d'installer Android Studio,
pas besoin de ligne de commande. GitHub compile l'appli à ta place, et tu
télécharges l'APK à la fin. Compte environ 10 minutes la première fois.

## Ce qu'il faut

- Un compte GitHub gratuit (https://github.com/signup)
- Ce dossier de projet, avec le fichier `.github/workflows/build-apk.yml` déjà dedans

## Les étapes

1. **Créer un dépôt** sur https://github.com/new
   - Nom : `appli-peche` (par exemple)
   - Choisir **Public** (plus simple, et gratuit)
   - Cliquer sur **Create repository**.
2. **Déposer le projet** : sur la page du dépôt, cliquer sur
   **uploading an existing file**, puis glisser-déposer **le contenu** du
   dossier `appli-peche-android` (les dossiers `www/`, `android/`,
   `.github/` et les fichiers à la racine). Cliquer sur **Commit changes**.
   - Les dossiers/fichiers dont le nom commence par un point (`.github`, `.gitignore`) sont cachés
     sur certains ordinateurs : vérifie qu'ils sont bien déposés, sinon le bouton « Run workflow » n'apparaîtra pas.
   - Attention : il faut déposer le contenu du dossier, pas le dossier
     lui-même dans un sous-dossier, sinon la compilation ne trouvera pas
     le dossier `android/`.
3. **Lancer la compilation** : onglet **Actions** → **Construire l'APK** →
   **Run workflow** → **Run workflow**. Attendre quelques minutes que
   le petit rond devienne vert.
4. **Télécharger l'APK** : cliquer sur la compilation terminée, puis en bas
   de page, dans **Artifacts**, télécharger **Appli-de-peche**. Le fichier
   `app-debug.apk` est dedans (on peut le renommer `Appli-de-peche.apk`).
5. **Installer sur le téléphone** : envoyer l'APK sur le Samsung (courriel,
   Drive…), l'ouvrir, autoriser les applis inconnues si demandé, toucher
   **Installer**. L'icône coffre à pêche apparaît sur l'écran d'accueil.

## Si ça ne marche pas

- Si la compilation échoue (rond rouge), cliquer dessus et m'envoyer une
  capture du message d'erreur, ou le journal : on règle ça ensemble.
- Si tu passes par une autre IA : donne-lui ce dossier tel quel, le fichier
  `.github/workflows/build-apk.yml` fait déjà tout le travail — elle n'a
  qu'à déposer le projet sur GitHub et lancer le workflow.

## Rappel

- L'appli fonctionne hors ligne, les données restent sur le téléphone.
- Au premier lancement, accepter l'accès à la caméra et à la localisation.
- La pince doit être étalonnée une fois (photo avec un gallon à mesurer à côté).
