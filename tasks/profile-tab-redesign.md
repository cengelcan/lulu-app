# Profile Tab Redesign — Task Tracker

Profil sekmesini iOS Human Interface Guidelines'a uygun bir **hub ekranı** olarak yeniden yapılandırma planı.

**Mevcut durum:** ✅ v1 hub ekranı tamamlandı (Faz 0–3). Faz 4 ve PRD güncellemesi kapsam dışı.

**Önceki durum (referans):**
- ~~`app/(tabs)/profile.tsx` → `SettingsScreenContent` render ediyor~~ → `ProfileScreenContent`
- ~~Settings profilden link yok~~ → User Card ⚙ → `/settings`
- ~~store / storage / avatar / display name yok~~ → `user.store` + `user.storage`
- Auth placeholder (Guest); Log Out guest'te gizli
- Lulu Plus placeholder (`ComingSoonModal`); StoreKit ayrı task
- `services/pick-image-from-gallery.ts` — pet + kullanıcı fotoğrafları ortak

**Önerilen uygulama sırası:** Faz 0 → Faz 1 → Faz 2 → Faz 3 → ~~Faz 4~~ (gelecek)

---

## Tasarım kararları (önceden netleştir)

### Öneri 1 — Profil ≠ Settings (kabul edildi)

Mevcut bildirim ve hatırlatıcı tercihleri profilden **ayrılmalı**. User Card'daki Settings butonu `app/settings` stack ekranına gitsin. Profil sekmesi keşif / hesap / topluluk / yasal işlemler için hub olsun.

### Öneri 2 — iOS grouped list düzeni

| Bölüm | HIG yaklaşımı |
|-------|---------------|
| User Card | Kart **içinde değil**; üstte serbest header (avatar + isim + e-posta). Settings ikonu sağ üst köşede `Pressable` |
| Lulu Plus, Community, Legal | Her biri ayrı **inset grouped** kart; satırlar arasında `hairline` ayırıcı |
| Delete / Log Out | Legal kartının **altında**, ayrı grouped kart veya son kartın alt satırları; destructive kırmızı metin |

Referans: Settings.app, Apple ID profil sayfası.

### Öneri 3 — Kullanıcı adı düzenleme UX'i

Inline TextInput yerine **tap-to-edit** önerilir:
- İsim yoksa: "Add your name" (secondary renk, italik veya caption)
- Tıklanınca: iOS `Alert.prompt` (sadece iOS) veya küçük bottom sheet / modal
- Boş isim geçerli (opsiyonel alan)

Alternatif (daha basit v1): Settings ekranına taşımak — **önerilmez**; isim profil kimliğinin parçası.

### Öneri 4 — "Delete My Account" vs mevcut "Delete All Data"

| Kullanıcı tipi | Davranış (v1 önerisi) |
|----------------|----------------------|
| Guest | Delete My Account = tüm yerel veriyi sil + onboarding'e dön (mevcut `deleteAllLocalData` akışı) |
| Gelecek: Apple/Google/Email | Aynı UI; backend hesap silme Faz 4+ / auth task'ına bağlanır |

Modal metni kullanıcıya net olsun: *"All pets, check-ins, and preferences on this device will be permanently removed."*

Mevcut "Delete All Data" etiketi → **"Delete My Account"** olarak yeniden adlandırılır; davranış aynı kalabilir.

### Öneri 5 — Log Out (guest için)

Auth olmadan Log Out:
- **Seçenek A (önerilen):** Guest kullanıcıda Log Out satırını **gizle** veya disabled + "Sign in to enable" alt metni
- **Seçenek B:** Log Out = yerel veriyi silmeden auth ekranına git (veri kalır, kafa karıştırıcı)

Gerçek auth geldiğinde: oturumu kapat, yerel cache'i temizleme (veya politikaya göre), `/(auth)` ekranına yönlendir.

### Öneri 6 — Lulu Plus kartı (henüz IAP yok)

| Durum | Kart içeriği |
|-------|--------------|
| Free | Başlık: **Lulu Plus** · Alt metin: *"Unlock advanced reports, multi-caregiver sharing, and more."* · CTA: **Upgrade** (primary outline veya filled küçük buton) |
| Subscribed (gelecek) | Alt metin: *"Your plan renews on {date}"* veya *"Active"* · CTA: **Manage** |

