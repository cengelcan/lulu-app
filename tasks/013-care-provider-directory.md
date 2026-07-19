# 013 — Bakım Sağlayıcı Dizini

| Alan | Değer |
|---|---|
| Durum | Backlog |
| Öncelik | P2 |
| Hedef sürüm | v1.7 |
| Tür | Özellik |
| Efor | L |
| Paket | Free + Plus |
| Bağımlılıklar | 003, 008, 009, 011 |
| Son güncelleme | 2026-07-15 |

## Bağlam ve problem

Veteriner, acil klinik, kuaför, bakıcı, sigorta ve eczane bilgileri telefon rehberi, notlar ve farklı uygulamalara dağılmış durumda. Bu kişilerle ilişkili randevu, belge, maliyet ve pet geçmişi birlikte görülemiyor.

## Kullanıcı sonucu

Kullanıcı her pet için bakım ekibini tek yerde tutar; arama, yol tarifi, randevu hazırlığı ve ilgili kayıt/belgelere hızlıca ulaşır.

## Başarı metrikleri

- Aktif kullanıcıların en az %25'inin bir bakım sağlayıcı eklemesi.
- Sağlayıcı profillerinden başlatılan arama/yol tarifi/takvim eylemlerinde %20 aylık kullanım.
- Vet Visit kullananların en az %50'sinin ziyareti bir sağlayıcıyla ilişkilendirmesi.
- Aynı ailede yinelenen sağlayıcı kayıtlarının %10 altında kalması.

## Kapsam

- Türler: ana veteriner, uzman/acil klinik, groomer, sitter/boarding, sigorta ve eczane.
- Ad, kurum, telefon, e-posta, web sitesi, adres, çalışma notu ve acil durum bilgisi.
- Sağlayıcıyı bir veya birden fazla pet ile ilişkilendirme.
- Ana veteriner ve varsayılan acil klinik seçimi.
- Arama, e-posta, web sitesi, harita/yol tarifi ve takvime ekleme aksiyonları.
- İlgili randevular, Vet Visit özetleri, belgeler, masraflar ve özel notlar.
- Aile içinde ortak dizin ve rol bazlı düzenleme.
- VCard/kişi paylaşımı veya dışa aktarma.

## Kapsam dışı

- İlk sürümde klinik arama pazaryeri veya kullanıcı yorumu.
- Gerçek zamanlı randevu rezervasyonu.
- Sağlayıcı doğrulama/sertifikasyon sistemi.
- Ödeme veya sigorta talebi işleme.

## UX ve durumlar

- Boş dizin: sağlayıcı türlerine göre hızlı ekleme.
- Profil: iletişim aksiyonları üstte, pet ilişkileri ve geçmiş altta.
- Yinelenen kayıt: birleştirme önerisi; otomatik veri kaybı yok.
- İzin verilmeyen aile üyesi: salt okunur görünüm.
- Silme: bağlı kayıtları silmeden ilişki etkisini açıklayan onay.
- Acil klinik profili: büyük ve erişilebilir arama/yol tarifi aksiyonları.

## İş kuralları

- Sağlayıcı aile/household seviyesinde saklanır, pet ilişkileri ayrı tutulur.
- Bir pet'in yalnızca bir varsayılan ana veterineri; bir varsayılan acil kliniği olabilir.
- Sağlayıcı silinince geçmiş ziyaretler ve belgeler korunur, ilişki arşivlenmiş etiketle görünür.
- Telefon/adres gibi kişisel bilgiler kullanıcı tarafından girilmiş veri olarak kabul edilir; herkese açık dizine dönüşmez.
- Harici uygulama açılmadan önce kullanıcıya hedef aksiyon net gösterilir.

## Free / Plus ayrımı

