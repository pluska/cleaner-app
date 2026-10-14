// Retire the former next-pwa worker. Its API caches could survive sign-out and
// expose a previous account's responses offline. Keep this URL for installed clients.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const legacyCaches = new Set([
      'apis','cross-origin','google-fonts-stylesheets','google-fonts-webfonts',
      'next-data','next-image','next-static-js-assets','pages','pages-rsc','pages-rsc-prefetch',
      'start-url','static-audio-assets','static-data-assets','static-font-assets',
      'static-image-assets','static-js-assets','static-style-assets','static-video-assets',
    ]);
    const names = await caches.keys();
    await Promise.all(names.filter(name => legacyCaches.has(name) || name.startsWith('workbox-precache-')).map(name => caches.delete(name)));
    await self.clients.claim();
    await self.registration.unregister();
  })());
});
// No fetch handler: authenticated requests always go to the network.
