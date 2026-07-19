# 009 — Belge Tarama ve Yapılandırılmış İçe Aktarma

## Task özeti

| Alan | Değer |
|---|---|
| Durum | Backlog |
| Öncelik | P1 |
| Hedef sürüm | v1.5 |
| Task türü | Plus / AI-OCR / Sağlık Verisi |
| Tahmini efor | XL |
| Ürün katmanı | Plus; sınırlı demo Free olabilir |
| Bağımlılıklar | 006, 008 |
| Son güncelleme | 2026-07-15 |

## Bağlam ve problem

Aşı kartı, reçete, laboratuvar sonucu ve veteriner faturası gibi belgeleri elle kaydetmek yüksek sürtünme yaratır. Yanlış otomatik çıkarım ise sağlık verisini bozabilir. Bu nedenle tarama “otomatik kaydetme” değil, kaynak belge + kullanıcı onaylı yapılandırılmış taslak üretmelidir.

## Kullanıcı sonucu

> Bir kullanıcı olarak veteriner belgesinin fotoğrafını çekip alanları otomatik doldurmak ve doğruladıktan sonra kayıt/hatırlatıcı oluşturmak istiyorum.

## Desteklenen belgeler

İlk sürümde sırayla:

1. Aşı kartı
2. Reçete/ilaç etiketi
3. Veteriner ziyaret özeti
4. Laboratuvar sonucu
5. Fatura — yalnız arşiv/harcama alanları

## Ana akış

1. Kamera veya galeriden belge seçimi.
2. Kırpma, döndürme ve kalite kontrolü.
3. Belge tipi sınıflandırması.
4. OCR/structured extraction.
5. Kaynak görüntü yanında alan bazlı review; düşük güven işaretlenir.
6. Kullanıcı onayı sonrası record, medication veya reminder oluşturulur.

## İş kuralları

- Kullanıcı onayı olmadan hiçbir sağlık alanı kalıcı kaydedilmez.
- Her alan kaynak sayfa/bölge ve confidence ile eşleşir.
- Tarih ve doz normalizasyonu locale ve birim doğrulamasından geçer.
- Aynı belge hash’i duplicate uyarısı üretir.
- Belge silinirse türetilmiş kaydın bağımsız kalıp kalmayacağı kullanıcıya açıklanır.

## Veri modeli

- `documents`: pet, type, storage_path, mime, hash, captured_at, status.
- `document_extractions`: provider/model_version, fields, confidence, reviewed_at.
- `document_links`: record/medication/vet_visit ilişkisi.
- Supabase Storage private bucket, signed URL ve strict RLS.

## Gizlilik ve güvenlik

- Belge tıbbi ve kişisel veri içerebilir; public URL üretilmez.
- OCR sağlayıcısının retention/training politikası incelenmeden production kullanılmaz.
- EXIF konum bilgisi upload öncesi kaldırılır.
- Logs, crash reports ve analytics OCR metni içermez.
- Kullanıcı belgeyi ve türetilmiş veriyi ayrı ayrı silebilir.

## Uygulama fazları

### Faz 1 — Güvenli dosya altyapısı

- [ ] Private storage, upload queue, retry ve cleanup.
- [ ] Kamera/galeri, kalite ve boyut sınırları.
- [ ] Attachment görüntüleme ve silme.

### Faz 2 — OCR ve review

- [ ] Aşı/reçete extraction schema.
- [ ] Field confidence ve source highlight.
- [ ] Kullanıcı düzeltme/confirm akışı.

### Faz 3 — Otomasyon

- [ ] Medication/reminder/vet visit taslağı.
- [ ] Duplicate detection.
- [ ] Model eval, maliyet ve latency dashboard.

## Kabul kriterleri

- [ ] Düşük güvenli alanlar otomatik kabul edilmiyor.
- [ ] Kullanıcı orijinal belge ile extracted değeri yan yana görebiliyor.
- [ ] Offline upload güvenli biçimde kuyruklanıyor.
- [ ] Private belge başka family dışı kullanıcı tarafından açılamıyor.
- [ ] Model sürümü ve kullanıcı düzeltmesi audit edilebiliyor.

## Açık sorular

- [ ] On-device OCR yeterli mi, cloud extraction gerekli mi?
- [ ] Belge storage kotası Plus planında ne olacak?
- [ ] Laboratuvar değerleri ilk sürümde yapılandırılacak mı yalnız PDF olarak mı saklanacak?

## Test planı

- Golden belge seti: desteklenen türler, farklı kalite/dil ve düşük güven alanları.
- Entegrasyon: upload retry, offline queue, duplicate detection ve taslak kayıt üretimi.
- Güvenlik: RLS, signed URL süresi, EXIF temizleme, silme ve sağlayıcı retention doğrulaması.
- Manuel: kamera/dosya seçimi, karşılaştırmalı review, düzeltme, iPad ve VoiceOver.

## Definition of Done

- Extraction kalite eşiği ve düşük güven davranışı ölçülüp belgelenmiş.
- Orijinal belge, kullanıcı düzeltmesi ve model sürümü audit edilebilir.
- Silme/retention/privacy ve maliyet/latency izleme süreçleri hazır.
- EN/DE, erişilebilirlik ve feature flag rollout'u tamamlandı.
