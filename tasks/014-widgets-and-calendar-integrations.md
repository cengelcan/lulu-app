# 014 — Widget, Takvim ve Hızlı Aksiyon Entegrasyonları

| Alan | Değer |
|---|---|
| Durum | Backlog |
| Öncelik | P2 |
| Hedef sürüm | v1.8 |
| Tür | Platform entegrasyonu |
| Efor | XL |
| Paket | Free + Plus |
| Bağımlılıklar | 002, 003, 004, 006, 012 |
| Son güncelleme | 2026-07-15 |

## Bağlam ve problem

Günlük bakım görevlerinin değeri, kullanıcı uygulamayı açmayı hatırladığında ortaya çıkıyor. Yaklaşan ilaç, check-in ve randevuların ana ekran/kilit ekranı ve sistem takviminde görünmesi; kritik eylemlere daha hızlı ulaşılmasını sağlar.

## Kullanıcı sonucu

Kullanıcı bugün yapılacakları uygulamayı açmadan görür, doğru pet'e ait göreve tek dokunuşla gider ve seçtiği bakım olaylarını cihaz takvimine güvenle aktarır.

## Başarı metrikleri

- Aktif kullanıcıların en az %15'inin bir widget eklemesi.
- Widget deep link'lerinin %99 üzerinde doğru hedefe açılması.
- Widget kullananlarda zamanında görev tamamlama oranında en az %10 artış.
- Takvim senkronizasyonunda yinelenen etkinlik oranının %1 altında olması.

## Kapsam

- iOS Home Screen küçük/orta “Today” widget'ı.
- Uygun sistemlerde Lock Screen yaklaşan görev widget'ı.
- Kullanıcının pet ve gösterilecek içerik türünü seçebilmesi.
- Yaklaşan ilaç, reminder, check-in ve randevu özeti.
- Widget'tan ilgili uygulama ekranına güvenli deep link.
- Seçilen bakım olaylarını sistem takvimine tek seferlik dışa aktarma.
- Kullanıcı onaylı sürekli takvim senkronizasyonu; güncelleme ve silme eşlemesi.
- App Intent/Shortcut ile “Check-in başlat” ve “Bugünün bakımını göster” hızlı aksiyonları için altyapı araştırması.

## Kapsam dışı

- İlk sürümde watchOS uygulaması.
- Widget üzerinden hassas sağlık notu veya tanı detayları.
- Kullanıcı izni olmadan takvime otomatik yazma.
- Android widget kapsamı ayrı değerlendirilmeden iOS uygulamasına birebir bağlanmaz.

## UX ve durumlar

- Veri yok: son senkron zamanı ve uygulamayı açma aksiyonu.
- Birden fazla pet: kullanıcı seçimi veya sade toplam görünüm.
- Kilit ekranı: isim/sağlık içeriği için gizlilik seviyesi seçimi.
- Geciken görev: alarmist olmayan ama belirgin durum.
- Takvim izni reddedildi: ayarlara yönlendirme ve `.ics` paylaşım alternatifi.
- Oturum/pet erişimi kaybedildi: hassas içeriği hemen kaldıran güvenli placeholder.

## İş kuralları

- Widget içeriği minimum veriyle bir App Group/shared container üzerinden sağlanmalı.
- Lock Screen'de varsayılan görünüm pet adı ve sağlık ayrıntısını gizlemeli.
- Her widget öğesi kararlı bir route ve erişim kontrolü taşımalı.
- Takvim olayları kararlı external identifier ile eşleşmeli; tekrar senkronizasyon çift etkinlik üretmemeli.
- Uygulamada silinen/ertelenen olayın takvim davranışı kullanıcı tercihine ve kayıtlı eşlemeye göre yürütülmeli.
- Zaman dilimi ve daylight-saving değişiklikleri yerel duvar saati tercihini bozmamalı.

## Free / Plus ayrımı

| Free | Plus |
|---|---|
| Tek pet için temel Today widget'ı | Çoklu pet, aile özeti ve özelleştirilebilir widget'lar |
| Tek seferlik takvime ekleme | Sürekli çift yönlü durum eşleme/senkronizasyon |
| Temel uygulama deep link'i | İlaç, bakım planı ve akıllı özet hızlı aksiyonları |

## Teknik yaklaşım ve dosyalar

