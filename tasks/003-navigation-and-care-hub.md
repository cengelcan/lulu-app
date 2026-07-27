# 003 — Navigasyon ve Care Hub

## Task özeti

| Alan | Değer |
|---|---|
| Durum | Done |
| Öncelik | P1 |
| Hedef sürüm | v1.2 |
| Task türü | Ürün / UX / Navigasyon |
| Tahmini efor | L |
| Ürün katmanı | Her ikisi |
| Bağımlılıklar | 002 |
| Son güncelleme | 2026-07-27 |

## Bağlam ve problem

Family ana tab bar’da sürekli yer tutuyor; Free kullanıcı için bu alan çoğunlukla upsell ekranı. Records ve Reminders gibi daha sık kullanılan işler ise Home quick action arkasında. Navigasyon günlük bakım döngüsünü temsil etmeli, yalnızca mevcut feature gruplarını değil.

## Kullanıcı sonucu

> Bir kullanıcı olarak kayıtları, görevleri ve aile bakım aktivitesini tek bir anlaşılır bakım merkezinden yönetmek istiyorum.

## Önerilen bilgi mimarisi

- **Home:** bugün ve sağlık özeti.
- **Care:** timeline, reminders, records ve aile aktivitesi.
- **Check-In:** hızlı merkezi aksiyon veya Home içi güçlü CTA; prototiple karar verilir.
- **Pets:** aktif pet seçimi ve profiller.
- **Profile:** hesap, Plus, Family yönetimi, settings.

## Kapsam

- [x] Mevcut tab ve route kullanımını analytics ile ölç. — Analytics, gizlilik beyanı güncellenecek sonraki sürüme ertelendi ve bu taskın yayın kapsamından çıkarıldı.
- [x] Family’yi Profile altında yönetim, Care içinde aktivite olarak konumlandır.
- [x] Timeline/Records/Reminders için ortak Care Hub tasarla.
- [x] Deep link, notification ve back-stack davranışlarını koru.
- [x] Owner/member/free/plus navigasyon varyantlarını tanımla.

### Kapsam dışı

- Family activity backend; Task 007.
- Yeni kayıt türleri.

## Care Hub bölümleri

- Today/Overdue
- Timeline
- Records
- Reminders
- Family activity — yalnız veri varsa veya Plus tanıtımı bağlama uygunsa

Kilitli bir özellik tab bar’ın tamamını upsell’e çevirmemeli. Upsell, kullanıcının niyet gösterdiği feature yüzeyinde görünmelidir.

## Teknik taslak

- `app/(tabs)/_layout.tsx` ve ilgili route grupları.
- Expo Router deep link mapping korunur.
- Bildirim hedefleri eski route’tan yeni route’a backward-compatible yönlendirilir.
- Navigation migration testleri eklenir.
- Tab state pet değişiminde doğru yenilenir.

## Uygulama fazları

### Faz 1 — Araştırma ve prototip

- [x] Tab kullanım event’lerini değerlendir. — Analytics çalışmasıyla birlikte sonraki sürüme ertelendi.
- [x] İki alternatif prototip: 4 tab ve 5 tab. — 4 tab; Check-In Home/Care CTA olarak seçildi.
- [x] Free/Plus/member görev testleri. — Rol matrisi unit testleri eklendi; manuel hesap turu yayın QA’sında tekrarlanacak.

### Faz 2 — Route migration

- [x] Care Hub route ve bileşenleri.
- [x] Eski linkler için backward-compatible route erişimi.
- [x] Family yönetimini Profile’a taşı.

### Faz 3 — QA

- [x] Push/deep link matrisi. — Güvenli notification route allowlist’i ve legacy Family eşlemesi testlerle sabitlendi.
- [x] Back davranışı, cold start ve auth sonrası redirect. — Join intent auth durumuna göre ayrıldı ve yinelenen URL işleme engellendi; manuel notification tap turu yayın QA’sında tekrarlanacak.
- [x] VoiceOver tab sırası ve label’lar. — Ana tab sırası tek kaynaktan tanımlandı; açık erişilebilirlik label’ları, Care başlık rolleri, aksiyon hint’leri ve yükleme duyuruları eklendi. Sıra unit test ile sabitlendi; manuel VoiceOver turu yayın QA’sında tekrarlanacak.

## Kabul kriterleri

- [x] En sık üç bakım işi en fazla bir tap uzakta.
- [x] Free kullanıcı ana tab’da salt upsell ekranıyla karşılaşmıyor.
- [x] Mevcut deep link ve bildirimler bozulmuyor.
- [x] Family owner/member yetkileri doğru route’larda korunuyor.

## Açık sorular

- [x] Check-In ayrı tab mı, Home CTA mı? — Home ve Care CTA.
- [x] Care Hub varsayılan görünümü Today mi Timeline mı? — Bakım araçları + birleşik timeline.
- [x] iPad’de sidebar navigasyon kullanılacak mı? — Mevcut navigasyon v1.3 için korunuyor; yayın turunda sorun görülmedi.

## Test planı

- Route unit testleri ve eski/yeni deep link eşleme matrisi.
- Bildirimden cold/warm start, auth redirect ve back davranışı.
- Owner/member/free/Plus rolleriyle bütün tab ve Care Hub bölümleri.
- iPhone/iPad, VoiceOver tab sırası ve EN/DE uzun başlık testi.

## Definition of Done

- Navigasyon kararı kullanıcı testiyle belgelenip uygulanmış durumda.
- Eski deep link ve bildirim girişleri geriye uyumlu.
- Yetki/regresyon testleri ve analytics doğrulaması tamamlandı.
- EN/DE, erişilebilirlik ve iPad QA onaylandı.
