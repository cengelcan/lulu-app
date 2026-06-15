# Pet & Home HIG Redesign — Task Tracker

Home, My Pets, Pet Details ve Edit Pet ekranlarını ürün kararları + iOS HIG ile hizalama planı.

**Ürün kararları (netleştirildi):**
- `species` = kedi/köpek (üst kimlik); **Basic Information'da `breed`** (Van Kedisi, Ankara Kedisi, Golden Retriever vb.)
- **Günde 1 check-in** — aynı gün için güncelleme; çoklu kayıt yok
- **View All / History listesi yok** — Home özet ekranı kalır

**Mevcut durum:** ✅ Faz 1 tamamlandı. Faz 2–3 bekliyor.

**Önerilen uygulama sırası:** Faz 1 → Faz 2 → Faz 3

---

## Tasarım kararları

### Karar 1 — Species vs Breed

| Alan | Konum | Örnek |
|------|-------|-------|
| `species` | Pet header alt satırı | Cat, Dog |
| `breed` | Basic Information | Turkish Van, Turkish Angora, Golden Retriever |

Setup akışına breed adımı **Faz 2** (şimdilik Edit Pet'ten girilebilir; opsiyonel).

### Karar 2 — Günde tek check-in

| Durum | Davranış |
|-------|----------|
| Gün için kayıt yok | Boş form → Save Check-In |
| Gün için kayıt var | Form dolu → Update Check-In |
| DB | `UNIQUE(pet_id, date)`; migration'da duplicate'ler en son `created_at` ile birleştirilir |

Kaldırılacak UI: `ExistingCheckInItem`, "Add another check-in", `isAddingNew`.

### Karar 3 — Home bilgi mimarisi (View All yok)

```
Pet header (chevron → profile)
Start Check-In (primary CTA)
Daily Check-In Progress (haftalık pill'ler)
Today's Check-In (tap → check-in edit/create)
Upcoming Reminder
Quick Actions
```

Kaldırılacak: "View History" bölümü ve tüm geçmiş kart listesi.

### Karar 4 — Pet Profile navigation

- Navigation title = **pet adı**
- Sağ üst **Edit** → `/edit-pet`
- Alttaki "Edit Profile" butonu kalkar

---

## Faz 1 — Ürün kararları + kritik HIG

- [x] Task dosyası
- [x] `breed` alanı: types, constants, DB migration v6, storage
- [x] Günde 1 check-in: storage guard, unique index, migration dedupe
- [x] Check-in ekranı sadeleştirme
- [x] Home: history kaldır, Today's Check-In, chevron, section sırası
- [x] Pet Profile: nav Edit, breed, age group, health conditions
- [x] Edit Pet: breed seçimi (species'e bağlı)

---

## Faz 2 — Görsel dil birliği (Profil ile hizala)

- [ ] `ProfileDetailRow` / `GroupedSection` primitive (pet ekranları)
- [ ] Pet Profile: inset grouped kartlar, yatay label–value
- [ ] Edit Pet: grouped sections, Save navigation bar sağ üst, unsaved changes uyarısı
- [ ] My Pets: liste satırı, checkmark accessory, chevron → profile
- [ ] My Pets: çift başlık kaldır; alt satırda breed/species
- [ ] Setup: opsiyonel breed adımı

---

## Faz 3 — Polish

- [ ] Edit Pet: native date picker
- [ ] Dynamic Type
- [ ] Tab bar `HapticTab`
- [ ] Kilitli Quick Actions: Coming Soon badge

---

## Dosya etkisi (Faz 1)

| Dosya | Değişiklik |
|-------|------------|
| `types/pet.ts` | `breed?: string \| null` |
| `constants/pet-breeds.ts` | Kedi/köpek ırk listeleri |
| `storage/database.ts` | Migration v6: breed + check-in unique |
| `storage/pet.storage.ts` | breed read/write |
| `storage/check-in.storage.ts` | `getCheckInByPetIdAndDate`, upsert |
| `app/check-in/index.tsx` | Tek kayıt UX |
| `components/dashboard/DashboardScreen.tsx` | Home sadeleştirme |
| `app/pet-profile.tsx` | Nav Edit, yeni alanlar |
| `app/edit-pet.tsx` | Breed section |
| `utils/pet-display.ts` | `displayPetBreed`, `displayPetAgeGroup` |

---

## Notlar

- Mevcut petlerde `breed` null → profile'da "Not set"
- Check-in migration: aynı gün birden fazla kayıt varsa en yeni `created_at` kalır
- PRD güncellemesi bu task kapsamında değil (ayrı)
