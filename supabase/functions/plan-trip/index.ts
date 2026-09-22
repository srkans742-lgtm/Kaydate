import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"};
Deno.serve(async (req)=>{
 if(req.method==="OPTIONS") return new Response("ok",{headers:cors});
 try{
  const body=await req.json(); const places=body.places||[]; const request=body.request||"";
  const key=Deno.env.get("OPENAI_API_KEY");
  if(!key) return new Response(JSON.stringify({fallback:places.slice(0,5),error:"AI yapılandırılmadı"}),{headers:{...cors,"Content-Type":"application/json"}});
  const payload={model:"gpt-5.6",input:[{role:"system",content:"You are KayDate trip planner. Answer in Turkish. Use only supplied places. Never invent prices, hours, addresses or availability."},{role:"user",content:"İstek: "+request+"\nKaydedilen yerler: "+JSON.stringify(places)}]};
  const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify(payload)});
  const d=await r.json(); return new Response(JSON.stringify({text:d.output_text||"Plan oluşturulamadı."}),{headers:{...cors,"Content-Type":"application/json"}});
 }catch(e){return new Response(JSON.stringify({error:String(e)}),{status:500,headers:{...cors,"Content-Type":"application/json"}})}
});