# 015 — Deneyim Temelleri ve Kullanıcı Tercihleri

## Task özeti

| Alan | Değer |
|---|---|
| Durum | Done — v1.4.0 App Store'da yayında |
| Öncelik | P1 |
| Hedef sürüm | v1.4 |
| Task türü | Ürün / UX / Altyapı |
| Tahmini efor | XL |
| Ürün katmanı | Her ikisi |
| Bağımlılıklar | 004, 008 ve v1.3 Release QA |
| Son güncelleme | 2026-08-16 |

## Bağlam ve problem

v1.3 ile medication, family activity ve Vet Visit uçtan uca çalışır hale geldi.
Bir sonraki sürümde yeni bir sağlık özelliği eklemeden önce ilk kullanım,
görsel tercih, temel pet bilgileri, locale/birim tutarlılığı, bildirim kontrolü
ve Care Hub hiyerarşisi birlikte iyileştirilmelidir.

Bu task yeni notların eklenebileceği v1.4 deneyim paketidir. Amaç eski ekranları
aynen geri getirmek veya yalnız kozmetik değişiklik yapmak değil; uygulamanın
temel kullanım sözleşmelerini açık ve tutarlı hale getirmektir.

## Kapanış notu — 2026-08-16

Task 015, iOS build `17` ile tamamlandı. Build, kaynak commit `b334628` üzerinden
üretildi; EAS submission başarıyla tamamlandı ve v1.4.0, 2026-08-02 tarihinde
App Store'da yayına alındı. Canlı iOS release policy de mağaza yayını
doğrulandıktan sonra `latest_version = 1.4.0` olarak güncellendi.

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
- Uygulama dili ile cihaz bölgesi ayrı kaynaklardır. Metinler ve metin içeren
  tarih parçaları aktif uygulama dilini; kısa tarih sırası, sayı ayırıcıları ve
  12/24 saat davranışı cihazın Region/Calendar ayarını kullanır. Örneğin Türkiye
  bölgesinde İngilizce Lulu kullanan kişi İngilizce metinlerle birlikte gün-ay-yıl
  ve 24 saat düzeni görür.
- `en-TR` gibi birleştirilmiş BCP 47 etiketine tek başına güvenilmeyecek; bazı
  Intl/CLDR ortamları bunu ABD tarih ve sayı düzenine geri düşürebilir. Ortak
  formatter bu durumu test edilmiş bölgesel kurallarla güvenli biçimde çözer.
- v1.4'te ayrıca uygulama içi Region/Date Format seçimi eklenmez. Cihaz bölgesi
  değişirse yeni değer uygulama açılışında; Android'de ayrıca foreground
  dönüşünde yeniden okunur.
- Ağırlık tercihi kullanıcıya aittir; local-first saklanır ve authenticated
  kullanıcı için profil tercihi olarak cihazlar arasında senkronize edilir. Aynı
  family içindeki kullanıcılar aynı pet verisini kendi `kg` veya `lb`
  tercihleriyle görebilir.
- Mevcut ağırlık kayıtlarının `{ value, unit }` kaynağı yeniden yazılmaz. Grafik,
  karşılaştırma ve gösterim katmanı her kaydı ortak dönüşüm utility'siyle
  normalize eder; tercih değiştirmek sağlık verisini mutate etmez.
- Bildirim kategorisi tercihi cihaz/kullanıcı bazlıdır; bir cihazda kapatmak
  reminder, medication planı veya sağlık kaydını silmez.
- Care Tools sırası teknik modüllere göre değil, kullanım sıklığı ve bakım
  yolculuğuna göre düzenlenecek.
- Analytics v1.4 için bağımlılık değildir. Başlangıç sırası kullanıcı yolculuğu
  kararıyla sabitlenir; analytics ayrı bir sonraki çalışma olarak kalır.
- Medication dose ve refill bildirimleri ayrı tercihlerdir.
- İlk açılış tek kısa değer ekranıdır; Medication, Family ve Vet Visit eğitimi
  ilgili yüzeyde bir defa gösterilen inline açıklamalarla yapılır.
