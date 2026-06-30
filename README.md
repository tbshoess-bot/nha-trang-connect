# Sri Lanka Connect — MVP

Sri Lanka'da turist, backpacker ve expat'ları aynı platformda buluşturan topluluk uygulaması.
İki tip içerik: **etkinlik** (buluşma oluşturma, katılma) ve **soru** (yerel bilgi sorma/cevaplama).

## Kurulum (Claude Code'da çalıştırırken bu adımları takip et)

1. **Supabase projesi oluştur** → https://supabase.com (ücretsiz plan yeterli)
2. Supabase panelinde **SQL Editor**'a girip `supabase/schema.sql` dosyasının içeriğini çalıştır.
3. Supabase panelinde **Project Settings → API**'den `Project URL` ve `anon public` key'i kopyala.
4. `.env.example` dosyasını `.env.local` olarak kopyala ve değerleri yapıştır:
   ```
   cp .env.example .env.local
   ```
5. Bağımlılıkları kur ve sunucuyu başlat:
   ```
   npm install
   npm run dev
   ```
6. http://localhost:3000 adresinde uygulamayı görürsün.

## Yapı

- `app/page.tsx` — ana akış (feed), tüm etkinlik ve soruları listeler
- `app/login/page.tsx` — email magic link ile giriş
- `app/profile/setup/page.tsx` — ilk girişte profil oluşturma
- `app/post/new/page.tsx` — yeni etkinlik veya soru oluşturma
- `app/post/[id]/page.tsx` — detay sayfası: etkinlikse katılma, soruysa cevap yazma
- `supabase/schema.sql` — veritabanı şeması (profiller, postlar, katılımcılar, cevaplar)
- `lib/types.ts` — TypeScript tipleri, schema ile birebir eşleşir

## Bilinçli olarak MVP'de OLMAYANLAR

Bunlar ilk kullanıcı geri bildirimine göre eklenecek:
- Özel mesajlaşma
- Bildirimler
- Arama / filtreleme
- Ödeme (etkinlik bileti, öne çıkan ilan vb.)
- Fotoğraf yükleme
- Yorum/puanlama sistemi

## Sıradaki adımlar için Claude Code'a verebileceğin komutlar

- "Feed'e kategori filtresi ekle"
- "Profil sayfasına kullanıcının kendi paylaşımlarını gösteren bir sekme ekle"
- "Etkinliklere fotoğraf yükleme özelliği ekle (Supabase Storage kullan)"
- "Stripe ile ödeme alma özelliği ekle, etkinliklere ücretli bilet seçeneği koy"

Her birinde Claude Code mevcut veri modelini ve ekranları görüp ona göre entegre eder —
sıfırdan başlamana gerek yok.

## Deploy

En hızlı yol: [Vercel](https://vercel.com) — GitHub reponu bağla, environment variable'ları
(`.env.local` içindekiler) Vercel panelinden ekle, otomatik deploy olur.
