# Lulu 1.4.0 — Release QA

**Durum:** Tamamlandı — v1.4.0, 2026-08-02 tarihinde App Store'da yayına alındı.

**Kaynak sürüm:** `1.4.0`

**iOS build:** `17`

**Kaynak commit:** `b334628e84fcdb4ac2fc919347d880dabfc4508b`

**EAS build:** `a76ba43c-7832-46ba-aae2-93b4c55ae0f9`

**EAS submission:** `ad5e50d4-f799-41a2-a1f4-5c42ad50c7bd`

**App Store yayını:** `2026-08-01T22:23:27Z` (`2026-08-02`, Europe/Berlin)

## Kapanış notu — 2026-08-16

- App Store'daki canlı sürüm `1.4.0` olarak yeniden doğrulandı.
- EAS production build `17` ve App Store Connect submission kaydı başarıyla
  tamamlanmış durumda.
- Canlı Supabase iOS release policy değeri, mağaza yayını doğrulandıktan sonra
  `latest_version = 1.4.0` olarak güncellendi; minimum destek `1.0.0` olarak
  korundu.
- Release kabulüyle aşağıdaki TestFlight ve fiziksel cihaz smoke turu kapatıldı.

## Otomatik yayın kapıları

- [x] `npm test`
- [x] `npx tsc --noEmit`
- [x] `npm run lint`
- [x] `npm run i18n:check:strict`
- [x] `npx expo export --platform ios`
- [x] `npx expo-doctor` — 20/20 kontrol geçti.
- [x] Production EAS config sürüm `1.4.0`, bundle ID `com.luluapp.app` ve test
  bypass `false` gösteriyor.
- [x] Build aynı temiz commit'ten oluşturuldu ve App Store Connect'e işlendi.
  — EAS build `17`, kaynak commit `b334628`; submission `FINISHED`.

## TestFlight smoke turu

- [x] v1.3 üzerine TestFlight v1.4 kurulumunda oturum, petler, sağlık kayıtları,
  reminder, medication, family ve Vet Visit verileri korunuyor.
- [x] Temiz kurulumda sistem temasına uygun splash ve tek ekran onboarding açılıyor.
- [x] System / Light / Dark geçişleri yeniden başlatmadan çalışıyor.
- [x] EN/DE/TR metinleri; cihaz bölgesine göre tarih, saat ve sayı biçimi doğru.
- [x] kg/lb tercihi form, Home, grafik ve PDF raporunda aynı; kaynak kayıt değişmiyor.
- [x] Bildirim kategori ayarları schedule/cancel davranışını fiziksel cihazda doğru uyguluyor.
- [x] Check-in, Home, My Pets, Pet Edit ve setup yüzeylerinde ortak kedi/köpek
  illüstrasyonları doğru görünüyor.
- [x] Care Hub sırası, pet detail/edit hiyerarşisi, Medication, Family Activity
  ve Vet Visit temel akışları sorunsuz.
- [x] Satın alma, restore ve Plus entitlement production RevenueCat ürünleriyle çalışıyor.
- [x] iPhone portrait ve iPad portrait/landscape smoke turunda kesilme veya crash yok.

## Uygulama içi güncelleme kontrolü

- [x] TestFlight v1.4, Supabase policy `latest_version = 1.3.0` iken yanlış
  güncelleme uyarısı göstermiyor.
- [x] Lokal preview ile optional sheet ve kapatılamayan required ekran doğrulandı.
- [x] Ağ/policy hatası uygulamanın açılmasını engellemiyor.
- [x] Supabase `latest_version` değeri yalnızca v1.4 App Store'da yayına
  alındığı doğrulandıktan sonra `1.4.0` yapıldı.

## Release sonrası otomatik kontrol — 2026-08-16

- [x] `npm test` — 206 test geçti.
- [x] `npx tsc --noEmit`
- [x] `npm run lint`
- [x] `npm run i18n:check:strict`
- Not: `npx expo-doctor` güncel registry beklentisine göre 19/21. Yayınlanan
  binary'nin release sonucunu değiştirmeyen SDK 57 patch uyumsuzlukları bulundu:
  `expo >= 57.0.9` / `react-native >= 0.86.2` Hermes düzeltmesi ve ilişkili Expo
  paket hizalaması bir sonraki binary öncesi bakım kapısıdır.

## TestFlight notu

Lulu 1.4 introduces System/Light/Dark appearance options, regional date and
number formatting, kg/lb preferences, detailed notification controls, a simpler
welcome experience, clearer pet profiles, refreshed pet illustrations, and
improved iPad and accessibility support. Please focus on upgrades from 1.3,
theme switching, notification settings, pet editing, reports, and shared-care flows.

## Yayın kararı

- **Stop ship:** Crash, veri kaybı, auth/pet izolasyon sorunu, yanlış entitlement,
  satın alma/restore hatası veya v1.3 migration kaybı.
- **Yayınlanabilir:** Otomatik kapılar ve fiziksel cihaz smoke turu geçiyor; açık
  P0/P1 bulunmuyor.
- **Sonuç:** Kabul edildi ve App Store'da yayında.
