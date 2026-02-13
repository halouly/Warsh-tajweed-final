const CACHE_NAME = 'warsh-v1';
const ASSETS = [
    './index.html',
    './manifest.json'
];

// 1. Install & Pre-cache App Shell
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        })
    );
});

// 2. Runtime Caching (Cache JSON data as you use it)
self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(cached => {
            // Return cached response if found
            if (cached) return cached;

            // Otherwise fetch from network
            return fetch(e.request).then(response => {
                // Check if valid response
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                // Cache the new file (like data/1.json)
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(e.request, responseToCache);
                });

                return response;
            });
        })
    );
});
