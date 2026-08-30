// Service Worker Holisya — cache léger, réseau prioritaire.
const CACHE = 'holisya-v2';
const ASSETS = ['/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Ne jamais mettre en cache l'API, l'auth, l'admin ni les vidéos.
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/admin') || url.pathname.startsWith('/_next/data') || url.pathname.includes('/videos/')) return;

  // Réseau d'abord ; repli sur le cache hors-ligne.
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200 && (url.pathname.startsWith('/_next/static') || url.pathname.startsWith('/icons') || url.pathname.startsWith('/images'))) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});

// Notifications push
self.addEventListener('push', (event) => {
  let data = { title: 'Holisya', body: '', url: '/' };
  try { data = { ...data, ...(event.data ? event.data.json() : {}) }; } catch (e) {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: data.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) { if (client.url.includes(url) && 'focus' in client) return client.focus(); }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
