# Lulu 1.4.0 — TestFlight Release QA

**Durum:** Release candidate hazırlanıyor.

**Kaynak sürüm:** `1.4.0`

**Beklenen iOS build:** EAS remote `16` üzerinden auto-increment ile `17`

**Dağıtım sırası:** Internal TestFlight → kabul → App Store review

## Otomatik yayın kapıları

- [x] `npm test`
- [x] `npx tsc --noEmit`
- [x] `npm run lint`
- [x] `npm run i18n:check:strict`
- [x] `npx expo export --platform ios`
- [x] `npx expo-doctor` — 20/20 kontrol geçti.
- [x] Production EAS config sürüm `1.4.0`, bundle ID `com.luluapp.app` ve test
  bypass `false` gösteriyor.
- [ ] Build aynı temiz commit'ten oluşturuldu ve App Store Connect'e işlendi.

## TestFlight smoke turu

- [ ] v1.3 üzerine TestFlight v1.4 kurulumunda oturum, petler, sağlık kayıtları,
  reminder, medication, family ve Vet Visit verileri korunuyor.
- [ ] Temiz kurulumda sistem temasına uygun splash ve tek ekran onboarding açılıyor.
- [ ] System / Light / Dark geçişleri yeniden başlatmadan çalışıyor.
- [ ] EN/DE/TR metinleri; cihaz bölgesine göre tarih, saat ve sayı biçimi doğru.
- [ ] kg/lb tercihi form, Home, grafik ve PDF raporunda aynı; kaynak kayıt değişmiyor.
- [ ] Bildirim kategori ayarları schedule/cancel davranışını fiziksel cihazda doğru uyguluyor.
- [ ] Check-in, Home, My Pets, Pet Edit ve setup yüzeylerinde ortak kedi/köpek
  illüstrasyonları doğru görünüyor.
- [ ] Care Hub sırası, pet detail/edit hiyerarşisi, Medication, Family Activity
  ve Vet Visit temel akışları sorunsuz.
- [ ] Satın alma, restore ve Plus entitlement production RevenueCat ürünleriyle çalışıyor.
- [ ] iPhone portrait ve iPad portrait/landscape smoke turunda kesilme veya crash yok.

## Uygulama içi güncelleme kontrolü

- [ ] TestFlight v1.4, Supabase policy `latest_version = 1.3.0` iken yanlış
  güncelleme uyarısı göstermiyor.
- [ ] Lokal preview ile optional sheet ve kapatılamayan required ekran doğrulandı.
- [ ] Ağ/policy hatası uygulamanın açılmasını engellemiyor.
- [ ] Supabase `latest_version` değeri v1.4 App Store'da gerçekten yayına
  alınmadan `1.4.0` yapılmıyor.

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
