# 015 — Faz 0 Deneyim Temelleri Auditi

Tarih: 2026-07-27

Bu belge v1.4 Task 015 başlamadan önce mevcut tarih/locale, ağırlık, bildirim,
tema, onboarding ve Care Tools davranışlarını sabitler. Faz 1 altyapısı bu
envanter ve sözleşmeler üzerinden uygulanacaktır.

## Expo ve platform sözleşmesi

- Proje `expo ~57.0.8` kullanıyor; repo talimatı gereği implementasyon öncesinde
  Expo'nun tam `v54.0.0` referansı ayrıca kontrol edildi.
- `expo-localization` cihaz `regionCode`, `measurementSystem`, sayı ayırıcıları
  ve calendar `uses24hourClock` bilgisini sağlayabiliyor.
- iOS locale değerleri uygulama çalışırken sabit kalır; yeni Region ayarı sonraki
  açılışta okunur. Android'de locale ayarları foreground dönüşünde yenilenebilir.
- Remote push Android Expo Go'da desteklenmediği için Family Activity push QA'sı
  development/production build üzerinde kalır; local notification testleri Expo
  Go ile çalışabilir.

## Locale ve tarih envanteri

Doğrudan `Intl` veya `toLocale*` kullanan 15 uygulama dosyası bulundu:

- Care Hub, Greeting, Today Care, Weight Chart
- Medication plan formu
- Reports wizard ve report preview builder
- Vet Visit listesi
- `utils/date`, `utils/time`, `utils/last-check-in`
- medication schedule, subscription display, upcoming reminders ve weight chart

Mevcut `utils/locale.ts` yalnız uygulama dilini `en-US`, `de-DE`, `tr-TR`
etiketlerine eşliyor. Bu nedenle cihaz bölgesi uygulama dilinden farklıysa tarih,
saat ve sayı düzeni kullanıcının Region ayarını izlemiyor.

### Karar

- Çeviri dili: uygulama language preference.
- Bölge: `expo-localization` cihaz `regionCode`.
- Saat: cihaz calendar `uses24hourClock`; null durumda bölgesel fallback.
- Kısa sayısal tarih: cihazın bölgesel gün/ay/yıl sırası.
- Metin içeren tarih: ay/hafta günü adları uygulama dilinde, parça sırası cihaz
  bölgesine göre.
- Sayılar: cihaz bölgesinin grouping/decimal sözleşmesi.
- Saklama: ISO timestamp ve `YYYY-MM-DD` local calendar date sözleşmeleri
  değişmez; locale yalnız sunum katmanıdır.
- `en-TR` gibi locale etiketleri tek başına kaynak değildir. Test ortamında
  `Intl('en-TR')` ABD düzenine geri düştüğü için formatter parça sırasını ve saat
  sözleşmesini ayrıca uygular.

Gerekli test matrisi en az `en+TR`, `tr+TR`, `de+DE`, `tr+DE`, `en+US` ve
`de+US`; 12/24 saat, DST ve gün sınırı örneklerini kapsar.

## Ağırlık envanteri

- Weight record metadata bugün `{ value, unit: 'kg' | 'lb' }` saklıyor.
- Local SQLite ve Supabase aynı metadata JSON'unu değiştirmeden taşıyor.
- Record formu her kayıtta ayrıca kg/lb seçtiriyor.
- Home/Health Overview, Weight Section, Weight Chart, record display ve PDF
  aynı tercihe bağlı ortak bir katman kullanmıyor.
- Kullanıcı tercihi veya profil alanı henüz yok.

### Karar

- Legacy metadata topluca dönüştürülmez ve overwrite edilmez.
- Ortak utility her kaydı hesaplama için kg'a normalize eder.
- Ekran ve PDF seçilen kullanıcı birimine display-time conversion yapar.
- Kullanıcının seçimi health record metadata'sından ayrıdır.
- Preference local-first cache kullanır ve authenticated kullanıcı profiliyle
  senkronize edilir.
- Dönüşüm her zaman kaynak kayıttan yapılır; ardışık kg ↔ lb görünümü kayıt
  değerinde drift oluşturmaz.

## Preference ve migration envanteri

- Mevcut preference katmanı `storage/prefs.storage.ts` içinde AsyncStorage
  anahtarları kullanıyor.
- Boolean `onboardingCompleted`, yeni versiyonlu onboarding'i ayırt etmiyor.
- `appAppearance` anahtarı mevcut fakat okuma/yazma sözleşmesi yok.
- Dil tercihi hazır ve notification schedule'larını yeniden kuruyor.
- Check-in saati için eski slot değerlerinden güvenli migration zaten var.