- App Store binary güncellemeleri cihazın otomatik güncelleme ayarına bırakılmaz;
  uygulama açılışında Supabase'teki iOS release policy kontrol edilir. Önerilen
  güncelleme `Daha Sonra` seçeneği olan Lulu-stilli sheet, desteklenmeyen sürüm
  ise kapatılamayan tam ekran olarak gösterilir. Ağ/policy hatası açılışı
  engellemez ve uygulama güncellemeyi kendi içinde kurmaya çalışmaz. Bu kod ilk
  kez v1.4 binary'sinde bulunduğu için mağazadaki v1.3 → v1.4 geçişini geriye
  dönük yönetemez; uygulama içi yönlendirme v1.4 → sonraki sürümlerde etkindir.

## Kapsam

### 1. Kısa ve progressive onboarding

- [x] Yeni kullanıcı için tek, kısa karşılama/değer ekranı.
- [x] Günlük bakım, aile koordinasyonu ve veteriner hazırlığını en fazla üç kısa
  faydayla anlatma.
- [x] Karşılama sonrası doğrudan auth ve pet setup akışına geçiş.
- [x] Medication, Family ve Vet Visit için yalnız ilk kullanımda gösterilen
  bağlamsal açıklamalar.
- [x] Onboarding sürümünün saklanması; mevcut kullanıcıya veya tamamlayan
  kullanıcıya yeniden gösterilmemesi.
- [x] Skip/geri/cold start/auth redirect ve family invite girişlerinin aynı
  ekranda döngü oluşturmaması.

### 2. System, Light ve Dark tema

- [x] Settings altında `System / Light / Dark` seçimi ve kalıcı tercih.
- [x] Tema değişikliğinin yeniden başlatma gerektirmeden uygulanması.
- [x] Semantic renk token'larının bütün temel ekranlarda kullanılması.
- [x] Auth, setup, Home, Care, pet detail/edit, records, reminders, medication,
  Vet Visit, reports, paywall, modal ve content state görsel turu.
- [x] Navigation bar, status bar, splash, görseller, grafikler ve gölgelerin iki
  temada bilinçli davranması.
  - 2026-07-27: Native splash ve ilk karşılama ekranı sistem görünümünü izleyen
    ayrı light/dark görsellere geçirildi. Açık splash için daha yüksek kontrastlı
    logo üretildi; ilk preference yüklenmeden önceki zorunlu dark fallback
    kaldırıldı. Pet türü seçimi, edit/avatar, setup ve Home yardım kartındaki
    stok kedi/köpek görselleri ortak Lulu illüstrasyon setiyle değiştirildi.
    Fotoğrafı olmayan pet avatarları Check-in, Home, My Pets, Pet Edit, profil,
    setup ve family yüzeylerinde tür bilgisini aynı ortak sete iletiyor.
- [x] WCAG AA kontrast regresyon testlerinin light ve dark palette için geçmesi.

### 3. Pet detail ve edit hiyerarşisi

- [x] Pet detail ekranının form yerine hızlı okunabilen özet yüzeyi olması.
- [x] Üst bölümde fotoğraf, ad, yaş ve temel durum.
- [x] Irkın tek özet satırı olarak gösterilmesi; tüm seçeneklerin varsayılan açık
  listelenmemesi.
- [x] Sağlık sorunlarının kompakt chip/özet olarak gösterilmesi; uzun listede
  `+N more` benzeri kontrollü genişleme.
- [x] Irk ve sağlık seçeneklerinin yalnız Edit sırasında searchable picker veya
  sheet içinde açılması.
- [x] Profil, sağlık, bakım ve paylaşım bölümlerinin kısa ve belirgin hiyerarşisi.
- [x] Büyük metin ve küçük ekranda ana aksiyonların uzun içerik altında
  kaybolmaması.

### 4. Tek tarih ve locale sözleşmesi

- [x] Uygulama ve PDF raporları için ortak tarih/saat formatter katmanı.
- [x] Aynı raporda `DD.MM.YYYY`, `MM/DD/YYYY` ve yazılı tarihlerin istemeden
  karışmasının engellenmesi.
