/* DG Đặt Hàng — service worker: chỉ lưu vỏ app (trang + icon) để mở nhanh; dữ liệu giá/đơn luôn lấy trực tiếp từ máy chủ, không lưu */
const C = 'dathang-202610281217';
const VO = ['/', '/manifest.webmanifest', '/icon-192.png', '/apple-touch-icon.png', '/favicon-32.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(VO)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;   // không đụng tới API / ảnh Drive / font
  if (e.request.mode === 'navigate' || u.pathname === '/' || u.pathname.endsWith('.html')) {   // trang: mạng trước, mất mạng mới dùng bản lưu
    e.respondWith(fetch(e.request).then(r => { const k = r.clone(); caches.open(C).then(c => c.put('/', k)); return r; }).catch(() => caches.match('/')));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
