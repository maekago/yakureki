// オフラインでも開けるようにアプリのファイルを保存しておく。
// 通信できるときは常に最新版を取りに行き、できないときだけ保存分を使う。
const CACHE_NAME = 'yakureki-v1';
const APP_FILES = ['./yakureki.html', './manifest.webmanifest', './icon-180.png', './icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return res;
      })
      .catch(() => caches.match(event.request, {ignoreSearch: true}))
  );
});
