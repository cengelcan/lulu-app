# Changelog

Lulu'daki kullanıcıya yansıyan önemli değişiklikler bu dosyada tutulur.

Sürüm numaraları semantik sürümleme düzenini izler:

- `PATCH` (`1.1.0` → `1.1.1`): Hata düzeltmeleri ve küçük metin/görsel iyileştirmeleri.
- `MINOR` (`1.1.0` → `1.2.0`): Geriye uyumlu yeni özellikler, yeni dil desteği veya belirgin akış değişiklikleri.
- `MAJOR` (`1.x` → `2.0`): Kullanıcı davranışında ya da veride geriye uyumsuz büyük değişiklikler.

Hazırlanan değişiklikler önce `Unreleased` altında birikir ve mağaza sürümü hazırlanırken ilgili sürüm başlığına taşınır.

## Unreleased

### Added

- Added a Care tab that brings daily actions, reminders, records, and family activity into one hub.

### Changed

- Moved Family management from the main tab bar to Profile while preserving existing Family routes.
- Improved VoiceOver labels and reading order across the main tabs and Care Hub, and allowed timeline rows to expand for larger text sizes.
- Increased contrast for semantic links, selected tabs, and status colors in light mode.
- Standardized Home and Care actions on a minimum 44-point touch target and made setup-card motion follow the system Reduce Motion preference.
- Made shared screens responsive with compact-phone padding, automatic scroll insets, and centered content-width limits for larger displays.
- Unified Home and Care loading, error, and empty states, and made locked quick actions announce their Lulu Plus requirement to VoiceOver.
- Made Profile subscription details selectable and updated the paywall to stack plans and feature content when screens are compact or text is enlarged.
- Improved the Reports wizard with responsive actions, semantic selection and error colors, accessible headings, and shared loading and empty states.
- Made setup and onboarding flows scroll safely with larger text, localized progress announcements, and semantic form errors across Records and Reminders.
- Aligned Check-In and pet editing with shared loading and error states, and constrained the Check-In save action on larger displays.
- Replaced the weekly Lulu Plus option with a €4.99 monthly plan while preserving legacy weekly receipt recognition.

### Fixed

- Prevented Family join deep links from opening duplicate screens during cold start and rejected malformed join codes.
- Restricted notification navigation to known safe routes and mapped the legacy Family entry to its current destination.

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
