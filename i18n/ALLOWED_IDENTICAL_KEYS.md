# Allowed identical EN/DE translation keys

Some strings are intentionally the same in English and German. The parity checker (`npm run i18n:check`) excludes these from “untranslated DE” warnings.

Configuration lives in `i18n/allowed-identical-keys.ts`.

## Product terminology (L4)

| Key | Value | Reason |
|-----|-------|--------|
| `checkIn.title` | Check-In | Product feature name |

## Brand & product (L5)

| Key | Value | Reason |
|-----|-------|--------|
| `welcome.appName` | Lulu | Brand name |
| `welcome.tagline` | Pet Health Journal | Brand tagline |
| `notifications.reminderTitle` | Pet Health Journal | Notification brand line |
| `profile.luluPlus` | Lulu Plus | Product name |
| `profile.version` | Lulu v{{version}} | Brand in version string |
| `profile.luluPlusActiveStatus` | …Lulu Plus… | Contains product name |
| `profile.manageA11y` / `profile.upgradeA11y` | …Lulu Plus… | Accessibility labels for product |

## Language picker

| Key | Reason |
|-----|--------|
| `settings.languageEnglish` | Shown as “English” in every locale |
| `settings.languageGerman` | Shown as “Deutsch” in every locale |
| `settings.languageSystem` | OS term, kept as “System” |

## Units & symbols

| Key | Value |
|-----|-------|
| `common.ok` | OK |
| `common.optional` | Optional (standard loanword in DE UI) |
| `records.units.kg` | kg |
| `records.units.lb` | lb |

## Placeholder templates

| Key | Reason |
|-----|--------|
| `dashboard.lastCheckInWhenDate` | Locale-neutral `{{date}} {{time}}` template |
| `checkIn.progressCard.percentComplete` | Locale-neutral `{{percent}}%` template |
| `records.summary.weightValue` | Locale-neutral `{{value}} {{unit}}` template |
| `reports.petCard.weightRecorded` | Locale-neutral `{{value}} ({{date}})` template |
| `reports.review.generatedOn` | Locale-neutral `{{timestamp}}` template |

## Identical in German

| Key | Reason |
|-----|--------|
| `records.sections.details` | "Details" is standard German |
| `reminders.sections.details` | "Details" is standard German |
| `records.fields.symptomName` | Medical term, same in DE |
| `records.grid.symptom` | Medical term, same in DE |
| `records.types.symptom` | Medical term, same in DE |
| `setup.petNameBreed.nameLabel` | "Name" is standard German |

## Medical terms

| Key | Reason |
|-----|--------|
| `pet.options.healthCondition.diabetes` | International medical term |
| `pet.options.healthCondition.arthritis` | International medical term |

## Email fields

| Key | Reason |
|-----|--------|
| `auth.emailLabel` | “E-Mail” / “Email” convention |
| `auth.emailPlaceholder` | Same as label |

## Prefix allowlists

These prefixes cover keys where values may stay in English or Latin (breed names, check-in option labels shared across locales):

- `pet.options.breeds.*` — breed names (e.g. Beagle, Maine Coon)
- `checkIn.options.*` — option maps keyed by slug
- `checkIn.status.*` — status maps keyed by slug

## Product term: Check-In

**“Check-In”** is kept as product terminology in German copy where it names the feature (see plan L4). Those strings should still be translated around the term; only standalone product uses may match.

## Adding to the allowlist

1. Add the full key path to `ALLOWED_IDENTICAL_KEYS` or a prefix to `ALLOWED_IDENTICAL_PREFIXES`.
2. Document the reason in this file.
3. Prefer translating over allowlisting when German users would expect localized copy.
