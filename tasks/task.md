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
**Durum:** ⬜ Bekliyor

**Kalan call site'lar:**
- [ ] `stores/pet.store.ts` → `loadPet` içinde `getActivePet()` kullan
- [ ] `services/notifications/schedule.ts` → `getActivePet()` kullan
- [ ] `storage/pet.storage.ts` → `getPet()` fonksiyonunu sil
- [ ] Repo genelinde `getPet(` grep temiz

**Kabul kriterleri:**
- [ ] `getPet(` hiçbir yerde kalmamış
- [ ] Tüm ekranlar aktif pet'i doğru yüklüyor

---

### TODO-4: `setActivePet` içinde notification sync merkezileştir

**Öncelik:** P2  
**Durum:** ⬜ Bekliyor

**Dosyalar:**
- `stores/pet.store.ts`
- `components/pets/MyPetsScreenContent.tsx`
- `services/setup/finalize-pet-creation.ts` (değerlendir)

**Yapılacaklar:**
- [ ] `pet.store.setActivePet` içinde `syncCheckInReminderSchedule({ petName })` çağır
- [ ] My Pets'teki duplicate sync çağrısını kaldır
- [ ] Add flow ile çakışma olmadığını doğrula

**Kabul kriterleri:**
- [ ] Pet switch her yerden yapılsa reminder metni güncellenir
- [ ] Notification permission / preference değişmez

---

### TODO-5: Check-in store pet switch güvenliği doğrula

**Öncelik:** P2  
**Durum:** ⬜ Bekliyor (büyük ölçüde yapılmış, doğrulama gerekli)

**Dosyalar:**
- `stores/check-in.store.ts`
- `components/dashboard/DashboardScreen.tsx`
- `app/check-in/index.tsx`

**Kontrol listesi:**
- [ ] `loadCheckIns` başında state temizliği yeterli mi?
- [ ] Dashboard `useFocusEffect` + `pet?.id` dependency doğru mu?
- [ ] Pet switch sırasında eski check-in'ler flash etmiyor mu?
- [ ] Gerekirse `clearCheckIns()` helper ekle

**Kabul kriterleri:**
- [ ] A pet check-in → B'ye geç → B'nin history'si görünür
- [ ] Geri A'ya geç → A'nın history'si geri gelir

---

### TODO-6: Bootstrap akışını gözden geçir

**Öncelik:** P2  
**Durum:** ⬜ Bekliyor

**Dosyalar:**
- `hooks/use-bootstrap.ts`

**Yapılacaklar:**
- [ ] `hasPet` kontrolünü gözden geçir (`hasAnyPet()` helper düşün)
- [ ] Upgrade senaryosu: mevcut 1 pet kullanıcı → `activePetId` fallback çalışıyor mu?

**Kabul kriterleri:**
- [ ] Eski kullanıcı upgrade → Home aynı pet'i gösterir
- [ ] Pet yok → setup'a yönlendirir

---

## Faz 3 — Store mimarisi (isteğe bağlı)

### TODO-7: Pet store'u çoklu pet modeline genişlet

**Öncelik:** P3  
**Durum:** ⬜ Bekliyor

**Dosyalar:**
- `stores/pet.store.ts`
- `components/pets/MyPetsScreenContent.tsx`

**Hedef state:** `pets[]`, `pet` (aktif), `activePetId`

**Yapılacaklar:**
- [ ] `loadPets()` ekle
- [ ] `createPet` → listeye append + aktif yap
- [ ] `deletePet` → listeden çıkar, aktifse yeniden ata
- [ ] My Pets'i store'dan besle (doğrudan `petStorage` bypass'ını kaldır)

---

### TODO-8: `deletePet` edge case'leri

**Öncelik:** P3  
**Durum:** ⬜ Bekliyor

**Dosyalar:**
- `stores/pet.store.ts`
- `storage/pet.storage.ts`

**Yapılacaklar:**
- [ ] Aktif pet silinirse → kalan pet'ten birini active yap
- [ ] Son pet silinirse → `removeActivePetId()` + `pet: null`

**Not:** My Pets'ten per-pet delete UI plan dışı (v1).

---

## Faz 4 — Dokümantasyon ve temizlik

### TODO-9: PRD güncelle

**Öncelik:** P3  
**Durum:** ⬜ Bekliyor

**Dosya:** `PRD.md`

**Yapılacaklar:**
- [ ] FR-001: "create one pet" → çoklu pet
- [ ] My Pets tab UX gereksinimlerini ekle
- [ ] Active pet kavramını dokümante et
- [ ] Global notification prefs limitasyonunu not et

---

### TODO-10: README güncelle

**Öncelik:** P4  
**Durum:** ⬜ Bekliyor

**Dosya:** `README.md`

**Yapılacaklar:**
- [ ] Tab yapısı: Home | My Pets | Profile
- [ ] Çoklu pet akışı kısa özet
- [ ] Add mode vs initial setup farkı

---

### TODO-11: Legacy route temizliği

**Öncelik:** P4  
**Durum:** ⬜ Bekliyor

**Dosyalar:**
- `app/(main)/dashboard.tsx`
- `app/(main)/_layout.tsx`

**Yapılacaklar:**
- [ ] `(main)` grubuna referans var mı kontrol et
- [ ] Güvenliyse redirect route'u kaldır

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
