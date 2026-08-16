# Changelog

Lulu'daki kullanıcıya yansıyan önemli değişiklikler bu dosyada tutulur.

Sürüm numaraları semantik sürümleme düzenini izler:

- `PATCH` (`1.1.0` → `1.1.1`): Hata düzeltmeleri ve küçük metin/görsel iyileştirmeleri.
- `MINOR` (`1.1.0` → `1.2.0`): Geriye uyumlu yeni özellikler, yeni dil desteği veya belirgin akış değişiklikleri.
- `MAJOR` (`1.x` → `2.0`): Kullanıcı davranışında ya da veride geriye uyumsuz büyük değişiklikler.

Hazırlanan değişiklikler önce `Unreleased` altında birikir ve mağaza sürümü hazırlanırken ilgili sürüm başlığına taşınır.

## Unreleased

## 1.4.0 - 2026-08-02

### Added

- Added System, Light, and Dark appearance preferences.
- Added user-specific kg/lb preferences with local-first profile sync.
- Added separate controls for daily check-in, reminders, medication dose/refill,
  and family digest notifications.
- Added contextual first-use guidance for Medication, Family, and Vet Visit.
- Added optional and required App Store update guidance backed by a remote release policy.

### Changed

- Replaced the multi-screen onboarding carousel with one concise welcome screen
  and progressive education inside relevant features.
- Reworked pet detail and edit screens into a clearer summary-and-edit hierarchy.
- Standardized date, time, number, and report formatting around app language and
  the device region without changing stored health data.
- Reordered Care tools around the daily care journey and improved responsive iPad layouts.
- Replaced generic pet placeholders with Lulu's shared cat and dog illustration set.

### Fixed

- Improved semantic color contrast, Dynamic Type layouts, Reduce Motion behavior,
  and light/dark cold-start consistency across core screens.
- Prevented sensitive medication, reminder, and family details from appearing in
  local notification previews.
- Added safe formatter fallbacks for iOS/Hermes environments without
  `Intl.formatToParts` support.

## 1.3.0 - 2026-07-27

### Added

- Added medication plans, dose tracking, inventory, refill reminders, and snooze actions.
- Added Family Activity with shared-care event history and filters.
- Added Vet Visit preparation, live-session questions, outcomes, reports, and follow-up care.

### Changed

- Added a Care tab that brings daily actions, reminders, records, and family activity into one hub.
- Moved Family management from the main tab bar to Profile while preserving existing Family routes.
- Improved responsive layouts, accessibility labels, reading order, and minimum touch targets.
- Replaced the weekly Lulu Plus option with a €4.99 monthly plan while preserving
  legacy weekly receipt recognition.

### Fixed

- Prevented Family join deep links from opening duplicate screens during cold start.
- Restricted notification navigation to known safe routes and rejected malformed family codes.

## 1.1.0 - 2026-07-17

### Added

- Uygulamanın tamamına Türkçe dil desteği eklendi.
- iOS ve Android için desteklenen mağaza dilleri İngilizce, Almanca ve Türkçe olarak tanımlandı.

### Changed

- Lulu Plus planlarında yenileme sıklığı, tek seferlik ödeme ve faturalandırma koşulları daha açık gösteriliyor.
- Uygulamanın yalnızca koyu tema kullandığı sistem seviyesinde tanımlandı.
- Gizlilik Politikası ve Kullanım Koşulları bağlantıları seçili uygulama dilindeki İngilizce, Almanca veya Türkçe sayfayı açıyor.
- Lulu Plus fayda metinleri gerçek ürün sınırlarıyla eşleştirildi; henüz sunulmayan gelişmiş içgörü vaadi kaldırıldı ve 10 pet sınırı açıklandı.

### Fixed

- Kilo alanına virgül veya nokta kullanılarak ondalıklı değer girilememesi düzeltildi.
- İlk kurulumdaki bildirim izni adımının “pet bulunamadı” ve ardından yanlış Lulu Plus sınırı hatası üretmesi düzeltildi.
- Bildirim kurulumu başarısız olsa bile evcil hayvan oluşturma ve ilk kurulum artık güvenli biçimde tamamlanıyor.
- Ana sayfadaki kurulum kartının telefon açık temadayken tasarım dışı açık renk görünmesi düzeltildi.
