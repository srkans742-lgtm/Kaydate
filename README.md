# KayDate

KayDate — Keşfet. Kaydet. Planla. Git.

Canlı: https://srkans742-lgtm.github.io/Kaydate/

## Mimari
- GitHub Pages + PWA
- Supabase Auth/Postgres
- Supabase Edge Functions
- Foursquare gerçek mekân verisi
- Google Maps yönlendirmesi
- PWA Share Target
- AI gezi planlama Edge Function

## Copilot 2.0
1. Sosyal medyadan Paylaş → KayDate akışını sağlamlaştır
2. Tek dosya JavaScript mimarisini modüllere ayır
3. Gerçek interaktif harita
4. Kullanıcı ve bulut senkronizasyonunu tamamla
5. AI gezi planlayıcıyı arayüze bağla
6. Listeler ve sosyal özellikler
7. Android/iOS paketleme

## Son teknik düzeltmeler
- PWA paylaşım hedefi için share-target.html eklendi.
- localStorage ile window.places arasındaki state senkronizasyonu düzeltildi.
- Kategori filtrelerinin arama ile birlikte çalışması düzeltildi.

## Güvenlik
Supabase publishable key istemci tarafında kullanılabilir. Secret anahtarlar yalnızca Edge Function secrets içinde tutulmalıdır. Foursquare ve OpenAI secret'ları frontend'e yazılmamalıdır.
