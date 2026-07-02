# Lulu i18n Cleanup Plan

**Created:** 2026-07-02  
**Goal:** Make EN/DE localization complete, consistent, and reliable before release.  
**Scope:** English + German only (v1). Fallback language: English.

This plan is derived from the i18n audit (2026-07-02). Work in the order below — each phase is independently shippable.

---

## Locked decisions

| # | Topic | Decision |
|---|-------|----------|
| L1 | Supported languages (v1) | **EN + DE** only |
| L2 | Fallback | **English** for unknown device locales and missing keys |
| L3 | User preference | **System / English / Deutsch** in Settings |
| L4 | Product term | **"Check-In"** stays as-is in all languages (K1) |
| L5 | Brand strings | `Lulu`, `Pet Health Journal`, `lulu.com` may remain untranslated |
| L6 | Architecture (v1) | Keep custom `translate()` + typed catalogs — no i18next migration pre-release |

---

## Current state (baseline)

| Metric | Value |
|--------|-------|
| Translation keys (EN / DE) | ~651 each — structurally aligned via `i18n/types.ts` |
| DE keys still identical to EN | ~136 (~21%) — content debt, not missing keys |
| Architecture | `i18n/en.ts`, `i18n/de.ts`, `useTranslation()`, Zustand `language.store` |
| Persistence | AsyncStorage `@pet_health_journal/app_language` |
| Notification reschedule on language change | ✅ Already implemented in `language.store.saveLanguage()` |
| PDF body labels | ✅ Passed from UI via `t()` |
| PDF shell / share / picker chrome | ❌ Partially hardcoded English |

---

## Priority overview

| Phase | Focus | Risk if skipped | Status |
|-------|-------|-----------------|--------|
| 0 | Tooling & CI guardrails | Key drift when adding languages | ✅ |
| 1 | Complete German catalog | German users see English across core flows | ✅ |
| 2 | iOS picker & modal chrome | Frequent untranslated UI in setup/edit/check-in | ✅ |
| 3 | Store & bootstrap errors | Error paths always English | ✅ |
| 4 | PDF shell & export UX | Vet-facing exports partially English | ✅ |
| 5 | Notifications & sharing gaps | Android channels, share message | ⬜ |
| 6 | Accessibility labels | VoiceOver gaps | ⬜ |
| 7 | QA & release sign-off | Regressions slip through | ⬜ |

---

## Phase 0 — Tooling & guardrails

**Risk:** Medium (prevents future drift)  
**Effort:** Small

### Tasks

- [x] Add `i18n/scripts/check-parity.ts` (or similar) that:
  - [x] Lists keys present in EN but missing in DE (and vice versa)
  - [x] Lists DE values identical to EN (exclude allowed brand keys from `L5`)
  - [x] Exits non-zero on structural key mismatch
- [x] Add npm script, e.g. `npm run i18n:check`
- [x] Run in CI on every PR touching `i18n/`
- [x] Document allowed identical keys (brand names, breed names, units like `kg`/`lb`, `Check-In`)

### Acceptance criteria

- CI fails if EN/DE key sets diverge
- CI warns (or fails) on new untranslated DE strings outside the allowlist

---

## Phase 1 — Complete German catalog (~136 keys)

**Risk:** High  
**Effort:** Medium (mostly copywriting)

Translate all DE values that are still English. Prioritize user-visible flows first.

### 1a — High-traffic screens (do first)

| Namespace | Keys still EN (approx.) | Files |
|-----------|-------------------------|-------|
| `dashboard.*` | 16 | `i18n/de.ts` |
| `pet.*` | 59 | `i18n/de.ts` |
| `checkInSuccess.*` | 3 | `i18n/de.ts` |
| `welcome.*` | 3 (`tagline`, `footerLine1`, etc.) | `i18n/de.ts` |
| `onboarding.intro2–4.description` | 3 | `i18n/de.ts` |
| `profile.*` | 19 | `i18n/de.ts` |