- [x] Saklama ve senkronizasyonda ISO tarih/zaman değerlerinin korunması;
  locale'ın yalnız gösterim katmanında uygulanması.
- [x] Tarih aralığı, record tarihi, report başlığı, timeline, reminder,
  medication ve Vet Visit çıktılarının aynı aktif locale'ı kullanması.
- [x] 12/24 saat davranışının aktif locale/sistem tercihiyle tutarlı olması.
- [x] EN, DE ve TR için snapshot/unit testleri; DST ve gün sınırı testleri.

### 5. Kullanıcıya özel ağırlık birimi

- [x] Settings altında `kg / lb` tercihi.
- [x] İlk varsayılanın aktif locale/region için belgelenmiş kuralla seçilmesi;
  kullanıcı seçiminin her zaman öncelikli olması.
- [x] Weight record formu, pet detail, Home/Health Overview, grafikler ve PDF
  raporlarının aynı tercihe uyması.
- [x] Mevcut kayıtların birimi bilinerek güvenli dönüşüm; yuvarlama kaynaklı
  değer drift'i oluşmaması.
- [x] Aynı değer art arda kg ↔ lb görüntülendiğinde saklanan temel değerin
  değişmemesi.
- [x] Family üyelerinin aynı pet kaydını kendi birim tercihiyle görebilmesi.

### 6. Ayrıntılı bildirim tercihleri

- [x] Sistem bildirim izni ile uygulama içi kategori tercihlerinin görsel olarak
  ayrılması.
- [x] Daily Check-in bildirimi ve saati.
- [x] Genel pet reminder bildirimleri.
- [x] Medication dose ve refill bildirimleri.
- [x] Family Activity digest bildirimi ve destekleniyorsa sıklığı. — v1.4'te
  mevcut digest sıklığı korunuyor; ayrı sıklık seçimi eklenmedi.
- [x] Gelecekte Vet Visit yaklaşan randevu bildirimi eklenebilmesi için genişleyen
  kategori sözleşmesi. — Yeni kategori v1.4 kapsamına alınmadı; mevcut sürümlü
  preference sözleşmesi ileride ek kategori taşıyabilecek şekilde bırakıldı.
- [x] Bir kategori kapatıldığında o kategoriye ait planlanmış local
  notification'ların iptal edilmesi; yeniden açıldığında yalnız gelecekteki
  uygun bildirimlerin tekrar planlanması.
- [x] OS izni kapalıysa kategori seçimlerinin kaybolmaması ve Settings'e açık
  yönlendirme gösterilmesi.
- [x] Bildirim önizlemelerinde hassas sağlık notu, family kodu veya tedavi
  ayrıntısının varsayılan gösterilmemesi.

### 7. Care Tools bilgi mimarisi

- [x] Sıralamanın kullanıcı yolculuğuyla doğrulanması; analytics ürün kararıyla
  sonraki çalışmaya ertelendi.
- [x] Başlangıç önerisi: `Check-in → Medications → Reminders → Vet Visits →
  Health Records`; güncel/urgent aksiyonların statik araç listesinin üstünde
  kalması.
- [x] Health Report ve Family Activity'nin bağlama uygun ayrı bölüm/aksiyon
  olarak değerlendirilmesi; Care Tools içine rastgele karıştırılmaması.
- [x] Sık kullanılan araçların erişimini kolaylaştırırken nadir araçları
  görünmez hale getirmeyen bölümleme.
- [x] VoiceOver sırası ile görsel sıranın aynı olması.

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
- `weightUnitPreference`: `kg | lb`; local-first ve kullanıcı profiliyle
  senkronize.
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
- Legacy ağırlık kaydı kendi `value + unit` değerini korur. Ortak utility her
  kaydı hesaplama sırasında kg'a normalize eder ve seçilen birime display-time
  conversion uygular; tercih değişimi kayıt metadata'sını overwrite etmez.

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

