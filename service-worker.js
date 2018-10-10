// Copyright 2016 Google Inc.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var dataCacheName = 'weatherData-v1';
var cacheName = 'weatherPWA-final-1';
var filesToCache = [
  '/puzzle/',
  '/puzzle/manifest.json',
  '/puzzle/index.html',
  '/puzzle/scripts/app.js',
  '/puzzle/scripts/papp.js',
  '/puzzle/scripts/runtime.js',
  '/puzzle/scripts/poly.js',
  '/puzzle/styles/inline.css',
  '/puzzle/images/clear.png',
  '/puzzle/images/cloudy-scattered-showers.png',
  '/puzzle/images/cloudy.png',
  '/puzzle/images/fog.png',
  '/puzzle/images/ic_add_white_24px.svg',
  '/puzzle/images/ic_refresh_white_24px.svg',
  '/puzzle/images/partly-cloudy.png',
  '/puzzle/images/rain.png',
  '/puzzle/images/scattered-showers.png',
  '/puzzle/images/sleet.png',
  '/puzzle/images/snow.png',
  '/puzzle/images/thunderstorm.png',
  '/puzzle/images/wind.png',
  '/puzzle/images/models/board.gltf',
  '/puzzle/images/models/peace_1.gltf',
  '/puzzle/images/models/peace_2.gltf',
  '/puzzle/images/models/peace_3.gltf',
  '/puzzle/images/models/peace_4.gltf',
  '/puzzle/images/models/peace_5.gltf',
  '/puzzle/images/models/peace_6.gltf',
  '/puzzle/images/models/peace_7.gltf',
  '/puzzle/images/models/peace_8.gltf',
  '/puzzle/images/models/peace_9.gltf',
  '/puzzle/images/models/peace_10.gltf',
  '/puzzle/images/models/peace_11.gltf',
  '/puzzle/images/models/peace_12.gltf',
  '/puzzle/images/models/peace_13.gltf',
  '/puzzle/images/models/board.bin',
  '/puzzle/images/models/peace_1.bin',
  '/puzzle/images/models/peace_2.bin',
  '/puzzle/images/models/peace_3.bin',
  '/puzzle/images/models/peace_4.bin',
  '/puzzle/images/models/peace_5.bin',
  '/puzzle/images/models/peace_6.bin',
  '/puzzle/images/models/peace_7.bin',
  '/puzzle/images/models/peace_8.bin',
  '/puzzle/images/models/peace_9.bin',
  '/puzzle/images/models/peace_10.bin',
  '/puzzle/images/models/peace_11.bin',
  '/puzzle/images/models/peace_12.bin',
  '/puzzle/images/models/peace_13.bin'
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName && key !== dataCacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  /*
   * Fixes a corner case in which the app wasn't returning the latest data.
   * You can reproduce the corner case by commenting out the line below and
   * then doing the following steps: 1) load app for first time so that the
   * initial New York City data is shown 2) press the refresh button on the
   * app 3) go offline 4) reload the app. You expect to see the newer NYC
   * data, but you actually see the initial data. This happens because the
   * service worker is not yet activated. The code below essentially lets
   * you activate the service worker faster.
   */
  return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  console.log('[Service Worker] Fetch', e.request.url);
  var dataUrl = 'https://query.yahooapis.com/v1/public/yql';
  if (e.request.url.indexOf(dataUrl) > -1) {
    /*
     * When the request URL contains dataUrl, the app is asking for fresh
     * weather data. In this case, the service worker always goes to the
     * network and then caches the response. This is called the "Cache then
     * network" strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-then-network
     */
    e.respondWith(
      caches.open(dataCacheName).then(function(cache) {
        return fetch(e.request).then(function(response){
          cache.put(e.request.url, response.clone());
          return response;
        });
      })
    );
  } else {
    /*
     * The app is asking for app shell files. In this scenario the app uses the
     * "Cache, falling back to the network" offline strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
     */
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  }
});
