# 008 — Vet Visit Mode

## Task özeti

| Alan | Değer |
|---|---|
| Durum | In Progress |
| Öncelik | P0 |
| Hedef sürüm | v1.4 |
| Task türü | Plus / Sağlık / Raporlama |
| Tahmini efor | XL |
| Ürün katmanı | Plus; hazırlık önizlemesi Free olabilir |
| Bağımlılıklar | 002, 006 |
| Son güncelleme | 2026-07-23 |

## Bağlam ve problem

Lulu check-in, kilo, kayıt, hatırlatıcı ve PDF verisine sahip; fakat bu parçalar veteriner randevusu öncesi tek bir kullanıcı sonucuna dönüşmüyor. Kullanıcı klinikte tarihleri hatırlamak, belirtileri anlatmak ve sorularını unutmamak zorunda kalıyor.

## Kullanıcı sonucu

> Bir kullanıcı olarak veteriner randevusuna pet’imin son değişikliklerini, ilaçlarını ve sorularımı içeren düzenli bir özetle hazırlanmak istiyorum.

## Başarı ölçütleri

- Başlatılan visit prep → tamamlanan rapor oranı.
- Rapor paylaşma/kopyalama oranı.
- Randevu sonrası follow-up ve reminder oluşturma oranı.

## Kapsam

### Ziyaret öncesi

- [x] Tarih aralığı: 7/30/90 gün/custom.
- [x] Check-in değişimleri, kilo, belirtiler, aktif ilaçlar ve son kayıtlar.
- [x] Kullanıcının veterinere soruları ve gözlem notları.
- [ ] Otomatik özet düzenlenebilir; kaynak satırlarına geri gidilebilir.
- [ ] PDF ve ekranda “Visit Brief”.

### Ziyaret sonrası

- [ ] Klinik, veteriner, tarih, not, tanı olarak kullanıcı tarafından girilen bilgi.
- [ ] Reçete/tedavi değişikliği ve sonraki kontrol tarihi.
- [ ] Tek tap ile reminder/medication plan oluşturma.

### Kapsam dışı

- Teşhis veya tedavi önerisi.
- Veteriner adına resmi tıbbi kayıt oluşturma.

## UX akışı

1. Home/Care/Pet Profile → `Prepare for vet visit`.
2. Tarih aralığı ve dahil edilecek bölümler.
3. Lulu önemli değişiklikleri kaynaklarıyla özetler.
4. Kullanıcı sorularını ekler ve önizlemeyi düzenler.
5. Ekran/PDF/share.
6. Ziyaret sonrası “Add outcome” ile follow-up.

## Veri modeli

- `vet_visits`: pet, scheduled_at, provider_id, reason, status, completed_at.
- `vet_visit_questions`: text, answered, order.
- `vet_visit_summaries`: range, selected_sections, generated_at, version; hassas snapshot saklama kararı açık.
- `vet_visit_outcomes`: user-entered diagnosis label, notes, next_visit_at.
- Mevcut records/medications ile entity reference.

## Özetleme yaklaşımı

- İlk sürüm deterministik: sayım, tarih, trend ve seçili kayıtları formatlar.
- AI özeti daha sonra feature flag ile; her cümle kaynak veriye bağlanır.
- Kullanıcı onayı olmadan rapora yeni tıbbi iddia eklenmez.

## Gizlilik ve güvenlik

- Paylaşım explicit kullanıcı aksiyonuyla başlar.
- PDF geçici dosyaları paylaşım sonrası temizlenir.
- AI kullanılırsa gönderilen alanlar ve retention açıkça açıklanır.
- Her raporda “veteriner değerlendirmesinin yerine geçmez” sınırı.

## Uygulama fazları

### Faz 1 — Deterministik Visit Brief

- [x] Model, wizard ve veri seçimi. — Care Hub girişli wizard ve deterministik seçim sözleşmesi tamam.
- [x] Kaynak bağlantılı özet. — Her otomatik madde kaynak kimlikleri ve uygulama içi rotalarla üretiliyor.
- [ ] Mevcut PDF altyapısı ile export.

### Faz 2 — Outcome ve follow-up

- [ ] Visit sonucu kaydı.
- [ ] Medication/reminder oluşturma.
- [ ] Timeline entegrasyonu.

### Faz 3 — Akıllı özet

- [ ] Feature flag, eval dataset ve güvenlik review.
- [ ] Kaynak gösterimi ve hallucination guardrail.

## Kabul kriterleri

- [ ] Kullanıcı 30 günlük raporu beş dakikadan kısa sürede hazırlayabiliyor.
- [ ] Her otomatik özet maddesi Lulu içindeki kaynak veriye izlenebilir.
- [ ] Boş veri bölümleri raporda anlamsız başlık oluşturmaz.
- [ ] PDF EN/DE ve locale tarih/birim formatlarına uyar.
- [ ] Shared member yalnız rolünün izin verdiği raporu görür.

## Açık sorular

- [ ] Visit Brief Free önizlemesi ne kadar ayrıntılı?
- [x] AI özet ilk sürümde gerekli mi? — Hayır; ilk sürüm yalnız deterministik ve kaynak bağlantılı.
- [ ] Veteriner sonucu bağımsız record türü mü, visit entity mi?

## Test planı

- Unit: tarih aralığı, bölüm seçimi, veri yetersizliği ve kaynak izlenebilirliği.
- Golden dataset: deterministik özet/PDF; AI eklenirse doğruluk ve hallucination eval'i.
- Entegrasyon: medication, reminder, timeline, belge ve aile yetkileri.
- Manuel: EN/DE PDF, paylaşım, offline hazırlık, iPad ve erişilebilirlik.

### Mevcut manuel kontrol

- [ ] Care Hub → “Veteriner Görüşmesine Hazırlan” ekranı açılıyor.
- [ ] 7/30/90 gün ve özel tarih aralığı seçimleri doğru çalışıyor.
- [ ] Check-In, ilaç ve sağlık kaydı seçimleri özet içeriğini doğru değiştiriyor.
- [ ] Her satıra yazılan soru önizlemede ayrı madde olarak görünüyor.
- [ ] Kaynak kayıt satırları ilgili Check-In, ilaç veya sağlık kaydını açıyor.
- [ ] Eşleşen veri olmayan aralık dürüst boş durum gösteriyor.

## Definition of Done

- Her özet maddesi kaynak kayda izlenebilir ve veri yetersizliği dürüstçe gösterilir.
- PDF, outcome ve follow-up akışları uçtan uca test edildi.
- Sağlık/gizlilik incelemesi, analytics ve feature flag tamamlandı.
- EN/DE ve aile rolü QA onaylandı.
