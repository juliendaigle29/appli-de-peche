> **Mise à jour (v5)** : la compilation se fait maintenant sur GitHub Actions (`.github/workflows/build-apk.yml`,
> Java 21, Node 22, `npm install` + `npx cap sync android`). Les remarques ci-dessous concernent l'ancien
> environnement Muse et sont gardées à titre d'historique.

# Notes de compilation — Carnet de pêche Québec Android

## État

**APK non produit.** Le projet Capacitor est complet et prêt à compiler, mais
la compilation Gradle est impossible dans cet environnement (VM Muse).
Il suffit de compiler le projet dans Android Studio sur un ordinateur normal
(voir `README.md`).

## Ce qui est terminé

- Projet Capacitor 8.6.2 complet : `~/workspace/appli-peche-android/`
  (`com.julien.applidepeche`, « Carnet de pêche Québec », version 1.0).
- Dossier web `www/` synchronisé (index.html, Leaflet 1.9.4 local, service
  worker, manifeste, icônes coffre à pêche).
- Plateforme Android ajoutée, `cap sync` fait, icônes/splash générés
  (87 fichiers), manifeste patché (CAMERA, READ_MEDIA_IMAGES,
  ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION), `MainActivity.java` patché
  (demande des autorisations au lancement).
- Environnement de compilation installé dans la VM : JDK Temurin 17.0.21.1
  (`/opt/jdk17`), Android SDK (`/opt/android-sdk` : platform-tools,
  platforms;android-36, build-tools;36.0.0, licences), Gradle 8.14.3
  (`/opt/gradle/gradle-8.14.3`, installé directement, voir ci-dessous).
  Attention : `/opt` est éphémère (disparaît au redémarrage de la VM).

## Ce qui bloque (cause exacte, vérifiée)

**Gradle ne peut pas démarrer son daemon dans cette VM.** Le client Gradle et
son daemon communiquent par une connexion TCP locale (loopback 127.0.0.1).
Le bac à sable (sandbox) Muse intercepte les connexions TCP brutes des
processus JVM et les refuse avec ce message de politique :

> « muse: Other TCP connections is turned off for this assistant. To allow it,
> ask the user to open Muse settings -> Permissions -> Direct network
> protocols and switch other_tcp from Deny to Ask. »

Preuves réunies le 2026-11-24 ~22:30 :

1. Trois tentatives de `./gradlew assembleDebug` / `gradle assembleDebug`
   (avec et sans `--no-daemon`, après suppression du registre des daemons
   `~/.gradle/daemon`) échouent toutes avec :
   `Could not receive a message from the daemon` /
   `IllegalArgumentException: Unexpected type tag 109 found`.
2. Test minimal Java : un client Java qui se connecte à un serveur Python en
   écoute sur 127.0.0.1 reçoit le message de politique ci-dessus au lieu de
   la réponse du serveur (le serveur ne voit même pas la connexion). Même
   résultat vers un port fermé (le port 1 « se connecte » : interception).
3. Le même test en Python pur fonctionne (PONG:HELLO) : l'interception cible
   les processus JVM.
4. Le réseau HTTP via le proxy d'egress fonctionne (curl OK, sdkmanager a
   récupéré la liste des paquets, téléchargements directs OK) : le problème
   est spécifique au TCP brut / loopback, pas à l'accès internet.

Conséquence : le wrapper Gradle ne peut pas non plus télécharger sa
distribution (échec de tunnel CONNECT dans `HttpURLConnection`) — contourné
en installant Gradle 8.14.3 directement via curl (binaire, 137 Mo,
`~/workspace/downloads/gradle-8.14.3-bin.zip`). Mais le build lui-même reste
bloqué par le daemon.

## Pistes non retenues

- **Activer `other_tcp`** : c'est un réglage des permissions Muse à changer
  par l'utilisateur (Muse settings → Permissions → Direct network protocols).
  Non demandé à Julien dans cette tâche ; à proposer si on veut compiler ici.
- **Compilation manuelle sans Gradle** (aapt2 + d8 + zipalign + apksigner) :
  possible en principe (ces outils n'utilisent pas de TCP), mais il faudrait
  reconstituer à la main tout le graphe de dépendances (bibliothèque Capacitor
  + AndroidX : appcompat, activity, fragment, webkit, core, lifecycle…),
  la fusion des ressources et des manifestes. Très fragile, non tenté.
- **Android Studio dans la VM** : impossible (pas d'interface graphique) et
  de toute façon le même daemon Gradle serait bloqué.

## Nouvelle tentative le 2026-11-24 ~22:40 UTC (après passage de `other_tcp` à Ask)

Julien a changé `other_tcp` de Deny à Ask dans Muse. Nouvelle tentative :
`gradle assembleDebug` (Gradle 8.14.3 direct) dans `android/` → échec en
~10 s, même erreur (journal `gradle-build-2.log`) :

```
A new daemon was started but could not be connected to.
Caused by: DaemonInitialConnectException: The first result from the daemon was empty.
```

Pendant le build, une approbation a été demandée et accordée (« Allowed
once », 22:40:41 UTC, id `f4a38d34…`) — le build a quand même échoué.

Test diagnostique refait juste après (client Java → serveur Python sur
127.0.0.1:18099) : le client se « connecte », une carte d'approbation
apparaît (« Direct connection to ::ffff:127.0.0.1 », port 18099,
id `d1549d89…`), Julien l'approuve, mais la connexion est ensuite
réinitialisée (`java.net.SocketException: Connection reset`) et le serveur
ne voit jamais la connexion (journal vide). Conclusion : **même avec
`other_tcp` sur Ask et l'approbation accordée, le TCP loopback des
processus JVM ne transporte pas de données dans cette VM**. Le daemon
Gradle ne peut donc pas fonctionner ici, et chaque nouvelle tentative
déclencherait une nouvelle carte d'approbation (le port du daemon est
aléatoire). L'APK ne peut pas être produit dans cette VM ; le projet reste
prêt à compiler dans Android Studio (voir `README.md`).

## Ce qu'il reste à faire

1. Ouvrir `~/workspace/appli-peche-android/android/` dans Android Studio
   (ou lancer `./gradlew assembleDebug` sur une machine normale) et compiler.
2. Valider l'APK : `aapt2 dump badging app-debug.apk` (nom, ID, version,
   permissions).
3. Copier l'APK vers `~/workspace/your_files/appli-de-peche-android/`
   et le remettre à Julien avec les instructions d'installation (déjà dans
   `README.md`).
4. Dire clairement que l'installation sur émulateur/appareil n'a pas été testée.

## Fichiers utiles

- `~/workspace/appli-peche-android/` — projet complet.
- `~/workspace/appli-peche-android/gradle-build.log` — journal du dernier
  build (échec daemon).
- `~/workspace/downloads/gradle-8.14.3-bin.zip` — distribution Gradle 8.14.3.
- `~/workspace/downloads/build-tools_r36_linux.zip` — build-tools 36.0.0.
