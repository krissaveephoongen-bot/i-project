const CACHE_NAME = 'project-management-v1';
const STATIC_CACHE_NAME = 'static-v1';

// Files to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/projects',
  '/reports',
  '/tasks',
  '/users',
  '/settings',
  '/api/health',
  '/favicon.ico',
  '/manifest.json'
];

// API routes to cache
const API_CACHE_ROUTES = [
  '/api/projects',
  '/api/users',
  '/api/tasks',
  '/api/milestones',
  '/api/health',
  '/api/system/health',
  '/api/system/metrics'
];

// Install event listener
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(
        STATIC_ASSETS.map((url) =>
          caches.match(url).then((response) => {
            if (!response || response.status !== 200) {
              return fetch(url).then((response) => {
                return response.clone();
              });
            }
            return response;
          })
        )
      );
    })
  );
  
  // Skip waiting for activation
  self.skipWaiting();
  event.clients.claim();
});

// Activate event listener
self.addEventListener('activate', (event) => {
  event.clients.claim();
});

// Fetch event listener with caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip caching for non-GET requests
  if (request.method !== 'GET') {
    return event.respondWith(fetch(request));
  }

  // Cache static assets
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        });
      })
    );
    return;
  }

  // Cache API routes with network-first strategy
  if (API_CACHE_ROUTES.some(route => url.pathname.startsWith(route))) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response && response.status === 200) {
          // Return cached response if still fresh (5 minutes)
          const cachedDate = response.headers.get('date');
          if (cachedDate) {
            const age = (Date.now() - new Date(cachedDate).getTime()) / 1000;
            if (age < 300) {
              return response;
            }
          }
        }
        // Fetch fresh data and cache it
        return fetch(request).then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        });
      })
    );
    }

  // Network-first for everything else
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request);
    })
  );
});

// Background sync for cache cleanup
self.addEventListener('sync', (event) => {
  if (event.tag === 'cache') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  if (event.data && event.data.type === 'CACHE_UPDATE') {
      event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
          return caches.keys().then((cacheNames) => {
            return Promise.all(
              cacheNames.map((cacheName) => caches.delete(cacheName))
            });
          }).then(() => {
            return caches.open(CACHE_NAME).then((cache) => {
              return cache.addAll(
                STATIC_ASSETS.map((url) =>
                  caches.match(url).then((response) => {
                    if (!response || response.status !== 200) {
                      return fetch(url).then((response) => {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                          cache.put(url, responseClone);
                        });
                        return response;
                      });
                    }
                    return response;
                  })
                )
              );
            });
          });
        })
      );
  }
});
