const CACHE_NAME = "map-tiles-cache-v1";

// Максимальное количество кешируемых тайлов
const MAX_TILES = 200;

// Список URL, которые мы хотим всегда кешировать при установке (можно оставить пустым или добавить базовые ресурсы)
const PRECACHE_URLS = [
  // '/',
  // '/index.html',
];

// При установке — кешируем нужные ресурсы
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }),
  );
  self.skipWaiting();
});

// При активации — удаляем старые кеши
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        }),
      ),
    ),
  );
  self.clients.claim();
});

// Логика кеширования тайлов
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // Фильтруем только запросы к тайлам OpenStreetMap (или другой используемой плитке)
  if (
    url.startsWith("https://a.tile.openstreetmap.org/") ||
    url.startsWith("https://c.tile.openstreetmap.org/") ||
    url.match(/tile.*\.(png|jpg|jpeg|webp)/)
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          // Если тайл есть в кеше — отдаём его
          return cachedResponse;
        }
        // Если нет — загружаем с сети и кешируем
        return fetch(event.request)
          .then((response) => {
            if (response.status === 200) {
              cache.put(event.request, response.clone());
              // Очистка кеша, если нужно (например, чтобы не рос бесконечно)
              limitCacheSize(cache, MAX_TILES);
            }
            return response;
          })
          .catch(() => {
            // Можно вернуть fallback-изображение тайла, если сеть недоступна
            return caches.match("/tile-fallback.png");
          });
      }),
    );
  }
  // Для остальных запросов — обычный fetch
});
