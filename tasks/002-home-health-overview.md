# 002 — Home Bilgi Mimarisi ve Health Overview

## Task özeti

| Alan | Değer |
|---|---|
| Durum | Done |
| Öncelik | P0 |
| Hedef sürüm | v1.2 |
| Task türü | Ürün / UX |
| Tahmini efor | L |
| Ürün katmanı | Her ikisi |
| Bağımlılıklar | 001 |
| Son güncelleme | 2026-07-27 |

## Bağlam ve problem

Home bugün birçok faydalı kartı art arda gösteriyor: greeting, pet, check-in, reminder katılımı, setup guide, quick actions, trend, kilo, overdue ve upcoming. Bu yapı özellikle küçük ekran ve yeni kullanıcıda birincil aksiyonu belirsizleştirebilir. Home’un amacı “bugün ne yapmalıyım ve pet’imde ne değişti?” sorusunu ilk bakışta yanıtlamak olmalıdır.

## Kullanıcı sonucu

> Bir kullanıcı olarak uygulamayı açtığımda bugünkü bakım görevlerini, pet’imin mevcut durumunu ve dikkat etmem gereken değişiklikleri birkaç saniyede görmek istiyorum.

## Başarı ölçütleri

- Home açılışı → ilk anlamlı aksiyon süresi azalır.
- Check-in ve overdue reminder tamamlama oranı artar.
- Scroll derinliği ve kart etkileşimi ile gereksiz bölümler tespit edilir.

## Hedef hiyerarşi

1. **Today:** check-in, geciken ve bugünkü görevler.
2. **Health Overview:** son durum, kilo ve önemli değişiklik.
3. **Recent & Upcoming:** son kayıtlar ve yaklaşan bakım.
4. İkincil işlemler: rapor, kayıt arama, ayarlar.

## Kapsam

### Dahil

- [x] Mevcut Home kartlarını kullanıcı ihtiyacına göre grupla.
- [x] `Today` bölümünde tek, güçlü bir sonraki aksiyon üret.
- [x] Trend ve kilo alanlarını `Health Overview` altında birleştir.
- [x] Setup guide’ı yalnızca tamamlanmamış maddelerde ve geçici göster.
- [x] Yeni kullanıcı, veri birikmiş kullanıcı, memorial pet ve shared pet varyantları.
- [x] iPad’de tek uzun sütun yerine uygun iki kolon düzenini değerlendir.

### Kapsam dışı

- Yeni sağlık insight algoritmaları; Task 010.
- Tab bar değişimi; Task 003.

## UX akışı

- Kullanıcı Home’u açar.
- Üst bölüm pet adı, gün ve bugünkü bakım durumunu gösterir.
- Birincil CTA en yüksek öncelikli işi açar: overdue ilaç > overdue reminder > check-in > upcoming.
- Health Overview, “normal”, “takip et” veya “yeterli veri yok” durumunu açıklanabilir biçimde gösterir.
- Kullanıcı detay için Timeline/Records/Reminders’a gider.

## Durumlar

- Yeni pet ve veri yok: üç adımlı başlangıç rehberi.
- Bugün her şey tamam: sakin başarı durumu, gereksiz CTA yok.
- Offline: son senkronize veriler ve local aksiyonlar çalışır.
- Memorial pet: görev yerine geçmiş ve anma içeriği.
- Shared pet: rol izinlerine uygun CTA.

## Teknik taslak

- `components/dashboard/DashboardScreen.tsx` yalnız orchestration yapmalı.
- Yeni bölümler: `TodayCareSection`, `HealthOverviewCard`, `RecentActivitySection`.
- Öncelik motoru saf fonksiyon olmalı: `utils/dashboard/build-next-care-action.ts`.
- Mevcut `TrendsSection`, `WeightSection`, reminder listeleri yeniden kullanılmalı.
- iPad düzeni `useWindowDimensions` ile breakpoint üzerinden kurulmalı.

## Analytics

- `home_viewed` — kullanıcı segmenti: new/active/memorial/shared.
- `home_primary_action_tapped` — yalnız action türü.
- `health_overview_opened`.
- `setup_guide_completed`.

## Uygulama fazları

### Faz 1 — IA ve prototip

- [x] Kart envanteri.
- [x] iPhone/iPad bilgi mimarisi ve responsive yerleşim.
- [x] Birincil aksiyon öncelik kuralları.

### Faz 2 — Bileşenler

- [x] Today ve Health Overview.
- [x] Yeni/boş/memorial/shared durumlar.
- [x] Geçiş animasyonları ve haptics.

### Faz 3 — QA ve ölçüm

- [x] Öncelik motoru unit testi.
- [x] Dynamic Type ve gerçek iPad portrait.
- [x] iPad landscape manuel doğrulaması. — v1.3 yayın turunda sorun görülmedi.
- [x] Ortam değişkeni tabanlı geri dönüşlü feature flag.
- [x] Analytics sağlayıcısı, event gönderimi ve dashboard. — Ürün kararıyla sonraki sürüme ertelendi; bu taskın yayın kapsamından çıkarıldı.

## Kabul kriterleri

- [x] İlk viewport’ta pet, bakım durumu ve birincil aksiyon görünür.
- [x] Aynı bilgi birden fazla kartta tekrarlanmıyor.
- [x] Setup guide tamamlanınca kalıcı yer kaplamıyor.
- [x] Bütün mevcut Home işlevleri erişilebilir kalıyor.
- [x] Health Overview, Free/Plus hakkında desteklenmeyen bir fayda iddiası göstermiyor.

## Kararlar

- Health Overview tek kart olarak kalır; hızlı tarama için carousel kullanılmaz.
- Geciken ilaç ve diğer geciken hatırlatmalar check-in’den yüksek önceliklidir.
- Son aktivite bu fazda Home’da kalır; Care Hub’a taşıma Task 003 kapsamında yeniden değerlendirilir.
- Aktif Home sırası `Today → Health Overview → Quick Actions → diğer yaklaşan reminder'lar → Recent Records` olur.
- Tamamlanmamış Setup Guide, Today ile Health Overview arasına girer; memorial pet'te gösterilmez.
- Today'de bir yaklaşan reminder öne çıkarılmışsa aynı reminder alt listede tekrarlanmaz.
- Ayrıntılı Trends ve Weight kartları yeni Home'da tekrarlanmaz; feature flag ile eski Home'a dönüldüğünde korunur.

## Test planı

- Unit test: öncelik motoru, boş/yeni/memorial/shared durum seçimi.
- Görsel test: küçük iPhone, Pro Max, iPad portrait/landscape ve EN/DE metinleri.
- Manuel test: cold start, offline, görev tamamlama, pet değiştirme, Dynamic Type ve VoiceOver.
- Analytics doğrulaması: kart görünümü ve CTA event'lerinde pet/sağlık içeriği taşınmaması.

## Definition of Done

- Kabul kriterleri ve cihaz matrisi tamamlandı.
- Eski Home işlevleri için regresyon testi geçti.
- Analytics dashboard ve feature flag hazır.
- EN/DE, erişilebilirlik ve iPad QA onaylandı.