- [x] EN/DE/TR metinleri birlikte eklenir.
- [x] Tarih, saat, ondalık ayırıcı ve birimler aktif locale ile doğrulanır.
- [x] VoiceOver tema seçeneklerini, birim seçimini ve toggle durumlarını açıkça
  okur.
- [x] Light/dark kontrastı, Dynamic Type ve Reduce Motion kontrol edilir.
- [x] Uzun Almanca metin ve en büyük makul yazı boyutunda Settings/Care/pet
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

- [x] Rapor ve ekranlardaki bütün tarih formatter'larını envanterle. — Ayrıntılar `015-experience-foundations-audit.md` içinde.
- [x] Ağırlık giriş/gösterim/saklama noktalarını ve legacy kayıtları envanterle.
- [x] Notification schedule kaynakları ve mevcut tercih migration'ını çıkar.
- [x] Tema token'larında hard-coded dark yüzeyleri belirle.
- [x] Care Tools kullanım verisi yoksa sıralamayı kullanıcı yolculuğu kararıyla
  geçici olarak sabitle.

### Faz 1 — Tercih altyapısı

- [x] Tema, ağırlık ve notification kategori preference sözleşmeleri. — Versiyonlu schema, güvenli varsayılanlar ve kategori sözleşmesi eklendi.
- [x] Ortak locale/date/weight formatter katmanı. — Uygulama dili + cihaz bölgesi context'i, kısa/uzun tarih, saat, sayı ve drift oluşturmayan kg/lb utility'leri testlerle eklendi.
- [x] Mevcut kullanıcılar için geriye uyumlu local migration. — Legacy değerler yeni SQLite localStorage kaydına kopyalanıyor; hata açılışı engellemiyor ve eski anahtarlar silinmiyor.

### Faz 2 — Ana kullanıcı yüzeyleri

- [x] Settings tercih ekranları. — Tema, ağırlık birimi ve notification kategori
  tercihleri tamamlandı.
- [x] Pet detail/edit progressive disclosure tasarımı. — Profil fotoğraf/ad/yaş/durum
  özeti, kontrollü sağlık chip'leri ve Edit içinde açılan searchable ırk/sağlık
  alanları tamamlandı; büyük metinde hero dikey düzene geçiyor ve Edit aksiyonu
  navigation header'da görünür kalıyor.
- [x] Care Tools yeni bölümleme ve sıralama. — Aksiyon gerekli/yaklaşan içerik
  statik araçların üstüne taşındı; ana sıra tek sabitten üretiliyor ve Health
  Report ile Family Activity `Geçmiş ve koordinasyon` bölümünde ayrıştırıldı.
- [x] Kısa onboarding ve bağlamsal açıklamalar. — Eski dört adımlı route'lar
  kaldırıldı; tek welcome ekranı üç kısa faydayla doğrudan auth'a ilerliyor.
  Onboarding legacy boolean ve sürümlü preference birlikte tamamlanıyor;
  Medication, Family ve Vet Visit açıklamaları konu bazında bir defa gösteriliyor.

### Faz 3 — Uygulama geneli geçiş

- [x] Tema ve formatter'ların bütün ekranlara uygulanması.
  - Root/navigation/status bar/splash, Settings, auth/reset-password,
    onboarding kabuğu, Check-in, Home haftalık check-in, ortak date/time picker,
    family/medication/Vet Visit hata durumları ve dashboard empty-state
    illüstrasyonları light/dark semantic token'lara geçirildi. Reports ekran
    kabuğu, Paywall ve Family rozet/avatarlardaki kontrast da uyarlandı; PDF'in
    yazdırılabilir belge yüzeyi bilinçli olarak beyaz bırakıldı.
  - Cihaz bölgesini uygulama dilinden bağımsız okuyan ortak regional context
    hook'u eklendi. Care/Vet Visit tarih-saatleri, Home tarih başlığı ve yaklaşan
    reminder, Check-in, pet tarihleri ve ortak date/time picker bu sözleşmeye
    geçirildi. `YYYY-MM-DD` değerlerinin saat diliminde gün kaydırmaması testle
    güvenceye alındı. Rapor, timeline ve diğer uygulama yüzeylerinin formatter
    geçişi de tamamlandı.
  - Regional context Reports/PDF üretim zincirine, record/reminder listelerine,
    inbox ve Family Activity veri akışına, Health Overview ve kilo grafiğine
    taşındı. Reminder/medication saatleri timestamp'ten ayrılarak 12/24 saat
    tercihine uyan ve saat diliminde kaymayan wall-clock formatter'a geçirildi.
  - Memorial/subscription tarihleri, trend gün etiketleri ve notification
    önizlemesi ortak katmana alındı. Kullanılmayan legacy locale/date/time
    formatter'ları kaldırıldı; uygulama yüzeylerinde bağımsız `toLocale*`
    formatlaması kalmadı.
