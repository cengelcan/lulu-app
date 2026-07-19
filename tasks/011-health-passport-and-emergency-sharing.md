# 011 — Health Passport ve Güvenli Acil Durum Paylaşımı

| Alan | Değer |
|---|---|
| Durum | Backlog |
| Öncelik | P1 |
| Hedef sürüm | v1.6 |
| Tür | Özellik / Güvenlik |
| Efor | L |
| Paket | Free + Plus |
| Bağımlılıklar | 001, 004, 006, 007 |
| Son güncelleme | 2026-07-15 |

## Bağlam ve problem

Evcil hayvanın kritik bilgileri bugün farklı kayıtların içine dağılmış durumda. Acil bir durumda, yeni bir veterinere gidildiğinde veya hayvan geçici olarak başka bir bakıcıya bırakıldığında mikroçip, alerji, aktif ilaç ve aşı bilgilerine hızlı erişmek zorlaşıyor. Kullanıcının tüm hesabını paylaşması ise gereksiz ve güvensiz.

## Kullanıcı sonucu

Kullanıcı, evcil hayvanı için güncel bir sağlık kartını saniyeler içinde açabilir; seçtiği alanları süreli ve iptal edilebilir bir bağlantı veya QR koduyla güvenle paylaşabilir.

## Başarı metrikleri

- Profili uygun kullanıcıların en az %30'unun Health Passport'u tamamlaması.
- Oluşturulan paylaşım bağlantılarının en az %70'inin başarıyla açılması.
- Eski veya iptal edilmiş bağlantılardan veri sızıntısı yaşanmaması.
- Passport içindeki kritik alanların en az %90'ının doğrulanmış kaynak kayda bağlanması.

## Kapsam

- Kimlik: ad, fotoğraf, tür, ırk, doğum tarihi, cinsiyet ve mikroçip numarası.
- Kritik sağlık bilgileri: alerjiler, kronik durumlar, aktif ilaçlar, son aşılar ve özel bakım notları.
- İletişim: ana veteriner, acil klinik ve sahip/acil durum kişisi.
- Kullanıcının paylaşılacak alanları tek tek seçebilmesi.
- Salt okunur, süreli ve iptal edilebilir web bağlantısı.
- QR kod üretimi ve uygulama gerektirmeyen mobil web görünümü.
- Paylaşım geçmişi, son erişim bilgisi ve anında erişim iptali.
- İnternet olmadığında cihaz üzerinde gösterilebilen sınırlı acil durum kartı.

## Kapsam dışı

- Ulusal evcil hayvan kimlik sistemleriyle resmi entegrasyon.
- Sağlık belgesi veya seyahat sertifikası yerine geçme iddiası.
- Paylaşılan sayfa üzerinden veri düzenleme.
- İlk sürümde Apple Wallet kartı.

## UX ve durumlar

- Eksik passport: tamamlanma göstergesi ve en kritik eksik alanlar.
- Hazır passport: önizleme, güncellik tarihi ve kaynak kayıtlar.
- Paylaşım oluşturma: alan seçimi, süre seçimi, önizleme ve onay.
- Aktif paylaşım: kopyala, QR göster, süreyi görüntüle, iptal et.
- Süresi dolmuş/iptal edilmiş bağlantı: hiçbir sağlık verisi göstermeyen açıklayıcı ekran.
- Memorial profilde paylaşım özelliği varsayılan olarak kapalı olmalı.

## İş kuralları

- Paylaşım varsayılanı tüm alanlar değil, minimum güvenli alan setidir.
- Mikroçip, adres, telefon ve ayrıntılı sağlık notları ayrı açık onay gerektirir.
- Bağlantı token'ı düz metin saklanmaz; sunucuda hash'lenir ve süre sonu zorunludur.
- Kaynak kayıt güncellendiğinde passport güncellenir, fakat aktif paylaşım kapsamı kendiliğinden genişlemez.
- Silinen veya erişimi kaldırılan pet için bütün aktif bağlantılar iptal edilir.
- Passport sağlık raporu değil, kullanıcı tarafından derlenen bilgi özeti olarak etiketlenir.

## Free / Plus ayrımı

