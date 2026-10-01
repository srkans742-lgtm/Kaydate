const CACHE="kaydate-v8-auth";
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(["./","./index.html","./manifest.webmanifest","./share-target.html"])).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("message",e=>{if(e.data?.type==="NEAR_PLACE"){e.waitUntil(self.registration.showNotification(e.data.title||"KayDate", {body:e.data.body||"Kaydettiğin bir yere yaklaştın.",icon:"./icon-192.png",badge:"./icon-192.png",data:{url:e.data.url||"./"}}));}});
self.addEventListener("notificationclick",e=>{e.notification.close();e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(cs=>{const c=cs[0];if(c){c.focus();if(e.notification.data?.url)c.navigate(e.notification.data.url);}else if(self.clients.openWindow)e.waitUntil(self.clients.openWindow(e.notification.data?.url||"./"));}));});
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