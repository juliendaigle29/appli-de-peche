/* Service worker — Carnet de pêche Québec
   Met l'appli en cache pour le hors ligne et permet à Chrome (Android)
   de reconnaître la page comme une appli installable (PWA).
   Les tuiles de carte vues sont gardées sur le téléphone (hors ligne) et
   se rafraîchissent toutes seules quand le réseau est disponible. */
"use strict";

var CACHE_VERSION = "peche-v19";
var SHELL_CACHE = CACHE_VERSION + "-shell";
var RUNTIME_CACHE = CACHE_VERSION + "-runtime";

/* Cache des tuiles de carte : nom fixe, pour survivre aux mises à jour de l'appli. */
var TILE_CACHE = "peche-tuiles";
var TILE_MAX = 5000;                         /* ≈ 100 à 150 Mo au maximum */
var TILE_FRESH_MS = 14 * 24 * 3600 * 1000;   /* au-delà de 14 jours : rafraîchie en ligne */
var tilePuts = 0;

/* Fichiers de l'appli, relatifs à ce script (dossier assets/). */
var SHELL_FILES = [
  "knots/clinch-1.svg",
  "knots/clinch-2.svg",
  "knots/clinch-3.svg",
  "knots/clinch-4.svg",
  "knots/clinch-5.svg",
  "knots/uni-1.svg",
  "knots/uni-2.svg",
  "knots/uni-3.svg",
  "knots/uni-4.svg",
  "knots/trilene-1.svg",
  "knots/trilene-2.svg",
  "knots/trilene-3.svg",
  "knots/trilene-4.svg",
  "knots/albright-1.svg",
  "knots/albright-2.svg",
  "knots/albright-3.svg",
  "knots/albright-4.svg",
  "knots/albright-5.svg",
  "knots/nail-1.svg",
  "knots/nail-2.svg",
  "knots/nail-3.svg",
  "knots/nail-4.svg",
  "knots/nail-5.svg",
  "../index.html",
  "manifest.webmanifest",
  "icon-192.png",
  "icon-512.png",
  "icon-maskable-512.png",
  "apple-touch-icon.png",
  "vendor/leaflet/leaflet.js",
  "vendor/leaflet/leaflet.css",
  "guides.js",
  "contour.svg",
  "fonts/bitter.woff",
  "fonts/dmsans.woff",
];

/* Fournisseurs de tuiles utilisés par la carte (satellite Esri + étiquettes Carto). */
function isTileHost(host) {
  return host === "server.arcgisonline.com" || /(^|\.)basemaps\.cartocdn\.com$/.test(host);
}

/* Tuile transparente 1x1, affichée hors ligne pour une zone jamais visitée. */
function blankTile() {
  var bin = atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=");
  var bytes = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Response(bytes, { status: 200, headers: { "Content-Type": "image/png" } });
}

/* Garde la tuile avec sa date d'enregistrement ; élague les plus anciennes au besoin. */
function stashTile(cache, url, res) {
  return res.blob().then(function (blob) {
    var h = new Headers(res.headers);
    h.set("x-cached-at", String(Date.now()));
    return cache.put(url, new Response(blob, { status: res.status, statusText: res.statusText, headers: h }));
  }).then(function () {
    tilePuts++;
    if (tilePuts % 100 === 0) return trimTiles(cache);
  }).catch(function () { /* stockage plein ou indisponible : on continue sans cache */ });
}

function trimTiles(cache) {
  return cache.keys().then(function (keys) {
    var extra = keys.length - TILE_MAX;
    if (extra <= 0) return;
    return Promise.all(keys.slice(0, extra).map(function (k) { return cache["delete"](k); }));
  });
}

/* Télécharge une tuile en mode CORS (réponse lisible, donc mise en cache correctement).
   Si le serveur refuse le CORS, on affiche quand même la tuile, sans la mettre en cache. */
function fetchTile(req, cache) {
  return fetch(req.url, { mode: "cors", credentials: "omit" }).then(function (res) {
    if (!res || !res.ok) return null;
    stashTile(cache, req.url, res.clone());
    return res;
  }).catch(function () {
    return fetch(req).catch(function () { return null; });
  });
}

function handleTile(event) {
  var req = event.request;
  return caches.open(TILE_CACHE).then(function (cache) {
    return cache.match(req.url).then(function (cached) {
      if (cached) {
        var age = Date.now() - Number(cached.headers.get("x-cached-at") || 0);
        /* Tuile ancienne : on l'affiche tout de suite et on la met à jour en arrière-plan. */
        if (age > TILE_FRESH_MS) event.waitUntil(fetchTile(req, cache));
        return cached;
      }
      return fetchTile(req, cache).then(function (res) { return res || blankTile(); });
    });
  });
}

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(function (cache) {
      /* addAll échoue en bloc si un fichier manque : on ajoute un par un. */
      return Promise.all(
        SHELL_FILES.map(function (url) {
          return cache.add(url).catch(function () { /* fichier absent : on continue */ });
        })
      );
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (key) {
          if (key !== SHELL_CACHE && key !== RUNTIME_CACHE && key !== TILE_CACHE) return caches["delete"](key);
        })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;
  var url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  /* Navigation (ouverture de l'appli) : réseau d'abord, cache en secours hors ligne. */
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(SHELL_CACHE).then(function (cache) { cache.put("../index.html", copy); });
        return res;
      }).catch(function () {
        return caches.match("../index.html", { ignoreSearch: true })
          .then(function (cached) { return cached || caches.match("../", { ignoreSearch: true }); });
      })
    );
    return;
  }

  /* Même origine (icônes, manifeste, guides.js…) : réseau d'abord, cache en
     secours hors ligne seulement. L'ancienne stratégie « cache affiché tout
     de suite, rafraîchi en arrière-plan » montrait l'ancienne copie à la
     première réouverture après une mise à jour — il fallait ouvrir l'appli
     deux fois pour voir les nouveautés (ex. les schémas des nœuds). */
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(SHELL_CACHE).then(function (cache) { cache.put(req, copy); });
        }
        return res;
      }).catch(function () {
        return caches.match(req, { ignoreSearch: true });
      })
    );
    return;
  }

  /* Tuiles de carte : cache d'abord, rafraîchies en arrière-plan quand elles vieillissent. */
  if (isTileHost(url.hostname)) {
    event.respondWith(handleTile(event));
    return;
  }

  /* Sonde de connectivité (indicateur « En ligne » de l'appli) : réseau
     seulement, jamais servie par le cache, sinon la sonde dirait
     « en ligne » même hors ligne. */
  if (url.searchParams.has("__probe")) {
    event.respondWith(fetch(req).catch(function () { return new Response("", { status: 504 }); }));
    return;
  }

  /* Autres ressources externes (polices, météo) :
     cache d'abord, réseau en arrière-plan pour rafraîchir. */
  event.respondWith(
    caches.open(RUNTIME_CACHE).then(function (cache) {
      return cache.match(req, { ignoreSearch: true }).then(function (cached) {
        var network = fetch(req).then(function (res) {
          if (res && (res.status === 200 || res.type === "opaque")) cache.put(req, res.clone());
          return res;
        }).catch(function () { return cached; });
        return cached || network;
      });
    })
  );
});
