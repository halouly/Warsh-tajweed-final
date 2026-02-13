const CACHE_NAME = 'warsh-v2-offline-data'; // Changed version to force update
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

// 1. INSTALL: Download EVERYTHING immediately
self.addEventListener('install', e => {
    console.log('[Service Worker] Installing and downloading all data...');
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ALL_ASSETS);
        })
    );
    self.skipWaiting(); // Force this new SW to become active immediately
});

// 2. ACTIVATE: Clean up old caches (v1)
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if (key !== CACHE_NAME) {
                    console.log('[Service Worker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

// 3. FETCH: Serve from Cache first, then Network
self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(cachedResponse => {
            // Return cached file if found (Instant & Offline)
            if (cachedResponse) {
                return cachedResponse;
            }
            // Otherwise try network (e.g. Audio files)
            return fetch(e.request);
        })
    );
});
