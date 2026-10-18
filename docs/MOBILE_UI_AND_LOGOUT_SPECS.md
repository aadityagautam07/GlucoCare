# Mobile UI & Authentication Session Specifications
## Comprehensive Mobile Navigation Overhaul & Multi-Touchpoint Logout Architecture

**Document Version:** 1.0.0  
**Target:** Mobile iOS & Android User Experience  
**Status:** Implemented & Production Verified  
**Author:** Lead Front-End & Security Engineering Team  

---

### Table of Contents
1. [Executive Summary: The Mobile Logout Discovery Problem](#1-executive-summary-the-mobile-logout-discovery-problem)
2. [Mobile UI Architecture & Human Interface Guidelines](#2-mobile-ui-architecture--human-interface-guidelines)
3. [The Four Redundant Mobile Logout Touchpoints](#3-the-four-redundant-mobile-logout-touchpoints)
   - [Touchpoint 1: Mobile Sticky Header (1-Tap Immediate Sign Out)](#touchpoint-1-mobile-sticky-header-1-tap-immediate-sign-out)
   - [Touchpoint 2: Mobile Navigation Drawer (Account Badge + Prominent Button)](#touchpoint-2-mobile-navigation-drawer-account-badge--prominent-button)
   - [Touchpoint 3: Profile View (Account Session & Security Card)](#touchpoint-3-profile-view-account-session--security-card)
   - [Touchpoint 4: Settings View (Account & Session Management Card)](#touchpoint-4-settings-view-account--session-management-card)
4. [Session Termination & Cookie Invalidation Flow](#4-session-termination--cookie-invalidation-flow)
5. [iOS & Mobile Safe Area Compliance](#5-ios--mobile-safe-area-compliance)
6. [Verification Checklist](#6-verification-checklist)

---

### 1. Executive Summary: The Mobile Logout Discovery Problem

On desktop viewports ($\ge 1024\text{px}$), GlucoCare displays a persistent 256px sidebar (`components/layout/app-sidebar.tsx`) featuring an account badge and an explicit `LogOut` icon button at the bottom of the viewport.

However, on mobile viewports ($< 1024\text{px}$, including iPhone and Android screens):
- The desktop sidebar is hidden (`hidden lg:flex`).
- The mobile header previously only contained the GlucoCare logo, dark mode toggle, quick log button, and profile circle.
- The mobile bottom navigation drawer ("More" menu) previously displayed a $2 \times 4$ grid of internal page links, with **zero logout action**.
- The User Profile page (`/profile`) only allowed editing target ranges and contact details, lacking an account session termination button.

This caused a critical user experience issue: **a mobile user was effectively trapped in their logged-in session with no discoverable way to sign out.**

---

### 2. Mobile UI Architecture & Human Interface Guidelines

Following Apple's **Human Interface Guidelines (HIG)** and Google's **Material Design 3**:
1. **Touch Target Size:** Every interactive element has a touch target of at least $36\text{px} \times 36\text{px}$ (exceeding standard $44\text{px}$ effective hit testing with padding).
2. **Visual Hierarchy:** Destructive actions (signing out) use high-contrast rose/red semantic accents (`bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400`) to differentiate them from routine navigation links.
3. **Multi-Touchpoint Redundancy:** Users expect logout in either the top-right header, the primary navigation menu, the Profile screen, or Settings. GlucoCare now provides accessible sign out across **all four** locations.

---

### 3. The Four Redundant Mobile Logout Touchpoints

```
┌────────────────────────────────────────────────────────┐
│ GlucoCare Mobile UI Layout                             │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ [Heart] GlucoCare          [Dark] [Log] [User] [⎋] │ │  <-- Touchpoint 1: Header (1-Tap)
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│   Active Content (Dashboard, Glucose, Meals, etc.)     │
│                                                        │
│   When on /profile:                                    │
│   ┌──────────────────────────────────────────────────┐ │
│   │ [⎋] Account Session & Security                   │ │  <-- Touchpoint 3: Profile Card
│   │     Signed in as: user@email.com                 │ │
│   │     [ Sign Out of GlucoCare ]                    │ │
│   └──────────────────────────────────────────────────┘ │
│                                                        │
│   When on /settings:                                   │
│   ┌──────────────────────────────────────────────────┐ │
│   │ [⎋] Account Session & Log Out                    │ │  <-- Touchpoint 4: Settings Card
│   │     [ Sign Out of GlucoCare ]                    │ │
│   └──────────────────────────────────────────────────┘ │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ [Home]    [Glucose]    [ (+) Log ]   [Insights] [⋯] │ │  <-- Touchpoint 2: "More" Menu
│ └────────────────────────────────────────────────────┘ │
│                          │                             │
│                          ▼ (Opens Bottom Sheet)        │
│   ┌──────────────────────────────────────────────────┐ │
│   │ All Health Portals & Tools                   [X] │ │
│   │ [Pill Meds] [Utensils Meals] [Activity] [Appts]  │ │
│   │                                                  │ │
│   │ ┌──────────────────────────────────────────────┐ │ │
│   │ │ (PT) Aditya Gautam - aditya@gmail.com [ADMIN]│ │ │
│   │ └──────────────────────────────────────────────┘ │ │
│   │ ┌──────────────────────────────────────────────┐ │ │
│   │ │  [⎋]  Log Out of GlucoCare                   │ │ │  <-- Full-Width Drawer Button
│   │ └──────────────────────────────────────────────┘ │ │
│   └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

#### Touchpoint 1: Mobile Sticky Header (1-Tap Immediate Sign Out)
* **File:** [`components/layout/mobile-header.tsx`](file:///c:/Users/aadit/projects/diabetes/components/layout/mobile-header.tsx)
* **Location:** Upper right corner of the mobile screen, pinned to the top on every dashboard view.
* **Element:** Rose-accented icon button with `LogOut` icon (`h-8 w-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400`).
* **Behavior:** Directly dispatches `/api/auth/logout`, clears session cookies, shows toast notification *"Signed out successfully"*, and redirects to `/login`.

#### Touchpoint 2: Mobile Navigation Drawer (Account Badge + Prominent Button)
* **File:** [`components/layout/mobile-nav.tsx`](file:///c:/Users/aadit/projects/diabetes/components/layout/mobile-nav.tsx)
* **Location:** Accessible by tapping the **"More" (⋯)** tab in the bottom navigation bar.
* **Elements:**
  1. **User Identity Pill:** Displays user initials in an avatar circle, user's full name, email address, and role badge (`ADMIN`, `DOCTOR`, or `PATIENT`).
  2. **Full-Width Destructive Action Button:** `Log Out of GlucoCare` button spanning the entire width of the bottom sheet with active touch scaling and loading spinner states.

#### Touchpoint 3: Profile View (Account Session & Security Card)
* **File:** [`components/profile/profile-view.tsx`](file:///c:/Users/aadit/projects/diabetes/components/profile/profile-view.tsx)
* **Location:** Directly below the target range form and above the Developer contact card.
* **Element:** A dedicated Card component with title *"Account Session & Security"*, notifying the user which email they are currently logged in as, with an outline button *"Sign Out of GlucoCare"*.

#### Touchpoint 4: Settings View (Account & Session Management Card)
* **File:** [`components/settings/settings-view.tsx`](file:///c:/Users/aadit/projects/diabetes/components/settings/settings-view.tsx)
* **Location:** Positioned between the Medical Privacy Policy card and the Developer Profile Card.
* **Element:** Card component titled *"Account Session & Log Out"* with an explicit *"Sign Out of GlucoCare"* trigger.

---

### 4. Session Termination & Cookie Invalidation Flow

When any logout button is tapped:
1. `isLoggingOut` state is set to `true`, disabling the button and preventing double-submission.
2. An asynchronous `POST` request is dispatched to `/api/auth/logout`:
   ```typescript
   await fetch("/api/auth/logout", { method: "POST" });
   ```
3. The server handler ([`app/api/auth/logout/route.ts`](file:///c:/Users/aadit/projects/diabetes/app/api/auth/logout/route.ts)) deletes the `glucocare_session` HTTP-only cookie by setting its expiration to the Unix epoch (`Max-Age=0`).
4. A confirmation toast is triggered: `toast.success("Signed out successfully")`.
5. Next.js router executes client navigation to `/login`:
   ```typescript
   router.push("/login");
   router.refresh();
   ```

---

### 5. iOS & Mobile Safe Area Compliance

1. **iPhone Dynamic Island & Notch:** The sticky header uses `sticky top-0 z-20` with `h-14 backdrop-blur-md` and explicit `px-3.5` horizontal padding to prevent elements from bleeding into curved screen corners.
2. **iPhone Home Indicator Bar:** The bottom navigation bar includes `pb-safe` (safe area inset bottom) so that bottom nav tabs never overlap iOS home gesture swipes.
3. **Sheet Dismissal:** The mobile drawer backdrop includes an interactive click-away blur dismisser (`bg-slate-900/40 backdrop-blur-xs`) and explicit `[X]` close button.

---

### 6. Verification Checklist

| Test Item | Device Viewport | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **Header Sign Out Button** | Mobile (375px–430px) | Visible in top-right header next to profile circle; tapping signs out immediately. | **PASS** |
| **Drawer User Session Pill** | Mobile (375px–430px) | Tapping "More" reveals drawer showing user name, email, and role badge. | **PASS** |
| **Drawer Sign Out Button** | Mobile (375px–430px) | Visible at bottom of drawer; tapping executes logout and closes drawer. | **PASS** |
| **Profile Screen Logout** | Mobile & Desktop | Account Session card present; allows signing out directly from Profile. | **PASS** |
| **Settings Screen Logout** | Mobile & Desktop | Account Session card present; allows signing out directly from Settings. | **PASS** |
| **Next.js Production Build** | All Routes | `npm run build` succeeds with exit code 0 and zero TypeScript errors. | **PASS** |