- [x] `dashboard.*` — empty states, check-in CTAs, notification hints, trends labels
- [x] `pet.*` — field labels, placeholders, validation messages, discard/delete copy, sections
- [x] `checkInSuccess.*` — title, message, first-check-in message
- [x] `welcome.*` — `tagline`, `footerLine1` (keep `appName: Lulu`)
- [x] `onboarding.intro2.description`, `intro3.description`, `intro4.description`
- [x] `profile.*` — photo access, edit name, share/rate strings, Lulu Plus description

### 1b — Remaining identical keys

- [x] `checkIn.*` — remaining 8 keys (e.g. `checkIn.title`, progress card)
- [x] `common.*` — `ok`, `optional` if they should differ in DE
- [x] `records.*` / `reminders.*` — remaining identical keys (mostly units/labels like `Symptom`, `kg`)
- [x] `settings.*` — `languageSystem`, `languageGerman` (evaluate: keep `System` / `Deutsch` or localize further)
- [x] `setup.*` — remaining 5 keys (e.g. `setup.petAge.description`)
- [x] `notifications.reminderTitle` — decide: keep `Pet Health Journal` (brand) or localize tagline

### Copy notes

- Keep **"Check-In"** as product terminology (L1).
- Breed names and medical terms (e.g. `Diabetes`, `Beagle`) may stay in English/latin — document in allowlist.
- Review informal **du** tone consistency across DE strings (match existing `auth.*` / `setup.*` style).

### Acceptance criteria

- `i18n:check` reports zero unexpected identical DE strings
- Manual spot-check: Home, Pet Profile, Check-in Success, Welcome, Onboarding in DE

---

## Phase 2 — iOS picker & modal chrome

**Risk:** Medium  
**Effort:** Small

### New keys (suggested)

```
common.selectDate
common.selectTime
common.done
common.clear        # already have common.cancel — use consistently
common.dismissDialog
```

### Tasks

- [x] Add keys to `i18n/en.ts`, `i18n/de.ts`, `i18n/types.ts`
- [x] `components/ui/IosPickerSheet.tsx` — replace hardcoded `"Done"` with prop or `t('common.done')`
- [x] `components/ui/DatePickerField.tsx` — `title`, `leftAction.label`, default `placeholder`
- [x] `components/ui/TimePickerField.tsx` — `title`
- [x] `components/check-in/CheckInHeader.tsx` — `title`, `leftAction.label` (`Cancel` → `common.cancel`)
- [x] `components/ui/ConfirmModal.tsx` — default `cancelLabel` → require prop or use `t('common.cancel')`; `accessibilityLabel`
- [x] `components/profile/EditNameModal.tsx` — `accessibilityLabel="Dismiss dialog"`

### Acceptance criteria

- All iOS date/time picker sheets show localized title and actions in DE
- Confirm modals never fall back to English cancel when caller omits `cancelLabel`

---

## Phase 3 — Store & bootstrap errors

**Risk:** High  
**Effort:** Medium

Store layers currently set English fallback strings (e.g. `'Failed to load pets'`) that are displayed raw in UI.

### Approach

1. Stores emit **error keys** (e.g. `errors.loadPets`) instead of English sentences.
2. Extend `utils/translate-error.ts` (or add `utils/translate-store-error.ts`) to map keys → `t()`.
3. UI always translates before display.

### New key namespace (suggested)

```
errors.loadPets
errors.loadPet
errors.switchPet
errors.createPet
errors.updatePet
errors.deletePet
errors.loadCheckIns
errors.createCheckIn
errors.loadRecords
errors.loadReminders
errors.loadProfile
errors.saveName
errors.savePhoto
errors.loadNotificationSettings
errors.saveReminderTime
errors.saveNotificationPermission
errors.loadOnboardingStatus
errors.onboardingUnavailable
errors.shareUnavailable
```

### Files to update

**Stores (emit keys, not English):**

