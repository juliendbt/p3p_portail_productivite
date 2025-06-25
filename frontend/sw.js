self.addEventListener("install", (e) => {
    e.waitUntil(
        caches.open("p3p-cache").then(cache => {
            return cache.addAll([
                "./index.html",
                "./dashboard.html",
                "./goals.html",
                "./assets/js/script.js",
                "./assets/js/dashboard.js",
                "./assets/js/goals.js",
                "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
            ]);
        })
    );
});

self.addEventListener("fetch", (e) => {
    e.respondWith(
        caches.match(e.request).then(res => res || fetch(e.request))
    );
});