v1: `isPlusSubscriber` mock/store flag → CTA `ComingSoonModal` veya basit paywall placeholder. StoreKit entegrasyonu ayrı task.

### Öneri 7 — Community aksiyonları

| Satır | Davranış | Bağımlılık |
|-------|----------|------------|
| Rate Lulu | `expo-store-review` → `StoreReview.requestReview()`; cooldown ile (ör. 90 gün) | Yeni paket |
| Share Lulu | `Share.share()` (RN built-in) veya `expo-sharing` | Minimal |
| Follow us on Instagram | `Linking.openURL('https://instagram.com/...')` | Instagram handle URL sabiti |

Rate için App Store ID yoksa v1'de `ComingSoonModal` fallback.

### Öneri 8 — Legal satırları

Privacy Policy ve Terms → `expo-web-browser` in-app browser (`components/external-link.tsx` pattern).

URL'ler için `constants/legal.ts` (placeholder domain'ler; yayın öncesi güncellenir).

### Öneri 9 — App version footer (opsiyonel, HIG uyumlu)

Legal kartının altında centered caption: `Lulu v1.0.0` (`expo-constants`). Settings.app'teki gibi; destek taleplerinde faydalı.

### Öneri 10 — Bileşen mimarisi

```
components/profile/
  ProfileScreenContent.tsx    # ana ekran
  UserCard.tsx                # avatar + isim + email + settings
  UserAvatar.tsx              # PetAvatar pattern; placeholder: person.fill
  ProfileListRow.tsx          # icon + label + chevron / external link
  LuluPlusCard.tsx
  CommunityCard.tsx
  LegalCard.tsx

stores/user.store.ts          # displayName, avatarUri, email (mock), provider
storage/user.storage.ts       # AsyncStorage veya SQLite users tablosu
services/user-photo.ts        # pickPetPhotoFromGallery'den türet veya genelleştir
```

`ProfileListRow`: `accessibilityRole="button"`, min 44pt touch target, iOS haptic (`Haptics.impactAsync`).

---

## Ekran wireframe (mantıksal)

```
┌─────────────────────────────────────┐
│  [Avatar 88pt]          [⚙ Settings] │
│  Display Name (veya "Add your name") │
│  email@example.com (secondary)       │
├─────────────────────────────────────┤
│ ┌ Lulu Plus ─────────────────────┐ │
│ │ Unlock advanced reports...      │ │
│ │                    [ Upgrade ]  │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ ┌ Community ─────────────────────┐ │
│ │ ⭐ Rate Lulu                 › │ │
│ │ ─────────────────────────────  │ │
│ │ 📤 Share Lulu                › │ │
│ │ ─────────────────────────────  │ │
│ │ 📷 Follow us on Instagram  ↗ │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ ┌ Legal ─────────────────────────┐ │
│ │ Privacy Policy               ↗ │ │
│ │ ─────────────────────────────  │ │
│ │ Terms & Conditions           ↗ │ │
│ │ ─────────────────────────────  │ │
│ │ Delete My Account    (destructive)│
│ │ ─────────────────────────────  │ │
│ │ Log Out              (destructive)│
│ └─────────────────────────────────┘ │
│           Lulu v1.0.0               │
└─────────────────────────────────────┘
```

---

## Faz 0 — Veri katmanı ve tipler

### TODO-P0-1: User profile storage

**Öncelik:** P0  
**Durum:** ✅ Tamamlandı

**Dosyalar:**
- `storage/user.storage.ts`
- `constants/storage-keys.ts` → `userProfile` key
- `types/user.ts` → `UserProfile`, `DISPLAY_NAME_MAX_LENGTH`

**Yapılacaklar:**
- [x] `UserProfile` tipi: `{ displayName: string \| null; avatarUri: string \| null }`
- [x] `getUserProfile()` / `setUserProfile()` / `clearUserProfile()`
- [x] `deleteAllLocalData` içinde profile temizliği
- [x] Avatar: pet ile aynı raw URI yaklaşımı (v1)

**Kabul kriterleri:**
- [x] Uygulama yeniden açılınca isim ve avatar korunur
- [x] Delete My Account sonrası profile sıfırlanır

