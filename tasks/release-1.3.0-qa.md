# Lulu 1.3.0 — Release QA

**Durum:** Tamamlandı — v1.3.0, 2026-07-27 tarihinde yayına alındı.

Medication, Family Activity ve Vet Visit dahil yayın kapsamındaki ana akışlar;
fiziksel cihaz ve Simulator kontrolleriyle kabul edildi. Aşağıdaki checklist
yayın kapanış kaydı olarak güncellenmiştir.

Bu belge, tek bir fiziksel iPhone ve tek bir iOS Simulator ile yayın adayını aşamalı olarak doğrular. Her aşama ayrı bir yayın kapısıdır; bir aşamada hata görülürse sonraki aşamaya geçilmez.

## Test düzeni ve kayıt biçimi

- **Fiziksel cihaz (F):** Bildirim, haptics, fotoğraf seçimi, paylaşım ve StoreKit kontrollerinin ana cihazı.
- **Simulator (S):** İkinci kullanıcı, temiz kurulum, farklı ekran boyutu/dil ve family eşzamanlılık kontrolleri.
- Fiziksel cihazda yayın adayı build, Simulator'da aynı commit ve `1.3.0` sürümü kullanılmalı.
- Her hata için cihaz, iOS sürümü, hesap/pet, tekrar adımları, beklenen/gerçek sonuç ve ekran kaydı tutulmalı.
- Kritik veri kaybı, crash, oturum/yetki kaçağı, satın alma sorunu veya bozuk navigation **bloklayıcıdır**.

## Aşama 1 — Build, kurulum ve hesap yaşam döngüsü

### Her iki cihaz

- [x] Uygulama açılışta crash olmadan Lulu splash ekranından doğru başlangıç ekranına geçiyor.
- [x] Görünen sürümün `1.3.0` olduğu doğrulanıyor; fiziksel build numarası beklenen EAS numarasıyla eşleşiyor.
- [x] Temiz kurulumda onboarding ileri/geri hareketleri doğru; aynı ekran stack'te çoğalmıyor.
- [x] E-posta ile yeni hesap oluşturma, doğrulama dönüşü ve giriş çalışıyor.
- [x] Hatalı e-posta, kısa/yanlış parola ve başarısız giriş anlaşılır hata gösteriyor; buton yüklenmede takılı kalmıyor.
- [x] Parola sıfırlama isteği başarı mesajı veriyor.
- [x] Uygulama tamamen kapatılıp açıldığında oturum ve seçili pet korunuyor.
- [x] Çıkış sonrası önceki hesaba ait pet/record/reminder/medication/family verisi görünmüyor.

### Fiziksel cihaz

- [x] Apple ile giriş başarılı veya kullanıcı iptalinde güvenli biçimde login ekranında kalıyor.
- [x] `1.2.0` yüklü bir cihazdan `1.3.0` üzerine güncelleme yapıldığında oturum ve mevcut veriler korunuyor.

**Geçiş ölçütü:** Crash, auth döngüsü, veri karışması ve migration hatası yok.

## Aşama 2 — Pet kurulumu, profil ve ana navigasyon

### Her iki cihaz

- [x] İlk pet kurulumu: tür, ad/ırk arama, yaş/sağlık seçimi, fotoğraf, check-in saati ve bildirim adımları tamamlanıyor.
- [x] Irk ve sağlık arama alanlarında aç/kapat, filtrele, seç, temizle ve geri dön davranışları doğru.
- [x] İkinci pet eklenebiliyor; aktif pet değişince Home, Care, Records, Reminders ve Medications verileri doğru pet'e geçiyor.
- [x] Pet adı ve profil bilgileri düzenlenip yeniden açıldığında korunuyor.
- [x] İsim düzenleme modalı her açılışta güncel isimle başlıyor; iptal edilen taslak sonraki açılışa taşınmıyor.
- [x] Pet silme onayı her açılışta boş başlıyor; yalnız tam pet adı girildiğinde silme aktif oluyor.
- [x] Home, Care, Family, My Pets ve Profile sekmeleri doğru başlık/içerikle açılıyor.
- [x] Her alt ekranda geri hareketi tek adım geri gidiyor; aynı ekranın tekrar tekrar görünmesi veya sekmeler arası stack sızıntısı yok.
- [x] Uygulamayı arka plana alıp geri getirince seçili sekme ve veri tutarlı.

