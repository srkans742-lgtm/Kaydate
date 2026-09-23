const CACHE="kaydate-v5";
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(["./","./index.html","./manifest.webmanifest"])).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>{
 const u=new URL(e.request.url);
 if(e.request.method==="POST"&&u.pathname.endsWith("/share-target.html")){
  e.respondWith((async()=>{
   const data=await e.request.formData(),p=new URLSearchParams();
   for(const k of ["title","text","url"]){const v=data.get(k);if(v)p.set(k,String(v));}
   return Response.redirect(u.origin+u.pathname.replace("share-target.html","index.html")+"?"+p.toString(),303);
  })());
  return;
 }
 e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return res}).catch(()=>caches.match("./index.html"))));
});