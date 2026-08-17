const CACHE_NAME = 'spafit-v2-cache-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/imagen/logo.jpg'
]

// Instalar: guardar en cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    })
  )
  self.skipWaiting()
})

// Activar: limpiar caches viejas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Fetch: responder desde cache o red
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Si está en cache, devuelve cache. Si no, va a la red.
      return response || fetch(event.request)
    })
  )
})