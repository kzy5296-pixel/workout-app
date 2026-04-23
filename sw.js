const CACHE_NAME = '101training-v12';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192-v2.png',
  './icon-512-v2.png',
  './apple-touch-icon-v2.png'
];

// インストール：キャッシュを作成してすぐ有効化
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 有効化：古いキャッシュを削除し、全クライアントに更新通知
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => {
      self.clients.claim();
      // 開いているページ全てにリロード通知を送る
      return self.clients.matchAll({ type: 'window' }).then(clients => {
        clients.forEach(client => client.postMessage({ type: 'SW_UPDATED' }));
      });
    })
  );
});

// ===== インターバルタイマー通知（バックグラウンド対応）=====
let _timerTimeout = null;

self.addEventListener('message', event => {
  const d = event.data;
  if (!d) return;

  if (d.type === 'SCHEDULE_TIMER') {
    if (_timerTimeout) { clearTimeout(_timerTimeout); _timerTimeout = null; }
    const delay = Math.max(0, d.endTime - Date.now());
    _timerTimeout = setTimeout(() => {
      _timerTimeout = null;
      self.registration.showNotification('⏱️ インターバル終了！', {
        body: `${d.exName} — 次のセットへ 💪`,
        icon:    './icon-192.png',
        badge:   './icon-192.png',
        vibrate: [200, 100, 200, 100, 400],
        tag:     'interval-timer',
        renotify: true,
        data:    { url: self.registration.scope }
      });
    }, delay);
  }

  if (d.type === 'CANCEL_TIMER') {
    if (_timerTimeout) { clearTimeout(_timerTimeout); _timerTimeout = null; }
  }
});

// 通知タップで該当PWAを前面に
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || self.registration.scope;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const found = clients.find(c => c.url.startsWith(self.registration.scope));
      return found ? found.focus() : self.clients.openWindow(url);
    })
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;

  // ナビゲーション（HTMLページ本体）はネットワーク優先
  // → 常に最新版を取得し、オフライン時のみキャッシュにフォールバック
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return response;
      }).catch(() => caches.match(req).then(c => c || caches.match('./index.html')))
    );
    return;
  }

  // その他（manifest.json など）はキャッシュ優先
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(response => {
        if (response && response.status === 200 && response.type !== 'opaque') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
