// FYI - Need to register this service-worker.js into the index.html file 
// needs to be added into my index.html or else it won't be recognized & won't run
// once registered, check the "cache storage" in dev tools to see that our files, 
// content has been registered in the cache.
// note: same is true for the db.js file 
// link to help troubleshoot this file:
// https://stackoverflow.com/questions/60242294/why-are-my-service-workers-not-working-offline
// account for files to use offline 
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/index.js',
    '/manifest.webmanifest',
    '/db.js',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
  ];

const CACHE_NAME = 'static-cache-ver-1';
const DATA_CACHE_NAME = 'data-cache-ver-1';


// 1st Install a service worker
self.addEventListener('install', function(evt) {
    evt.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        console.log('Your service worker is installed and are being stored to cache!');
        return cache.addAll(FILES_TO_CACHE);
      })
    );
  
    self.skipWaiting();
  });

  // 2nd, then need to activate the service worker & clear out any previous cache
self.addEventListener('activate', function(evt) {
    evt.waitUntil(
      caches.keys().then(keyList =>
        Promise.all(
          keyList.map(key => {    // remove unwanted caches
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log('service worker is activated, now Clear out previous cache', key);
              return caches.delete(key);
            }
          })
        )
      )
    );
  
    self.clients.claim();
  });

  // to work offline, call fetch
  // make the service worker fetch our api when a connection is present, or load the cache site pages
  self.addEventListener('fetch', (evt) => {
        if (evt.request.url.includes('/api/')) {
        evt.respondWith(
            caches
            .open(DATA_CACHE_NAME)
            .then(cache =>
                fetch(evt.request)
                .then(response => {
                    // when a connection is made, take the fetched data, and put it in our cache
                    // so that when offline, we have latest data to work with 
                    if (response.status === 200) {
                    cache.put(evt.request.url, response.clone());
                    }
    
                    return response;
                })
                .catch(err =>
                    // if there is no connection to any network, get the data from our cache
                    cache.match(evt.request)
                )
            )
            .catch(err => console.log(err))
        );
    
        return;
        }
  // when the if condition if false, and no api is available because we are offline, 
  // then open the data from cache
  evt.respondWith(
    caches
      .open(CACHE_NAME)
      .then(cache =>
        cache
          .match(evt.request)
          .then(response => response || fetch(evt.request))
      )
  );
});