### Fiziksel cihaz

- [x] Kamera rulosundan pet/profil fotoğrafı seçme, izni reddetme ve izni Ayarlar'dan tekrar açma akışları güvenli.

**Geçiş ölçütü:** Pet izolasyonu, form state'i ve navigation sorunsuz.

## Aşama 3 — Günlük bakım, kayıtlar ve bildirimler

### Her iki cihaz

- [x] Check-in oluşturma ve tamamlama Home özetini ve Care timeline'ı güncelliyor.
- [x] Her desteklenen health record türü oluşturuluyor, düzenleniyor ve Recent Records'ta doğru özet/tarihle görünüyor.
- [x] Reminder oluşturma, düzenleme, tamamla, atla ve ertele işlemleri doğru listelere yansıyor.
- [x] Tekrarlayan reminder tamamlandığında yalnız bir sonraki occurrence oluşuyor; çift kayıt yok.
- [x] Completed Reminders içinden bağlı record doğru ekrana açılıyor.
- [x] Uygulama kapatılıp açılınca record ve reminder durumları korunuyor.
- [x] Ağ kapalıyken mevcut yerel veriler açılıyor; uygulama crash veya sonsuz loading göstermiyor. Ağ geri gelince yeniden giriş gerektirmeden toparlıyor.

### Fiziksel cihaz

- [x] Bildirim izni: izin ver, reddet ve daha sonra Settings'ten aç senaryoları doğru.
- [x] Check-in ve reminder bildirimi beklenen saatte, doğru pet adıyla ve hassas sağlık detayı sızdırmadan geliyor.
- [x] Bildirime dokunmak uygulamayı cold start ve background durumlarında doğru ekrana götürüyor; geri davranışı doğru.
- [x] Reminder değiştirildiğinde/silindiğinde eski planlanmış bildirim gelmiyor.

**Geçiş ölçütü:** Veri kaybı, duplicate occurrence veya stale notification yok.

## Aşama 4 — Medication planı ve doz takibi

### Her iki cihaz

- [x] Yeni medication planı; ad, doz, birim, talimat, başlangıç/bitiş, saat ve tekrar seçenekleriyle kaydediliyor.
- [x] Mevcut plan düzenlendiğinde gelecek dozlar yeni plana göre güncelleniyor; geçmiş tamamlamalar bozulmuyor.
- [x] Doz için Taken, Skipped ve Snooze işlemleri doğru durum/zamanla görünür.
- [x] Aynı doza hızlıca iki kez dokunmak duplicate completion veya yanlış inventory üretmiyor.
- [x] Inventory/refill eşikleri doğru azalıyor ve beklenen uyarıyı gösteriyor.
- [x] Plan silindiğinde dozları kayboluyor; bağlı tamamlanmış Vet Visit outcome ekranı açılıyor ve silinmiş plana bozuk link göstermiyor.
- [x] Uygulama yeniden başlatıldığında plan, doz ve inventory state'i korunuyor.

### Fiziksel cihaz

- [x] Medication bildirimi doğru saatte geliyor; dokunma doğru pet/doza götürüyor.
- [x] Snooze sonrası eski bildirim iptal, yeni bildirim doğru zamanda geliyor.
- [x] Saat dilimi veya cihaz saati değişiminden sonra planlanan yerel saat beklenen biçimde korunuyor.

**Geçiş ölçütü:** Doz idempotency, inventory ve notification planı tutarlı.

## Aşama 5 — Vet Visit uçtan uca

### Her iki cihaz

- [x] Care → Prepare for a Vet Visit → Upcoming Visit → geri akışı her dokunuşta yalnız bir ekran geri gidiyor.
- [x] Yeni visit; tarih/saat, klinik/provider, neden, not ve sorularla kaydediliyor.
- [x] Attach Health Report açıldığında tarih aralığı seçiliyor; rapor yalnız seçili pet ve aralıktaki verileri içeriyor.
- [x] Taslak/upcoming visit düzenlenip yeniden açıldığında alanlar korunuyor.
- [x] Visit başlatılıyor; sorular cevaplanıyor, cevaplanmadı olarak değiştirilebiliyor ve uygulama kapanıp açılınca oturum devam ediyor.
- [x] Visit tamamlandığında outcome ekranı açılıyor ve Care timeline'a tek bir “completed” etkinliği düşüyor.
- [x] Outcome summary, treatment notes ve next visit bilgisi kaydediliyor.
- [x] Follow-up reminder oluşturma doğru reminder'ı üretip outcome'a bağlar.
- [x] Yeni medication oluşturma ve mevcut plan seçme doğru planı outcome'a bağlar.
- [x] İlk Save outcome ekranını sonuç/bağlı aksiyonları göstermek için açık tutar; sonraki Save Vet Visit listesine döner.
- [x] Outcome'daki reminder ve medication bağlantıları doğru hedefe açılır.
- [x] Bağlı reminder silinince outcome açılır, bozuk reminder linki kalmaz.
- [x] Bağlı medication planı silinince outcome açılır, bozuk medication linki kalmaz.
- [x] Tamamlanmış visit yeniden açıldığında sorular, outcome ve timeline verisi değişmeden görünür.

