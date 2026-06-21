# Önceden Var Olan TypeScript Hataları

`npx tsc --noEmit` çalıştırıldığında çıkan ve **rapor/PDF çalışmasından bağımsız**, projede önceden bulunan hatalar. Toplam: **5 hata, 4 dosya**.

> Not: Bu hataların hiçbiri benim dokunduğum dosyalarda değil. Rapor önizleme/PDF değişiklikleri temiz (`tsc` ve lint hatasız). Aşağıdakiler ayrı bir temizlik turunda ele alınmalı.

Son kontrol: 21 Haz 2026

---

## 1. `detachInactiveScreens` Stack `screenOptions` içinde geçersiz (2 yer)

- **Dosyalar:**
  - `app/(onboarding)/_layout.tsx:8`
  - `app/(setup)/_layout.tsx:9`
- **Hata:** `TS2353: Object literal may only specify known properties, and 'detachInactiveScreens' does not exist in type 'NativeStackNavigationOptions | (...)'`
- **Kök neden:** `detachInactiveScreens`, ekran bazlı bir seçenek (`screenOptions`) değil; navigator seviyesinde bir prop. Mevcut expo-router / `@react-navigation/native-stack` tip tanımlarında `screenOptions` içinde tanınmıyor.
- **Önerilen çözüm:** Prop'u `screenOptions` dışına, doğrudan `<Stack>` bileşenine taşımayı dene:
  ```tsx
  <Stack
    detachInactiveScreens={false}
    screenOptions={{ headerShown: false }}
  />
  ```
  Eğer expo-router `Stack` bunu navigator'a iletmiyorsa, tip hâlâ kabul etmeyebilir. Bu durumda alternatif: `unmountOnBlur`/`freezeOnBlur` gibi desteklenen bir seçenekle aynı davranışın (wizard adımlarını mount'ta tutma) sağlanıp sağlanamayacağını araştır.
- **Bağlam/risk:** `(setup)` layout'ta amaç wizard adımları arasında geri gidince form state'inin korunması. Davranışı bozmadan düzeltilmeli — sadece tipi susturmak (`as any`) yerine doğru API kullanılmalı. **Öncelik: Orta.**

---

## 2. `useColorScheme` dönüş tipi `undefined` içeriyor (2 yer)

- **Dosyalar:**
  - `hooks/use-color-scheme.ts:17`
  - `hooks/use-color-scheme.web.ts:30`
- **Hata:** `TS2322: Type 'ColorSchemeName' is not assignable to type '"light" | "dark" | null'. Type 'undefined' is not assignable...`
- **Kök neden:** React Native'in `useColorScheme()` dönüşü `ColorSchemeName = 'light' | 'dark' | null | undefined`. Fonksiyon imzası ise `'light' | 'dark' | null` döndüreceğini söylüyor; `systemScheme` `undefined` olabildiği için uyumsuz.
- **Önerilen çözüm:** Dönüşte `undefined`'ı `null`'a indir:
  ```ts
  return systemScheme ?? null;
  ```
  Her iki dosyada (`.ts` ve `.web.ts`) aynı düzeltme uygulanmalı.
- **Bağlam/risk:** Tek satırlık, davranış-nötr düzeltme. **Öncelik: Düşük (kolay kazanım).**

---

## 3. `scheduleDailyCheckInReminder`'a `null` `reminderTime` geçişi

- **Dosya:** `services/notifications/schedule.ts:94`
- **Hata:** `TS2345: Argument of type 'ReminderTime | null' is not assignable to parameter of type 'ReminderTime'. Type 'null' is not assignable to type 'ReminderTime'.`
- **Kök neden:** `syncCheckInReminderSchedule` içinde `reminderTime` değişkeni `ReminderTime | null` tipinde (girdi ya da `getCheckInReminderTime()` `null` dönebilir). 94. satırda `scheduleDailyCheckInReminder(reminderTime, ...)` çağrılırken `null` ihtimali için bir guard yok; fonksiyon ise `ReminderTime` (null değil) bekliyor.
- **Önerilen çözüm:** Zamanlamadan önce null kontrolü ekle (mevcut `permission`/`petName` guard'larıyla aynı desende):
  ```ts
  if (!reminderTime) {
    return;
  }

  await scheduleDailyCheckInReminder(reminderTime, petName, language);
  ```
- **Bağlam/risk:** Potansiyel runtime sorununu da kapatır (hatırlatma zamanı yoksa zaten zamanlama yapılmamalı). **Öncelik: Orta-Yüksek** (hem tip hem mantık doğruluğu).

---

## Önerilen düzeltme sırası

1. **#2 useColorScheme** — tek satır, risksiz.
2. **#3 schedule.ts** — guard ekle, mantıksal olarak da doğru.
3. **#1 detachInactiveScreens** — doğru API'yi araştırıp davranışı koruyarak düzelt (en fazla dikkat isteyen).

Hepsi düzeltilince hedef: `npx tsc --noEmit` → 0 hata.
