// ================================================================
// 📄 FILE PATH: public/sw.js
// ================================================================

self.addEventListener('install', (event) => {
  // Langsung aktifkan service worker baru tanpa menunggu
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Klaim semua client yang terbuka agar langsung dikontrol oleh SW ini
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Jika notifikasi diklik, buka tab aplikasi atau fokus ke tab yang sudah terbuka
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});
