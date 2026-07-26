# 015 — Deneyim Temelleri ve Kullanıcı Tercihleri

## Task özeti

| Alan | Değer |
|---|---|
| Durum | Backlog — not toplama ve kapsam netleştirme |
| Öncelik | P1 |
| Hedef sürüm | v1.4 |
| Task türü | Ürün / UX / Altyapı |
| Tahmini efor | XL |
| Ürün katmanı | Her ikisi |
| Bağımlılıklar | 004, 008 ve v1.3 Release QA |
| Son güncelleme | 2026-07-26 |

## Bağlam ve problem

v1.3 ile medication, family activity ve Vet Visit uçtan uca çalışır hale geldi.
Bir sonraki sürümde yeni bir sağlık özelliği eklemeden önce ilk kullanım,
görsel tercih, temel pet bilgileri, locale/birim tutarlılığı, bildirim kontrolü
ve Care Hub hiyerarşisi birlikte iyileştirilmelidir.

Bu task yeni notların eklenebileceği v1.4 deneyim paketidir. Amaç eski ekranları
aynen geri getirmek veya yalnız kozmetik değişiklik yapmak değil; uygulamanın
temel kullanım sözleşmelerini açık ve tutarlı hale getirmektir.

## Kullanıcı sonucu

> Bir kullanıcı olarak Lulu'yu tercih ettiğim görünüm, dil, tarih ve ölçü
> biçimleriyle kullanmak; yalnız istediğim bildirimleri almak ve pet bakım
> araçlarına gereksiz kalabalık olmadan ulaşmak istiyorum.

## Ürün kararları

- Eski dört ekranlı onboarding carousel'i aynen geri getirilmeyecek.
- İlk kullanım kısa bir değer anlatımı ve bağlamsal, progressive onboarding ile
  çözülecek.
- Tema seçenekleri `System`, `Light` ve `Dark` olacak; varsayılan `System`.
- Tarih biçimi App Store storefront ülkesinden alınmayacak. App Store hesabının
  ülkesi kullanıcının dili, yaşadığı bölge veya tercih ettiği tarih biçimi için
  güvenilir bir kaynak değildir.
- İlk sürümde tarih/saat/sayı formatı uygulamanın aktif diline ait locale'dan
  üretilecek: EN → uygun İngilizce locale, DE → Almanca locale, TR → Türkçe
  locale. Aynı rapor ve ekranda tek formatter sözleşmesi kullanılacak.
- Ağırlık tercihi kullanıcıya aittir; aynı family içindeki kullanıcılar aynı pet
  verisini kendi `kg` veya `lb` tercihleriyle görebilir.
- Bildirim kategorisi tercihi cihaz/kullanıcı bazlıdır; bir cihazda kapatmak
  reminder, medication planı veya sağlık kaydını silmez.
- Care Tools sırası teknik modüllere göre değil, kullanım sıklığı ve bakım
  yolculuğuna göre düzenlenecek.

## Kapsam

### 1. Kısa ve progressive onboarding

- [ ] Yeni kullanıcı için tek, kısa karşılama/değer ekranı.
- [ ] Günlük bakım, aile koordinasyonu ve veteriner hazırlığını en fazla üç kısa
  faydayla anlatma.
- [ ] Karşılama sonrası doğrudan auth ve pet setup akışına geçiş.
- [ ] Medication, Family ve Vet Visit için yalnız ilk kullanımda gösterilen
  bağlamsal açıklamalar.
- [ ] Onboarding sürümünün saklanması; mevcut kullanıcıya veya tamamlayan
  kullanıcıya yeniden gösterilmemesi.
- [ ] Skip/geri/cold start/auth redirect ve family invite girişlerinin aynı
  ekranda döngü oluşturmaması.

### 2. System, Light ve Dark tema

- [ ] Settings altında `System / Light / Dark` seçimi ve kalıcı tercih.
- [ ] Tema değişikliğinin yeniden başlatma gerektirmeden uygulanması.
- [ ] Semantic renk token'larının bütün temel ekranlarda kullanılması.
- [ ] Auth, setup, Home, Care, pet detail/edit, records, reminders, medication,
  Vet Visit, reports, paywall, modal ve content state görsel turu.
- [ ] Navigation bar, status bar, splash, görseller, grafikler ve gölgelerin iki
  temada bilinçli davranması.
- [ ] WCAG AA kontrast regresyon testlerinin light ve dark palette için geçmesi.

### 3. Pet detail ve edit hiyerarşisi

