const CACHE = "myfit-v2";
const STATIC = ["./","./index.html","./styles.css","./manifest.json","./icons/icon-192.png","./icons/icon-512.png"];
self.addEventListener("install", e => {e.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC))); self.skipWaiting();});
self.addEventListener("activate", e => {e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))); self.clients.claim();});
self.addEventListener("fetch", e => {
  if(e.request.method!=="GET") return;
  const url=new URL(e.request.url);
  if(url.origin===location.origin){
    e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});return r;}).catch(()=>caches.match(e.request)));
  }
});