- [x] `stores/pet.store.ts`
- [x] `stores/check-in.store.ts`
- [x] `stores/pet-record.store.ts`
- [x] `stores/pet-reminder.store.ts`
- [x] `stores/user.store.ts`
- [x] `stores/notification.store.ts`
- [x] `stores/onboarding.store.ts`

**UI (translate before render):**

- [x] `components/dashboard/DashboardScreen.tsx`
- [x] `components/pets/MyPetsScreenContent.tsx`
- [x] `app/check-in/index.tsx`
- [x] `app/edit-pet.tsx`
- [x] `app/(setup)/pet-photo.tsx`
- [x] `app/(setup)/notification-permission.tsx`
- [x] `components/settings/NotificationSection.tsx`
- [x] `components/onboarding/onboarding-screen.tsx`
- [x] `app/index.tsx` — splash error + `Try Again` → `t('common.tryAgain')`
- [x] `hooks/use-bootstrap.ts` — `onboardingUnavailable` key

### Acceptance criteria

- Simulate load failure (airplane mode) on Home / My Pets / Check-in — error text appears in DE when language is DE
- Splash error screen fully localized

---

## Phase 4 — PDF shell & export UX

**Risk:** Medium  
**Effort:** Small–medium

PDF **content** is already localized via `documentLabels` from `t()`. Shell/metadata is not.

### Tasks

- [x] `services/reports/generate-report-html.ts`
  - [x] Pass `language` / `lang` attribute (`en` | `de`) instead of hardcoded `lang="en"`
  - [x] Localize `<title>` suffix (currently `— Report`)
- [x] `services/reports/export-report-pdf.ts`
  - [x] Localize `dialogTitle` (`Share report`)
  - [x] Localize `DEFAULT_REPORT_FILE_NAME` fallback
  - [x] Localize `'Sharing is not available on this device'` — throw keyed error, translate in UI
- [x] `services/reports/html/components/report-header.ts`
  - [x] App Store badge text (`Download on the`, `App Store`) — pass as labels or skip badge in DE for v1
  - [x] `alt="QR code"` — keyed a11y string (low priority for PDF)
- [x] `components/reports/ReportsWizardContent.tsx` — pass language into `generateReportHtml` and `exportReportPdf`

### New keys (suggested)

```
reports.pdfTitleSuffix
reports.shareDialogTitle
reports.shareUnavailable
reports.defaultFileName
reports.qrCodeAlt
reports.appStoreBadgeLine1
reports.appStoreBadgeLine2
```

### Acceptance criteria

- Export PDF in DE → HTML `lang="de"`, localized share sheet title
- Section labels and dates still correct (regression check)

---

## Phase 5 — Notifications & sharing

**Risk:** Low–medium  
**Effort:** Small

### Tasks

- [ ] `services/notifications/permissions.ts` — localize Android channel names
  - [ ] `notifications.channelCheckIn`
  - [ ] `notifications.channelPetReminders`
  - [ ] Re-call `ensureAndroidNotificationChannels()` on language change (Android only)
- [ ] `constants/social.ts` — move `SHARE_MESSAGE` to `profile.shareMessage` in catalogs
- [ ] `components/profile/CommunityCard.tsx` — use `t('profile.shareMessage')`
- [ ] `components/setup/NotificationPermissionPrompt.tsx` — replace `'your pet'` with `t('setup.notifications.previewNameFallback')` or `setup.petAgeHealth.ageHintFallbackName`

### Acceptance criteria

- Share from Profile uses localized message in DE
- Notification preview in setup shows localized fallback pet name

---

## Phase 6 — Accessibility labels (lower priority)

**Risk:** Low  
**Effort:** Small

### Tasks

- [ ] Add `*A11y` keys for:
  - [ ] `components/pet/PetAvatar.tsx`
  - [ ] `components/profile/UserAvatar.tsx`
  - [ ] `components/setup/BreedSearchField.tsx`
  - [ ] `components/setup/HealthConditionsSearchField.tsx`
  - [ ] `components/profile/UserCard.tsx`
  - [ ] `components/welcome/welcome-screen.tsx` / `app/index.tsx` — logo label (`welcome.appName` or `common.appNameA11y`)

