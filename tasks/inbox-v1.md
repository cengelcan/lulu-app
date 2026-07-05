# Inbox v1 — Bildirim Merkezi (zil butonu)

**Oluşturulma:** 2026-07-04  
**Kapsam:** Aile paylaşımı **olmadan** v1 inbox. Mimari, ileride aile aktivitesi eklenecek şekilde tasarlanır.  
**İlgili:** Paket K (bildirim ekranları), `components/dashboard/NotificationBellButton.tsx`

---

## Amaç

Home sağ üstteki zil butonunu gerçek bir **inbox** haline getirmek:

- Kullanıcının **yapması gereken** şeyleri göstermek (check-in, gecikmiş hatırlatıcı, izin)
- **Yaklaşan** hatırlatıcıları özetlemek
- **Tüm aktif pet'ler** için çalışmak (Home yalnızca aktif pet'i gösterir)
- Aile paylaşımı gelince **aynı inbox'a** “Family activity” bölümü eklenebilmek

---

## v1 kapsamı

### Dahil ✅

| # | Öğe | Kaynak |
|---|-----|--------|
| 1 | Bugün check-in yapılmadı (pet başına) | `getAllCheckIns()` + aktif pet'ler |
| 2 | Dünkü check-in kaçırıldı (pet başına) | Aynı |
| 3 | Gecikmiş hatırlatıcılar (tüm pet'ler) | `getAllPetReminders()` + `buildOverdueReminders()` |
| 4 | Bugün / yarın yaklaşan hatırlatıcılar | `buildUpcomingReminders({ withinDays: 1 })` |
| 5 | Bildirim izni kapalı | `notification.store` → `permission === 'denied'` |
| 6 | Okunmamış badge (aksiyon gerektiren sayı) | urgent + normal `action_required` |
| 7 | Tap → deep link (check-in, reminder form, settings) | Mevcut route'lar |
| 8 | Boş durum: “All caught up” | i18n en/de |
| 9 | Dismiss (swipe veya “Gördüm”) — opsiyonel v1 | Local storage |

### Hariç ❌ (aile paylaşımı / sonraki faz)

- Başka kullanıcının yaptığı eylemler (check-in, record, reminder)
- Davet / caregiver bildirimleri
- Push geçmişi / Realtime
- Setup guide görevleri, trend uyarıları, sync hataları
- Kalıcı sunucu tarafı inbox

---

## Mimari — aile paylaşımına hazır

### Tasarım ilkesi: Provider pattern

Inbox öğeleri **tek bir orchestrator** tarafından üretilir; her kaynak ayrı **provider** dosyasıdır. v1'de yalnızca `personal` provider aktif; aile paylaşımı gelince `family` provider eklenir, UI değişmez.

```
types/inbox.ts
utils/inbox/
  build-inbox-items.ts          ← orchestrator: provider'ları çağırır, sıralar, dedupe
  sort-inbox-items.ts
  providers/
    personal-action-provider.ts ← v1: check-in, reminder, permission
    family-activity-provider.ts ← v2 stub: şimdilik [] döner
hooks/use-inbox.ts              ← store'lardan veri toplar, buildInboxItems çağırır
storage/inbox-dismissed.storage.ts
components/inbox/
  InboxSheet.tsx
  InboxSection.tsx
  InboxItemRow.tsx
```

### Tip modeli (`types/inbox.ts`)

```typescript
/** v1: yalnızca 'personal'. Aile paylaşımında 'family' eklenir. */
export type InboxItemSource = 'personal' | 'family';

/** UI bölüm gruplaması */
export type InboxItemCategory =
  | 'action_required'  // kullanıcı bir şey yapmalı
  | 'upcoming'         // bilgi / yaklaşan
  | 'activity';        // v2: aile aktivite akışı

/** Genişletilebilir kind — v2 kind'ları şimdiden tanımlı, provider boş döner */
export type InboxItemKind =
  // v1 — personal
  | 'missed_check_in_today'
  | 'missed_check_in_yesterday'
  | 'overdue_reminder'
  | 'upcoming_reminder'
  | 'notification_permission_denied'
  // v2 — family (stub)
  | 'family_check_in_created'
  | 'family_check_in_updated'
  | 'family_record_created'
  | 'family_reminder_completed'
  | 'family_invite_sent'
  | 'family_invite_accepted'
  | 'family_member_left';

export type InboxItem = {
  /** Stabil dedup anahtarı, örn. `missed_check_in_today:{petId}` */
  id: string;
  source: InboxItemSource;
  category: InboxItemCategory;
  kind: InboxItemKind;
  priority: 'urgent' | 'normal' | 'low';
  petId: string | null;       // permission gibi pet'siz öğeler için null
  petName: string | null;
  titleKey: string;
  titleParams?: Record<string, string>;
  subtitleKey?: string;
  subtitleParams?: Record<string, string>;
  route: Href;
  sortAt: string;             // ISO — sıralama
  createdAt: string;        // v2 activity events ile uyumlu
  // v2 — aile aktivitesi (v1'de undefined)
  actorUserId?: string;
  actorDisplayName?: string;
};

export type InboxSection = {
  category: InboxItemCategory;
  titleKey: string;
  items: InboxItem[];
};

export type InboxProviderInput = {
  pets: Pet[];                          // yalnızca status === 'active'
  checkIns: CheckIn[];
  reminders: PetReminder[];
  permission: NotificationPermissionStatus | null;
  dismissedIds: Set<string>;
  referenceDate: Date;
  locale: string;
  t: TranslateFn;
};

export type InboxProvider = (input: InboxProviderInput) => InboxItem[];
```

### Orchestrator sözleşmesi

```typescript
// utils/inbox/build-inbox-items.ts
const PROVIDERS: InboxProvider[] = [
  buildPersonalActionItems,   // v1
  buildFamilyActivityItems,   // v2 stub → return []
];

export function buildInboxItems(input: InboxProviderInput): InboxSection[] {
  const items = PROVIDERS
    .flatMap((provider) => provider(input))
    .filter((item) => !input.dismissedIds.has(item.id));

  return groupIntoSections(sortInboxItems(items));
}
```

### v2 geçiş notu (aile paylaşımı)

Aile paylaşımı gelince:

1. `activity_events` Supabase tablosu + sync
2. `buildFamilyActivityItems` provider'ı doldurulur (`source: 'family'`, `category: 'activity'`)
3. `InboxSheet` zaten `category === 'activity'` için ayrı bölüm render eder
4. Kişisel aksiyonlar (`personal`) aynı kalır — **mevcut v1 kodu değişmez**

---

## Görev listesi

### Faz 1 — Tipler & altyapı

- [ ] **1.1** `types/inbox.ts` — yukarıdaki tip modeli (v2 kind'ları dahil, stub için)
- [ ] **1.2** `utils/inbox/sort-inbox-items.ts` — öncelik: `urgent` → `normal` → `low`, sonra `sortAt` desc
- [ ] **1.3** `utils/inbox/group-inbox-sections.ts` — `action_required` · `upcoming` · (`activity` v2)
- [ ] **1.4** `utils/inbox/build-inbox-items.ts` — orchestrator + provider registry
- [ ] **1.5** `utils/inbox/providers/family-activity-provider.ts` — **stub**: `return []` + JSDoc v2 planı
- [ ] **1.6** `storage/inbox-dismissed.storage.ts` — dismissed id listesi (AsyncStorage / mevcut storage pattern)
- [ ] **1.7** `utils/inbox/build-inbox-items.test.ts` — en az: sıralama, dedupe, dismiss filtresi, boş input

### Faz 2 — Personal action provider (v1 çekirdek)

- [ ] **2.1** `utils/inbox/providers/personal-action-provider.ts`
  - [ ] Aktif pet'leri filtrele (`status !== 'deceased'`)
  - [ ] **Missed check-in today** — bugün kayıt yok → `missed_check_in_today:{petId}`
  - [ ] **Missed check-in yesterday** — dün kayıt yok → `missed_check_in_yesterday:{petId}` (bugün varsa gösterme)
  - [ ] **Overdue reminders** — `listOverduePendingReminders` + pet adı + `getReminderFormRoute`
  - [ ] **Upcoming today/tomorrow** — `buildUpcomingReminders({ withinDays: 1 })`
  - [ ] **Permission denied** — `permission === 'denied'` → route: Settings (veya `Linking.openSettings`)
- [ ] **2.2** `utils/inbox/providers/personal-action-provider.test.ts`
  - [ ] Tek pet / çoklu pet
  - [ ] Vefat pet hariç tutulur
  - [ ] Aynı pet için today + yesterday çakışma kuralı

**Veri kaynakları (mevcut):**

| Veri | Storage fonksiyonu |
|------|-------------------|
| Tüm pet'ler | `petStorage.getPets()` |
| Tüm check-in'ler | `checkInStorage.getAllCheckIns()` |
| Tüm hatırlatıcılar | `petReminderStorage.getAllPetReminders()` |
| Bildirim izni | `useNotificationStore.permission` |

**Öncelik / kategori eşlemesi:**

| Kind | category | priority |
|------|----------|----------|
| `missed_check_in_today` | action_required | urgent |
| `missed_check_in_yesterday` | action_required | normal |
| `overdue_reminder` | action_required | urgent |
| `notification_permission_denied` | action_required | normal |
| `upcoming_reminder` | upcoming | low |

**Route eşlemesi:**

| Kind | route |
|------|-------|
| missed check-in | `/(tabs)/check-in` veya mevcut check-in flow |
| overdue / upcoming reminder | `getReminderFormRoute(type, id)` |
| permission denied | Settings ekranı (`/(tabs)/profile` → settings) veya `openSettings` |

### Faz 3 — Hook & veri yükleme

- [ ] **3.1** `hooks/use-inbox.ts`
  - [ ] `loadPets`, `getAllCheckIns`, `getAllPetReminders`, `loadNotificationSettings` paralel
  - [ ] `buildInboxItems` çağrısı
  - [ ] `dismissedIds` yükleme
  - [ ] `actionRequiredCount` — badge için
  - [ ] Home focus'ta yenile (`useFocusEffect` veya inbox açılınca)
- [ ] **3.2** Performans: inbox sheet **açıldığında** yükle (her render'da değil)
- [ ] **3.3** Loading / error state (kısa spinner, retry)

### Faz 4 — UI bileşenleri

- [ ] **4.1** `components/inbox/InboxItemRow.tsx`
  - [ ] İkon (kind'a göre), başlık, alt metin, pet adı chip (çoklu pet)
  - [ ] `accessibilityRole="button"`, `accessibilityLabel`
  - [ ] Tap → `router.push(item.route)` + sheet kapat
- [ ] **4.2** `components/inbox/InboxSection.tsx` — bölüm başlığı + item listesi
- [ ] **4.3** `components/inbox/InboxSheet.tsx`
  - [ ] `NotificationBellButton` içindeki Modal içeriğini buraya taşı
  - [ ] Bölümler: “Action needed” · “Upcoming” · (v2: “Family activity” — boşken gizle)
  - [ ] Boş durum: `inbox.allCaughtUp` (mevcut `notificationsEmpty` yerine)
  - [ ] Pull-to-refresh veya açılışta refresh
- [ ] **4.4** `components/dashboard/NotificationBellButton.tsx` güncelle
  - [ ] `useInbox` bağla
  - [ ] `hasUnread={actionRequiredCount > 0}` geç
  - [ ] Modal → `InboxSheet`
- [ ] **4.5** (Opsiyonel v1) Dismiss: satır swipe veya uzun bas → `dismissInboxItem(id)`

### Faz 5 — i18n (en/de)

- [ ] **5.1** `i18n/types.ts` + `en.ts` + `de.ts` — `inbox.*` namespace:

```typescript
inbox: {
  title: string;                    // "Notifications" (veya mevcut dashboard.notificationsTitle kullan)
  allCaughtUp: string;              // "You're all caught up."
  sections: {
    actionRequired: string;
    upcoming: string;
    familyActivity: string;         // v2 — şimdiden ekle, UI'da kullanılmaz
  };
  missedCheckInToday: string;       // "{name} hasn't checked in today."
  missedCheckInYesterday: string;   // "{name} missed yesterday's check-in."
  overdueReminder: string;          // "{title} — overdue"
  upcomingReminder: string;         // "{title} — {dateLabel}"
  permissionDenied: string;         // "Notifications are turned off."
  permissionDeniedSubtitle: string; // "Open Settings to enable reminders."
  a11y: {
    open: string;
    dismiss: string;
    unreadCount: string;            // "{count} items need attention"
  };
}
```

- [ ] **5.2** Mevcut `dashboard.missedCheckIn*` key'leri inbox'a taşınabilir veya inbox'tan referans verilir (tek kaynak)

### Faz 6 — QA & dokümantasyon

- [ ] **6.1** Manuel test matrisi (aşağıda)
- [ ] **6.2** `yapilacaklar.md` — Paket K altına inbox v1 tamamlandı notu
- [ ] **6.3** `is-plani.md` — inbox v1 fazı referansı

---

## Manuel test matrisi

| # | Senaryo | Beklenen |
|---|---------|----------|
| T1 | Tek pet, bugün check-in yok | Action required'da görünür, badge aktif |
| T2 | Check-in yapıldıktan sonra | Öğe kaybolur |
| T3 | Dün check-in yok, bugün var | Yalnızca today (yesterday gösterilmez) |
| T4 | İkisi de yok | Today + yesterday (veya yalnızca today — karar: **yalnızca en acil**) |
| T5 | Gecikmiş hatırlatıcı | Urgent, tap → reminder form |
| T6 | Yarın hatırlatıcı | Upcoming bölümünde |
| T7 | 2 aktif pet, ikisinde de check-in yok | İki ayrı satır, pet adı görünür |
| T8 | Vefat pet | Inbox'ta görünmez |
| T9 | Bildirim izni denied | Action required + Settings yönlendirme |
| T10 | Hiç aksiyon yok | “All caught up” |
| T11 | EN ↔ DE | Tüm metinler çevrilmiş |
| T12 | Dynamic Type / VoiceOver | Satırlar okunabilir |

**T4 kararı (netleştir):** Aynı pet için hem today hem yesterday varsa **yalnızca today** göster — inbox şişmesin.

---

## Dosya özeti

| Dosya | Aksiyon |
|-------|---------|
| `types/inbox.ts` | Yeni |
| `utils/inbox/build-inbox-items.ts` | Yeni |
| `utils/inbox/sort-inbox-items.ts` | Yeni |
| `utils/inbox/group-inbox-sections.ts` | Yeni |
| `utils/inbox/providers/personal-action-provider.ts` | Yeni |
| `utils/inbox/providers/family-activity-provider.ts` | Yeni (stub) |
| `utils/inbox/*.test.ts` | Yeni |
| `storage/inbox-dismissed.storage.ts` | Yeni |
| `hooks/use-inbox.ts` | Yeni |
| `components/inbox/InboxSheet.tsx` | Yeni |
| `components/inbox/InboxSection.tsx` | Yeni |
| `components/inbox/InboxItemRow.tsx` | Yeni |
| `components/dashboard/NotificationBellButton.tsx` | Güncelle |
| `i18n/en.ts`, `i18n/de.ts`, `i18n/types.ts` | Güncelle |

---

## Tahmini efor

| Faz | Süre |
|-----|------|
| Faz 1 — Tipler & altyapı | ~2–3 saat |
| Faz 2 — Personal provider + test | ~3–4 saat |
| Faz 3 — Hook | ~1–2 saat |
| Faz 4 — UI | ~3–4 saat |
| Faz 5 — i18n | ~1 saat |
| Faz 6 — QA | ~1–2 saat |
| **Toplam** | **~1–1.5 gün** |

---

## v2 checklist (aile paylaşımı — inbox entegrasyonu)

Aile paylaşımı sprint'inde inbox'a eklemek için planlanmıştı; **kod tarafı tamamlandı**:

- [x] `supabase/migrations/0009_family_sharing.sql` (`activity_events`)
- [x] `types/sharing.ts` + `family_groups` / `pet_memberships`
- [x] `buildFamilyActivityItems` provider implementasyonu
- [x] Inbox — `familyActivity` bölümü (`group-inbox-sections.ts`)
- [x] “Başkasının eylemi” filtresi: `actorUserId !== currentUserId`
- [ ] (Opsiyonel) Push: “Anna checked in for Luna”

Detay: `yapilacaklar.md` → §4 Faz F.
