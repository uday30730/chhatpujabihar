const CHHATH_HOME = './';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', event => {
  const target = (event.notification && event.notification.data && event.notification.data.url) || CHHATH_HOME;
  event.notification.close();
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      try {
        const current = new URL(client.url);
        const wanted = new URL(target, self.location.origin);
        if (current.origin === wanted.origin) {
          await client.focus();
          if ('navigate' in client && client.url !== wanted.href) await client.navigate(wanted.href);
          return;
        }
      } catch (_e) {}
    }
    if (self.clients.openWindow) return self.clients.openWindow(target);
  })());
});

// Ready for future Web Push/FCM integration. Supabase Realtime notifications
// are currently triggered by the open page and displayed via showNotification().
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_e) {
    data = { body: event.data ? event.data.text() : '' };
  }
  const title = data.title || '🙏 छठ पूजा';
  const options = {
    body: data.body || 'नई update उपलब्ध है।',
    icon: data.icon || './icon-192.png',
    badge: data.badge || './icon-192.png',
    image: data.image || undefined,
    tag: data.tag || 'chhath-push',
    renotify: true,
    vibrate: [220, 100, 220],
    data: { url: data.url || CHHATH_HOME }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
