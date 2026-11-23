/* Service worker mínimo: só repassa os pedidos para a rede.
   Serve para o sistema poder ser instalado como aplicativo; não guarda cópia,
   então nunca mostra uma versão antiga. */
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => { e.respondWith(fetch(e.request)); });
