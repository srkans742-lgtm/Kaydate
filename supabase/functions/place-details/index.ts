import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors={
  "Access-Control-Allow-Origin":"*",
  "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"
};
const headers=(key:string)=>({
  "Authorization":"Bearer "+key,
  "X-Places-Api-Version":"2025-06-17",
  "Accept":"application/json"
});

Deno.serve(async(req)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
  try{
    const {fsq_id}=await req.json();
    const id=String(fsq_id||"").trim();
    const key=Deno.env.get("FOURSQUARE_API_KEY");
    if(!id)return new Response(JSON.stringify({error:"fsq_id gerekli"}),{status:400,headers:{...cors,"Content-Type":"application/json"}});
    if(!key)return new Response(JSON.stringify({error:"FOURSQUARE_API_KEY secret eksik"}),{status:503,headers:{...cors,"Content-Type":"application/json"}});
    const h=headers(key);
    const [placeRes,photoRes]=await Promise.all([
      fetch("https://places-api.foursquare.com/places/"+encodeURIComponent(id)+"?fields=fsq_id,name,categories,location,geocodes,website,tel,rating,price,hours,description,features,social_media",{headers:h}),
      fetch("https://places-api.foursquare.com/places/"+encodeURIComponent(id)+"/photos?limit=8&sort=POPULAR",{headers:h})
    ]);
    const place=await placeRes.json();
    const photos=photoRes.ok?await photoRes.json():[];
    if(!placeRes.ok)return new Response(JSON.stringify({error:place?.message||"Mekan bulunamadı"}),{status:placeRes.status,headers:{...cors,"Content-Type":"application/json"}});
    const photoList=(photos||[]).map((p:any)=>({
      id:p.id||p.fsq_photo_id||null,
      url:p.prefix&&p.suffix?p.prefix+"width800"+p.suffix:null,
      width:p.width||null,height:p.height||null
    })).filter((p:any)=>p.url);
    return new Response(JSON.stringify({place,photos:photoList}),{headers:{...cors,"Content-Type":"application/json"}});
  }catch(e){
    return new Response(JSON.stringify({error:String(e)}),{status:500,headers:{...cors,"Content-Type":"application/json"}});
  }
});