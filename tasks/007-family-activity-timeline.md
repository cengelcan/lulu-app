# 007 — Family Activity Timeline

## Task özeti

| Alan | Değer |
|---|---|
| Durum | Backlog |
| Öncelik | P1 |
| Hedef sürüm | v1.3 |
| Task türü | Plus / İşbirliği / Realtime |
| Tahmini efor | L |
| Ürün katmanı | Plus |
| Bağımlılıklar | 003, 006 |
| Son güncelleme | 2026-07-15 |

## Bağlam ve problem

Aile paylaşımı ortak veriye erişim sağlıyor ancak bakım koordinasyonu görünür bir günlük deneyime dönüşmüyor. Kullanıcı kimin check-in yaptığını, ilacı verdiğini veya reminder tamamladığını tek akışta göremediğinde duplicate bakım ve iletişim yükü devam eder. Mevcut inbox activity altyapısı başlangıç noktasıdır.

## Kullanıcı sonucu

> Bir aile üyesi olarak bugün kimin hangi bakımı yaptığını görmek ve yapılmamış işleri güvenle devralmak istiyorum.

## Kapsam

- [ ] Check-in created/updated, record added, reminder completed, dose taken/skipped.
- [ ] Family member joined/left ve paylaşım değişiklikleri.
- [ ] Pet ve aktör filtreleri.
- [ ] Activity detail deep link.
- [ ] Read/unread ve önemli aksiyon ayrımı.
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

- [ ] Mevcut inbox activity audit.
- [ ] Versioned event schema ve RLS.
- [ ] Idempotent producer testleri.

### Faz 2 — Timeline

- [ ] Paginated store ve realtime merge.
- [ ] Care Hub UI, filtre, empty/error/offline.
- [ ] Deep link permission kontrolleri.

### Faz 3 — Medication entegrasyonu

- [ ] Taken/skipped/refill event’leri.
- [ ] Duplicate dose guardrail.
- [ ] Push digest tercihi.

## Kabul kriterleri

- [ ] İki cihazda yapılan eylem diğerinde gerçek zamanlı ve tek kez görünür.
- [ ] Family’den ayrılan kullanıcı timeline’a erişemez.
- [ ] Offline event’ler bağlantı gelince doğru sırada birleşir.
- [ ] Timeline hassas not veya tıbbi ayrıntıyı preview’da ifşa etmez.
- [ ] EN/DE aktör ve zaman cümleleri dilbilgisel doğru.

## Açık sorular

- [ ] Event saklama süresi ne kadar?
- [ ] Family activity için push digest varsayılan mı opt-in mi?
- [ ] Acknowledgement/yorum v1 kapsamında mı?

## Test planı

- Unit/enforcement: event sözleşmesi, cursor pagination, sıralama ve duplicate engelleme.
- Entegrasyon: iki cihaz realtime, offline merge, push/deep link ve doz çakışması.
- Güvenlik: RLS, aileden çıkma, pet erişim değişimi ve hassas preview kontrolü.
- Manuel: empty/error/offline, filtreler, EN/DE aktör cümleleri ve VoiceOver.

## Definition of Done

- Bütün üretici event'leri sürümlü sözleşmeye bağlı.
- Realtime/offline/idempotency ve RLS testleri tamamlandı.
- Saklama politikası, analytics ve push tercihleri belgelendi.
- EN/DE, erişilebilirlik ve kontrollü rollout hazır.
