# 004 — Görsel Sistem, Responsive ve Erişilebilirlik

## Task özeti

| Alan | Değer |
|---|---|
| Durum | In Progress |
| Öncelik | P1 |
| Hedef sürüm | v1.2 |
| Task türü | Tasarım Sistemi / UX / Altyapı |
| Tahmini efor | L |
| Ürün katmanı | Her ikisi |
| Bağımlılıklar | 002 |
| Son güncelleme | 2026-07-19 |

## Bağlam ve problem

Lulu’nun monokrom + lavanta dili tutarlı ve sakin; ancak bazı ekranlar çok sayıda benzer karttan oluşuyor, ortak container safe-area davranışı modern Expo/iOS yaklaşımından uzak ve bazı bileşenler küçük ekran/iPad için aynı düzeni kullanıyor. Bu task yeniden marka tasarımı değil, mevcut kimliğin sistemleştirilmesi ve yayın sonrası cilalanmasıdır.

## Kullanıcı sonucu

> Bir kullanıcı olarak Lulu’yu ekran boyutu, dil, yazı büyüklüğü veya hareket tercihime bakılmaksızın rahat ve tutarlı kullanmak istiyorum.

## Tasarım ilkeleri

- Sağlık uygulamasına uygun sakin, güvenilir ve düşük bilişsel yük.
- Bir ekranda tek baskın CTA.
- Kart yalnız gerçek bir gruplama veya etkileşim taşıyorsa kullanılır.
- Lavanta vurgu; durum renkleri semantik ve erişilebilir.
- iOS’ta native davranış, Android’de Material uyumu.

## Kapsam

- [ ] Semantic color token’ları ve light/dark davranışı.
- [ ] Card, Button, Section, List Row, Empty State ve Status bileşen sözleşmeleri.
- [x] `ScreenContainer` için automatic content inset ve iPad responsive grid. — Küçük ekran padding’i, 720/1120 pt içerik sınırları ve Home 760 pt iki kolon eşiği ortak token’larla uygulandı; iPad görsel turu yayın QA’sının sonunda yapılacak.
- [ ] Dynamic Type, VoiceOver, Reduce Motion, contrast ve touch target audit.
- [ ] Paywall, Home, Care, Records, Reports ve setup referans ekranları.

### Kapsam dışı

- Logo veya marka adının değişmesi.
- Bütün ekranların tek PR’da yeniden yazılması.

## Teknik taslak

- `constants/theme.ts` semantik rol bazlı hale gelir.
- Mümkün olan iOS renkleri `expo-router` Color API ile; web fallback korunur.
- `SafeAreaView` sarmalayıcı yerine Stack + `contentInsetAdjustmentBehavior="automatic"` yaklaşımı değerlendirilir.
- `useWindowDimensions` ile compact/regular layout helper.
- Eski legacy shadow/elevation varsa `boxShadow` geçişi.
- Animasyonlar Reduce Motion’a saygı duyar.

## Uygulama fazları

### Faz 1 — Audit ve token

- [x] Component ve spacing envanteri. — `tasks/004-design-system-audit.md` içinde kullanım sayıları ve geçiş sırası belgelendi.
- [x] Renk/kontrast raporu. — Açık tema ön plan rolleri düzeltildi; kritik semantik renkler için WCAG AA regresyon testi eklendi.
- [x] Compact/regular grid kuralları. — `<360`, `>=360` ve `>=760` eşikleri ile 720/1120 pt içerik sınırları testle sabitlendi.

### Faz 2 — Temel bileşenler

- [x] Button/Card/Section/Row/ScreenContainer. — Ortak Button/Card sözleşmesi, 44 pt minimum touch token’ı, Home/Care satır-aksiyonları ve responsive ScreenContainer tamamlandı.
- [x] Empty, loading, error ve locked state. — Ortak ContentState sözleşmesi Home/Care’e uygulandı; polite/assertive duyurular, heading düzeni, retry CTA ve Plus kilit açıklaması eklendi.
- [ ] Visual regression örnek ekranları.

### Faz 3 — Ekran geçişleri

- [x] Home ve Care. — Semantik accent ön planları, büyük metinde genişleyen bölüm başlıkları, minimum dokunma alanları, Reduce Motion uyumlu setup kartı ve responsive container tamamlandı.
- [x] Paywall ve Profile. — Plan kartları küçük ekran/büyük metinde dikeyleşiyor; fiyat metinleri kesilmiyor, loading/error ortak state kullanıyor ve Profile üyelik verileri seçilebilir/erişilebilir hale getirildi.
- [x] Forms, Reports ve onboarding. — Reports, Records, Reminders, Check-In ve pet düzenleme referans formları ortak semantik hata/loading sözleşmesine taşındı. Setup/onboarding kabuğunda çevrilmiş ilerleme duyuruları, kaydırılabilir büyük metin düzeni ve dar alanda responsive başlık yerleşimi uygulandı; Check-In sabit CTA'sı büyük ekran içerik sınırıyla hizalandı.

## Kabul kriterleri

- [ ] Küçük iPhone’da yatay taşma yok.
- [ ] iPad portrait/landscape boşluk ve kolon kullanımı bilinçli.
- [ ] %200 yazı boyutunda kritik CTA ve bilgi erişilebilir.
- [ ] VoiceOver sırası görsel sırayla uyumlu.
- [ ] Reduce Motion ile gereksiz animasyon devre dışı.
- [ ] EN/DE metin uzaması bozulma yaratmıyor.

## Test planı

- Component visual regression.
- Accessibility Inspector ve VoiceOver manuel turu.
- iPhone SE sınıfı, Pro Max ve iPad Air matrisi.

## Açık sorular

- [x] Light mode yeniden kullanıcı seçeneği olacak mı? — Evet; `System / Light / Dark` tercihi ve tam ekran QA kapsamı task 015'e taşındı.
- [ ] iPad regular width için sidebar kullanılacak mı?
- [ ] Health status için kaç semantik renk gerekli?

## Definition of Done

- Token ve ortak bileşen sözleşmeleri belgelenip ana ekranlarda kullanıldı.
- Desteklenen cihaz ve erişilebilirlik matrisi hatasız tamamlandı.
- Kritik ekranlar için görsel regresyon referansları oluşturuldu.
- Yeni bileşen ekleme kuralları proje dokümantasyonuna işlendi.
