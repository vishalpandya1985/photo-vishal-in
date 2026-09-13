// Minimal service worker — required for "Add to Home Screen" installability
// on Android/Chrome. This intentionally does NOT cache pages or API
// responses, since this app is private/session-based and always needs
// fresh data. It simply lets every request pass straight through to the
// network, so nothing here can ever show stale or incorrect content.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
