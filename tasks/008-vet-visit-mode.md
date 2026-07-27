# 008 — Vet Visit Workspace

## Task özeti

| Alan | Değer |
|---|---|
| Durum | Done |
| Öncelik | P0 |
| Hedef sürüm | v1.3 |
| Task türü | Plus / Sağlık / Bakım iş akışı |
| Tahmini efor | XL |
| Ürün katmanı | Plus; Free sınırı ayrıca kararlaştırılacak |
| Bağımlılıklar | 002, 006, 013 |
| Son güncelleme | 2026-07-27 |

## Son ürün kararı

Vet Visit ayrı bir rapor ürünü değildir. Lulu'da tek rapor mevcut Sağlık
Raporu olarak kalır. Plus değeri ikinci bir PDF'den değil; veteriner
görüşmesinin öncesini, görüşme anını ve sonrasını birbirine bağlayan kalıcı bir
Workspace akışından gelir.

### Kaldırılan yaklaşım

- “Visit highlights” kaldırıldı; mevcut sağlık verilerini tekrar eden otomatik
  bir öne çıkanlar bölümü yapılmayacak.
- Ayrı “Visit Brief” ekranı/PDF'i ve ikinci rapor önizlemesi yapılmayacak.
- Kullanıcı Vet Visit içinde sağlık raporundaki tarih ve veri türü seçimlerini
  tekrar yapmayacak.
- Toplu “Source records” listesi varsayılan açık gösterilmeyecek.
- Yeni ürün yönü kesinleşmeden geliştirilen eski wizard ve birleşik hazırlık PDF'i
  2026-07-25 tarihinde revert edildi.

## Problem

Kullanıcı veteriner randevusundan önce neden gittiğini ve sorularını hazırlamak,
görüşme sırasında yanıtları/notları takip etmek, sonrasında da ilaç ve kontrol
aksiyonlarını unutmamak zorunda. Lulu bu süreci bugün uçtan uca bağlamıyor.

## Kullanıcı sonucu

> Bir kullanıcı olarak veteriner görüşmesini Lulu'da hazırlamak, görüşme
> sırasında notlarımı takip etmek ve sonrasında yapılacak bakım işlerini doğrudan
> planlamak istiyorum.

## Ürün ilkeleri

- Sağlık Raporu tek rapor olarak kalır ve görüşmeye isteğe bağlı eklenir.
- Workspace tıbbi yorum üretmez; kullanıcı girdisini ve mevcut bakım araçlarını
  düzenler.
- Kullanıcı aynı seçimi iki farklı yerde yapmak zorunda kalmaz.
- Ana aksiyon uzun içeriğin altında kaybolmaz; bulunduğu aşamaya göre sabit ve
  erişilebilir kalır.
- Kaynak kayıtlar yalnız gerekli bağlamda açılır; merkezi ve uzun bir tekrar
  listesi oluşturulmaz.
- Görüşme sonucu ve tanı alanları veteriner kaydı iddiası taşımaz; açıkça
  kullanıcı tarafından girilen bilgi olarak etiketlenir.

## Kapsam

### Ziyaret öncesi

- [x] Randevu tarihi ve saati.
- [x] Klinik/veteriner seçimi veya serbest metin girişi.
- [x] Görüşme nedeni.
- [x] Sıralanabilir soru listesi.
- [x] Hazırlık ilerlemesi ve yaklaşan görüşmenin Care Hub'da gösterilmesi.
- [x] İsteğe bağlı Sağlık Raporu ekleme; yalnız tarih aralığı değiştirilebilir.
- [x] Sağlık Raporu oluşturma/düzenleme mevcut rapor akışına yönlendirir.

### Görüşme sırasında

- [x] Soruları yanıtlandı olarak işaretleme.
- [x] Her soruya kısa yanıt/not ekleme.
- [x] Görüşme geneli için hızlı not.
- [x] İnternet olmadan çalışabilen taslak ve güvenli otomatik kayıt.

### Ziyaret sonrası

- [x] Kullanıcı tarafından girilen görüşme sonucu ve notlar.
- [x] Tedavi/ilaç değişikliği notu.
- [x] Sonraki kontrol tarihi.
- [x] Tek dokunuşla reminder oluşturma.
- [x] Tek dokunuşla medication plan oluşturma veya mevcut planı açma.
- [x] Tamamlanan görüşmenin pet timeline'ında gösterilmesi.

### Kapsam dışı

- Teşhis veya tedavi önerisi.
- Otomatik “Visit highlights” veya AI özeti.
- İkinci bir veteriner raporu/PDF tasarımı.
- Veteriner adına resmi tıbbi kayıt oluşturma.
- Klinik sistemleriyle çift yönlü entegrasyonun ilk sürümü.

## Temel UX akışı

1. Care Hub → `Veteriner görüşmesi hazırla`.
2. Kullanıcı randevu, klinik/veteriner, neden ve soruları kaydeder.
3. İsterse mevcut Sağlık Raporu'nu görüşmeye ekler; veri türlerini yeniden seçmez.
4. Care Hub yaklaşan görüşmeyi ve hazırlık durumunu gösterir.
5. Görüşme sırasında sorular tamamlanır ve hızlı notlar alınır.
6. Görüşme sonunda sonuç, tedavi değişikliği ve sonraki kontrol kaydedilir.
7. Gerekli reminder/medication aksiyonları doğrudan oluşturulur.