| Free | Plus |
|---|---|
| Pet başına temel veteriner ve acil klinik | Sınırsız bakım ekibi ve çoklu pet ilişkileri |
| Arama, harita ve temel not | Ziyaret/belge/masraf geçmişi ve aile paylaşımı |
| Manuel kişi bilgileri | VCard dışa aktarma, gelişmiş filtre ve varsayılan roller |

## Veri modeli ve servisler

- `care_providers`: household, tür, kimlik/iletişim alanları, arşiv durumu.
- `care_provider_pet_links`: provider, pet, rol, varsayılan işaretleri.
- `care_provider_notes`: kapsam ve yazan üye; gerekirse hassas not ayrımı.
- Mevcut visit/document/expense kayıtlarına nullable `provider_id`.
- Adres koordinatı sadece harita özelliği için gerekliyse ve açık amaçla saklanmalı.

## Gizlilik ve sağlık sınırları

- Özel notlar sağlayıcıya otomatik gönderilmez.
- Kişisel iletişim verileri analytics event'lerine eklenmez.
- Aileden çıkarılan üyenin sağlayıcı dizinine erişimi anında sonlanır.
- Sağlayıcı bilgisi doğrulanmış sağlık kurumu olarak etiketlenmez.

## i18n ve erişilebilirlik

- Telefon ve adres locale'a uygun gösterilir; ham değer korunur.
- Telefon, harita ve e-posta düğmelerinin erişilebilir adları açık olmalı.
- Sağlayıcı türleri çevrilebilir enum üzerinden gösterilmeli.
- Uzun kurum/adres metinleri Dynamic Type'ta kesilmemeli.

## Analytics

- `care_provider_created` — iletişim içeriği gönderilmez.
- `care_provider_linked_to_pet`
- `care_provider_action_started` — call/map/email/web türü.
- `care_provider_visit_linked`
- `care_provider_archived`

## Uygulama aşamaları

1. Sağlayıcı ve pet ilişki modeli.
2. Dizin, ekleme/düzenleme ve profil UX'i.
3. Sistem arama/harita/e-posta/takvim aksiyonları.
4. Vet Visit, belge ve masraf bağlantıları.
5. Aile yetkileri, vCard ve yinelenen kayıt yönetimi.

## Kabul kriterleri

- Kullanıcı ana veteriner ve acil kliniğe en fazla iki dokunuşla ulaşabilir.
- Bir sağlayıcı birden fazla pet ile ilişkilendirilebilir.
- Sağlayıcı arşivlendiğinde geçmiş ziyaret ve belgeler kaybolmaz.
- Yetkisiz aile üyesi sağlayıcı bilgilerini değiştiremez.
- Arama/harita aksiyonu doğru telefon veya adresi sistem uygulamasına taşır.
- Analytics hiçbir iletişim veya sağlık notu içeriği taşımaz.

## Test planı

- Otomatik: RLS, varsayılan rol tekilliği, arşivleme ve ilişki bütünlüğü.
- Manuel: arama, e-posta, maps, takvim, uzun adres, yinelenen kayıt ve aile rolleri.
- Entegrasyon: Vet Visit, Health Passport ve belge bağlantıları.

## Rollout ve geri dönüş

- Temel veteriner/acil klinik diziniyle başlanmalı; gelişmiş ilişkiler uzaktan açılmalı.
- Harici aksiyonlarda sorun olursa veri modeli korunarak ilgili aksiyonlar kapatılabilmeli.

## Açık sorular

- Care Hub içinde ayrı bölüm mü, pet profilinin alt bölümü mü olmalı?
- Sigorta ve masraf bilgileri aynı sürümde mi, sonraki iterasyonda mı gelmeli?
- Apple Contacts'tan içe aktarma kullanıcı değeri yaratır mı?

## Definition of Done

- CRUD, aile yetkileri ve entegrasyon testleri tamamlandı.
- Sistem aksiyonları gerçek cihazlarda doğrulandı.
- Gizlilik/veri envanteri ve locale metinleri güncellendi.
- Analytics ve kontrollü rollout hazır.