- [ ] Pet detail ekranının form yerine hızlı okunabilen özet yüzeyi olması.
- [ ] Üst bölümde fotoğraf, ad, yaş ve temel durum.
- [ ] Irkın tek özet satırı olarak gösterilmesi; tüm seçeneklerin varsayılan açık
  listelenmemesi.
- [ ] Sağlık sorunlarının kompakt chip/özet olarak gösterilmesi; uzun listede
  `+N more` benzeri kontrollü genişleme.
- [ ] Irk ve sağlık seçeneklerinin yalnız Edit sırasında searchable picker veya
  sheet içinde açılması.
- [ ] Profil, sağlık, bakım ve paylaşım bölümlerinin kısa ve belirgin hiyerarşisi.
- [ ] Büyük metin ve küçük ekranda ana aksiyonların uzun içerik altında
  kaybolmaması.

### 4. Tek tarih ve locale sözleşmesi

- [ ] Uygulama ve PDF raporları için ortak tarih/saat formatter katmanı.
- [ ] Aynı raporda `DD.MM.YYYY`, `MM/DD/YYYY` ve yazılı tarihlerin istemeden
  karışmasının engellenmesi.
- [ ] Saklama ve senkronizasyonda ISO tarih/zaman değerlerinin korunması;
  locale'ın yalnız gösterim katmanında uygulanması.
- [ ] Tarih aralığı, record tarihi, report başlığı, timeline, reminder,
  medication ve Vet Visit çıktılarının aynı aktif locale'ı kullanması.
- [ ] 12/24 saat davranışının aktif locale/sistem tercihiyle tutarlı olması.
- [ ] EN, DE ve TR için snapshot/unit testleri; DST ve gün sınırı testleri.

### 5. Kullanıcıya özel ağırlık birimi

- [ ] Settings altında `kg / lb` tercihi.
- [ ] İlk varsayılanın aktif locale/region için belgelenmiş kuralla seçilmesi;
  kullanıcı seçiminin her zaman öncelikli olması.
- [ ] Weight record formu, pet detail, Home/Health Overview, grafikler ve PDF
  raporlarının aynı tercihe uyması.
- [ ] Mevcut kayıtların birimi bilinerek güvenli dönüşüm; yuvarlama kaynaklı
  değer drift'i oluşmaması.
- [ ] Aynı değer art arda kg ↔ lb görüntülendiğinde saklanan temel değerin
  değişmemesi.
- [ ] Family üyelerinin aynı pet kaydını kendi birim tercihiyle görebilmesi.

### 6. Ayrıntılı bildirim tercihleri

- [ ] Sistem bildirim izni ile uygulama içi kategori tercihlerinin görsel olarak
  ayrılması.
- [ ] Daily Check-in bildirimi ve saati.
- [ ] Genel pet reminder bildirimleri.
- [ ] Medication dose ve refill bildirimleri.
- [ ] Family Activity digest bildirimi ve destekleniyorsa sıklığı.
- [ ] Gelecekte Vet Visit yaklaşan randevu bildirimi eklenebilmesi için genişleyen
  kategori sözleşmesi.
- [ ] Bir kategori kapatıldığında o kategoriye ait planlanmış local
  notification'ların iptal edilmesi; yeniden açıldığında yalnız gelecekteki
  uygun bildirimlerin tekrar planlanması.
- [ ] OS izni kapalıysa kategori seçimlerinin kaybolmaması ve Settings'e açık
  yönlendirme gösterilmesi.
- [ ] Bildirim önizlemelerinde hassas sağlık notu, family kodu veya tedavi
  ayrıntısının varsayılan gösterilmemesi.

### 7. Care Tools bilgi mimarisi

- [ ] Sıralamanın analytics ve kullanıcı yolculuğuyla doğrulanması.
- [ ] Başlangıç önerisi: `Check-in → Medications → Reminders → Vet Visits →
  Health Records`; güncel/urgent aksiyonların statik araç listesinin üstünde
  kalması.
- [ ] Health Report ve Family Activity'nin bağlama uygun ayrı bölüm/aksiyon
  olarak değerlendirilmesi; Care Tools içine rastgele karıştırılmaması.
- [ ] Sık kullanılan araçların erişimini kolaylaştırırken nadir araçları
  görünmez hale getirmeyen bölümleme.
- [ ] VoiceOver sırası ile görsel sıranın aynı olması.

### Kapsam dışı

- Eski onboarding tasarımının birebir geri getirilmesi.
- App Store storefront ülkesinin locale tercihi olarak kullanılması.
- Kullanıcı onayı olmadan bütün mevcut ağırlık değerlerinin kalıcı olarak başka
  bir birime dönüştürülmesi.