### Fiziksel cihaz

- [x] Health Report preview/share sheet açılıyor; PDF okunaklı ve doğru pet/tarih aralığına ait.

**Geçiş ölçütü:** Visit state machine, geri stack'i ve follow-up bağlantıları tutarlı.

## Aşama 6 — Family, iki cihaz ve yetkilendirme

### Cihaz düzeni

- **F:** Owner hesabı.
- **S:** Ayrı member hesabı.

### Kontroller

- [x] Owner family oluşturuyor; isim ve ikon güncellemeleri kaydoluyor.
- [x] Invite code kopyalanıyor; member kodla katılıyor. Hatalı/eski kod güvenli hata veriyor.
- [x] Owner paylaşılan petleri seçiyor; member yalnız izin verilen petleri görüyor.
- [x] Member'ın pet, record, reminder, medication ve visit için izin verilen/yasaklanan aksiyonları role uygun.
- [x] Bir cihazdaki record/reminder/dose/visit değişikliği diğer cihazda duplicate oluşturmadan görünür.
- [x] Family Activity actor, pet, olay tipi ve zaman bilgisini doğru gösteriyor; filtreler ve “load more” çalışıyor.
- [x] Bir cihaz kısa süre offline iken diğerinde değişiklik yapılır; bağlantı dönünce veri tutarlı biçimde birleşir.
- [x] Owner invite code'u rotate eder; eski kod artık çalışmaz, mevcut member erişimi bozulmaz.
- [x] Member ayrılınca veya çıkarılınca paylaşılan veriye erişim derhal kaybolur; yeniden açma/deep link veri sızdırmaz.
- [x] Family adı edit alanı ekrana her dönüşte güncel sunucu değeriyle açılır.

**Geçiş ölçütü:** Yetkisiz veri görünümü/yazımı, duplicate event ve stale erişim yok.

## Aşama 7 — Plus, paywall ve satın alma

### Fiziksel cihaz — Sandbox/Test Store hesabı

- [x] Home, Records, Reminders, My Pets, Family, Vet Visit ve Profile'daki Plus girişleri doğru paywall'ı açıyor.
- [x] Monthly, Yearly ve Lifetime kartlarında fiyat/period App Store–RevenueCat verisiyle uyumlu; hard-coded veya boş fiyat yok.
- [x] Seçili plan görsel ve VoiceOver açısından anlaşılır; purchase butonu doğru ürünü başlatıyor.
- [x] Başarılı satın alma sonrası Plus özellikleri uygulamayı yeniden başlatmadan açılıyor.
- [x] Kullanıcı iptali hata gibi sunulmuyor; gerçek StoreKit hatası anlaşılır ve tekrar denenebilir.
- [x] Restore Purchases mevcut entitlement'ı geri getiriyor; satın alması olmayan hesapta yanıltıcı başarı yok.
- [x] Manage Subscription doğru App Store sayfasını açıyor.
- [x] Expired/cancelled durumda erişim ve yenileme metni doğru; lifetime'da bitiş tarihi gösterilmiyor.
- [x] Legal bağlantılar ve otomatik yenileme açıklaması açılıyor ve okunuyor.

### Simulator

- [x] Free hesapta limitler ve kilitler tutarlı; kilitli aksiyon veri oluşturmadan paywall'a gider.
- [x] Paywall küçük ekran, büyük metin ve EN/DE/TR dillerinde taşmadan kaydırılabilir.

**Geçiş ölçütü:** Ürün/fiyat/entitlement uyumsuzluğu ve satın alma blokajı yok.