---

### TODO-P0-2: User store

**Öncelik:** P0  
**Durum:** ✅ Tamamlandı

**Dosya:** `stores/user.store.ts`

**Yapılacaklar:**
- [x] `loadUserProfile()`, `updateDisplayName()`, `updateAvatarUri()`
- [x] Guest için email: `null` (satır gizlenir)
- [x] Profile focus'ta yükleme (`ProfileScreenContent` useFocusEffect)

**Kabul kriterleri:**
- [x] Profile ekranı store'dan beslenir
- [x] Avatar / isim güncellemesi anında UI'da yansır

---

### TODO-P0-3: Avatar picker servisi

**Öncelik:** P1  
**Durum:** ✅ Tamamlandı

**Dosya:** `services/pick-image-from-gallery.ts` (pet-photo delegate eder)

**Yapılacaklar:**
- [x] `pickImageFromGallery()` generic helper
- [x] `app.json` photosPermission metni güncellendi

---

## Faz 1 — UI iskeleti ve navigasyon

### TODO-P1-1: ProfileScreenContent oluştur

**Öncelik:** P0  
**Durum:** ✅ Tamamlandı

**Dosyalar:**
- `components/profile/ProfileScreenContent.tsx`
- `app/(tabs)/profile.tsx`

**Yapılacaklar:**
- [x] `ScreenContainer scrollable` + section gap (`Spacing.lg`)
- [x] Büyük başlık kullanılmıyor
- [x] Alt kartlar: `Card` + iç satırlar

