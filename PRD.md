# Product Requirements Document (PRD)

# Pet Health Journal
Version: 1.0 (MVP)

---

# 1. Product Summary

Pet Health Journal is a mobile application that enables pet owners to track their pet's health through quick daily check-ins.

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

---

# 7. Check-In System

## Daily Reminder

Trigger according to selected schedule.

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

# 9. Functional Requirements

FR-001

User must be able to create one pet.

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

User must receive scheduled reminders.

---

FR-006

User must be able to skip a reminder.

---

FR-007

System must save historical check-in data.

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
- Pet creation works
- Notifications work
- Daily check-ins work
- Dashboard works
- Data persists correctly
- App supports Light and Dark Mode
- App passes App Store Review

End of PRD