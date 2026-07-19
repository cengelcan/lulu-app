# 006 — İlaç ve Doz Takibi

## Task özeti

| Alan | Değer |
|---|---|
| Durum | Backlog |
| Öncelik | P0 |
| Hedef sürüm | v1.3 |
| Task türü | Sağlık / Plus / Bildirim |
| Tahmini efor | XL |
| Ürün katmanı | Her ikisi; gelişmiş özellikler Plus |
| Bağımlılıklar | 001 |
| Son güncelleme | 2026-07-15 |

## Bağlam ve problem

Mevcut medication record ve reminder altyapısı tekil kayıt oluşturabiliyor ancak bir tedaviyi doz programı, uygulama geçmişi, kaçırılan doz, stok ve aile koordinasyonu ile modellemiyor. Özellikle birden fazla bakıcı olduğunda aynı dozun iki kez verilmesi veya hiç verilmemesi riski bulunur.

## Kullanıcı sonucu

> Bir kullanıcı olarak pet’imin ilaç programını tanımlamak, her dozu verildi/atlandı olarak kaydetmek ve ailemin aynı güncel bilgiyi görmesini istiyorum.

## Başarı ölçütleri

- Planlanan dozların tamamlanma ve gecikme oranı ölçülebilir.
- Duplicate dose uyarıları ve aile conflict oranı izlenir.
- Notification tap → dose completion dönüşümü artar.

## Kapsam

### Dahil

- [ ] İlaç adı, form, doz, birim, talimat, başlangıç/bitiş ve not.
- [ ] Günlük/haftalık/custom schedule ve gerektiğinde (`PRN`) modu.
- [ ] Doz durumları: scheduled, taken, skipped, missed, snoozed.
- [ ] Dozu veren kişi ve timestamp.
- [ ] Yerel bildirim, snooze ve bildirimden tamamlama.
- [ ] Stok miktarı ve refill uyarısı — Plus.
- [ ] Reçete/fotoğraf eki Task 009 ile entegre olacak biçimde alan hazırlığı.

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

- [ ] Schema, migration, RLS ve local storage.
- [ ] Plan oluşturma/düzenleme/archive.
- [ ] Schedule engine unit testleri.

### Faz 2 — Doz deneyimi

- [ ] Today dose listesi.
- [ ] Taken/skipped/snooze akışları.
- [ ] Notification actions ve deep link.

### Faz 3 — Plus ve family

- [ ] Actor timeline, conflict prevention.
- [ ] Inventory/refill.
- [ ] PDF/Vet Visit entegrasyonu.

## Kabul kriterleri

- [ ] Kullanıcı farklı recurrence tipleriyle ilaç planı oluşturabiliyor.
- [ ] Bildirimden tamamlanan doz bütün cihazlara idempotent senkronize oluyor.
- [ ] DST/offline/concurrent completion testleri geçiyor.
- [ ] Memorial pet bildirimleri iptal, geçmiş korunuyor.
- [ ] EN/DE ve accessibility QA tamam.

## Açık sorular

- [ ] Free aktif ilaç programı sınırı kaç olmalı?
- [ ] PRN dozlar schedule dışında nasıl gösterilecek?
- [ ] Notification lock-screen’da ilaç adı varsayılan olarak gizli mi olmalı?

## Test planı

- Unit/property test: recurrence, DST, saat dilimi, snooze ve inventory hesapları.
- Entegrasyon: notification action, offline queue, realtime family sync ve idempotency.
- Yetki: owner/member/çıkarılmış üye ve memorial pet senaryoları.
- Manuel: gerçek cihaz bildirimleri, Dynamic Type, VoiceOver, EN/DE ve gizli lock-screen.

## Definition of Done

- Schedule motoru ve kritik edge-case testleri geçti.
- Notification, offline ve eşzamanlı aile kullanımı gerçek cihazda doğrulandı.
- Sağlık sınırı metinleri, privacy envanteri ve analytics hazır.
- Feature flag/rollback ile kontrollü yayın planlandı.
