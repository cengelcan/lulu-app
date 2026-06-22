# Pet Health Journal

## Overview

Pet Health Journal is a mobile application designed to help pet owners track their cats' and dogs' health through quick daily check-ins.

Users can manage multiple pets and switch between them at any time. The dashboard, check-ins, and reminder copy always reflect the **currently active pet**.

Unlike traditional pet management apps that require extensive manual logging, Pet Health Journal focuses on capturing meaningful health changes in less than 10 seconds per day.

The primary goal is to help pet owners remember symptoms, medication adherence, behavioral changes, and overall wellbeing before veterinary visits.

---

# Product Vision

Most pet owners struggle to answer questions like:

- When did the vomiting start?
- Has appetite changed recently?
- How long has energy been lower than usual?
- Has medication been given consistently?

Pet Health Journal solves this problem by creating a simple daily health journal that transforms small daily observations into long-term health insights.

---

# Core Philosophy

Users should not open the app to enter data.

The app should come to the user.

Daily check-ins are initiated through notifications and can be completed within a few seconds.

The focus is not collecting as much data as possible.

The focus is detecting meaningful changes.

---

# MVP Scope (V1)

## Included Features

### Onboarding

- Product introduction
- Health tracking value proposition
- Pet creation
- Notification preferences

### Pet Profile

- Pet Type (Cat / Dog)
- Name
- Age Group
- Existing Health Conditions

### My Pets

- List all pets (avatar + name)
- Indicate the active pet ("Current" badge)
- Tap a pet to switch the active pet and open Home
- Add additional pets without repeating onboarding or global notification setup

### Navigation

Bottom tabs:

- **Home** — dashboard for the active pet
- **My Pets** — pet list, selection, and add pet
- **Profile** — app settings (notifications, reminder preferences, delete all data)

Notification and check-in preferences are **global** (shared across all pets). Reminder notification text uses the active pet's name.

### Daily Check-In

Users receive reminders and answer:

#### Appetite

- Good
- Normal
- Reduced
- Not Eating

#### Energy

- High
- Normal
- Low

#### Symptoms

- None
- Vomiting
- Diarrhea
- Other

### Dashboard

Displays data for the **active pet**:

- Last Check-In
- Today's Status
- Quick Health Snapshot
- Upcoming Check-In Reminder

### Notifications

Users choose preferred check-in times:

- Morning
- Afternoon
- Evening
- Multiple Times Daily

---

# User Journey

## Day 1 (First Pet)

1. Install App
2. Complete onboarding
3. Complete initial pet setup (type → name → age → health → check-in prefs → notifications)
4. Complete first check-in
5. View dashboard (Home tab)

## Adding Another Pet

1. Open **My Pets** tab
2. Tap **Add Pet**
3. Complete pet-only setup (type → name → age → health) — skips onboarding and global prefs
4. New pet becomes active; app navigates to Home

## Switching Pets

1. Open **My Pets** tab
2. Tap a pet row
3. Active pet updates; app navigates to Home with that pet's dashboard and check-in history

## Daily Usage

1. Receive reminder
2. Open app
3. Complete check-in
4. Continue day

Total time:

Less than 10 seconds.

---

# Pet Setup Flows

## Initial Setup (First Pet)

Full flow after onboarding:

`pet-type → pet-name → pet-age → health-conditions → check-in-prefs → notification-permission → Home`

Creates the first pet, saves global notification/check-in preferences, and sets the new pet as active.

## Add Mode (Additional Pets)

From **My Pets → Add Pet**:

`pet-type → pet-name → pet-age → health-conditions → Home`

Skips check-in preferences and notification permission. Global prefs stay unchanged. The new pet becomes the active pet.

---

# Future Versions

## V1.5

### Medication Tracker

Track medication schedules and adherence.

### Weight Tracking

Monitor weight trends over time.

### Vet Report Generator

Generate veterinary-ready health summaries.

---

## V2

### Medical Records Vault

Store:

- Vaccination records
- Blood tests
- Prescriptions
- Veterinary documents

### Shared Care

Allow family members or pet sitters to participate.

### Health Timeline

Visual history of significant health events.

---

## V3

### Adaptive Check-Ins

Questions adapt based on pet conditions.

### AI Health Insights

Identify patterns and health trends.

### Health Score

Overall wellbeing indicator based on collected data.

---

# Design System

