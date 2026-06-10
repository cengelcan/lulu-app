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

## Design Direction

Apple Health for Cats & Dogs

The app should feel:

- Professional
- Trustworthy
- Calm
- Premium

Avoid:

- Cartoon aesthetics
- Bright playful colors
- Gamification-heavy interfaces

---

# Visual Style

## Design Category

Warm Medical

A balance between:

- Healthcare
- Pet Care
- Emotional Connection

---

# Color Palette

## Primary

Sage Green

HEX: #6B8F71

Used for:

- Buttons
- Highlights
- Positive indicators

---

## Secondary

Soft Sage

HEX: #8FAE96

Used for:

- Supporting UI elements
- Charts
- Secondary actions

---

## Background

Warm Cream

HEX: #FAF8F4

Used for:

- Main backgrounds
- Empty states

---

## Success

HEX: #34C759

---

## Warning

HEX: #FFCC00

---

## Alert

HEX: #FF3B30

---

# Typography

## iOS

Font Family:

San Francisco (SF Pro)

Use Apple's native typography system.

No custom fonts required for V1.

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

Apple Health

Apple Journal

Apple Fitness

Apple Reminders

Apple Human Interface Guidelines

The application should follow Apple's Human Interface Guidelines as closely as possible during the initial iOS-first release.

---

# Product Tagline

Remember every symptom.

Explain every vet visit.

---

# Success Metric

A successful user should be able to:

Complete a daily health check-in in under 10 seconds.

And generate a meaningful health history before visiting a veterinarian.