- Expo managed yapı içinde WidgetKit/App Intents gereksinimleri için config plugin veya ayrı native target araştırması.
- EAS production/dev build süreçlerinde extension signing, App Group ve provisioning doğrulaması.
- Shared snapshot sözleşmesi: yalnızca widget için gerekli, kullanıcı tarafından seçilmiş alanlar.
- Deep link route sözleşmesi ve yetki kontrolü uygulama açılışında yeniden yapılmalı.
- EventKit izinleri ve takvim eşleme tablosu.
- Uygulama hedefi ve extension arasında sürüm uyumluluğu belgelenmeli.

## Veri modeli ve servisler

- `calendar_sync_preferences`: household/user, içerik türleri, takvim kimliği ve durum.
- `calendar_event_links`: kaynak kayıt, platform event identifier, son senkron sürümü.
- Widget snapshot yerel ve kısa ömürlü; sunucu sağlık kaydının kopyası olmamalı.
- Timeline reload yalnızca ilgili veri değişimlerinde ve sistem limitlerine saygılı yapılmalı.

## Gizlilik ve sağlık sınırları

- Widget konfigürasyonunda kilit ekranında görünecek örnek veri açıkça gösterilmeli.
- Hassas sağlık ayrıntıları varsayılan olarak widget/takvim başlığına yazılmamalı.
- Paylaşılan cihaz ve aile takvimi riski takvim izni öncesinde açıklanmalı.
- Çıkış yapıldığında veya erişim kaldırıldığında shared snapshot temizlenmeli.

## i18n ve erişilebilirlik

- Widget metinleri dar alan ve farklı diller için ayrı kısa varyantlara sahip olmalı.
- VoiceOver etiketleri pet, görev ve zamanı anlamlı sırada okumalı.
- Sadece renkle durum anlatılmamalı.
- 12/24 saat ve locale tarih biçimleri sistem tercihinden gelmeli.

## Analytics

- `widget_configured` — içerik detayı olmadan boyut/tür.
- `widget_deep_link_opened`
- `widget_snapshot_stale_detected`
- `calendar_export_started`
- `calendar_sync_enabled`
- `calendar_sync_error` — sağlık içeriği olmadan hata sınıfı.

## Uygulama aşamaları

1. Native target/config plugin ve signing proof-of-concept.
2. Shared snapshot ve deep link sözleşmesi.
3. Home Screen widget; gizlilik ve stale durumları.
4. EventKit tek seferlik ekleme ve kararlı eşleme.
5. Sürekli senkronizasyon, Lock Screen ve App Intent değerlendirmesi.

## Kabul kriterleri

- Widget seçilen pet ve görevleri doğru locale/saat diliminde gösterir.
- Deep link doğru ekrana gider; erişim yoksa veri göstermeden güvenli fallback açar.
- Çıkış veya üyelik kaldırma sonrası widget hassas içeriği temizler.
- Aynı olay tekrar senkronize edildiğinde çift takvim etkinliği oluşmaz.
- Takvim izni reddedildiğinde uygulama kullanılabilir kalır.
- Widget extension production signing ile TestFlight build'inde çalışır.

## Test planı

- Otomatik: snapshot üretimi, deep link çözümleme, event eşleme/idempotency ve saat dilimi.
- Manuel: küçük/orta/Lock Screen widget, gizli bildirim ayarları, çoklu pet, çıkış, stale data ve takvim izni.
- Build: dev, ad hoc/TestFlight ve production provisioning; temiz kurulum ve yükseltme.
- Erişilebilirlik: VoiceOver, büyük metin, yüksek kontrast ve Reduce Motion.

## Rollout ve geri dönüş

- İlk olarak Home Screen widget ve tek seferlik takvim ekleme yayınlanmalı.
- Sürekli senkronizasyon uzaktan açılmalı; sorun halinde eşlemeler korunarak yeni sync durdurulabilmeli.
- Extension ana uygulamadan bağımsız çökme ve stale snapshot metrikleriyle izlenmeli.

## Açık sorular

- İlk sürümde Lock Screen widget mahremiyet riski nedeniyle ertelenmeli mi?
- Takvim senkronizasyonu tek yönlü mü kalmalı, kullanıcı takvimde değiştirince uygulamaya yansıtılmalı mı?
- Android karşılığı aynı roadmap içinde mi, ayrı task olarak mı planlanmalı?

## Definition of Done

- Native extension/build süreci CI/EAS üzerinde belgeli ve doğrulanmış.
- Gizlilik, deep link ve takvim idempotency testleri tamamlandı.
- Analytics ve feature flag rollout'u hazır.
- İngilizce ve Almanca kısa widget metinleri gerçek cihazda kontrol edildi.