**Kabul kriterleri:**
- [x] Profile tab settings içeriğini göstermez
- [x] Dark mode desteği (theme token'ları)

---

### TODO-P1-2: UserCard bileşeni

**Öncelik:** P0  
**Durum:** ✅ Tamamlandı

**Dosya:** `components/profile/UserCard.tsx`

**Yapılacaklar:**
- [x] `UserAvatar` — fotoğraf seçici; accessibility: "Change profile photo"
- [x] Display name — tap-to-edit (`EditNameModal`)
- [x] Email — guest'te satır gizli
- [x] Settings — `router.push('/settings')`, min 44×44 hit area

---

### TODO-P1-3: ProfileListRow bileşeni

**Öncelik:** P1  
**Durum:** ✅ Tamamlandı

**Dosya:** `components/profile/ProfileListRow.tsx`

---

### TODO-P1-4: Settings ekranını ayır

**Öncelik:** P0  
**Durum:** ✅ Tamamlandı

**Dosyalar:**
- `components/settings/SettingsScreenContent.tsx`
- `app/settings.tsx`

**Yapılacaklar:**
- [x] "Profile & Settings" başlığı kaldırıldı; stack header "Settings"
- [x] Delete All Data kaldırıldı → Legal kartına taşındı

**Kabul kriterleri:**
- [x] Profile → Settings → geri navigasyonu
- [x] Bildirim tercihleri Settings'te çalışıyor

---

## Faz 2 — Kart içerikleri

### TODO-P2-1: LuluPlusCard

**Öncelik:** P1  
**Durum:** ✅ Tamamlandı

**Dosya:** `components/profile/LuluPlusCard.tsx`

**Yapılacaklar:**
- [x] `user.store` içinde `isPlusActive: boolean` (default `false`)
- [x] Free → Upgrade CTA
- [x] Active → Manage CTA
- [x] v1: `ComingSoonModal` placeholder

---

### TODO-P2-2: CommunityCard

**Öncelik:** P1  
**Durum:** ✅ Tamamlandı

**Dosya:** `components/profile/CommunityCard.tsx`

**Yapılacaklar:**
- [x] Rate → `expo-store-review` + 90 gün cooldown (`lastStoreReviewPromptAt`)
- [x] Share → `Share.share()`
- [x] Instagram → `constants/social.ts` → `INSTAGRAM_URL`

---

### TODO-P2-3: LegalCard + destructive aksiyonlar

**Öncelik:** P0  
**Durum:** ✅ Tamamlandı

**Dosya:** `components/profile/LegalCard.tsx`

**Yapılacaklar:**
- [x] Privacy / Terms → `openBrowserAsync`
- [x] Delete My Account → `ConfirmModal` + `deleteAllLocalData`
- [x] Log Out → guest'te gizli
- [x] `constants/legal.ts` placeholder URL'ler

**Kabul kriterleri:**
- [ ] Delete akışı 2 pet ile manuel test (T9)
- [x] Destructive satırlar kırmızı + modal onayı

---

## Faz 3 — Polish ve iOS detayları

### TODO-P3-1: Haptics ve animasyon

**Öncelik:** P2  
**Durum:** ✅ Tamamlandı

- [x] Liste satırı press → `Light` haptic
- [x] Avatar değişiminde ek animasyon yok

---

### TODO-P3-2: Erişilebilirlik denetimi

**Öncelik:** P2  
**Durum:** ✅ Tamamlandı (v1)

- [x] Satırlar `accessibilityLabel` ile
- [x] Settings butonu: "Open Settings"
- [ ] Tam VoiceOver / Dynamic Type manuel doğrulama (T11, T12)

---

### TODO-P3-3: App version footer

**Öncelik:** P3  
**Durum:** ✅ Tamamlandı

- [x] `expo-constants` → version label
- [x] Caption stil, `textSecondary`, centered

---

## Faz 4 — Gelecek (bu task kapsamı dışı, bağlantı noktaları)

| Konu | Not |
|------|-----|
| Apple / Google / Email auth | `User.email` gerçek değer; Log Out anlamlı hale gelir |
| Backend account deletion | Delete My Account API çağrısı + yerel temizlik |
| StoreKit / RevenueCat | Lulu Plus Upgrade / Manage gerçek akış |
| Display name sync | Cloud profile |
| `expo-image-picker` kamera | Avatar için "Take Photo" action sheet (HIG: avatar edit'te yaygın) |

---

## PRD / dokümantasyon

### TODO-P4-1: PRD Screen 17 güncelle

**Durum:** ⬜ Bekliyor

Screen 17'yi yeni hub yapısına göre böl:
- Screen 17a: Profile (hub)
- Screen 17b: Settings (bildirimler — mevcut içerik)

---

## Manuel test matrisi

| # | Senaryo | Beklenen | Durum |
|---|---------|----------|-------|
| T1 | Profile tab aç | User Card + 3 kart görünür; settings içeriği yok | ⬜ |
| T2 | Avatar değiştir | Galeri → kırp → kaydet → persist | ⬜ |
| T3 | İsim ekle / sil | Opsiyonel; boş geçerli | ⬜ |
| T4 | Settings butonu | Settings stack açılır, bildirimler çalışır | ⬜ |
| T5 | Lulu Plus Upgrade | Placeholder modal / sheet | ⬜ |
| T6 | Share Lulu | Native share sheet | ⬜ |
| T7 | Instagram | Instagram app veya browser açılır | ⬜ |
| T8 | Privacy / Terms | In-app browser | ⬜ |
| T9 | Delete My Account | Modal → tüm veri silinir → onboarding | ⬜ |
| T10 | Guest Log Out | Gizli veya disabled (karar sonrası) | ⬜ |
| T11 | Dark mode | Tüm kartlar ve destructive renkler OK | ⬜ |
| T12 | Dynamic Type | Layout kırılmaz | ⬜ |

---

## Tahmini commit sırası

1. [x] `feat: add user profile storage and store` — `c876166`
2. [x] `feat: add profile hub screen with user card and action cards` — `aecbf69`
3. [x] `refactor: slim settings to notifications and move delete to profile` — `228c976`
4. [x] `chore: add expo-store-review for profile rate action` — `a6cbb35`
5. [ ] `docs: update PRD for profile hub and settings split`

---

## Kararlar — onaylandı

1. **Guest e-posta:** Satır gizlensin (`email === null`)
2. **Log Out guest'te:** Gizle
3. **Instagram:** `https://instagram.com/luluapp` (`constants/social.ts`)
4. **Legal URL'ler:** Placeholder (`https://lulu.app/privacy`, `/terms`); store öncesi canlı olmalı
5. **İsim düzenleme:** Cross-platform modal (`EditNameModal`)
6. **Delete My Account:** Sadece Profile'da; Settings'ten kaldırıldı
