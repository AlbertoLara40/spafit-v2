const CACHE_NAME = 'spafit-v2-cache-v3'
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
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
 
// Fetch: solo interceptar peticiones GET de nuestro propio sitio.
// Todo lo demás (POST, PUT, DELETE, y peticiones a otros dominios
// como Supabase) pasa directo a la red, sin pasar por el cache.
self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)
 
  const isSameOrigin = url.origin === self.location.origin
  const isGet = request.method === 'GET'
 
  if (!isSameOrigin || !isGet) {
    // Dejar que la petición siga su curso normal, sin interceptar
    return
  }
 
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request)
    })
  )
})
 