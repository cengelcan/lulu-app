# 007 — Family Activity Timeline

## Task özeti

| Alan | Değer |
|---|---|
| Durum | In Progress |
| Öncelik | P1 |
| Hedef sürüm | v1.3 |
| Task türü | Plus / İşbirliği / Realtime |
| Tahmini efor | L |
| Ürün katmanı | Plus |
| Bağımlılıklar | 003, 006 |
| Son güncelleme | 2026-07-23 |

## Bağlam ve problem

Aile paylaşımı ortak veriye erişim sağlıyor ancak bakım koordinasyonu görünür bir günlük deneyime dönüşmüyor. Kullanıcı kimin check-in yaptığını, ilacı verdiğini veya reminder tamamladığını tek akışta göremediğinde duplicate bakım ve iletişim yükü devam eder. Mevcut inbox activity altyapısı başlangıç noktasıdır.

## Kullanıcı sonucu

> Bir aile üyesi olarak bugün kimin hangi bakımı yaptığını görmek ve yapılmamış işleri güvenle devralmak istiyorum.

## Kapsam

- [x] Check-in created/updated, record added, reminder completed, dose taken/skipped.
- [x] Family member joined/left ve paylaşım değişiklikleri.
- [x] Pet ve aktör filtreleri.
- [x] Activity detail deep link.
- [x] Read/unread ve önemli aksiyon ayrımı.
- [ ] Basit acknowledgement/emoji sonraki faz için değerlendirilebilir.

### Kapsam dışı

- Genel amaçlı mesajlaşma.
- Sağlık kaydı içeriğinin notification preview’da gösterilmesi.

## UX

- Care Hub içinde `Family activity` bölümü.
- Satır: aktör, eylem, pet, göreli zaman ve durum ikonu.
- “Can gave Lulu’s medication · 08:02” gibi kısa ama teşhis içermeyen dil.
- Aktiviteye dokununca izin varsa ilgili kayıt/doz/check-in açılır.
- Kendi eylemleri de görünür fakat görsel olarak ayrıştırılmaz; tutarlı timeline korunur.

## Veri modeli ve senkronizasyon

- Mevcut `activity_events` yapısı audit edilir ve ortak event envelope’a geçirilir.
- Alanlar: id, family_id, pet_id, actor_user_id, kind, entity_id, occurred_at, metadata_version.
- Metadata yalnız UI için gerekli güvenli sınıflandırmaları taşır; serbest sağlık notu taşımaz.
- Realtime + pagination + local cache.
- Event üretimi server tarafında veya idempotent RPC ile; client’ın aktör spoof etmesi engellenir.

## Yetki ve gizlilik

- Kullanıcı yalnız üyesi olduğu aktif family event’lerini görür.
- Family’den ayrılınca realtime subscription ve erişim derhal kesilir.
- Silinen kaydın event’i “record removed” olabilir; hassas snapshot tutulmaz.
- Export/analytics event içeriğini taşımaz.

## Uygulama fazları

### Faz 1 — Event sözleşmesi

- [x] Mevcut inbox activity audit. — Inbox kısa aktivite yüzeyi olarak korundu; kalıcı geçmiş ayrı store ve ekrana taşındı.
- [x] Versioned event schema ve RLS. — `family_id`, `entity_id`, `metadata_version`, `occurred_at` eklendi; doğrudan authenticated insert kapatıldı.
- [x] Idempotent producer testleri. — Sunucu `on conflict` koruması ve client realtime/pagination dedupe testleri eklendi.

### Faz 2 — Timeline

- [x] Paginated store ve realtime merge.
- [x] Care Hub UI, filtre, empty/error/offline.
- [x] Deep link permission kontrolleri. — Event sorgusu ve hedef veri RLS erişimine bağlı; erişilemeyen pet cache’i temizleniyor.

### Faz 3 — Medication entegrasyonu

- [x] Taken/skipped/refill event’leri.
- [x] Duplicate dose guardrail.
- [x] Push digest tercihi. — Hesaba bağlı, cihazlar arası senkronize ve gizlilik için varsayılan kapalı.
- [x] Uzaktan push teslimi. — 15 dakikalık özet, yalnız diğer üyelerin aktivitesi ve hassas ayrıntı içermeyen önizleme.

## Kabul kriterleri

- [ ] İki cihazda yapılan eylem diğerinde gerçek zamanlı ve tek kez görünür.
- [ ] Family’den ayrılan kullanıcı timeline’a erişemez.
- [ ] Offline event’ler bağlantı gelince doğru sırada birleşir.
- [ ] Timeline hassas not veya tıbbi ayrıntıyı preview’da ifşa etmez.
- [ ] EN/DE aktör ve zaman cümleleri dilbilgisel doğru.

## Açık sorular

- [ ] Event saklama süresi ne kadar?
- [x] Family activity için push digest varsayılan mı opt-in mi? — Opt-in; kullanıcı Ayarlar’dan açıkça etkinleştirir.
- [ ] Acknowledgement/yorum v1 kapsamında mı?

## Test planı

- Unit/enforcement: event sözleşmesi, cursor pagination, sıralama ve duplicate engelleme.
- Entegrasyon: iki cihaz realtime, offline merge, push/deep link ve doz çakışması.
- Güvenlik: RLS, aileden çıkma, pet erişim değişimi ve hassas preview kontrolü.
- Manuel: empty/error/offline, filtreler, EN/DE aktör cümleleri ve VoiceOver.

### Yayın öncesi kontrol listesi

- [ ] İki eşzamanlı fiziksel cihaz veya simülatör — Alıcı hesapta “Aile Aktivitesi Özeti” açıkken diğer aile hesabı bakım aktivitesi oluşturacak; özet en geç 15 dakika içinde ulaşmalı ve bildirime dokununca Family Activity ekranı açılmalı.
- [ ] Push önizlemesi — Bildirim başlığı ve gövdesi ilaç adı, pet adı, sağlık notu veya tıbbi ayrıntı içermemeli.
- [ ] Hesap izolasyonu — Aynı kurulumda hesaptan çıkış yapıldığında önceki hesabın aile aktivitesi bildirimi artık gelmemeli.

## Definition of Done

- Bütün üretici event'leri sürümlü sözleşmeye bağlı.
- Realtime/offline/idempotency ve RLS testleri tamamlandı.
- Saklama politikası, analytics ve push tercihleri belgelendi.
- EN/DE, erişilebilirlik ve kontrollü rollout hazır.
