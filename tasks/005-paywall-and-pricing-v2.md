# 005 — Paywall ve Fiyatlandırma v2

## Task özeti

| Alan | Değer |
|---|---|
| Durum | Done |
| Öncelik | P1 |
| Hedef sürüm | v1.2 |
| Task türü | Plus / UX / Büyüme |
| Tahmini efor | M |
| Ürün katmanı | Plus |
| Bağımlılıklar | 001, 004 |
| Son güncelleme | 2026-07-27 |

## Bağlam ve problem

İlk yayın paywall’ı haftalık, yıllık ve lifetime planları telefonda yan yana gösteriyor. Bu düzen dar ekranlarda yoğun; haftalık ile yıllık toplam maliyet arasındaki çok büyük fark fiyat çıpası hissi yaratabilir. İlk App Review reddi nedeniyle satın alma şeffaflığı bu taskın değişmez guardrail’idir.

## Kullanıcı sonucu

> Bir kullanıcı olarak planlar arasındaki farkı, bugün ne ödeyeceğimi ve yenileme koşullarını kolayca anlayarak bilinçli seçim yapmak istiyorum.

## Kapsam

- [x] Haftalık plan yerine aylık plan seçeneğini ürün/finans açısından değerlendir. — Aylık €4,99; yıllık €24,99 ve lifetime €59,99 olarak kararlaştırıldı.
- [x] Yıllık planı ana, lifetime’ı ayrı ve haftalık/aylığı ikincil hiyerarşide prototiple.
- [x] Gerçek feature kataloğundan 3–4 somut fayda göster.
- [x] Lokal fiyat, dönem, hemen ücretlendirme ve otomatik yenileme CTA yakınında kalır.
- [x] Restore, Terms, Privacy ve Manage Subscription görünür.
- [x] RevenueCat offering ve App Store Connect ürün migration planı. — `lulu_plus_monthly` aynı subscription group ve `plus` entitlement altında oluşturuldu; 1.1 onayı sırasında default offering Weekly + Monthly birlikte tutuluyor.

### Kapsam dışı

- Gerçek olmayan deneme/introductory offer.
- Apple dışı ödeme sistemi.

## Önerilen UX

- Üst: bağlama göre değer mesajı; kullanıcı hangi kilitten geldiyse o fayda öne çıkar.
- Orta: yıllık ana kart, lifetime alternatif; aylık/haftalık “other options”.
- Alt: seçili planın tam ve lokal billing disclosure’ı + CTA.
- Satın alma sonrası başarı ve restore durumları.

## İş kuralları

- StoreKit/RevenueCat fiyatı tek doğruluk kaynağıdır.
- Mock fiyat yalnız preview route’da kullanılabilir.
- CTA “free trial” demez; gerçekten intro offer eklenirse StoreKit uygunluğu ile dinamikleşir.
- Lifetime açıkça abonelik olmayan tek seferlik satın alma olarak gösterilir.

## Analytics

- `paywall_viewed`: giriş noktası.
- `plan_selected`: ürün kimliği.
- `purchase_started/completed/failed/cancelled`.
- `restore_started/completed`.
- Sağlık veya pet bilgisi event’e eklenmez.

## Uygulama fazları

### Faz 1 — Fiyat ve prototip

- [x] Aylık/haftalık karar ve gelir senaryosu. — Haftalık yeni paywall'dan kaldırılıyor; aylık temel abonelik seçeneği oluyor.
- [x] iPhone/iPad prototipleri.
- [x] EN/DE copy ve App Review compliance review.

### Faz 2 — Store yapılandırması

- [x] App Store Connect ve RevenueCat offering. — Monthly ürün ve paket eklendi; Weekly paketi 1.1 geriye uyumluluğu için geçici olarak offering'de.
- [x] Eski aboneler için grandfathering/ürün görünürlüğü.
- [x] Dynamic eligibility ve localized prices.

### Faz 3 — Deney ve yayın

- [x] Feature flag/A-B varyantı gerekiyorsa server controlled.
- [x] Sandbox satın alma/restore/expired/lifetime QA.
- [x] Review screenshot ve notes güncellemesi.

## Kabul kriterleri

- [x] Kullanıcı seçili planın tutarını ve yenileme dönemini CTA yanında görüyor.
- [x] Dar ekranda plan/metin kesilmiyor.
- [x] Paywall feature listesi 001 ürün kataloğuyla aynı.
- [x] Aktif abone satın alma yerine manage flow görüyor.
- [x] App Review 3.1.2(c) gereksinimleri karşılanıyor.

## Açık sorular

- [x] Haftalık ürün tamamen satıştan kaldırılacak mı? — Evet; 1.2 yayınlandıktan sonra RevenueCat offering ve App Store satışından kaldırılacak.
- [x] Lifetime plan kalıcı mı dönemsel mi? — v1.3 için kalıcı ürün seçeneği olarak korunuyor; gelecek fiyatlandırma çalışması ayrı karar verebilir.
- [x] Paywall giriş noktasına göre başlık kişiselleştirilecek mi? — Hayır; v1.3'te tek ve tutarlı paywall başlığı korunuyor.

## Test planı

- StoreKit/RevenueCat: yeni, aktif, expired, cancelled, restore, lifetime ve eligibility senaryoları.
- App Store sandbox'ta locale bazlı fiyat, dönem ve introductory offer metinleri.
- Küçük iPhone/iPad, Dynamic Type, VoiceOver ve EN/DE paywall görünümü.
- Analytics funnel ve varyant atamasında fiyat/kişisel veri sızıntısı kontrolü.

## Definition of Done

- App Store Connect, RevenueCat ve uygulama ürün kataloğu aynı.
- Satın alma/restore/manage ve eski abone geçiş testleri tamamlandı.
- Review screenshot/notları güncellendi ve compliance kontrolü yapıldı.
- Feature flag, analytics dashboard ve rollback planı hazır.