- [x] Report/PDF, notification scheduling ve family görünümünün uyarlanması.
  - Ağırlık tercihi local-first saklama ve kullanıcı profili senkronizasyonuna
    bağlandı. Home sağlık özeti, kilo grafiği, kayıt listeleri ve PDF raporu
    kaynak kaydı değiştirmeden seçilen `kg/lb` birimine dönüştürüyor.
  - Yeni weight record formu kullanıcının seçili birimiyle açılıyor; mevcut
    kayıt düzenlenirken kaynağın kendi birimi korunuyor. Local bildirim
    önizlemeleri medication adı/dozu, reminder başlığı/notu veya family kodu
    göstermeyen genel metne geçirildi; ayrıntılar yalnız uygulama açıldığında
    görünür. Family Activity digest zaten yalnız aktivite sayısını gösteriyor.
- [x] EN/DE/TR, iPhone/iPad, accessibility ve migration QA.
  - 2026-07-27: Temiz iPhone 17 Pro Simulator turunda tek ekran onboarding EN,
    DE ve TR için doğrulandı; uzun Almanca/Türkçe fayda metinlerinde taşma veya
    kesilme görülmedi. Auth ekranı `System` tercihiyle uygulama açıkken light →
    dark geçişinde status bar, Apple/email aksiyonları ve yasal metin kontrastını
    doğru korudu. Settings/Care/pet detail ve iPad/accessibility turu release
    kabulünde tamamlandı.
  - 2026-07-27: Settings, Care, Pet Detail ve Pet Edit ekranları Almanca uzun
    metinlerle iPhone 17 Pro Simulator'da light/dark doğrulandı. Dark cold
    start'ta açık notification switch thumb'larının kaybolduğu görüldü; açık
    track semantic brand accent, thumb sabit açık yüzey rengine geçirilerek
    light/dark ve cold start'ta yeniden doğrulandı.
  - iOS/Hermes'in `Intl.*.formatToParts` sağlamadığı runtime'da Home Health
    Overview render'ı çöküyordu. Tarih, sayı ve medication timezone parçalama
    işlemleri `formatToParts` gerektirmeyen fallback'lere geçirildi. Home'da
    Almanca bölgesel `5,2 kg` gösterimi ve Pet Detail geçişi simülatörde
    doğrulandı; formatToParts'sız regresyon testleri eklendi.
  - 2026-07-27: iPad Pro 13-inch Simulator portrait turunda Settings, Care Hub
    ve Pet Profile Almanca ve `accessibility-extra-extra-extra-large` Dynamic
    Type kategorisinde doğrulandı. Ortak `ThemedText` line-height değeri fontla
    birlikte büyümediği için metinlerin kesildiği bulundu; line-height aynı
    `maxFontSizeMultiplier` sınırıyla ölçeklenerek uygulama genelinde düzeltildi
    ve regresyon testi eklendi. Settings segmentleri büyük yazıda dikey düzene
    geçiyor; Pet Profile header Edit aksiyonu erişilebilir boyutta görünür
    kalıyor.
  - iOS picker sheet genişliği ilk açılıştaki `Dimensions.get` değerinden
    ayrıldı; güncel container genişliğine uyuyor ve iPad'de 640 pt ile
    sınırlanıyor. Auth expandable email animasyonu da `ReduceMotion.System`
    sözleşmesine geçirildi. Settings switch'lerinde VoiceOver role/state bilgisi
    açıkça sağlanıyor.
  - 2026-07-27: Orientation ürün kararı kesinleştirildi: iPhone ve Android
    telefonlar portrait-only; iPad portrait ve landscape destekliyor. Root
    `orientation: portrait`, `ios.supportsTablet: true` ve açıkça tanımlanan
    `ios.requireFullScreen: false` sözleşmesi Expo prebuild çıktısında telefon
    için yalnız portrait, iPad için dört yön üretiyor. Yeni development binary
    iPad Pro 13-inch Simulator'a kuruldu; Home portrait ve landscape'te siyah
    letterbox olmadan tam ekran, responsive iki kolon ve tab bar ile doğrulandı.
    App config sözleşmesi otomatik testle koruma altına alındı.
  - 2026-07-27: v1.3 → v1.4 tercih migration'ı saklama bağımlılıklarından
    ayrılarak gerçek legacy snapshot ile regresyon testine alındı. Eski onboarding,
    tema ve notification seçimleri yeni şemaya kopyalanırken v1.3 anahtarları
    mutate edilmiyor. Sağlık verisi SQLite şeması v1.3 ile aynı `user_version 20`
    olduğundan v1.4 bu tabloları yeniden oluşturmuyor; önceki simulator verileri
    yeni native binary kurulumundan sonra görünür kaldı.
  - 2026-07-28: iOS binary sürüm kontrolü public-read Supabase release policy,
    App Store release-type filtresi ve sürüm karşılaştırma katmanıyla eklendi.
    Optional sheet ile zorunlu tam ekran EN/DE/TR metinleriyle simülatörde
    doğrulandı. TestFlight v1.4, policy'deki canlı App Store sürümü hâlâ v1.3
    iken güncelleme istemez; policy yalnız daha yeni binary App Store'da gerçekten
    yayına alındıktan sonra yükseltilir. Mağazadaki mevcut v1.3 binary bu kodu
    içermediğinden v1.4 modalı gösteremez.

