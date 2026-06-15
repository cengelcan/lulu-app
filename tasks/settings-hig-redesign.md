# Settings HIG Redesign — Task Tracker

Settings ekranını iOS Human Interface Guidelines'a uygun grouped list düzenine geçirme; bildirimleri toggle + saat seçiciye, görünümü Light/Dark/System tercihine dönüştürme.

**Önceki durum:** İki kart — bildirim status metni + 4 seçenekli hatırlatıcı tercihi (`morning` / `afternoon` / `evening` / `multiple_times_daily`). Tema yalnızca sistem.

---

## Kilitlemiş kararlar (HIG)

| # | Konu | Karar | Gerekçe |
|---|------|-------|---------|
| 1 | Tema seçimi UI | Navigation row + chevron → **Action Sheet** (iOS) / Alert (Android) | Settings.app "Appearance" pattern |
| 2 | Toggle kapalıyken saat satırı | **Gizle** | Bağımlı ayar; üst koşul sağlanmadan gösterilmez |
| 3 | Setup `check-in-prefs` | **Saat seçici** (toggle yok; izin sonraki ekranda) | Settings ile tutarlı veri modeli, setup akışı sade |
| 4 | Dil | İngilizce (mevcut app dili) | Lokalizasyon ayrı task |

---

## Ekran wireframe

```
┌─────────────────────────────────────┐
│  NOTIFICATIONS                      │
│ ┌─────────────────────────────────┐ │
│ │ Daily Check-In Reminder    [○] │ │
│ │ ─────────────────────────────── │ │  ← toggle ON iken
│ │ Reminder Time          9:00 AM ›│ │
│ └─────────────────────────────────┘ │
│  Notifications are disabled in     │  ← denied footer
│  system settings. [Open Settings]  │
├─────────────────────────────────────┤
│  APPEARANCE                         │
│ ┌─────────────────────────────────┐ │
│ │ Theme              System    › │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## Veri modeli

```ts
type ReminderTime = { hour: number; minute: number };  // default 09:00
type AppAppearance = 'system' | 'light' | 'dark';     // default 'system'
```

**Migration:** Eski `checkInPreferences` → saat eşlemesi (morning 09:00, afternoon 18:00, evening 21:00, multiple_times_daily 09:00).

---

## Fazlar

### Faz 0 — Veri katmanı
- [x] `types/reminder.ts`, `types/appearance.ts`
- [x] Storage keys + get/set + migration
- [x] `deleteAllLocalData` güncellemesi

### Faz 1 — Schedule & store
- [x] `schedule.ts` tek saat modeli
- [x] `notification.store` → `reminderTime`, `saveReminderTime`
- [x] `appearance.store`

### Faz 2 — UI
- [x] `TimePickerField`, `SettingsToggleRow`, `SettingsValueRow`
- [x] `NotificationSection`, `AppearanceSection`
- [x] `SettingsScreenContent` refactor

### Faz 3 — Tema entegrasyonu
- [x] `use-color-scheme` override
- [x] `_layout.tsx` bootstrap load

### Faz 4 — Setup & temizlik
- [x] `check-in-prefs.tsx` saat seçici
- [x] `DashboardScreen` upcoming reminder
- [x] Eski `CheckInPreference` kaldır

---

## Kabul kriterleri

| # | Senaryo | Beklenen |
|---|---------|----------|
| S1 | Settings aç | Notifications + Appearance grouped sections |
| S2 | Toggle ON | OS izin → hatırlatıcı planlanır |
| S3 | Toggle OFF | Hatırlatıcılar iptal |
| S4 | Saat değiştir | Yeni saatte yeniden planlanır |
| S5 | OS denied | Footer + Open Settings |
| S6 | Theme → Dark | Anında koyu tema, persist |
| S7 | Theme → System | Sistem temasını takip |
| S8 | Eski kullanıcı | Preference → saate migrate |
| S9 | Delete Account | Tüm prefs temizlenir |
