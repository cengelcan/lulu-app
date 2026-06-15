# Daily Check-In Redesign — Task Tracker

Günlük check-in ekranını 6 kategorili snap carousel UX'e geçirme; dil tercihi (EN/TR) ekleme; HIG uyumlu seçim ve home özet davranışları.

**Önceki durum:** 3 kategori (Appetite, Energy, Symptoms), dikey `SelectableOption` listesi, yalnızca İngilizce.

---

## Kilitlemiş kararlar

| # | Konu | Karar | Gerekçe |
|---|------|-------|---------|
| 1 | Dil | Settings → Language (English / Türkçe), AsyncStorage persist | Kullanıcı talebi; Appearance pattern ile tutarlı |
| 2 | i18n yaklaşımı | Hafif custom `i18n/` + `useTranslation` hook | Ek bağımlılık yok; kademeli genişletme |
| 3 | İlk çeviri kapsamı | Settings, Check-in, Check-in success, Dashboard check-in bölümleri | Ana akış; diğer ekranlar sonraki task |
| 4 | Seçim tetikleyicisi | Kaydırma bitince ortadaki kart seçilir + dokunma | Snap carousel HIG pattern; hızlı akış |
| 5 | Home özeti | Yalnızca normal dışı değerler; hepsi normal ise "All normal today ✓" | Bilgi yoğunluğunu azaltır (HIG) |
| 6 | Carousel | `FlatList` horizontal + `snapToInterval` + peek | Native scroll; ek kütüphane yok |
| 7 | Kart genişliği | Ekranın ~72%'si, radius 18px | Plan spec |
| 8 | Süre hedefi | < 30 saniye (PRD güncellenecek) | 6 kategori gerçekçi hedef |
| 9 | `symptom` alanı | Deprecated; `pee` + `poop` ile değiştirilir | Daha detaylı takip |

---

## Ekran wireframe

```
┌─────────────────────────────────────────┐
│  ← Check-In                             │
├─────────────────────────────────────────┤
│  How is Lulu today?                     │
│  Quick daily care check                 │
│  ●●●○○○  3 of 6                         │
│                                         │
│  🍗 Appetite                            │
│     [ snap carousel — peek sides ]      │
│  💧 Water Intake                        │
│     [ snap carousel ]                   │
│  ... (6 categories)                     │
│  ▸ Add a note (optional)                │
├─────────────────────────────────────────┤
│  [ Save Check-In ]          6/6 ✓       │
└─────────────────────────────────────────┘
```

---

## Veri modeli

```ts
type Appetite = 'no_appetite' | 'reduced' | 'normal' | 'increased';
type WaterIntake = 'very_low' | 'low' | 'normal' | 'high' | 'very_high';
type Energy = 'very_low' | 'low' | 'normal' | 'high' | 'very_high';
type Mood = 'restless' | 'irritable' | 'normal' | 'happy' | 'playful';
type Pee = 'straining' | 'less_than_normal' | 'normal' | 'more_than_normal' | 'not_observed';
type Poop = 'diarrhea' | 'soft' | 'normal' | 'hard' | 'none' | 'not_observed';
```

---

## Fazlar

### Faz 0 — Plan & task dosyası
- [x] Task dosyası
- [x] Karar kilitleme

### Faz 1 — i18n + dil tercihi
- [x] `types/language.ts`, `i18n/en.ts`, `i18n/tr.ts`
- [x] `stores/language.store.ts`, prefs storage
- [x] `LanguageSection` + Settings entegrasyonu
- [x] `_layout.tsx` bootstrap load
- [x] `deleteAllLocalData` güncellemesi

### Faz 2 — Veri katmanı
- [x] `types/check-in.ts` genişletme
- [x] `constants/check-in.ts` (ikon metadata)
- [x] DB migration v7 + legacy mapping
- [x] Storage + store güncellemesi

### Faz 3 — UI primitives
- [x] `CheckInOptionCard`
- [x] `SnapOptionCarousel`
- [x] `CheckInCategorySection`
- [x] `CheckInProgress` + `CheckInNotesSection`
- [x] `icon-symbol` mapping genişletme

### Faz 4 — Ekran entegrasyonu
- [x] `app/check-in/index.tsx` refactor
- [x] `app/check-in-success.tsx` i18n
- [x] `DashboardScreen` abnormal-only özet
- [x] `DailyCheckInProgress` i18n

### Faz 5 — QA
- [ ] EN/TR dil geçişi
- [ ] Yeni kayıt + düzenleme
- [ ] Eski kayıt migration
- [ ] VoiceOver / Reduce Motion

---

## Kabul kriterleri

| # | Senaryo | Beklenen |
|---|---------|----------|
| S1 | Settings → Language → Türkçe | Check-in + dashboard TR |
| S2 | 6 kategori carousel | Snap + peek + seçim |
| S3 | Kaydırma bitince | Ortadaki kart seçilir |
| S4 | 6/6 seçilmeden kaydet | Disabled |
| S5 | Home — hepsi normal | "All normal today ✓" |
| S6 | Home — anormal değer | Yalnızca anormal satırlar |
| S7 | Eski 3 alanlı kayıt | Migration + düzenlenebilir |
| S8 | Delete Account | Dil tercihi sıfırlanır |
