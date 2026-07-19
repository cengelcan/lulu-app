# 012 — Akıllı Bakım Planları

| Alan | Değer |
|---|---|
| Durum | Backlog |
| Öncelik | P2 |
| Hedef sürüm | v1.7 |
| Tür | Özellik / İçerik sistemi |
| Efor | XL |
| Paket | Free + Plus |
| Bağımlılıklar | 002, 006, 008, 010 |
| Son güncelleme | 2026-07-15 |

## Bağlam ve problem

Kullanıcılar hangi rutin bakımların ne zaman yapılacağını hatırlamakta zorlanıyor. Basit hatırlatıcılar tekil işleri çözüyor; fakat yaş, tür, kullanıcı tercihi ve veteriner önerilerine göre düzenlenebilen bütünlüklü bir bakım planı sunmuyor.

## Kullanıcı sonucu

Kullanıcı, veterinerinin önerileriyle uyumlu olacak şekilde düzenleyebildiği, açıklanabilir ve takip edilebilir bir bakım planına sahip olur; yaklaşan işleri görür ve tamamlandıkça plan ilerlemesini takip eder.

## Başarı metrikleri

- Plan oluşturan kullanıcıların en az %50'sinin ilk hafta bir öğeyi tamamlaması.
- Aktif planlarda aylık görev tamamlama oranının %40 üzerinde olması.
- Kullanıcıların önerilerin en az %80'inde neden/kaynak açıklamasını görebilmesi.
- Yanlış otomatik plan değişikliği nedeniyle oluşan kritik destek talebi bulunmaması.

## Kapsam

- Sürüm kontrollü bakım şablonları: aşı takibi, parazit önleme, diş bakımı, tımar, kilo kontrolü ve ilaç rutini.
- Tür, yaşam evresi, kullanıcının seçtiği ihtiyaçlar ve doğrulanmış pet bilgileriyle başlangıç önerisi.
- Her öneri için neden, varsayım ve gerektiğinde veterinere danışma uyarısı.
- Kullanıcının öneriyi kabul, düzenle, ertele veya kaldırabilmesi.
- Plan öğesinden reminder/check-in/medication planı oluşturma.
- Tamamlanma geçmişi, yaklaşan işler ve geciken öğeler.
- Veteriner ziyareti sonrası planı kullanıcı onayıyla revize etme.
- Aile üyeleri için ortak görünüm ve sorumlu atama.

## Kapsam dışı

- Hastalık teşhisi veya tedavi önerisi.
- Otomatik reçete, doz ya da beslenme reçetesi oluşturma.
- İlk sürümde serbest metin üreten yapay zekânın tek başına plan belirlemesi.
- Klinik protokollerin yerini alma iddiası.

## UX ve durumlar

- Başlangıç: kısa hedef seçimi, mevcut rutinler ve veteriner önerileri.
- Taslak plan: öneriler, nedenleri, sıklıkları ve kullanıcı onayı.
- Aktif plan: bugün, yakında, geciken ve tamamlanan bölümleri.
- Veri yetersiz: tahmin yapmak yerine eksik bilgiyi isteme.
- Çakışma: mevcut reminder/medication planıyla birleştirme veya ayrı tutma seçimi.
- Şablon güncellemesi: değişiklik özeti ve kabul ekranı; sessizce değiştirme yok.

## İş kuralları

- Plan motoru ilk sürümde deterministik ve sürüm kontrollü kurallardan oluşur.
- Kullanıcı onayı olmadan yeni sağlık görevi veya ilaç dozu oluşturulmaz.
- Ülke, tür ve yaşam evresine göre değişebilecek klinik öneriler genellenmez; içerik kapsamı açık yazılır.
- Tamamlanan gerçek kayıt, aynı plan öğesinin manuel tamamlanmasını idempotent biçimde karşılar.
- Zaman dilimi değişikliklerinde yerel saat tercihi korunur.
- Memorial profillerde aktif bakım planı durdurulur ve geçmiş korunur.

## Free / Plus ayrımı

