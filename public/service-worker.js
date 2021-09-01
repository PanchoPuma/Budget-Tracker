
const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

const FILES_TO_CACHE = [
    "/index.html",
    "/assets/images/icons/icon-192x192.png",
    "/assets/images/icons/icon-512x512.png",
    "/assets/js/idb.js",
    "/assets/css/styles.css",
    "/assets/js/index.js",
    "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
    "https://cdn.jsdelivr.net/npm/chart.js@2.8.0"
];


self.addEventListener("install", (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
});




self.addEventListener("fetch", (e) => {
    if (e.request.url.includes("/api/") && e.request.method === "GET") {
        e.respondWith(
            caches
                .open(DATA_CACHE_NAME)
                .then((cache) => {
                    return fetch(e.request)
                        .then((response) => {
                            if (response.status === 200) {
                                cache.put(e.request, response.clone());
                            }

                            return response;
                        })
                        .catch(() => {
                            return cache.match(e.request);
                        });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json(err);
                })
        );

        return;
    }

    e.respondWith(
        caches.match(e.request)
            .then((response) => {
                return response || fetch(e.request);
            })
            .catch(err => {
                console.log(err);
                res.status(500).json(err);
            })
    );
});


self.addEventListener("activate", (e) => {
    e.waitUntil(
        caches.keys()
            .then((keyList) => {
                return Promise.all(
                    keyList.map((key) => {
                        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                            return caches.delete(key);
                        }
                    })
                );
            })
            .catch(err => {
                console.log(err);
                res.status(500).json(err);
            })
    );
    

    self.clients.claim();
});