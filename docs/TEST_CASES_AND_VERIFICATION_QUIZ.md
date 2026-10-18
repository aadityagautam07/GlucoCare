# Test Case Matrix & Quality Assurance Verification Quiz
## Comprehensive System Test Suite for GlucoCare

**Document Version:** 2.0.0  
**Status:** Ready for Execution  
**Target Quality Bar:** 100% Pass Rate across Unit, Integration, Persistence & UI Layers  

---

### Table of Contents
1. [Test Execution Strategy](#1-test-execution-strategy)
2. [Master Test Case Matrix](#2-master-test-case-matrix)
   - [TC-AUTH: Authentication, Sessions & RBAC](#tc-auth-authentication-sessions--rbac)
   - [TC-GLUC: Blood Glucose & Biomarker Range Engine](#tc-gluc-blood-glucose--biomarker-range-engine)
   - [TC-MEDS: Medication Regimens & Dose Adherence](#tc-meds-medication-regimens--dose-adherence)
   - [TC-MEAL: Nutrition Diary, Pantry Rations & Auto-Deduction](#tc-meal-nutrition-diary-pantry-rations--auto-deduction)
   - [TC-FITN: Apple Fitness 3-Metric Rings & Daily Logs](#tc-fitn-apple-fitness-3-metric-rings--daily-logs)
   - [TC-REPT: Lab Vault & Endocrinology Clinical Reports](#tc-rept-lab-vault--endocrinology-clinical-reports)
   - [TC-APPT: Appointments, Telehealth & Alarm Reminders](#tc-appt-appointments-telehealth--alarm-reminders)
   - [TC-ADMN: Multi-Tenant Admin & Patient Dossier Supervision](#tc-admn-multi-tenant-admin--patient-dossier-supervision)
   - [TC-PERS: Data Persistence, Serverless & Failover Validation](#tc-pers-data-persistence-serverless--failover-validation)
3. [The QA Verification Quiz (Interactive Validation Questionnaire)](#3-the-qa-verification-quiz-interactive-validation-questionnaire)

---

### 1. Test Execution Strategy

The GlucoCare test suite validates three core invariants:
1. **Clinical Accuracy**: Calculations (Estimated HbA1c, Time In Range, Glucose Units) must adhere strictly to clinical diabetes formulas.
2. **Data Invariant / Zero Data Loss**: Any entity created by a user must persist across hard page refreshes, browser restarts, and serverless cold boots.
3. **Multi-Tenant Security**: Users must never see, modify, or delete another patient's biomarker data unless explicitly possessing the `admin` role.

---

### 2. Master Test Case Matrix

#### TC-AUTH: Authentication, Sessions & RBAC

| Test ID | Test Scenario | Preconditions | Input Data | Expected Result | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-AUTH-01** | Standard Patient Registration | Clean database state | Name: "John Doe", Email: `john@test.com`, Pass: `SecurePass123!`, Diabetes: `Type 2` | 201 Created; JWT cookie `glucocare_session` set with `httpOnly: true`; user redirected to `/dashboard`. | DB contains hashed password; user can log out and log back in. |
| **TC-AUTH-02** | Prevent Duplicate Email | `john@test.com` already registered | Same email, different password | HTTP 409 Conflict with message `"An account with this email already exists"`. | No duplicate document created; UI displays clear inline toast. |
| **TC-AUTH-03** | Administrator Registration via Setup Key | System has `ADMIN_SETUP_KEY` configured | Valid admin key provided during registration | User provisioned with `role: "admin"` and all 11 administrative permissions enabled. | User can access `/admin` console without permission barriers. |
| **TC-AUTH-04** | Invalid Login Credentials | Registered user exists | Valid email, incorrect password | HTTP 401 Unauthorized (`"Invalid email or password"`). | Cookie not issued; login counter logged; no sensitive hash leakage. |
| **TC-AUTH-05** | Demo Patient One-Click Entry | Clean or seeded state | Click "Explore as Demo Patient" | Direct login as Eleanor Brooks (`demo.patient@glucocare.health`); 14-day sample dataset loaded. | Seamless entry without password friction. |
| **TC-AUTH-06** | Session Cookie Expiration & Invalidation | Active session | User clicks "Log Out" in profile menu | Cookie `glucocare_session` cleared with maxAge: 0; user redirected to `/login`. | Subsequent access to `/dashboard` returns redirect to `/login`. |
| **TC-AUTH-07** | Password Reset via SMTP | User registered | Email: `john@test.com` on `/forgot-password` | HTTP 200; Reset token created in DB (60m TTL); Nodemailer dispatches HTML email. | Verification code arrives in inbox; password can be updated. |

---

#### TC-GLUC: Blood Glucose & Biomarker Range Engine

| Test ID | Test Scenario | Preconditions | Input Data | Expected Result | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-GLUC-01** | Log Fasting Glucose in Target | Patient logged in | Value: `95 mg/dL`, Context: `fasting`, Date: `2026-10-17`, Time: `07:30` | 201 Created; Badge: `Target` (Green); Reading appears at top of Glucose Table. | Reading saved in database; today's plan updates fasting task. |
| **TC-GLUC-02** | Log Hypoglycemic Reading | Patient logged in | Value: `58 mg/dL`, Context: `before_meal` | 201 Created; Badge: `Low` (Rose/Red alert); Observational insight recommends fast-acting carbs. | Immediate visual alert rendered; TIR calculation updates. |
| **TC-GLUC-03** | Log Hyperglycemic Reading | Patient logged in | Value: `220 mg/dL`, Context: `after_meal` | 201 Created; Badge: `High` (Amber/Orange alert); Post-meal spike flagged. | Reading appears on Recharts trend above the 180 threshold line. |
| **TC-GLUC-04** | Delete Glucose Reading | Reading exists in DB | User clicks trash icon on reading #101 | Confirmation dialog appears; upon confirm, HTTP 200 DELETE; reading removed from UI & DB. | DB record erased; metrics immediately recomputed. |
| **TC-GLUC-05** | Unit Toggle `mg/dL` to `mmol/L` | Readings stored in `mg/dL` | User toggles unit switch in Settings | UI dynamically renders values divided by $18.0182$ (e.g., $180\text{ mg/dL} \to 10.0\text{ mmol/L}$). | Mathematical accuracy within 0.1 mmol/L; no database mutation. |

---

#### TC-MEDS: Medication Regimens & Dose Adherence

| Test ID | Test Scenario | Preconditions | Input Data | Expected Result | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-MEDS-01** | Create New Prescription | Patient logged in | Name: "Metformin", Dosage: "500 mg", Schedule: "morning", Freq: "Once daily" | 201 Created; Prescription card rendered with instructions and dosage badges. | Stored in database; linked to patient's `userId`. |
| **TC-MEDS-02** | Toggle Dose Taken in Today's Plan | Scheduled med exists | User clicks checkbox "Metformin 500 mg" | Checkbox checked; strike-through style; `/api/medication-logs` saves `{ status: "taken" }`. | Status persists on page refresh; history logs exact timestamp. |
| **TC-MEDS-03** | Record Skipped or Missed Dose | Scheduled med exists | User logs dose with status: `skipped` and note: "Nausea" | History table displays yellow `Skipped` badge with attached patient note. | Both status and note persisted in database. |

---

#### TC-MEAL: Nutrition Diary, Pantry Rations & Auto-Deduction

| Test ID | Test Scenario | Preconditions | Input Data | Expected Result | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-MEAL-01** | Log Custom Meal Entry | Patient logged in | Meal: "Grilled Chicken & Quinoa", Type: `dinner`, Carbs: 35g, Cal: 450 kcal | 201 Created; Meal appears in Food Diary; Dashboard Carbs & Calories today increment. | Database reflects meal record; dark mode badge displays clean colors. |
| **TC-MEAL-02** | Add Monthly Pantry Staple | Patient logged in | Name: "Rolled Oats", Category: `grains`, Allocated: 2.0 kg, LowStock: 0.5 kg | 201 Created; Item added to Monthly Pantry Inventory card with progress bar. | Quotas stored with `YYYY-MM` month tag. |
| **TC-MEAL-03** | 1-Click Cook & Log Auto-Deduction | Pantry has Oats: 2.0kg | User clicks "Cook & Log" for Oatmeal recipe (uses 0.1kg Oats) | 1. Meal logged in diary; 2. Oats usedQuantity increments by 0.1kg (remaining: 1.9kg). | Atomic transaction updates both collections. |
| **TC-MEAL-04** | Low Stock Alert Trigger | Remaining stock $\le$ threshold | Ration item usedQuantity reaches $1.6\text{ kg}$ of $2.0\text{ kg}$ (Threshold: $0.5\text{ kg}$) | Badge turns yellow with alert icon: `"Low Stock"`; tab pill displays alert badge. | Patient notified visually without blocking logging. |

---

#### TC-FITN: Apple Fitness 3-Metric Rings & Daily Logs

| Test ID | Test Scenario | Preconditions | Input Data | Expected Result | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-FITN-01** | Log Apple Fitness Daily Metrics | Patient logged in | Date: Today, Calories: 550 kcal, Steps: 10,500, Distance: 5.2 km | 200 OK; SVG Activity Rings animate; Move, Step, and Distance rings all CLOSE ($\ge 100\%$). | Badges display `"3/3 Rings Closed"`; saved in database. |
| **TC-FITN-02** | View Past Date Fitness Log | Multiple logs exist | User selects past date via date picker | Rings and summary metrics smoothly update to reflect selected historical date. | Accurate date isolation; back to today button appears. |
| **TC-FITN-03** | Empty Steps Field (NaN Bug Fix) | Patient logging workout | Enters Duration: 30 min, leaves Steps blank | Form submits successfully with `steps: null`; no silent Zod validation failure. | Workout saved and displayed in Logged Workouts list. |

---

#### TC-REPT: Lab Vault & Endocrinology Clinical Reports

| Test ID | Test Scenario | Preconditions | Input Data | Expected Result | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-REPT-01** | Upload/Record Diagnostic Lab Report | Patient logged in | Title: "HbA1c & Lipid Panel", Lab: "Quest Diagnostics", Date: `2026-10-10`, Metrics: "HbA1c: 6.2%" | 201 Created; Report card rendered in Lab Vault with category icon. | Record persisted; accessible for clinical review. |
| **TC-REPT-02** | Generate 14-Day Clinical Summary | $\ge 10$ glucose readings exist | Select "14 Days" range on Reports tab | Summary card renders: Mean Glucose, Estimated A1c ($eA1c$), TIR %, High %, Low %, Std Dev. | Math verified against clinical formula ($eA1c = (\text{Mean} + 46.7) / 28.7$). |
| **TC-REPT-03** | Print Report Compatibility | Report generated | User triggers browser Print (`Ctrl+P` / `Cmd+P`) | Unnecessary navigation bars hidden; clean high-contrast black-and-white table formatted. | Page breaks clean; zero clipping. |

---

#### TC-APPT: Appointments, Telehealth & Alarm Reminders

| Test ID | Test Scenario | Preconditions | Input Data | Expected Result | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-APPT-01** | Schedule In-Person Clinic Visit | Patient logged in | Doctor: "Dr. Robert Vance", Specialty: "Endocrinology", Date: Next week, Alarm: `1d` | 201 Created; Appointment card shows clinic location and 1-day alarm icon. | Card appears in Dashboard Upcoming strip. |
| **TC-APPT-02** | Schedule Virtual Telehealth Visit | Patient logged in | Virtual: `true`, Location: "Zoom / Telehealth Link", Alarm: `15m` | Telehealth video badge displayed; reminder alarm set to 15 minutes before visit. | Persisted in database. |

---

#### TC-ADMN: Multi-Tenant Admin & Patient Dossier Supervision

| Test ID | Test Scenario | Preconditions | Input Data | Expected Result | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-ADMN-01** | Non-Admin Blocked from Admin Panel | Logged in as standard `patient` | Navigates directly to `/admin` URL | System redirects to `/dashboard` or renders `"Unauthorized: Admin privileges required"`. | HTTP 403 / redirect enforced at server layout level. |
| **TC-ADMN-02** | Suspend & Activate Patient Account | Logged in as `admin` | Admin toggles user status from `active` to `suspended` | User status updated in DB; suspended user blocked from subsequent API calls. | Instant enforcement across all patient routes. |
| **TC-ADMN-03** | Inspect Patient Full Dossier | Logged in as `admin` | Admin clicks patient name in directory | Full multi-tab dossier opens: Patient Profile, Glucose History, Meds, Meals, Fitness, Reports. | Admin can view all data without affecting patient's active state. |

---

#### TC-PERS: Data Persistence, Serverless & Failover Validation

| Test ID | Test Scenario | Preconditions | Input Data | Expected Result | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-PERS-01** | Vercel Cold Start Persistence | App deployed on Vercel | User logs glucose reading, logs out, closes browser, logs in after 10 minutes | Previous reading is 100% visible and intact; nothing reset. | Zero data loss on serverless container recycling. |
| **TC-PERS-02** | Multi-Container Concurrent Writes | 2 devices logged in as same patient | Device A logs Meal; Device B logs Glucose simultaneously | Both records saved atomically in MongoDB Atlas; no concurrency overwrite. | Both records visible in respective tables. |
| **TC-PERS-03** | In-Memory Failover Grace | `MONGODB_URI` invalid or network severed | Start application without network | System logs warning and falls back to in-memory store; does NOT crash. | Server continues running; demo patient accessible. |
| **TC-MOB-01** | Mobile Logout Discovery | iPhone/Android viewport (< 1024px) | Tap top-right header `LogOut` button or "More" drawer `Log Out of GlucoCare` | Session cookie `glucocare_session` invalidated; redirected to `/login` | Instant sign out across all mobile screens. |
| **TC-SMTP-01** | Live Gmail SMTP Delivery | SMTP configured in `.env.local` | Request password reset for registered email | Generates 6-digit token; dispatches responsive HTML email via Google SMTP | Email received in inbox with `250 2.0.0 OK`. |

---

### 3. The QA Verification Quiz (Interactive Validation Questionnaire)

*Answer each question to confirm full compliance before greenlighting release.*

```
[x] Q1: When a new user registers on Vercel, does their account persist if a different serverless instance serves the next request?
    -> YES: Handled by MongoDB Atlas UserModel persistence.

[x] Q2: When a patient logs a meal or morning medication dose, does refreshing the browser keep the checkmark and meal history intact?
    -> YES: Handled by atomic MongoDB MealModel and MedicationLogModel queries.

[x] Q3: In Dark Mode, are all meal slot timings, badges, and progress tracks legible without any white-on-white text?
    -> YES: Handled by dark:bg-* and dark:text-* token parity in Tailwind v4.

[x] Q4: If the Steps field in the Activity Dialog is left blank, does the form submit without crashing or silent failure?
    -> YES: Handled by setValueAs: (v) => (v === "" ? null : Number(v)) in React Hook Form.

[x] Q5: Does the Apple Fitness view restrict tracking to strictly 3 metrics (Active Calories, Step Count, Step Distance)?
    -> YES: Handled by AppleFitnessRings and AppleFitnessDayLog schema.

[ ] Q6: In MongoDB Atlas Network Access, is 0.0.0.0/0 whitelisted so Vercel serverless functions can connect?
    -> REQUIRED ACTION: User must whitelist 0.0.0.0/0 in MongoDB Atlas dashboard.

[x] Q7: Does the Estimated HbA1c formula strictly compute (Mean_Glucose + 46.7) / 28.7?
    -> YES: Implemented in reports-view.tsx and printable-report.tsx.

[x] Q8: Can an admin review the full clinical dossier of any registered patient without logging in as that patient?
    -> YES: Implemented via /admin/users/[id] Full Dossier Inspector.

[x] Q9: Can an iPhone or Android user easily find and trigger a logout button without zooming or horizontal scrolling?
    -> YES: Implemented in 4 distinct mobile locations: (1) Sticky Top Header, (2) Bottom Navigation Drawer with user badge, (3) Profile screen session card, and (4) Settings screen session card.

[x] Q10: Does password reset dispatch real emails via Gmail SMTP using aadityagautam06@gmail.com?
    -> YES: Live Gmail SMTP verified with Google SMTP servers (Message ID: <4c36f301-2b95-8d25-3e0c-d4b7bdfa3509@gmail.com>).
```