## Kabul kriterleri

- [x] Yeni kullanıcı Lulu'nun değerini anlayıp gereksiz carousel olmadan pet
  setup'a ulaşır.
- [x] System, Light ve Dark seçimi uygulamanın temel ekranlarında tutarlı çalışır.
- [x] Aynı raporda tarih formatı karışmaz; aktif dilin locale'ı her yerde aynıdır.
- [x] Ağırlık girişi ve gösterimi seçilen birime uyar; dönüşüm veri drift'i
  oluşturmaz.
- [x] Daily Check-in, pet reminder, medication ve family bildirimleri ayrı ayrı
  yönetilebilir.
- [x] Care Tools sırası günlük bakım yolculuğunu destekler ve erişilebilir sıra
  ile eşleşir.
- [x] Pet detail seçenek listesi gibi görünmez; bilgiler kısa özet halinde okunur.
- [x] Mevcut kullanıcı güncellemesinde tercih veya sağlık verisi kaybolmaz.

## Test planı

### Otomatik

- Locale/date formatter snapshot ve timezone testleri.
- Kg/lb dönüşüm, precision ve round-trip testleri.
- Tema preference çözümleme ve semantic contrast testleri.
- Notification category schedule/cancel/reschedule testleri.
- Onboarding route ve mevcut kullanıcı migration testleri.
- Care Tools görsel/VoiceOver sıra sözleşmesi.

### Manuel QA

- [x] Temiz kurulum ve v1.3 → v1.4 yükseltme.
- [x] v1.4 binary üzerinde daha yeni canlı sürüm policy'siyle optional update
  sheet'i; `Daha Sonra` tekrar hatırlatma aralığı ve App Store yönlendirmesi.
- [x] Destek alt sınırının altında kalan binary üzerinde kapatılamayan zorunlu
  güncelleme ekranı; ağ/policy hatasında fail-open davranışı.