### Acceptance criteria

- VoiceOver reads German labels when app language is DE

---

## Phase 7 — QA & release sign-off

### Manual iOS test checklist

#### Language detection & persistence

- [ ] Fresh install, device DE → app shows German
- [ ] Fresh install, device EN → app shows English
- [ ] Device locale FR (or other) → English fallback
- [ ] Settings → Deutsch → UI updates immediately
- [ ] Settings → English → UI updates immediately
- [ ] Settings → System → matches device locale
- [ ] Manual Deutsch → force-quit → relaunch → still Deutsch
- [ ] System preference → change iOS language → relaunch → reflects device

#### Core flows (run in both EN and DE)

- [ ] Welcome + onboarding intro 1–4
- [ ] Auth sign-in / sign-up / validation errors
- [ ] Reset password + invalid link
- [ ] Pet setup wizard (all steps)
- [ ] Daily check-in + success screen
- [ ] Home dashboard (empty + populated states)
- [ ] Pet profile / edit pet (validation, discard, delete, mark deceased)
- [ ] Records create/edit
- [ ] Reminders create/edit (skip, delete alerts)
- [ ] Reports wizard → preview → PDF export
- [ ] Profile (name, photo, legal, delete account)
- [ ] Settings (notifications, language picker)

#### Pickers & modals

- [ ] iOS date picker — title, Done, Clear/Cancel
- [ ] iOS time picker — title, Done
- [ ] Delete pet / delete account confirm modals

#### Notifications

- [ ] Check-in reminder body in DE when language is DE
- [ ] Change language → reminders rescheduled with new language
- [ ] Pet reminder title/body match app language

#### PDF

- [ ] Export in DE — labels and dates localized
- [ ] Switch to EN, re-export — labels update
- [ ] Share sheet title localized

#### Error paths

- [ ] Airplane mode during pet load — localized error on Home / My Pets
- [ ] Splash error + Try Again button

---

## File reference

| Area | Primary files |
|------|---------------|
| Catalogs | `i18n/en.ts`, `i18n/de.ts`, `i18n/types.ts` |
| Engine | `i18n/index.ts` |
| Hook | `hooks/use-translation.ts` |
| Language state | `stores/language.store.ts` |
| Persistence | `storage/prefs.storage.ts` |
| Device detection | `utils/device-language.ts` |
| Date locale | `utils/locale.ts` |
| Validation errors | `utils/translate-error.ts` |
| Notifications | `services/notifications/content.ts`, `schedule.ts`, `pet-reminder-schedule.ts` |
| PDF | `components/reports/ReportsWizardContent.tsx`, `services/reports/generate-report-html.ts`, `export-report-pdf.ts` |
| Settings UI | `components/settings/LanguageSection.tsx` |

---

## Out of scope (post-release)

- Third language (e.g. French, Turkish)
- i18next / ICU pluralization migration
- Runtime device-locale listener when preference is `system`
- Remote / OTA translations
- Localizing legal document **content** (URLs stay `lulu.pet`; in-app link labels already keyed)

---

## Progress log

| Date | Phase | Notes |
|------|-------|-------|
| 2026-07-02 | — | Plan created from i18n audit |
| 2026-07-02 | 0 | Parity checker, allowlist, `i18n:check` scripts, CI workflow |
| 2026-07-02 | 1a | German translations for dashboard, pet, checkInSuccess, welcome, onboarding, profile |
| 2026-07-02 | 1b | Remaining DE catalog gaps; allowlist for product terms, templates, loanwords |
| 2026-07-02 | 2 | iOS picker/modal chrome localized via common.* keys |
| 2026-07-02 | 3 | Store error keys + translateError; splash and error screens localized |
| 2026-07-02 | 4 | PDF HTML lang/title, share sheet, App Store badge, QR alt localized |
