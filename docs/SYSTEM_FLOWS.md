# System Architecture & User Data Flows
## GlucoCare — End-to-End Operational Lifecycle

**Document Version:** 2.0.0  
**Status:** Approved  
**Author:** Lead Full-Stack Engineering Team  

---

### Table of Contents
1. [Flow 1: Authentication & RBAC Session Management](#flow-1-authentication--rbac-session-management)
2. [Flow 2: Secure Password Reset via SMTP Email](#flow-2-secure-password-reset-via-smtp-email)
3. [Flow 3: Blood Glucose Logging & Real-Time Target Evaluation](#flow-3-blood-glucose-logging--real-time-target-evaluation)
4. [Flow 4: Medication Schedule & Today's Plan Checklist Synchronization](#flow-4-medication-schedule--todays-plan-checklist-synchronization)
5. [Flow 5: Nutrition Diary & Monthly Pantry Ration Auto-Deduction Engine](#flow-5-nutrition-diary--monthly-pantry-ration-auto-deduction-engine)
6. [Flow 6: Apple Fitness 3-Metric Daily Tracking & Ring Progress](#flow-6-apple-fitness-3-metric-daily-tracking--ring-progress)
7. [Flow 7: Diagnostic Lab Vault & Printable Clinical Endocrinology Reports](#flow-7-diagnostic-lab-vault--printable-clinical-endocrinology-reports)
8. [Flow 8: Telehealth & Doctor Consultations with Reminder Alarms](#flow-8-telehealth--doctor-consultations-with-reminder-alarms)
9. [Flow 9: Multi-Tenant Administration & Patient Dossier Supervision](#flow-9-multi-tenant-administration--patient-dossier-supervision)
10. [Flow 10: Serverless Data Persistence & Cache Reconciliation Flow](#flow-10-serverless-data-persistence--cache-reconciliation-flow)

---

### Flow 1: Authentication & RBAC Session Management

This flow governs user registration, credential hashing, session token issuance, and role-based route protection.

```mermaid
sequenceDiagram
    autonumber
    actor User as Patient / Admin
    participant UI as Next.js Client
    participant AuthAPI as /api/auth/register (or /login)
    participant DB as MongoDB Atlas
    participant Cookie as Browser Cookie Jar

    User->>UI: Enters Credentials (Email, Password, Role/AdminKey)
    UI->>AuthAPI: POST payload (Zod validated)
    AuthAPI->>DB: Query User by Email
    alt User Already Exists
        DB-->>AuthAPI: Existing User Record
        AuthAPI-->>UI: 409 Conflict ("Email already registered")
    else New Registration
        AuthAPI->>AuthAPI: bcrypt.hash(password, saltRounds=10)
        AuthAPI->>AuthAPI: Check Admin Key -> Assign role (admin or patient)
        AuthAPI->>DB: User.create(newUserDocument)
        DB-->>AuthAPI: Saved User Document (UUID, Permissions)
        AuthAPI->>AuthAPI: jose.SignJWT(payload) with AUTH_SECRET
        AuthAPI->>Cookie: Set-Cookie: glucocare_session (httpOnly, secure, lax, 30d)
        AuthAPI-->>UI: 201 Created + User Profile Object
        UI->>UI: Redirect to /dashboard or /admin
    end
```

**Key Architectural Guards:**
- Passwords never stored in plain text.
- Session cookie uses `httpOnly: true` (inaccessible to JavaScript XSS attacks) and `SameSite: Lax` (CSRF prevention).
- If registering with a valid `ADMIN_SETUP_KEY`, role is automatically elevated to `admin` with full system governance permissions.

---

### Flow 2: Secure Password Reset via SMTP Email

Governs self-service password recovery without compromising account security.

```mermaid
sequenceDiagram
    autonumber
    actor User as Patient
    participant UI as Forgot Password Page
    participant API as /api/auth/forgot-password
    participant DB as MongoDB Atlas
    participant SMTP as Nodemailer SMTP Relay
    participant Inbox as Patient Email Inbox

    User->>UI: Submits registered email
    UI->>API: POST { email }
    API->>DB: Find user by email
    alt User Not Found
        API-->>UI: Generic 200 OK (Avoid user enumeration attack)
    else User Exists
        API->>API: Generate 6-digit numeric token & unique UUID
        API->>DB: ResetToken.create({ email, token, expiresAt: now + 60min })
        API->>SMTP: sendPasswordResetEmail({ to, name, token, resetUrl })
        SMTP->>Inbox: Delivers HTML reset notification with secure link
        API-->>UI: 200 OK ("Reset link dispatched")
    end

    User->>Inbox: Clicks reset link or copies token
    User->>UI: Submits new password + verification token
    UI->>API: POST /api/auth/reset-password
    API->>DB: Verify token & expiration
    API->>API: bcrypt.hash(newPassword)
    API->>DB: Update User passwordHash & delete used token
    API-->>UI: 200 OK ("Password successfully updated")
    UI->>UI: Redirect to Login
```

---

### Flow 3: Blood Glucose Logging & Real-Time Target Evaluation

Handles recording biomarker readings, calculating hypo/hyperglycemic flags, and updating Recharts trends.

```mermaid
sequenceDiagram
    autonumber
    actor Patient as Patient
    participant UI as Glucose Dialog / Today's Plan
    participant API as /api/glucose
    participant DB as MongoDB Atlas
    participant Trend as Recharts Trend Component

    Patient->>UI: Enters Reading (e.g. 118 mg/dL, Fasting, 08:00 AM)
    UI->>API: POST /api/glucose (Zod validated: value, unit, context, date, time)
    API->>API: Verify session token (extract userId)
    API->>DB: GlucoseReading.create({ userId, value, unit, context, measuredAt })
    DB-->>API: Persisted Reading Document
    API-->>UI: 201 Created { reading }
    UI->>UI: Re-evaluate target range (Fasting: 70-130 -> Status: Target/Normal)
    UI->>Trend: Append data point to 7D/14D/30D/90D time series
    UI->>UI: Mark "Morning Fasting Glucose" in Today's Plan Checklist as COMPLETED
    UI->>UI: Toast notification: "Glucose logged successfully"
```

---

### Flow 4: Medication Schedule & Today's Plan Checklist Synchronization

Coordinates prescribed drug schedules, daily dose taking, and checklist synchronization.

```mermaid
sequenceDiagram
    autonumber
    actor Patient as Patient
    participant Checklist as Today's Plan Checklist
    participant MedAPI as /api/medication-logs
    participant DB as MongoDB Atlas
    participant History as Medication Diary View

    Checklist->>Checklist: Renders scheduled meds for today (e.g., Metformin 500mg - Morning)
    Patient->>Checklist: Toggles checkbox "Take Morning Dose"
    Checklist->>MedAPI: POST /api/medication-logs { medicationId, status: "taken", takenAt }
    MedAPI->>API: Authenticate User
    MedAPI->>DB: MedicationLog.create({ userId, medicationId, status: "taken", takenAt })
    DB-->>MedAPI: Saved Log Record
    MedAPI-->>Checklist: 201 Created { log }
    Checklist->>Checklist: State set to checked (green strikethrough)
    Checklist->>History: Signal refresh -> History displays "Taken at 08:15 AM"
    Checklist->>UI: Recalculate daily progress completion percentage
```

---

### Flow 5: Nutrition Diary & Monthly Pantry Ration Auto-Deduction Engine

Integrates food logging with smart monthly pantry inventory management.

```mermaid
sequenceDiagram
    autonumber
    actor Patient as Patient
    participant Suggester as Smart Meal Suggester
    participant MealAPI as /api/meals
    participant RationAPI as /api/rations
    participant DB as MongoDB Atlas

    Patient->>Suggester: Selects recipe: "Moong Dal Khichdi (Low GI)"
    Suggester->>Suggester: Verifies pantry ingredients (Moong Dal: 50g, Oats: 40g)
    Patient->>Suggester: Clicks "Cook & Log This Meal"
    Suggester->>MealAPI: POST /api/meals (Meal description, carbs, calories, rationIngredients)
    MealAPI->>DB: Meal.create({ userId, mealType, rationIngredients, ... })
    DB-->>MealAPI: Created Meal Document
    MealAPI->>DB: Atomically decrement RationItem usedQuantity for each ingredient
    DB-->>MealAPI: Updated Ration Quotas
    MealAPI-->>Suggester: 201 Created + Updated Pantry Balances
    Suggester->>UI: Meal appears in Food Diary & Ration Stock reflects deducted amounts
    alt Any Item below Low Stock Threshold
        UI->>UI: Displays yellow "Low Stock Alert" badge on Ration Inventory
    end
```

---

### Flow 6: Apple Fitness 3-Metric Daily Tracking & Ring Progress

Tracks strictly Active Calories, Step Count, and Step Distance with SVG ring visualization.

```mermaid
sequenceDiagram
    autonumber
    actor Patient as Patient (iOS / Apple Watch User)
    participant Rings as AppleFitnessRings Component
    participant FitAPI as /api/apple-fitness
    participant DB as MongoDB Atlas

    Patient->>Rings: Views Today's Fitness Rings
    Rings->>FitAPI: GET /api/apple-fitness?date=2026-10-17
    FitAPI->>DB: AppleFitnessDayLog.findOne({ userId, date: '2026-10-17' })
    DB-->>FitAPI: Day Log (Calories: 480, Steps: 9200, Distance: 6.1km)
    FitAPI-->>Rings: Day Log JSON
    Rings->>Rings: Calculate % Goals:
    Note over Rings: Move Ring (480/500 = 96%)<br/>Step Ring (9200/10000 = 92%)<br/>Distance Ring (6.1/5.0 = 122% CLOSED)
    Patient->>Rings: Clicks "Log Apple Fitness" -> Enters updated numbers
    Rings->>FitAPI: POST /api/apple-fitness (Upsert by date)
    FitAPI->>DB: AppleFitnessDayLog.findOneAndUpdate({ userId, date }, updates, { upsert: true })
    DB-->>FitAPI: Updated Document
    FitAPI-->>Rings: 200 OK
    Rings->>Rings: Rings animate to new percentages smoothly
```

---

### Flow 7: Diagnostic Lab Vault & Printable Clinical Endocrinology Reports

Generates clinical reports with calculated metrics for doctor appointments.

```mermaid
sequenceDiagram
    autonumber
    actor Patient as Patient
    participant Vault as Lab Report Vault
    participant Reports as Printable Clinical Report
    participant API as /api/reports?days=14
    participant DB as MongoDB Atlas
    actor Doctor as Endocrinologist

    Patient->>Reports: Selects "14-Day Clinical Review"
    Reports->>API: GET /api/reports?days=14
    API->>DB: Fetch GlucoseReadings, MedicationLogs, and LabReports for past 14 days
    DB-->>API: Raw Historical Records
    API->>API: Compute Biomarkers:
    Note over API: Mean Glucose: 124 mg/dL<br/>Estimated HbA1c: (124 + 46.7) / 28.7 = 5.95%<br/>Time In Range (TIR): 86%<br/>Hypoglycemic events (<70): 2%<br/>Hyperglycemic events (>180): 12%<br/>Standard Deviation: 18.4
    API-->>Reports: Aggregated Statistics JSON
    Reports->>Reports: Renders print-formatted clinical summary table
    Patient->>Reports: Clicks "Print / Save PDF"
    Reports->>Doctor: Clean, structured medical summary delivered for consultation
```

---

### Flow 8: Telehealth & Doctor Consultations with Reminder Alarms

```mermaid
sequenceDiagram
    autonumber
    actor Patient as Patient
    participant UI as Appointment Form
    participant ApptAPI as /api/appointments
    participant DB as MongoDB Atlas
    participant Dash as Dashboard Upcoming Card

    Patient->>UI: Creates Appointment (Dr. Sarah Chen, Endocrinologist, Oct 24, 10:00 AM, Alarm: 1h)
    UI->>ApptAPI: POST /api/appointments
    ApptAPI->>DB: Appointment.create({ userId, doctorName, date, time, reminderAlarm })
    DB-->>ApptAPI: Created Appointment
    ApptAPI-->>UI: 201 Created
    UI->>Dash: Refresh -> Card shows "Dr. Sarah Chen in 7 days" with bell alarm active
```

---

### Flow 9: Multi-Tenant Administration & Patient Dossier Supervision

```mermaid
sequenceDiagram
    autonumber
    actor Admin as System Administrator / Clinician
    participant AdminUI as /admin Dashboard
    participant UserAPI as /api/admin/users
    participant DossierAPI as /api/admin/users/[id]
    participant DB as MongoDB Atlas

    Admin->>AdminUI: Navigates to Admin Panel
    AdminUI->>UserAPI: GET /api/admin/users
    UserAPI->>UserAPI: Verify Admin Role in JWT
    UserAPI->>DB: Fetch all users + summary stats
    DB-->>UserAPI: User directory list
    UserAPI-->>AdminUI: Render patient directory
    Admin->>AdminUI: Clicks "Inspect Patient Full Dossier" for specific user
    AdminUI->>DossierAPI: GET /api/admin/users/user-123
    DossierAPI->>DB: Aggregates Glucose, Meds, Meals, Apple Fitness, Lab Vault for user-123
    DB-->>DossierAPI: Comprehensive Patient Dossier
    DossierAPI-->>AdminUI: Renders multi-tab clinician inspection view
```

---

### Flow 10: Serverless Data Persistence & Cache Reconciliation Flow

```mermaid
flowchart TD
    Req[Incoming Client Request] --> AuthCheck{JWT Verified?}
    AuthCheck -- No --> Ret401[Return 401 Unauthorized]
    AuthCheck -- Yes --> MongoCheck{MongoDB Atlas Connected?}

    MongoCheck -- Yes --> MongoOps[Execute Mongoose Query against MongoDB Atlas]
    MongoOps --> ReturnSuccess[Return Persisted Document & HTTP 200/201]

    MongoCheck -- No --> CheckEnv{MONGODB_URI set in Environment?}
    CheckEnv -- Yes --> RetryConn[Attempt Reconnection with global cached pool]
    RetryConn --> ReconSuccess{Connected?}
    ReconSuccess -- Yes --> MongoOps
    ReconSuccess -- No --> MemoryFallback[Read/Write to In-Memory Demo Store]

    CheckEnv -- No --> MemoryFallback
    MemoryFallback --> WarnLog[Console Warning: Demo In-Memory Mode Active]
    WarnLog --> ReturnSuccess
```