| Free | Plus |
|---|---|
| Cihaz içi sağlık kartı ve manuel görüntüleme | Süreli web linki, QR paylaşımı ve erişim geçmişi |
| Temel kimlik, mikroçip, alerji ve acil kişi | Özelleştirilebilir alanlar, birden fazla aktif paylaşım ve aile yönetimi |
| Manuel güncelleme | İlaç/aşı/kayıtlardan otomatik güncel özet |

## Veri modeli ve servisler

- `health_passport_profiles`: pet, alan tercihleri, son doğrulama zamanı.
- `health_passport_shares`: oluşturucu, pet, seçilen alanlar, token hash, son kullanma, iptal zamanı.
- `health_passport_access_logs`: paylaşım, zaman, kaba istemci bilgisi; gereksiz kişisel veri tutulmaz.
- Sunucu tarafı salt okunur public endpoint ve hız sınırlama.
- Passport verisi mümkün olduğunca mevcut pet, record, medication ve provider kayıtlarından türetilmeli; kopya veri azaltılmalı.

## Gizlilik ve sağlık sınırları

- Paylaşım ekranında hangi bilginin herkese açık bağlantıya çıkacağı açıkça gösterilmeli.
- Arama motoru indeksleme, önizleme botları ve istem dışı sosyal medya kartları engellenmeli.
- Erişim logları kullanıcıya fayda sağlayacak minimum kapsamda tutulmalı.
- Bağlantılar tahmin edilemez, süreli, iptal edilebilir ve rate-limit korumalı olmalı.
- Acil kart tıbbi tavsiye veya resmi belge olarak sunulmamalı.

## i18n ve erişilebilirlik

- Kritik etiketler kısa ve tıbbi açıdan nötr çevrilmeli.
- QR dışında kopyalanabilir bağlantı ve paylaşım seçenekleri bulunmalı.
- Dynamic Type, VoiceOver alan sırası ve yüksek kontrast doğrulanmalı.
- Tarih, ağırlık ve iletişim biçimleri locale'a göre gösterilmeli.

## Analytics

- `health_passport_viewed`
- `health_passport_completed`
- `health_passport_share_created` — alan içeriği gönderilmez.
- `health_passport_share_opened`
- `health_passport_share_revoked`
- `health_passport_share_expired`

## Uygulama aşamaları

1. Passport alan sözleşmesi ve mevcut kayıt kaynaklarının haritası.
2. Uygulama içi passport oluşturma ve önizleme.
3. Güvenli paylaşım servisi, süre ve iptal mekanizması.
4. Mobil web görünümü, QR ve erişim geçmişi.
5. Offline acil kart ve kapsamlı güvenlik testi.

## Kabul kriterleri

- Kullanıcı paylaşmadan önce alıcının göreceği bütün alanları önizleyebilir.
- Süresi dolan veya iptal edilen bağlantı sağlık verisi döndürmez.
- Bir pet'e erişimi kaybeden aile üyesi yeni paylaşım oluşturamaz.
- Aktif ilaç ve aşı kaynağı güncellendiğinde passport doğru veriyi gösterir.
- Paylaşım bağlantısı uygulama yüklü olmayan mobil cihazda açılır.
- Hassas alanlar kullanıcı seçmeden paylaşıma dahil edilmez.

## Test planı

- Otomatik: token süresi/iptali, RLS, alan filtreleme, kaynak kayıt güncelleme ve yetki testleri.
- Manuel: link/QR akışı, farklı locale'lar, offline kart, VoiceOver, iPad ve düşük bağlantı.
- Güvenlik: token tahmini, brute-force, cache sızıntısı, indeksleme ve kaldırılmış üyelik senaryoları.

## Rollout ve geri dönüş

- Önce yalnızca uygulama içi passport; paylaşım özelliği feature flag arkasında açılmalı.
- Public endpoint anomalisinde yeni paylaşım üretimi kapatılabilmeli ve aktif token'lar topluca iptal edilebilmeli.

## Açık sorular

- Varsayılan bağlantı süresi 24 saat mi, 7 gün mü olmalı?
- Offline kart ekran görüntüsüne karşı ek bir uyarı gerektiriyor mu?
- Aşı ve reçete belgelerinin kendisi mi, yalnızca özet bilgisi mi paylaşılmalı?

## Definition of Done

- Kabul kriterleri ve güvenlik testleri tamamlandı.
- Privacy Policy/veri envanteri güncellendi.
- İngilizce ve Almanca metinler doğrulandı.
- Feature flag, izleme ve toplu iptal prosedürü hazır.