- Bildirim içinden hassas sağlık bilgisi gösteren zengin içerik.
- Care sekmesinin yeni bir navigasyon mimarisiyle tamamen değiştirilmesi.
- Belge tarama/içe aktarma; task 009 kapsamında kalır.

## İş kuralları

- Kullanıcı tercihleri Free ve Plus için aynıdır; temel erişilebilirlik ve locale
  davranışı paywall arkasında olamaz.
- Tema, dil ve ağırlık birimi birbirinden bağımsız değiştirilebilir.
- Kullanıcıya ait tercih family/pet sağlık verisinin parçası yapılmaz.
- Tarih ve ağırlık dönüşümleri yalnız tek, test edilmiş yardımcı katmandan geçer;
  ekran içinde elle format string'i veya dönüşüm katsayısı yazılmaz.
- Notification category kapatma işlemi domain verisini değiştirmez.
- Mevcut kullanıcı migration'ı eski görünüm ve veri anlamını koruyan güvenli
  varsayılanlar üretir.

## Veri modeli ve teknik taslak

### Tercihler

- `themePreference`: `system | light | dark`.
- `weightUnitPreference`: `kg | lb`.
- `onboardingVersionCompleted`: number/string.
- Notification preferences: `dailyCheckIn`, `petReminders`,
  `medicationDoses`, `medicationRefill`, `familyDigest`; cihaz bazlı saklama ve
  gerekiyorsa kullanıcı profiliyle senkronizasyon sınırı implementasyon öncesi
  kesinleştirilir.

### Ortak formatlama

- Aktif uygulama dili → locale çözümlemesi tek kaynaktan yapılır.
- Tarih, saat, sayı ve ağırlık gösterimi ortak utility/hook katmanına taşınır.
- PDF üretimi uygulamadaki formatter'ı kullanır; HTML template içinde bağımsız
  locale varsayımı yapılmaz.
- Ağırlık saklama stratejisi implementasyon öncesi mevcut kayıtlarla doğrulanır;
  önerilen yaklaşım canonical kg + display-time conversion'dır.

### Muhtemel dosyalar

- `constants/theme-colors.ts`
- `hooks/use-theme-color.ts`
- `utils/locale.ts`
- `utils/weight-*`
- `services/reports/*`
- `storage/prefs.storage.ts`
- `stores/language.store.ts`
- `stores/notification.store.ts`
- `components/settings/*`
- `components/care/CareHubScreen.tsx`
- `app/pet-profile.tsx`
- `app/edit-pet.tsx`
- `app/(onboarding)/*`

## Gizlilik, güvenlik ve sağlık sınırları

- Tema, locale ve birim tercihleri hassas sağlık içeriği taşımaz.
- Bildirim ayarlarında içerik örneği gösterilecekse gerçek pet sağlık notu
  kullanılmaz.
- Kilit ekranı bildirimi minimum bilgi ilkesiyle hazırlanır.
- Analytics içine pet adı, sağlık durumu, medication adı veya rapor içeriği
  yazılmaz.

## Lokalizasyon ve erişilebilirlik

- [ ] EN/DE/TR metinleri birlikte eklenir.
- [ ] Tarih, saat, ondalık ayırıcı ve birimler aktif locale ile doğrulanır.
- [ ] VoiceOver tema seçeneklerini, birim seçimini ve toggle durumlarını açıkça
  okur.
- [ ] Light/dark kontrastı, Dynamic Type ve Reduce Motion kontrol edilir.
- [ ] Uzun Almanca metin ve en büyük makul yazı boyutunda Settings/Care/pet
  detail taşmaz.

## Analytics

Hassas içerik veya kullanıcı tercihinin değeri zorunlu değilse event'e
yazılmaz.

- `onboarding_started`, `onboarding_skipped`, `onboarding_completed`
- `appearance_preference_changed`
- `weight_unit_changed`
- `notification_category_changed` — yalnız kategori ve enabled durumu
- `care_tool_opened` — yalnız araç kimliği ve sırası

## Uygulama fazları

### Faz 0 — Audit ve sözleşmeler

- [ ] Rapor ve ekranlardaki bütün tarih formatter'larını envanterle.
- [ ] Ağırlık giriş/gösterim/saklama noktalarını ve legacy kayıtları envanterle.
- [ ] Notification schedule kaynakları ve mevcut tercih migration'ını çıkar.
- [ ] Tema token'larında hard-coded dark yüzeyleri belirle.
- [ ] Care Tools kullanım verisi yoksa sıralamayı kullanıcı yolculuğu kararıyla
  geçici olarak sabitle.

### Faz 1 — Tercih altyapısı

