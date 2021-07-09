'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "22379fbf62b5ea2ba35b0962f4d52df8",
"assets/assets/images/aciligonye.jpg": "9b7864612010e6363f728af862cc4474",
"assets/assets/images/ajanda.jpg": "814bdb5568027a3aa8cbf83fc80be0a5",
"assets/assets/images/akrilikboya.jpg": "60496166a5a2b8afe433f5b914f214b2",
"assets/assets/images/cetvel.jpg": "174fe0164927cd7507d394d819f4c0ed",
"assets/assets/images/defter.jpg": "69ed3fca9bfdb9d736f75cb7e5517b9c",
"assets/assets/images/fircaseti.jpg": "91401a4cf2f85de7723cb30725115f43",
"assets/assets/images/fosforlukalem.jpg": "86a76da411652aa40573a37893e570df",
"assets/assets/images/fotokopikagidi.jpg": "fae7f808daa1f57bc0e51b96bdfe4789",
"assets/assets/images/hesapmakinesi.jpg": "cadae0c44475fb665ebefc897264a323",
"assets/assets/images/kalemkutu.jpg": "72d79c5010f8718723ae83537fdea0c2",
"assets/assets/images/kaligrafikalemi.jpg": "36154612cfe8fbf9a8de26a5ed00925e",
"assets/assets/images/kanvastablo.jpg": "e10b4be9d4a41b78ab5c2026d9a952e9",
"assets/assets/images/kecelikalem.jpg": "14821875730ef75a6bee12b319882ab9",
"assets/assets/images/kuruboya.jpg": "aed678af86f565f7985451b65304ced3",
"assets/assets/images/muzikkutusu.jpg": "9f58770b7db698f06c605166366fa07e",
"assets/assets/images/palet.jpg": "b369fb1e6484702195231efb82282d5b",
"assets/assets/images/pastelboya.jpeg": "e2ed512e511b1a51e9ee4ad09173c4be",
"assets/assets/images/pergel.jpg": "8ed803c08ebf5d2184ea9bb6be069fe3",
"assets/assets/images/puzzle.jpg": "491ad2afcc9d7362a4fb5d6ddb65047c",
"assets/assets/images/resimyagi.jpg": "d3b15fd75910ffac897516d8ca4a08d5",
"assets/assets/images/sovalye.jpg": "932ae41fac7c514069079418a93e1f40",
"assets/assets/images/suluboya.jpg": "58e7ed34b274231a693be26d3f6e2b1e",
"assets/assets/images/tcetveli.jpg": "bacc01d2296eecd6af380189461b1778",
"assets/assets/images/tuval.jpg": "a1b0ba8ef828d0a5f0f6e97c6de7c26c",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/NOTICES": "37638fdff63c239076580d2067843694",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "e64d103dcfb4534cfbcca51d168e325a",
"/": "e64d103dcfb4534cfbcca51d168e325a",
"main.dart.js": "aeb37ca0ba971d32948df3bfce54faf3",
"manifest.json": "5221ee89c5892b765311863c51e43415",
"version.json": "5a5686c30cf80c730d7fea5f13c167b4"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
