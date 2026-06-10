# Multi-Pet Migration — Task Tracker

Ana UX (My Pets listesi, seçim, ekleme) tamamlandı. Bu dosya kalan işleri ve ilerlemeyi takip eder.

**Önerilen uygulama sırası:** TODO-1 → TODO-2 → … → TODO-11

---

## Tamamlanan (önceki commit'ler)

- [x] Storage foundation (`activePetId`, `getPets`, `getActivePet`)
- [x] My Pets tab (read-only liste)
- [x] Pet selection (My Pets → active pet → Home)
- [x] Add Pet flow (`mode=add`, 4 adımlı setup)

---

## Faz 1 — Kritik (veri bütünlüğü)

### TODO-1: Delete All Data'yı çoklu pet için düzelt

**Öncelik:** P0  
**Durum:** ✅ Tamamlandı

**Dosyalar:**
- `services/cleanup/delete-all-local-data.ts`
- `components/settings/SettingsScreenContent.tsx`
- `storage/pet.storage.ts`

**Yapılanlar:**
- [x] Tüm petleri sil (`deleteAllPets()`)
- [x] `removeActivePetId()` ekle
- [x] Settings'ten `pet?.id` parametresini kaldır
- [x] Modal metnini çoğul ifadeyle güncelle

**Kabul kriterleri:**
- [x] 2 pet varken Delete All Data → DB'de 0 pet
- [x] `activePetId` AsyncStorage'dan silinmiş
- [x] Bootstrap → onboarding'e döner

**Commit önerisi:** `fix: delete all pets and activePetId on Delete All Data`

---

### TODO-2: İlk pet oluşturmada `activePetId` persist et

**Öncelik:** P1  
**Durum:** ✅ Tamamlandı

**Dosyalar:**
- `services/setup/finalize-pet-creation.ts` (`finalizeInitialModePet`)
- `app/(setup)/notification-permission.tsx`

**Yapılanlar:**
- [x] `finalizeInitialModePet` içinde `createPet` sonrası `setActivePet(pet.id)` çağrılıyor
- [x] Notification permission ekranı `setActivePet` dependency'sini geçiriyor

**Kabul kriterleri:**
- [x] Fresh install → setup tamamlanınca `activePetId` hemen set
- [x] My Pets açıldığında "Current" badge doğru pet'te
- [x] `getActivePet()` fallback'ine güvenmek zorunda kalınmasın

**Commit önerisi:** `fix: persist activePetId after initial pet setup`

---

## Faz 2 — Teknik borç ve merkezileştirme

### TODO-3: `getPet()` deprecated wrapper'ı kaldır

**Öncelik:** P1  
**Durum:** ✅ Tamamlandı

**Güncellenen dosyalar:**
- [x] `stores/pet.store.ts` → `getActivePet()`
- [x] `services/notifications/schedule.ts` → `getActivePet()`
- [x] `storage/pet.storage.ts` → `getPet()` silindi

**Kabul kriterleri:**
- [x] `getPet(` hiçbir yerde kalmamış
- [x] Tüm ekranlar aktif pet'i doğru yüklüyor

**Commit önerisi:** `refactor: replace deprecated getPet with getActivePet`

---

### TODO-4: `setActivePet` içinde notification sync merkezileştir

**Öncelik:** P2  
**Durum:** ✅ Tamamlandı

**Dosyalar:**
- `stores/pet.store.ts`
- `components/pets/MyPetsScreenContent.tsx`
- `services/setup/finalize-pet-creation.ts`

**Yapılanlar:**
- [x] `pet.store.setActivePet` içinde `syncCheckInReminderSchedule({ petName })` çağrılıyor
- [x] My Pets'teki duplicate sync kaldırıldı
- [x] Add/initial finalize flow'daki duplicate sync kaldırıldı (`setActivePet` üzerinden)

**Kabul kriterleri:**
- [x] Pet switch her yerden yapılsa reminder metni güncellenir
- [x] Notification permission / preference değişmez (sadece pet name copy)

**Commit önerisi:** `refactor: sync reminder schedule in setActivePet`

---

### TODO-5: Check-in store pet switch güvenliği doğrula

**Öncelik:** P2  
**Durum:** ✅ Tamamlandı

**Dosyalar:**
- `stores/check-in.store.ts`
- `stores/pet.store.ts`
- `components/pets/MyPetsScreenContent.tsx`
- `app/check-in/index.tsx`

**Doğrulama / yapılanlar:**
- [x] `loadCheckIns` başında state temizliği zaten vardı — korundu
- [x] `clearCheckIns()` helper eklendi
- [x] `setActivePet` switch anında check-in state'i senkron temizliyor (flash önleme)
- [x] My Pets `await loadCheckIns` — Home'a geçmeden önce doğru data yükleniyor
- [x] Check-in ekranı `pet?.id` değişince check-in'leri yeniden yüklüyor
- [x] Dashboard `pet?.id` dependency — zaten doğruydu

**Kabul kriterleri:**
- [x] A pet check-in → B'ye geç → B'nin history'si görünür
- [x] Geri A'ya geç → A'nın history'si geri gelir
- [x] Switch sırasında eski check-in flash etmiyor

**Commit önerisi:** `fix: clear stale check-ins when switching active pet`

---

### TODO-6: Bootstrap akışını gözden geçir

**Öncelik:** P2  
**Durum:** ✅ Tamamlandı

**Dosyalar:**
- `hooks/use-bootstrap.ts`
- `storage/pet.storage.ts`

