import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors={
  "Access-Control-Allow-Origin":"*",
  "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"
};

const categoryTerms:any={
  restoran:"restaurant", restaurant:"restaurant", kafe:"coffee", cafe:"coffee",
  otel:"hotel", gezi:"attraction", doğa:"park", doga:"park", plaj:"beach",
  alışveriş:"shopping", alisveris:"shopping"
};

const cityNames=[
  "Adana","Adıyaman","Afyonkarahisar","Ağrı","Aksaray","Amasya","Ankara","Antalya","Ardahan","Artvin",
  "Aydın","Balıkesir","Bartın","Batman","Bayburt","Bilecik","Bingöl","Bitlis","Bolu","Burdur","Bursa",
  "Çanakkale","Çankırı","Çorum","Denizli","Diyarbakır","Düzce","Edirne","Elazığ","Erzincan","Erzurum",
  "Eskişehir","Gaziantep","Giresun","Gümüşhane","Hakkari","Hatay","Iğdır","Isparta","İstanbul","İzmir",
  "Kahramanmaraş","Karabük","Karaman","Kars","Kastamonu","Kayseri","Kilis","Kırıkkale","Kırklareli",
  "Kırşehir","Kocaeli","Konya","Kütahya","Malatya","Manisa","Mardin","Mersin","Muğla","Muş","Nevşehir",
  "Niğde","Ordu","Osmaniye","Rize","Sakarya","Samsun","Siirt","Sinop","Sivas","Şanlıurfa","Şırnak",
  "Tekirdağ","Tokat","Trabzon","Tunceli","Uşak","Van","Yalova","Yozgat","Zonguldak"
];

function normalize(s:string){return s.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g,"");}
function detectCity(q:string){const n=normalize(q);return cityNames.find(c=>n.includes(normalize(c)))||"";}
function cleanQuery(q:string,city:string){if(!city)return q;return q.replace(new RegExp(city,"ig")," ").replace(/\s+/g," ").trim();}

function out(p:any){
  return {
    provider:"foursquare", external_id:p.fsq_id, name:p.name||"",
    category:(p.categories?.[0]?.name||"").toString(),
    address:p.location?.formatted_address||p.location?.address||"",
    city:p.location?.locality||"",
    latitude:p.geocodes?.main?.latitude??null, longitude:p.geocodes?.main?.longitude??null,
    website:p.website||null, phone:p.tel||null, rating:p.rating??null,
    price:p.price??null, open_now:p.hours?.open_now??null
  };
}

Deno.serve(async(req)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
  try{
    const body=await req.json();
    const rawQuery=String(body?.query||"").trim();
    const lat=body?.lat, lng=body?.lng;
    const radius=Math.min(Number(body?.radius)||25000,100000);
    const category=String(body?.category||"").trim().toLocaleLowerCase("tr-TR");
    const requestedNear=String(body?.near||"").trim();
    const key=Deno.env.get("FOURSQUARE_API_KEY");
    if(!key)return new Response(JSON.stringify({error:"FOURSQUARE_API_KEY secret eksik",places:[]}),{status:503,headers:{...cors,"Content-Type":"application/json"}});

    const city=detectCity(rawQuery);
    const near=requestedNear||city;
    const baseQuery=cleanQuery(rawQuery,city);
    const term=categoryTerms[category]||"";
    const query=[baseQuery,term].filter(Boolean).join(" ").trim();

    const base=new URLSearchParams();
    if(query)base.set("query",query);
    if(near)base.set("near",near+", Türkiye");
    else if(lat!=null&&lng!=null){base.set("ll",lat+","+lng);base.set("radius",String(radius));}
    else base.set("near","Turkey");
    base.set("limit","50");

    const headers={"Authorization":"Bearer "+key,"X-Places-Api-Version":"2025-06-17","Accept":"application/json"};
    const responses=await Promise.all(["RELEVANCE","POPULARITY"].map(async sort=>{
      const params=new URLSearchParams(base); params.set("sort",sort);
      const r=await fetch("https://places-api.foursquare.com/places/search?"+params,{headers});
      const d=await r.json();
      if(!r.ok)throw new Error(d?.message||("Places provider error ("+r.status+")"));
      return d.results||[];
    }));

    const seen=new Set<string>(); const places:any[]=[];
    for(const list of responses)for(const p of list){
      const id=p.fsq_id||((p.name||"")+"|"+(p.location?.formatted_address||""));
      if(seen.has(id))continue; seen.add(id); places.push(out(p));
    }

    return new Response(JSON.stringify({places:places.slice(0,100),provider:"foursquare",meta:{query:rawQuery,near:near||null,city:city||null,count:places.length}}),{headers:{...cors,"Content-Type":"application/json"}});
  }catch(e){
    return new Response(JSON.stringify({error:String(e),places:[]}),{status:500,headers:{...cors,"Content-Type":"application/json"}});
  }
});