// Service Worker for Einbürgerungstest PWA
// Provides offline functionality and fast loading

const CACHE_NAME = 'einbuergerungstest-v3';
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB max cache size
const MAX_CACHE_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

const urlsToCache = [
  '/',
  '/index.html',
  '/questions.js',
  '/src/js/app.js',
  '/src/js/quiz.js',
  '/src/js/storage.js',
  '/src/js/timer.js',
  '/src/js/navigation.js',
  '/src/js/statistics.js',
  '/src/js/share.js',
  '/src/js/dom-differ.js',
  '/src/js/ui-renderer.js',
  '/src/css/styles.css',
  '/src/css/accessibility.css',
  '/src/css/animations.css',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  // External dependencies
  'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js',
  'https://gc.zgo.at/count.js'
];

/**
 * Check cache quota and size
 */
async function checkCacheQuota() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      const percentUsed = (estimate.usage / estimate.quota) * 100;
      console.log(`[Service Worker] Storage: ${(estimate.usage / 1024 / 1024).toFixed(2)}MB / ${(estimate.quota / 1024 / 1024).toFixed(2)}MB (${percentUsed.toFixed(2)}%)`);

      // If using more than 80% of quota, cleanup old caches
      if (percentUsed > 80) {
        console.log('[Service Worker] Cache quota exceeded 80%, cleaning up...');
        await cleanupOldCaches();
      }

      return estimate;
    } catch (error) {
      console.error('[Service Worker] Failed to check quota:', error);
    }
  }
  return null;
}

/**
 * Cleanup old cached items based on age
 */
async function cleanupOldCaches() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    const now = Date.now();

    let deletedCount = 0;

    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const cachedDate = response.headers.get('date');
        if (cachedDate) {
          const age = now - new Date(cachedDate).getTime();
          // Delete if older than MAX_CACHE_AGE and not in critical urlsToCache
          if (age > MAX_CACHE_AGE && !urlsToCache.includes(request.url)) {
            await cache.delete(request);
            deletedCount++;
            console.log('[Service Worker] Deleted old cache entry:', request.url);
          }
        }
      }
    }

    if (deletedCount > 0) {
      console.log(`[Service Worker] Cleaned up ${deletedCount} old cache entries`);
    }
  } catch (error) {
    console.error('[Service Worker] Cache cleanup failed:', error);
  }
}

// Install event - cache all resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    (async () => {
      try {
        // Check quota before caching
        await checkCacheQuota();

        const cache = await caches.open(CACHE_NAME);
        console.log('[Service Worker] Caching app shell');

        // Cache URLs one by one to handle failures gracefully
        for (const url of urlsToCache) {
          try {
            await cache.add(url);
          } catch (error) {
            console.warn(`[Service Worker] Failed to cache ${url}:`, error.message);
          }
        }

        console.log('[Service Worker] App shell cached successfully');
      } catch (error) {
        console.error('[Service Worker] Installation failed:', error);
        throw error;
      }
    })()
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    (async () => {
      try {
        // Delete old caches
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );

        // Check quota and cleanup if needed
        await checkCacheQuota();

        console.log('[Service Worker] Activated successfully');
      } catch (error) {
        console.error('[Service Worker] Activation failed:', error);
      }
    })()
  );
  // Take control immediately
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests and chrome-extension requests
  if (!event.request.url.startsWith(self.location.origin) &&
      !event.request.url.startsWith('https://cdn.jsdelivr.net') &&
      !event.request.url.startsWith('https://gc.zgo.at')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          console.log('[Service Worker] Serving from cache:', event.request.url);
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the fetched response for next time
          caches.open(CACHE_NAME)
            .then(async (cache) => {
              // Only cache GET requests
              if (event.request.method === 'GET') {
                try {
                  await cache.put(event.request, responseToCache);
                } catch (error) {
                  // Handle quota exceeded errors
                  if (error.name === 'QuotaExceededError') {
                    console.warn('[Service Worker] Quota exceeded, cleaning up cache...');
                    await cleanupOldCaches();
                    // Try again after cleanup
                    try {
                      await cache.put(event.request, responseToCache.clone());
                    } catch (retryError) {
                      console.error('[Service Worker] Failed to cache after cleanup:', retryError);
                    }
                  }
                }
              }
            });

          return response;
        }).catch((error) => {
          console.log('[Service Worker] Fetch failed, serving offline page:', error);
          // You could return a custom offline page here
          return new Response('Offline - Please check your connection', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});

// Handle messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