## Aşama 8 — Dil, erişilebilirlik ve görsel dayanıklılık

### Her iki cihaz

- [x] EN, DE ve TR dillerinde ana sekmeler, auth/setup, formlar, boş/hata/loading durumları ve paywall kontrol ediliyor; ham çeviri anahtarı yok.
- [x] Sistem 12/24 saat ve tarih locale değişiklikleri reminder, medication, timeline ve visit ekranlarında doğru.
- [x] Light/Dark veya uygulamanın desteklediği görünümde metin-kontrast ve sistem barları okunaklı.
- [x] En büyük makul Dynamic Type seviyesinde temel aksiyonlar görünür/scroll edilebilir; metin buton üstüne taşmıyor.
- [x] VoiceOver ile sekmeler, geri butonları, form etiketleri, seçili durumlar, modal ve hata mesajları anlamlı sırada okunuyor.
- [x] Reduce Motion açıkken kritik durum değişimleri kaybolmuyor.
- [x] Küçük telefon Simulator ve fiziksel cihaz ölçüsünde klavye aktifken Save/Continue erişilebilir.
- [x] iPad desteği beyan edildiği için Simulator'da en az bir iPad boyutunda ana sekmeler, form/modal ve paywall hızlı smoke turu yapılıyor.

**Geçiş ölçütü:** Tamamlanamayan akış, kesilmiş kritik metin veya erişilemez kontrol yok.

## Aşama 9 — Dayanıklılık, gizlilik ve final release adayı

### Her iki cihaz

- [x] Cold start, warm start, background/foreground ve zorla kapat-aç turlarında crash yok.
- [x] Hızlı sekme değişimi ve Save'e tekrarlı dokunma duplicate veri oluşturmuyor.
- [x] Ağ yok/yavaş/ağ geri geldi durumlarında hata mesajı ve retry davranışı anlaşılır; sonsuz spinner yok.
- [x] Hesap değişiminde önceki kullanıcıya ait lokal cache, fotoğraf, rapor veya family verisi görünmüyor.
- [x] Pet silme ve Delete All Data sonrası uygulama güvenli başlangıç durumuna dönüyor; geri ile silinmiş ekrana ulaşılamıyor.
- [x] E-posta, pet sağlık notu ve family kodu notification/log/paylaşım önizlemesinde gereksiz yere açığa çıkmıyor.
- [x] Production build'de dev menüsü, preview route'u veya test-store davranışı kullanıcıya açık değil.

### Yayın metadatası

- [x] App Store Connect sürümü `1.3.0`; build numarası EAS remote counter ile benzersiz.
- [x] Release notes; Family Activity, medication ve Vet Visit yeniliklerini doğru anlatıyor, mevcut olmayan özellik vaat etmiyor.
- [x] Privacy nutrition labels, destek URL'si, privacy policy ve subscription ürünleri mevcut uygulama davranışıyla uyumlu.
- [x] App Store ekran görüntüleri ve metinleri güncel paywall/özelliklerle uyumlu.
- [x] Son build aynı commit'ten üretildi; git çalışma alanı temiz ve commit SHA kayıtlı.
- [x] TestFlight processing, export compliance ve internal tester install başarılı.
- [x] Son otomatik kapılar aynı commit'te geçiyor: lint, tests, strict i18n ve production export.

**Final geçiş ölçütü:** Açık P0/P1 yok; kabul edilen P2'ler yazılı; build/commit/metadata eşleşiyor. Bu aşama tamamlandığında submit işlemi başlatılabilir.

## Hata önem derecesi

- **P0 — Stop ship:** Veri/yetki ihlali, satın alma veya hesap güvenliği sorunu, yaygın crash/veri kaybı.
- **P1 — Release blocker:** Ana akış tamamlanamıyor, yanlış pet/hesap verisi, bozuk migration/navigation/notification.
- **P2 — Karar gerekli:** Workaround bulunan işlevsel veya belirgin erişilebilirlik/görsel sorun.
- **P3 — Takip:** Yayını etkilemeyen küçük polish/copy sorunu.

## Aşama onayı şablonu

Her aşama sonunda şu biçim yeterlidir:

`Aşama N tamam — F: geçti, S: geçti, not: yok`

Bir sorun varsa “tamam” demeden hata adımlarını ve mümkünse ekran görüntüsünü paylaşın.
