# Product Requirements Document (PRD)

# Pet Health Journal
Version: 1.0 (MVP)

---

# 1. Product Summary

Pet Health Journal is a mobile application that enables pet owners to track their pets' health through quick daily check-ins.

Users can manage multiple pets and select one active pet at a time. The dashboard, check-ins, and reminders reflect the currently active pet.

The application focuses on symptom awareness, behavioral changes and veterinary visit preparation.

The primary goal is to create a health history that helps users remember important changes over time.

---

# 2. Product Goals

## Primary Goal

Allow users to complete a daily health check-in in less than 10 seconds.

## Secondary Goals

- Increase daily engagement
- Build long-term health history
- Prepare users for veterinary visits
- Detect health changes over time

---

# 3. Success Metrics

### User Metrics

- Onboarding Completion Rate > 80%
- First Check-In Completion Rate > 90%
- Daily Check-In Time < 10 seconds
- 7-Day Retention > 40%
- 30-Day Retention > 20%

---

# 4. User Personas

## Persona A

Cat Owner

Age: 25-45

Needs:
- Track health changes
- Remember symptoms
- Prepare for vet visits

---

## Persona B

Dog Owner

Age: 25-55

Needs:
- Daily wellbeing tracking
- Symptom monitoring
- Medication reminders (future version)

---

# 5. Core User Flow

Install App

↓

Onboarding

↓

Account Creation

↓

Pet Creation

↓

Notification Setup

↓

First Check-In

↓

Dashboard

↓

My Pets (select active pet / add pet)

↓

Daily Notifications

↓

Daily Check-Ins

---

# 6. Screens

---

# Screen 01

Splash Screen

## Components

Logo

App Name

Tagline

## Actions

Automatically navigate to onboarding

after 2-3 seconds.

---

# Screen 02

Onboarding 1

## Title

Never forget an important health change again.

## CTA

Continue

---

# Screen 03

Onboarding 2

## Title

Can you remember when the symptoms started?

## CTA

Continue

---

# Screen 04

Onboarding 3

## Title

Daily check-ins take less than 10 seconds.

## CTA

Continue

---

# Screen 05

Onboarding 4

## Title

Turn daily notes into vet-ready reports.

## CTA

Get Started

---

# Screen 06

Authentication

## Options

Continue with Apple

Continue with Google

Continue with Email

Continue as Guest

## Requirements

Guest mode must be supported.

---

# Screen 07

Pet Type Selection

## Options

Cat

Dog

## Validation

One option must be selected.

---

# Screen 08

Pet Name

## Input

Text Field

## Validation

Minimum 1 character

Maximum 30 characters

---

# Screen 09

Pet Age Group

## Options

Under 1 Year

1-3 Years

4-7 Years

8-12 Years

13+ Years

## Validation

Required

---

# Screen 10

Health Conditions

## Multi Select

None

Kidney Disease

Diabetes

Allergy

Heart Disease

Arthritis

Other

Not Sure

---

# Screen 11

Check-In Preferences

## Options

Morning

Afternoon

Evening

Multiple Times Daily

## Validation

Required

---

# Screen 12

Notification Permission

## Actions

Allow Notifications

Maybe Later

---

# Screen 13

First Check-In

## Title

How is [Pet Name] today?

---

## Question 1

Appetite

### Options

Good

Normal

Reduced

Not Eating

---

## Question 2

Energy

### Options

High

Normal

Low

---

## Question 3

Symptoms

### Options

None

Vomiting

Diarrhea

Other

---

## CTA

Save Check-In

---

# Screen 14

Success Screen

## Message

Great!

You've completed your first health check-in.

## CTA

Go To Dashboard

---

# Screen 15

Dashboard

Shows data for the **currently active pet**.

## Navigation

Bottom tabs:

- Home
- My Pets
- Profile

---

## Header

Pet Name

Last Check-In Date

---

## Section

Health Snapshot

### Display

Appetite

Energy

Symptoms