**Yapılanlar:**
- [x] `hasAnyPet()` helper eklendi (`getFirstPet` tabanlı)
- [x] Bootstrap routing artık `hasAnyPet` ile setup vs home kararını veriyor (aktif pet yüklü mü ayrı konu)
- [x] `loadPet()` → `getActivePet()` upgrade'de `activePetId` yoksa first pet'e fallback + persist (mevcut, doğrulandı)
- [x] Reminder sync bootstrap'ta aktif pet adıyla çağrılıyor (`petName` explicit)

**Kabul kriterleri:**
- [x] Eski kullanıcı upgrade → `getActivePet` first pet'i resolve eder → Home aynı pet
- [x] Pet yok → setup'a yönlendirir
- [x] Onboarding tamamlanmamış → onboarding'e gider

**Commit önerisi:** `refactor: gate bootstrap routing on hasAnyPet`

---

## Faz 3 — Store mimarisi (isteğe bağlı)

### TODO-7: Pet store'u çoklu pet modeline genişlet

**Öncelik:** P3  
**Durum:** ✅ Tamamlandı

**Dosyalar:**
- `stores/pet.store.ts`
- `components/pets/MyPetsScreenContent.tsx`
- `services/cleanup/delete-all-local-data.ts`

**Yapılanlar:**
- [x] Store state: `pets[]`, `pet` (aktif), `activePetId`
- [x] `loadPets()` — liste + aktif pet tek seferde
- [x] `loadPet()` → `loadPets()` delegate
- [x] `createPet` → listeye append
- [x] `updatePet` → hem `pet` hem `pets[]` günceller
- [x] My Pets store'dan besleniyor (`petStorage` bypass kaldırıldı)

**Kabul kriterleri:**
- [x] My Pets ve Dashboard aynı store state'ini paylaşır
- [x] Pet ekleme/seçme sonrası My Pets listesi stale kalmaz (focus'ta `loadPets`)

**Commit önerisi:** `refactor: extend pet store for multi-pet list state`

---

### TODO-8: `deletePet` edge case'leri

**Öncelik:** P3  
**Durum:** ✅ Tamamlandı (TODO-7 ile birlikte)

**Dosyalar:**
- `stores/pet.store.ts`

**Yapılanlar:**
- [x] Aktif pet silinirse → kalan listeden ilki active yapılır + reminder sync
- [x] Son pet silinirse → `removeActivePetId()` + state temizliği
- [x] Delete All Data reset → `pets[]` + `activePetId` temizlenir

**Not:** My Pets'ten per-pet delete UI plan dışı (v1).

**Commit önerisi:** _(TODO-7 commit'ine dahil)_

---

## Faz 4 — Dokümantasyon ve temizlik

### TODO-9: PRD güncelle

**Öncelik:** P3  
**Durum:** ✅ Tamamlandı

**Dosya:** `PRD.md`

**Yapılanlar:**
- [x] FR-001 → çoklu pet + FR-001a/b/c eklendi
- [x] Screen 16 My Pets UX gereksinimleri eklendi
- [x] Active pet kavramı (Dashboard, data model, FR'ler)
- [x] Global notification prefs limitasyonu dokümante edildi
- [x] FR-008 Delete All Data, MVP release criteria güncellendi

**Commit önerisi:** `docs: update PRD for multi-pet support`

---

### TODO-10: README güncelle

**Öncelik:** P4  
**Durum:** ✅ Tamamlandı

**Dosya:** `README.md`

**Yapılanlar:**
- [x] Tab yapısı: Home | My Pets | Profile
- [x] Çoklu pet akışı (switch, add) özeti
- [x] Initial setup vs add mode farkı
- [x] Global notification prefs notu

**Commit önerisi:** `docs: document multi-pet flows in README`

---

### TODO-11: Legacy route temizliği

**Öncelik:** P4  
**Durum:** ✅ Tamamlandı

**Dosyalar:**
- `app/(main)/dashboard.tsx` — silindi
- `app/(main)/_layout.tsx` — silindi
- `app/_layout.tsx` — `(main)` Stack.Screen kaldırıldı

**Kontrol:**
- [x] Kod tabanında `/(main)/` referansı yoktu
- [x] Redirect route güvenle kaldırıldı

**Commit önerisi:** `chore: remove legacy (main) dashboard redirect`

---

## Manuel test matrisi

| # | Senaryo | Beklenen | Durum |
|---|---------|----------|-------|
| T1 | Fresh install | Onboarding → 6 adım setup → 1 pet → Home | ⬜ |
| T2 | Eski kullanıcı (1 pet, activePetId yok) | Home aynı pet, My Pets "Current" doğru | ⬜ |
| T3 | 2. pet ekle (add mode) | 4 adım, yeni pet active | ⬜ |
| T4 | Pet switch | Home name/photo/check-ins güncellenir | ⬜ |
| T5 | Switch back | Önceki pet'in check-in'leri geri gelir | ⬜ |
| T6 | Reminder metni | Switch sonrası yeni pet adı | ⬜ |
| T7 | Delete All Data (2 pet) | Tüm veri silinir, onboarding | ⬜ |
| T8 | Add mode back/cancel | My Pets'e döner | ⬜ |
| T9 | Dark mode | My Pets + add flow renkleri bozulmaz | ⬜ |
| T10 | Pet Profile → Edit → Home | Navigation stack düzgün | ⬜ |

---

## Kapsam dışı (v1)

- My Pets'ten tek pet silme UI
- Pet başına notification / check-in preference
- `petId` route param ile Pet Profile
- Cloud sync / cross-device active pet