| Free | Plus |
|---|---|
| Bir temel bakım şablonu ve manuel düzenleme | Pet verilerine göre kişiselleştirilmiş birden fazla plan |
| Temel görev tamamlama | Adaptif öneriler, ilerleme özeti ve aile sorumluları |
| Standart hatırlatıcı bağlantısı | Vet Visit sonuçları, ilaç ve insight verileriyle bağlantılı revizyon |

## Veri modeli ve servisler

- `care_plan_templates`: sürüm, uygunluk koşulları, içerik kaynağı ve locale.
- `care_plans`: pet, şablon sürümü, durum, oluşturucu ve kullanıcı tercihleri.
- `care_plan_items`: tür, sıklık, sonraki tarih, kaynak, sorumlu, durum.
- `care_plan_events`: kabul, düzenleme, erteleme, tamamlama ve sistem önerileri.
- Kural değerlendirme servisi aynı girdiye aynı sonucu üretmeli ve karar gerekçesini saklamalı.

## Gizlilik ve sağlık sınırları

- Her öneri sağlık tavsiyesi değil, organizasyon desteği olarak konumlanmalı.
- Doz, aşı tarihi veya tedavi değişikliği veteriner onayı olmadan önerilmemeli.
- İçerik şablonlarının editoryal sahibi, kaynağı, gözden geçirme tarihi ve sürümü olmalı.
- Kişisel sağlık verisi reklam veya üçüncü taraf profilleme amacıyla kullanılmamalı.

## i18n ve erişilebilirlik

- Klinik terimler locale bazında uzman gözden geçirmesinden geçmeli.
- Takvim sıklıkları doğal dilde ve erişilebilir biçimde okunmalı.
- Renk tek durum göstergesi olmamalı; ikon ve metin kullanılmalı.
- Büyük metinde yatay kaydırma veya kesilme olmamalı.

## Analytics

- `care_plan_started`
- `care_plan_generated`
- `care_plan_item_accepted`
- `care_plan_item_edited`
- `care_plan_item_completed`
- `care_plan_item_snoozed`
- `care_plan_template_update_accepted`

## Uygulama aşamaları

1. İçerik yönetişimi, kaynak ve şablon şeması.
2. Deterministik kural motoru ve açıklama çıktısı.
3. Taslak/aktif plan UX'i ve reminder bağlantıları.
4. İlaç, Vet Visit ve insight entegrasyonları.
5. Aile sorumluları, ilerleme özeti ve kontrollü rollout.

## Kabul kriterleri

- Her öneri neden üretildiğini ve hangi veriye dayandığını gösterir.
- Kullanıcı bütün önerileri etkinleşmeden önce düzenleyebilir veya reddedebilir.
- Şablon güncellemesi aktif planı kullanıcı onayı olmadan değiştirmez.
- Aynı tamamlanma olayı iki kez görev kapatmaz veya çift kayıt üretmez.
- Veri yetersizse sistem kesin öneri vermek yerine eksik bilgiyi belirtir.
- Plan silindiğinde bağlı bağımsız sağlık kayıtları silinmez.

## Test planı

- Otomatik: kural matrisi, sürüm geçişi, idempotency, saat dilimi, RLS ve entegrasyon testleri.
- İçerik: her şablon için kaynak, son inceleme tarihi ve klinik sınır kontrolü.
- Manuel: onboarding, çakışan reminders, aile ataması, memorial ve erişilebilirlik.

## Rollout ve geri dönüş

- Önce sınırlı şablon ve locale ile feature flag altında açılmalı.
- Sorunlu şablon yeni plan üretiminden kaldırılabilmeli; mevcut kullanıcı planı bozulmamalı.

## Açık sorular

- İlk desteklenecek türler yalnızca kedi/köpek mi olmalı?
- İçerik incelemesi için hangi veteriner danışmanlık süreci kullanılacak?
- Kullanıcının kendi özel şablonunu paylaşması ileride desteklenmeli mi?

## Definition of Done

- Şablon yönetişimi ve klinik inceleme süreci belgeli.
- Kural ve entegrasyon testleri tamamlandı.
- Analytics, rollout ve içerik geri alma mekanizması hazır.
- En az İngilizce ve Almanca içerik uzman kontrolünden geçti.
