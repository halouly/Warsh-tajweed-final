const CACHE_NAME = 'warsh-v3-text'; // Updated version
const AUDIO_CACHE = 'warsh-audio-v1';

const APP_SHELL = [
    './',
    './index.html',
    './manifest.json'
];

// Generate list of all 114 Surah data files
const DATA_FILES = [];
for (let i = 1; i <= 114; i++) {
    DATA_FILES.push(`./data/${i}.json`);
}

const ALL_ASSETS = [...APP_SHELL, ...DATA_FILES];

// 1. INSTALL: Download Text & App Shell immediately
self.addEventListener('install', e => {
    console.log('[Service Worker] Caching App Shell & Text...');
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ALL_ASSETS);
        })
    );
    self.skipWaiting();
});

// 2. ACTIVATE: Clean up old text caches
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if (key !== CACHE_NAME && key !== AUDIO_CACHE) {
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

// 3. FETCH: Handle Text and Audio differently
self.addEventListener('fetch', e => {
    
    // A. If it's an Audio File (.mp3)
    if (e.request.url.endsWith('.mp3')) {
        e.respondWith(
            caches.open(AUDIO_CACHE).then(cache => {
                return cache.match(e.request).then(cachedResponse => {
                    // 1. If we have it saved, play it from cache (OFFLINE SUPPORT)
                    if (cachedResponse) return cachedResponse;

                    // 2. If not, download it, play it, AND SAVE IT
                    return fetch(e.request).then(networkResponse => {
                        cache.put(e.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
        return;
    }

    // B. For everything else (Text, HTML, CSS) -> Cache First
    e.respondWith(
        caches.match(e.request).then(cached => {
            return cached || fetch(e.request);
        })
    );
});