The design system follows `design.md` — a clean, Cal.com-inspired monochrome
system. Tokens live in `constants/theme.ts` and flow through `useThemeColor`,
`ThemedText`, and the shared UI components, so the whole app is driven from a
single source of truth.

## Design Direction

Modern, confident, monochrome SaaS — applied to a pet health journal.

The app should feel:

- Professional
- Trustworthy
- Calm
- Precise

Brand voltage comes from typography (weight 600 display with negative
letter-spacing) and generous whitespace — not from accent colors. The action
layer is monochrome: primary CTAs are near-black on light, near-white on dark.

Avoid:

- Cartoon aesthetics
- Bright playful colors
- Accent colors on primary CTAs
- Gamification-heavy interfaces

---

# Visual Style

White canvas with black primary CTAs, light-gray cards, and a strictly
hierarchical type scale. The Dark Mode theme is derived from `design.md`'s dark
surfaces (`#101010` / `#1a1a1a`).

---

# Color Palette

Monochrome at the action layer; semantic colors only for status. Defined in
`constants/theme.ts` (`Palette`, `Colors.light`, `Colors.dark`).

## Light

| Role | HEX |
|---|---|
| Ink / primary text & CTA | `#111111` |
| Body / secondary text | `#6b7280` |
| Canvas / background | `#ffffff` |
| Card surface | `#f5f5f5` |
| Elevated surface (inputs, modals) | `#ffffff` |
| Hairline / border | `#e5e7eb` |
| On-primary text | `#ffffff` |

## Dark

| Role | HEX |
|---|---|
| Background | `#101010` |
| Card surface | `#1a1a1a` |
| Primary / CTA (inverted) | `#ffffff` |
| On-primary text | `#111111` |
| Secondary text | `#a1a1aa` |
| Border | `#2a2a2a` |

## Semantic (both themes)

| Role | HEX |
|---|---|
| Success | `#10b981` |
| Warning | `#f59e0b` |
| Alert / error | `#ef4444` |
| Accent (links, rare) | `#3b82f6` |

---

# Typography

Native system font (SF Pro on iOS). The Cal Sans display voice from `design.md`
is approximated with **weight 600 + negative letter-spacing**; body/UI text
stays neutral. No custom fonts are bundled for V1.

| Token | Size / Line | Weight | Tracking |
|---|---|---|---|
| `displayLg` | 40 / 44 | 600 | -1.2 |
| `displayMd` | 32 / 38 | 600 | -0.8 |
| `title` | 28 / 34 | 600 | -0.5 |
| `subtitle` | 22 / 28 | 600 | -0.3 |
| `titleSmall` | 16 / 22 | 600 | 0 |
| `body` | 16 / 24 | 400 | 0 |
| `bodySemiBold` | 16 / 24 | 600 | 0 |
| `caption` | 13 / 18 | 500 | 0 |
| `button` | 16 / 20 | 600 | 0 |

## Spacing & Radius

- Spacing (4px base): `xxs 4 · xs 8 · sm 12 · md 16 · lg 24 · xl 32 · xxl 48 · section 96`.
- Radius: `xs 4 · sm 6 · md 8` (buttons, inputs) · `lg 12` (cards) · `xl 16` (large cards) · `pill / full 9999`.

---

# Iconography

Use:

SF Symbols

Examples:

- heart.text.square
- pawprint
- calendar
- bell
- chart.line.uptrend.xyaxis

Avoid custom icon packs during MVP.

---

# Layout Principles

### Spacious

Generous whitespace.

### Card-Based

Health information should be displayed inside clean cards.

### Minimal Inputs

Prefer taps over typing.

### One-Hand Usage

Primary actions must be reachable with one thumb.

---

# Dashboard Structure

Bottom tabs: **Home** | **My Pets** | **Profile**

## Home (Active Pet)

Header

Pet Name

Last Check-In

---

Health Snapshot

- Appetite
- Energy
- Symptoms

---

Quick Actions

- New Check-In
- Medication
- Reports
- Records

---

Upcoming Reminder

Next scheduled check-in.

---

# Inspiration References

Cal.com (primary design language — see `design.md`)

Linear

Apple Human Interface Guidelines

The visual language follows the Cal.com-inspired monochrome system in
`design.md`, while interaction patterns and platform conventions follow Apple's
Human Interface Guidelines for the iOS-first release.

---

# Product Tagline

Remember every symptom.

Explain every vet visit.

---

# Success Metric

A successful user should be able to:

Complete a daily health check-in in under 10 seconds.

And generate a meaningful health history before visiting a veterinarian.