## Önerilen veri modeli

Uygulama kodundan önce kesinleştirilecek başlangıç sözleşmesi:

- `vet_visits`: pet, scheduled_at, provider_id/provider_name, reason, status,
  started_at, completed_at, health_report_range.
- `vet_visit_questions`: visit_id, text, answer, answered, sort_order.
- `vet_visit_outcomes`: visit_id, user_entered_summary, treatment_notes,
  next_visit_at.
- Reminder, medication, provider ve pet record ilişkileri kimlik referanslarıyla
  kurulur; hassas rapor snapshot'ı varsayılan olarak saklanmaz.

## Uygulama fazları

### Faz 0 — Eski yönü temizle

- [x] Eski Visit Brief wizard'ını ve Care Hub girişini kaldır.
- [x] Visit highlights ve ikinci rapor/PDF geliştirmesini geri al.
- [x] Task'ı Vet Visit Workspace kararına göre yeniden yaz.

### Faz 1 — Hazırlık Workspace'i

- [x] Veri modeli ve local/cloud saklama sözleşmesi.
- [x] Randevu, provider, neden ve soru CRUD akışı.
- [x] Care Hub yaklaşan görüşme kartı ve hazırlık durumu.
- [x] Mevcut Sağlık Raporu'nu isteğe bağlı bağlama.

### Faz 2 — Görüşme ve sonuç

- [x] Canlı görüşme modu, soru durumları ve hızlı notlar.
- [x] Outcome, tedavi değişikliği ve sonraki kontrol.
- [x] Timeline entegrasyonu.

### Faz 3 — Follow-up otomasyonu

- [x] Reminder oluşturma.
- [x] Medication plan oluşturma/güncelleme.
- [x] Analytics, Plus gating ve aile rolü politikası.

## Kabul kriterleri

- [x] Uygulamada “Visit highlights” veya ikinci Vet Visit raporu bulunmuyor.
- [x] Kullanıcı sağlık verisi türlerini Vet Visit içinde yeniden seçmiyor.
- [x] Kullanıcı yaklaşan görüşmeyi Care Hub'da görebiliyor.
- [x] Sorular görüşme sırasında tamamlanıp yanıt/not alabiliyor.
- [x] Sonuçtan reminder ve medication aksiyonları oluşturulabiliyor.
- [x] Ana aşama aksiyonu küçük ekran ve uzun içerikte erişilebilir kalıyor.
- [x] Shared member yalnız rolünün izin verdiği görüşmeleri görebiliyor.
- [x] EN/DE/TR, offline taslak, büyük metin ve VoiceOver/TalkBack doğrulanıyor.

## Başarı ölçütleri

- Oluşturulan görüşme → tamamlanan görüşme oranı.
- Görüşme öncesi en az bir soru ekleme oranı.
- Görüşme sonrası reminder/medication oluşturma oranı.
- Care Hub yaklaşan görüşme kartından Workspace'e dönüş oranı.

## Açık sorular

- [x] Free kullanıcı kaç aktif/tamamlanmış görüşme saklayabilecek? — Yeni Workspace oluşturma Plus'tır; abonelik sona erse de mevcut görüşmeler okunabilir.
- [x] Aile rollerinde kim düzenleyebilir, kim yalnız görüntüleyebilir? — Owner tüm görüşmeleri, member yalnız kendi oluşturduklarını düzenler; erişilebilir diğer görüşmeler salt okunurdur.

### Çözülen teknik kararlar

- Vet Visit, mevcut mimariyle uyumlu biçimde SQLite local-first cache ve
  Supabase aile erişimli bulut kaynağı kullanır.
- Provider Directory Faz 1 için zorunlu değildir; `provider_id` ileriye dönük
  tutulur ve bugün serbest metin `provider_name` kullanılır.
- Sağlık Raporu snapshot olarak çoğaltılmaz; görüşmede tarih aralığı referansı
  tutulur ve mevcut rapor akışı bu aralıkla açılır.
- Follow-up reminder ve medication plan kimlikleri outcome üzerinde tutulur;
  içerik kopyalanmaz ve silinen hedef referansı `null` olur.
- Analytics yalnız event adı, giriş yüzeyi ve follow-up türünü taşır; pet/visit
  kimliği, klinik adı, soru, yanıt veya sağlık metni göndermez.

## Test planı

- Unit: visit durum geçişleri, soru sırası/durumu ve follow-up eşlemesi.
- Entegrasyon: provider, reminder, medication, timeline ve aile yetkileri.
- Manuel: offline taslak, uygulama kapanıp açılınca devam, uzun soru listesi,
  küçük ekran, iPad, EN/DE/TR ve erişilebilirlik.
- Gizlilik: kullanıcı girdisi etiketleri, paylaşım izinleri ve hesap değişiminde
  veri izolasyonu.

## Definition of Done

- Öncesi, görüşme anı ve sonrası tek visit entity üzerinde uçtan uca çalışır.
- İkinci rapor veya tekrar eden veri seçimleri yoktur.
- Follow-up aksiyonları mevcut reminder/medication sistemine güvenli bağlanır.
- Sağlık/gizlilik incelemesi, analytics, Plus gating ve aile rolü QA tamamlanır.
