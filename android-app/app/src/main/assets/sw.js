const CACHE_NAME = 'ahsan-pharmacy-offline-v3';
const ASSETS = [
    './',
    './index.html',
    './Pharmise%20mangment%20system.html',
    './css/main.css',
    './css/mobile.css',
    './css/print.css',
    './js/db.js',
    './js/inventory.js',
    './js/pos.js',
    './js/dashboard.js',
    './js/settings.js',
    './js/app.js',
    './manifest.json'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS).catch(err => console.log('Asset cache notice:', err));
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((k) => {
                    if (k !== CACHE_NAME) return caches.delete(k);
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((res) => {
            return res || fetch(e.request).catch(() => caches.match('./index.html'));
        })
    );
});
