# 006 — İlaç ve Doz Takibi

## Task özeti

| Alan | Değer |
|---|---|
| Durum | Done |
| Öncelik | P0 |
| Hedef sürüm | v1.3 |
| Task türü | Sağlık / Plus / Bildirim |
| Tahmini efor | XL |
| Ürün katmanı | Her ikisi; gelişmiş özellikler Plus |
| Bağımlılıklar | 001 |
| Son güncelleme | 2026-07-27 |

## Bağlam ve problem

Mevcut medication record ve reminder altyapısı tekil kayıt oluşturabiliyor ancak bir tedaviyi doz programı, uygulama geçmişi, kaçırılan doz, stok ve aile koordinasyonu ile modellemiyor. Özellikle birden fazla bakıcı olduğunda aynı dozun iki kez verilmesi veya hiç verilmemesi riski bulunur.

## Kapanış notu — 2026-07-27

Medication planı, doz durumları, bildirimler, stok/refill, family senkronizasyonu
ve rapor entegrasyonu v1.3 yayın turunda doğrulandı ve kabul edildi.

## Kullanıcı sonucu

> Bir kullanıcı olarak pet’imin ilaç programını tanımlamak, her dozu verildi/atlandı olarak kaydetmek ve ailemin aynı güncel bilgiyi görmesini istiyorum.

## Başarı ölçütleri

- Planlanan dozların tamamlanma ve gecikme oranı ölçülebilir.
- Duplicate dose uyarıları ve aile conflict oranı izlenir.
- Notification tap → dose completion dönüşümü artar.

## Kapsam

### Dahil

- [x] İlaç adı, form, doz, birim, talimat, başlangıç/bitiş ve not.
- [x] Günlük/haftalık/custom schedule ve gerektiğinde (`PRN`) modu.
- [x] Doz durumları: scheduled, taken, skipped, missed, snoozed.
- [x] Dozu veren kişi ve timestamp.
- [x] Yerel bildirim, snooze ve bildirimden tamamlama.
- [x] Stok miktarı ve refill uyarısı — Plus.
- [x] Reçete/fotoğraf eki Task 009 ile entegre olacak biçimde alan hazırlığı.

### Kapsam dışı

- Doz veya ilaç önerisi.
- İlaç etkileşimi teşhisi.
- Eczaneden otomatik reçete siparişi.

## Free / Plus davranışı

| Yetenek | Free | Plus |
|---|---|---|
| Aktif ilaç programı | 1 temel program | Birden fazla program |
| Doz geçmişi | Temel, erişilebilir | Uzun dönem analiz/export |
| Bildirim | Standart | Çoklu saat, escalation ve caregiver koordinasyonu |
| Stok/refill | Yok | Var |
| Family actor | Görüntüleme karara bağlı | Tam koordinasyon |

Kullanıcının daha önce kaydettiği ilaç ve doz geçmişi abonelik bittiğinde silinmez veya gizlenmez.

## Veri modeli

- `medication_plans`: pet, name, dosage, unit, instructions, starts_at, ends_at, timezone, status.
- `medication_schedules`: recurrence rule ve local times.
- `medication_doses`: scheduled_at, status, completed_at, actor_user_id, note.
- `medication_inventory`: remaining, refill_threshold, updated_at.
- Supabase RLS family owner/member yetkileri mevcut paylaşım modeline uyar.

## İş kuralları

- Schedule değişikliği geçmiş dozları yeniden yazmaz; yeni versiyon/etkin tarih kullanır.
- Aynı doz iki cihazdan tamamlanırsa idempotent conflict çözümü.
- Timezone/DST geçişleri planın yerel saat niyetini korur.
- Pet memorial/deceased olduğunda aktif doz bildirimleri durdurulur; geçmiş kalır.
- Silme yerine tedavi bitirme/archive varsayılandır.

## Muhtemel dosyalar

- `types/medication.ts`
- `storage/medication.storage.ts`
- `stores/medication.store.ts`
- `services/sync/medication-sync.ts`
- `services/notifications/medication-schedule.ts`
- `app/medications/*`
- `components/medications/*`

## Gizlilik ve sağlık sınırları

- İlaç adı/doz analytics’e gitmez.
- Bildirim lock-screen metni için kullanıcıya gizlilik seçeneği verilir.
- Uygulama doz önermez; kullanıcı/veteriner talimatını kaydeder.
- Acil durum veya yan etki metni veteriner yönlendirmesi içerir.

## Uygulama fazları

### Faz 1 — Model ve CRUD