- [ ] Tema, ağırlık ve notification kategori preference sözleşmeleri.
- [ ] Ortak locale/date/weight formatter katmanı.
- [ ] Mevcut kullanıcılar için geriye uyumlu local migration.

### Faz 2 — Ana kullanıcı yüzeyleri

- [ ] Settings tercih ekranları.
- [ ] Pet detail/edit progressive disclosure tasarımı.
- [ ] Care Tools yeni bölümleme ve sıralama.
- [ ] Kısa onboarding ve bağlamsal açıklamalar.

### Faz 3 — Uygulama geneli geçiş

- [ ] Tema ve formatter'ların bütün ekranlara uygulanması.
- [ ] Report/PDF, notification scheduling ve family görünümünün uyarlanması.
- [ ] EN/DE/TR, iPhone/iPad, accessibility ve migration QA.

## Kabul kriterleri

- [ ] Yeni kullanıcı Lulu'nun değerini anlayıp gereksiz carousel olmadan pet
  setup'a ulaşır.
- [ ] System, Light ve Dark seçimi uygulamanın temel ekranlarında tutarlı çalışır.
- [ ] Aynı raporda tarih formatı karışmaz; aktif dilin locale'ı her yerde aynıdır.
- [ ] Ağırlık girişi ve gösterimi seçilen birime uyar; dönüşüm veri drift'i
  oluşturmaz.
- [ ] Daily Check-in, pet reminder, medication ve family bildirimleri ayrı ayrı
  yönetilebilir.
- [ ] Care Tools sırası günlük bakım yolculuğunu destekler ve erişilebilir sıra
  ile eşleşir.
- [ ] Pet detail seçenek listesi gibi görünmez; bilgiler kısa özet halinde okunur.
- [ ] Mevcut kullanıcı güncellemesinde tercih veya sağlık verisi kaybolmaz.

## Test planı

### Otomatik

- Locale/date formatter snapshot ve timezone testleri.
- Kg/lb dönüşüm, precision ve round-trip testleri.
- Tema preference çözümleme ve semantic contrast testleri.
- Notification category schedule/cancel/reschedule testleri.
- Onboarding route ve mevcut kullanıcı migration testleri.
- Care Tools görsel/VoiceOver sıra sözleşmesi.

### Manuel QA

- [ ] Temiz kurulum ve v1.3 → v1.4 yükseltme.
- [ ] Fiziksel iPhone ve küçük/büyük iPhone Simulator.
- [ ] iPad portrait/landscape smoke turu.
- [ ] System/Light/Dark ve uygulama açıkken sistem tema değişimi.
- [ ] EN/DE/TR; rapor, timeline ve tarih sınırı senaryoları.
- [ ] Kg/lb iki kullanıcıyla aynı shared pet görünümü.
- [ ] Her notification kategorisi açık/kapalı ve OS permission denied.
- [ ] Dynamic Type, VoiceOver, Reduce Motion ve kontrast.

## Rollout ve geri dönüş

- Tercih migration'ları additive ve geriye uyumlu olmalı.
- Yeni onboarding yalnız yeni/uygun kullanıcıya version gate ile gösterilmeli.
- Tema geçişi feature flag ile açılabilmeli; sorun halinde mevcut dark tema
  güvenli fallback olarak kalmalı.
- Formatter veya birim migration'ında kaynak sağlık değeri overwrite edilmemeli.

## Açık sorular

- [ ] Aktif uygulama dili dışında ayrıca `Region / Date format` tercihi gerekli mi,
  yoksa dil tabanlı locale v1.4 için yeterli mi?
- [ ] Ağırlık tercihi Supabase user profile ile cihazlar arasında senkronize
  edilmeli mi?
- [ ] Medication refill bildirimi v1.4'te ayrı toggle mı, medication altında alt
  tercih mi olmalı?
- [ ] Care Tools kullanım analytics'i yayın öncesinde yeterli veri üretecek mi?
- [ ] Progressive onboarding tooltip, coach mark veya inline card yaklaşımından
  hangisini kullanmalı?

## Definition of Done

- [ ] Bütün kabul kriterleri otomatik ve manuel testlerle doğrulandı.
- [ ] Yeni preference migration'ı veri kaybı olmadan geçti.
- [ ] Rapor ve uygulama aynı locale/format sözleşmesini kullanıyor.
- [ ] Tema ve pet detail referans ekranları tasarım QA'dan geçti.
- [ ] Bildirim category değişiklikleri gerçek cihazda schedule/cancel ile
  doğrulandı.
- [ ] Roadmap ve Release QA yeni davranışlarla güncellendi.