---

## Section

Quick Actions

New Check-In

Reports

Records (Locked for MVP)

Medication (Locked for MVP)

---

## Section

Next Reminder

Display:

Date

Time

Reminder copy uses the **active pet's name**.

---

# Screen 16

My Pets

## Purpose

List all pets owned by the user and manage the active pet selection.

---

## Pet List

Each row displays:

- Pet photo / avatar
- Pet name

The **active pet** must have a subtle visual indicator (for example, a "Current" badge or highlighted border).

---

## Actions

### Tap Pet Row

- Set tapped pet as the active pet
- Persist active pet selection locally
- Navigate to Home (Dashboard)

### Add Pet

- Open pet setup flow in **add mode**
- Collect pet-specific fields only (type, name, age group, health conditions)
- Skip onboarding and global notification / check-in preference setup
- New pet becomes the active pet after creation
- Navigate to Home (Dashboard)

### Empty State

If no pets exist, show CTA to initial pet setup.

---

# Screen 17

Profile & Settings

App-level settings (notifications, reminder preferences, delete all data).

Notification and check-in preferences are **global** (shared across all pets). Reminder notification text uses the active pet's name.

---

# 7. Check-In System

## Daily Reminder

Trigger according to the user's **global** reminder preference schedule.

Reminder notification copy uses the **active pet's name**. There is one shared reminder schedule for all pets in MVP.

Examples:

09:00

18:00

21:00

---

## Reminder Text Examples

How is Luna today?

Quick health check for Luna.

Any health changes today?

---

# 8. Data Model

Pet

- id
- name
- species
- ageGroup
- healthConditions
- createdAt

---

CheckIn

- id
- petId
- date
- appetite
- energy
- symptom
- createdAt

---

User

- id
- email
- provider
- createdAt

---

AppPreferences (local)

- activePetId
- onboardingCompleted
- notificationPermission
- checkInPreference

`activePetId` identifies which pet is currently active. If missing or stale, the system falls back to the oldest pet.

---

# 9. Functional Requirements

FR-001

User must be able to create and manage multiple pets.

---

FR-001a

User must be able to select one **active pet** at a time. Dashboard, check-ins, and reminder copy reflect the active pet.

---

FR-001b

User must be able to add an additional pet without repeating onboarding or global notification / check-in preference setup.

---

FR-001c

My Pets must list all pets with avatar and name, indicate the active pet, and allow switching the active pet.

---

FR-002

User must be able to edit pet information.

---

FR-003

User must be able to complete a check-in.

---

FR-004

User must be able to view latest check-in.

---

FR-005

User must receive scheduled reminders based on global reminder preferences.

Reminder text must use the active pet's name. Changing the active pet updates scheduled reminder copy without changing permission or preference settings.

---

FR-006

User must be able to skip a reminder.

---

FR-007

System must save historical check-in data per pet (`petId`).

---

FR-008

Delete All Data must remove all pets, all check-ins, active pet selection, and app preferences from the device.

---

# 10. Non Functional Requirements

Performance

App launch < 2 seconds

---

Offline Support

Check-ins should work offline.

Data sync when connection returns.

---

Security

User data encrypted in transit.

HTTPS required.

---

Accessibility

Dynamic Type support

VoiceOver compatibility

Dark Mode support

---

# 11. Out Of Scope (Not Included in MVP)

Medication Tracking

Weight Tracking

Medical Records

PDF Reports

Shared Care

AI Insights

Health Score

Veterinary Integrations

Wearable Integrations

---

# 12. MVP Release Criteria

Release is approved when:

- Onboarding works
- Pet creation works (initial setup and add-pet flow)
- Multiple pets can be listed, selected, and added from My Pets
- Active pet switching updates dashboard and check-in history correctly
- Notifications work (global prefs; reminder copy follows active pet)
- Daily check-ins work
- Dashboard works
- Data persists correctly
- App supports Light and Dark Mode
- App passes App Store Review

End of PRD