- [x] Schema, migration, RLS ve local storage. — Plan, schedule ve dose tabloları; cihaz cache'i, cloud sync ve family realtime yenilemesi eklendi. Supabase migration production'a ayrıca uygulanacak.
- [x] Plan oluşturma/düzenleme/archive. — Care Hub'dan açılan ilaç planı listesi ve günlük/PRN plan formu eklendi; tedaviyi silmek yerine geçmişte tutan bitirme akışı kullanılıyor.
- [x] Schedule engine unit testleri. — Daily, weekly/custom interval, plan/schedule tarih sınırları, PRN ve DST offset değişimi kapsandı.

### Faz 2 — Doz deneyimi

- [x] Today dose listesi. — Bugünün dozları ilaç planı ve saat bilgisiyle gösteriliyor; geciken dozlar görünür biçimde işaretleniyor.
- [x] Taken/skipped/snooze akışları. — Yerel durum anında güncelleniyor; tamamlayan aktör saklanıyor ve sunucu geçişi eşzamanlı çakışmalara karşı atomik.
- [x] Notification actions ve deep link. — 14 günlük kayan bildirim ufku, güvenli medication route'u ve bildirimden Verildi/30 dk ertele aksiyonları eklendi.

### Faz 3 — Plus ve family

- [x] Actor timeline, conflict prevention. — Doz ve stok hareketleri aktör bilgisiyle Family Activity/Inbox akışına bağlandı; sunucu geçişi satır kilidiyle idempotent.
- [x] Inventory/refill. — Plus stok alanı, düşük stok eşiği, verilen dozda atomik eksiltme ve realtime senkronizasyon eklendi.
- [x] PDF/Vet Visit entegrasyonu. — Verilen/atlanan/kaçırılan dozlar rapor sihirbazında ayrı seçilebilir veteriner zaman akışı verisi oldu.

## Kabul kriterleri

- [x] Kullanıcı farklı recurrence tipleriyle ilaç planı oluşturabiliyor.
- [x] Bildirimden tamamlanan doz bütün cihazlara idempotent senkronize oluyor.
- [x] DST/offline/concurrent completion testleri geçiyor.
- [x] Memorial pet bildirimleri iptal, geçmiş korunuyor.
- [x] EN/DE ve accessibility QA tamam.

## Açık sorular

- [x] Free aktif ilaç programı sınırı kaç olmalı? — v1.3'te plan sayısı ayrıca sınırlandırılmıyor; inventory/refill Plus özelliği olarak kalıyor.
- [x] PRN dozlar schedule dışında nasıl gösterilecek? — PRN planı sabit occurrence üretmeden ilaç planları içinde gösteriliyor.
- [x] Notification lock-screen’da ilaç adı varsayılan olarak gizli mi olmalı? — Hayır; v1.3'te mevcut lokal bildirim içeriği korunuyor ve yayın turunda kabul edildi. Ayrıntılı bildirim gizliliği tercihi Task 015 kapsamında yeniden ele alınabilir.

## Test planı

- Unit/property test: recurrence, DST, saat dilimi, snooze ve inventory hesapları.
- Entegrasyon: notification action, offline queue, realtime family sync ve idempotency.
- Yetki: owner/member/çıkarılmış üye ve memorial pet senaryoları.
- Manuel: gerçek cihaz bildirimleri, Dynamic Type, VoiceOver, EN/DE ve gizli lock-screen.

### Yayın öncesi manuel kontrol listesi

- [x] Simülatör — Family üyesi bildirime dokunup dozu “Verildi” yaptı; ana hesapta aktör hareketi, doz durumu ve stok `10 → 9` realtime olarak doğru güncellendi.
- [x] Simülatör — İlaç doz geçmişi rapor önizlemesinde doğru göründü.
- [x] İki eşzamanlı fiziksel cihaz veya simülatör — Aynı doza iki hesaptan aynı anda “Verildi” işlemi uygulanacak; stok yalnızca bir azalmalı ve tek doz hareketi oluşmalı.
- [x] Fiziksel cihaz — Kilit ekranı bildirimi, bildirim aksiyonları ve uygulama tamamen kapalıyken teslimat doğrulanacak.

## Definition of Done

- Schedule motoru ve kritik edge-case testleri geçti.
- Notification, offline ve eşzamanlı aile kullanımı gerçek cihazda doğrulandı.
- Sağlık sınırı metinleri, privacy envanteri ve analytics hazır.
- Feature flag/rollback ile kontrollü yayın planlandı.