- [x] Fiziksel iPhone ve küçük/büyük iPhone Simulator.
- [x] iPad portrait/landscape smoke turu.
  - iPad Pro 13-inch portrait; normal ve en büyük Dynamic Type ile tamamlandı.
    Yeni native binary ile landscape tam ekran Home düzeni de doğrulandı.
- [x] System/Light/Dark ve uygulama açıkken sistem tema değişimi.
  - Auth ekranında System light/dark canlı geçişi iPhone 17 Pro Simulator'da
    doğrulandı. Settings, Care, Pet Detail ve Pet Edit de light/dark ve Settings
    için dark cold start ile doğrulandı; uygulama geneli tur release kabulünde
    tamamlandı.
  - İlk karşılama ekranının dark sistem görünümü yeni yıldızlı arka plan ve açık
    logo ile iPhone 17 Pro Simulator'da doğrulandı. Native light/dark splash
    ayrımı config regresyon testiyle korunuyor; temiz binary cold-start turu
    release kabulünde tamamlandı.
- [x] EN/DE/TR; rapor, timeline ve tarih sınırı senaryoları.
  - Onboarding EN/DE/TR görsel turu ile rapor/timeline senaryoları release
    kabulünde tamamlandı.
- [x] Kg/lb iki kullanıcıyla aynı shared pet görünümü.
- [x] Her notification kategorisi açık/kapalı ve OS permission denied.
- [x] Dynamic Type, VoiceOver, Reduce Motion ve kontrast.
  - Mevcut WCAG otomatik kontrast testleri ve bu turun light/dark görsel
    kontrast kontrolleri geçti. iPad'de en büyük Dynamic Type turu tamamlandı;
    bütün Reanimated state geçişleri sistem Reduce Motion tercihine bağlı.
    Settings seçim/toggle accessibility role-state kod denetimi tamamlandı;
    gerçek VoiceOver odak/sıra cihaz turu release kabulünde tamamlandı.

## Rollout ve geri dönüş

- Tercih migration'ları additive ve geriye uyumlu olmalı.
- Yeni onboarding yalnız yeni/uygun kullanıcıya version gate ile gösterilmeli.
- Tema geçişi feature flag ile açılabilmeli; sorun halinde mevcut dark tema
  güvenli fallback olarak kalmalı.
- Formatter veya birim migration'ında kaynak sağlık değeri overwrite edilmemeli.

## Açık sorular

- [x] Aktif uygulama dili dışında ayrıca `Region / Date format` tercihi gerekli mi? — v1.4'te manuel seçim yok; uygulama dili metni, cihaz bölgesi tarih/saat/sayı düzenini belirler.
- [x] Ağırlık tercihi Supabase user profile ile cihazlar arasında senkronize edilmeli mi? — Evet; local-first cache ile kullanıcı profiline senkronize edilir.
- [x] Medication refill bildirimi v1.4'te ayrı toggle mı, medication altında alt tercih mi olmalı? — Ayrı toggle.
- [x] Care Tools kullanım analytics'i yayın öncesinde yeterli veri üretecek mi? — Analytics v1.4 bağımlılığından çıkarıldı; sıra kullanıcı yolculuğuyla sabitlenecek.
- [x] Progressive onboarding tooltip, coach mark veya inline card yaklaşımından hangisini kullanmalı? — Tek karşılama ekranı ve özellik yüzeylerinde bir defalık inline card.
- [x] iPad landscape v1.4 kapsamında desteklenecek mi? — Evet. Telefonlar
  portrait-only kalırken iPad portrait ve landscape destekliyor; multitasking
  kapatılmıyor.

## Definition of Done

- [x] Bütün kabul kriterleri otomatik ve manuel testlerle doğrulandı.
- [x] Yeni preference migration'ı veri kaybı olmadan geçti.
- [x] Rapor ve uygulama aynı locale/format sözleşmesini kullanıyor.
- [x] Tema ve pet detail referans ekranları tasarım QA'dan geçti.
- [x] Bildirim category değişiklikleri gerçek cihazda schedule/cancel ile
  doğrulandı.
- [x] Roadmap ve Release QA yeni davranışlarla güncellendi.
