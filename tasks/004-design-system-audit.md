# 004 — Faz 1 tasarım sistemi auditi

Tarih: 2026-07-19

## Mevcut durum

- Tema, spacing, radius ve typography token’ları `constants/theme.ts` içinde merkezi olarak tanımlı.
- 25 dosya ortak `ScreenContainer`, 31 dosya ortak `Button`, 18 dosya ortak `Card` kullanıyor.
- 62 dosyada doğrudan `Pressable` bulunuyor; touch target ve erişilebilirlik kontrolü ekran geçişlerinde yapılmalı.
- 37 ekran/bileşen dosyasında doğrudan hex/RGB renk, 31 dosyada doğrudan sayısal `fontSize` var. Bunların bir kısmı grafik, kayıt türü ve illüstrasyon gibi bilinçli veri renkleri; kalanları semantik token’a taşınmalı.

## Audit kararları

- Marka lavantası yüzey/illüstrasyon rengi olarak korunur; açık temadaki metin, link ve aktif tab ön planında daha koyu `brandAccentDark` kullanılır.
- Başarı, uyarı ve hata ön planları açık temada WCAG AA metin kontrastını sağlayan koyu rollere ayrılır.
- Ana metin, ikincil metin, accent ve durum ön planları için her iki temada en az 4.5:1; seçili tab ikonu için en az 3:1 kontrast testle korunur.
- Ortak bileşen geçişi önce Home ve Care, ardından Profile/Paywall, sonra form ve onboarding ekranlarında yapılır.
- iPad portrait/landscape düzen turu kullanıcının isteği doğrultusunda sürüm QA’sının sonuna bırakılır; responsive altyapı daha önce hazırlanabilir.

## Sonraki uygulama dilimi

1. [x] Touch target ve ortak Button/Card/Row sözleşmelerini netleştir.
2. [x] Home ve Care’de etkileşim ön planlarını semantik accent rollerine taşı.
3. [x] Home setup kartında Dynamic Type ve Reduce Motion davranışını tamamla.
4. [x] ScreenContainer automatic inset ve compact/regular responsive sözleşmesini uygula.
