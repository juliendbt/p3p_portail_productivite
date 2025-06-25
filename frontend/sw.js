// Version du cache (à incrémenter si tu modifies les fichiers)
const CACHE_NAME = "p3p-cache-v2";

// Fichiers à mettre en cache
const FILES_TO_CACHE = [
    "./index.html",
    "./dashboard.html",
    "./goals.html",
    "./assets/js/script.js",
    "./assets/js/dashboard.js",
    "./assets/js/goals.js",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
];

// INSTALLATION — ajoute les fichiers au cache
self.addEventListener("install", (e) => {
    console.log("[ServiceWorker] Install");

    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

// ACTIVATION — supprime les anciens caches
self.addEventListener("activate", (e) => {
    console.log("[ServiceWorker] Activate");

    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        console.log("[ServiceWorker] Supprime ancien cache :", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});

// FETCH — intercepte les requêtes
self.addEventListener("fetch", (e) => {
    e.respondWith(
        caches.match(e.request).then(res => {
            return res || fetch(e.request);
        })
    );
});