### Karar

- Yeni preference repository Expo SQLite localStorage polyfill üzerinde kurulur.
- Legacy AsyncStorage anahtarları ilk okumada doğrulanıp yeni repository'ye
  kopyalanır; başarılı yazma doğrulanmadan eski değer silinmez.
- `onboardingCompleted=true`, mevcut kullanıcı için v1.4 onboarding sürümü
  tamamlanmış kabul edilir; mevcut kullanıcı yeniden onboarding'e düşmez.
- Bozuk veya bilinmeyen değerler güvenli varsayılanlara döner:
  `theme=system`, bölge=device, weight=device measurement veya metric fallback.

## Bildirim envanteri

Mevcut kategoriler:

- Daily Check-in: permission ve saat tercihi var.
- Pet Reminders: kategori toggle ve schedule/cancel var.
- Family Activity Digest: local cache + remote user preference var; varsayılan
  kapalı.
- Medication Dose: schedule, cancel, action ve deep link var; kullanıcı toggle'ı
  yok.
- Medication Refill: UI/tercih/schedule sözleşmesi henüz ayrı değil.

### Karar

- OS permission ile uygulama içi kategori intent'i ayrı tutulur. OS izni kapalı
  olduğunda kullanıcının kategori seçimleri kaybolmaz.
- `dailyCheckIn`, `petReminders`, `medicationDoses`, `medicationRefill` ve
  `familyDigest` ayrı tercihlerdir.
- Kapatma yalnız ilgili identifier/channel ailesini iptal eder; domain verisine
  dokunmaz.
- Yeniden açma yalnız gelecekteki uygun bildirimleri tekrar planlar.
- Kilit ekranı içeriği minimum bilgi sözleşmesine taşınır; hassas tedavi detayı
  kullanıcı tercihi olmadan gösterilmez.

## Tema envanteri

- Light ve dark token setleri mevcut.
- Root `ThemeProvider` zorunlu `DarkTheme`, StatusBar zorunlu `light` kullanıyor.
- `app.json` `userInterfaceStyle: dark` olarak sabit.
- 40 app/component dosyasında doğrudan hex veya rgba kullanımı var. Bunların bir
  kısmı bilinçli veri/illüstrasyon rengi; yüzey, metin ve kontrol renkleri
  semantik token'a taşınmalı.
- Ortak `useThemeColor` kullanımı yaygın olduğu için geçiş sıfırdan başlamıyor.

### Geçiş sırası

1. Root provider, status/navigation bar ve splash.
2. Shared UI primitives ve modal/sheet yüzeyleri.
3. Settings, Home, Care ve Pet Detail/Edit referans ekranları.
4. Records, Reminders, Medication, Vet Visit, Reports/PDF ve Paywall.
5. Auth, setup, onboarding, grafik ve illüstrasyon özel durumları.

## Care Tools ve onboarding envanteri

- Care Tools mevcut sırası hedef kararla zaten eşleşiyor:
  `Check-in → Medications → Reminders → Vet Visits → Health Records`.
- Upcoming Vet Visit urgent içerik olarak statik listenin üstünde kalıyor.
- Family Activity timeline bölümünde ayrı aksiyon; Health Report Care Tools'a
  karıştırılmıyor.
- Analytics ertelendiği için v1.4 sırası kullanıcı yolculuğu kararıyla korunur.
- Dört intro route'u repoda mevcut ancak feature flag kapalı.
- Bootstrap boolean onboarding completion ve family join intent'i kullanıyor.

### Karar

- Care Hub bu fazda yeniden yapılandırılmaz; sıra ve VoiceOver sözleşmesi testle
  sabitlenir.
- Yeni kullanıcıya tek kısa değer ekranı gösterilir.
- Medication, Family ve Vet Visit açıklamaları hedef yüzeylerinde bir defalık
  inline card olur.
- Family invite, notification deep link ve authenticated/no-pet bootstrap
  öncelikleri korunur.

## Faz 1'e giriş kapıları

- Preference türleri ve migration tablosu unit testlerle tanımlanmalı.
- Locale resolver gerçek `regionCode` ve `uses24hourClock` girdileriyle saf
  fonksiyon olarak test edilmeli.
- Weight conversion/round-trip utility'si UI geçişinden önce tamamlanmalı.
- Notification kategori sözleşmesi tek store shape'i olarak tanımlanmalı.
- Bu altyapılar tamamlanmadan tema Settings UI veya Pet Detail redesign
  başlatılmamalı.
