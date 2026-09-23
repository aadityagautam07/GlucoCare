# 🩺 GlucoCare — Modern Diabetes Management Web Application

> **Help a diabetes patient understand and manage their day without overwhelming them with medical information.**

GlucoCare is a production-quality, responsive healthcare SaaS web application built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui-inspired** components. Designed around calm, trustworthy, and non-diagnostic principles to support patients managing Type 2 diabetes.

---

## 👨‍💻 Developed By

**Aaditya Gautam**  
*Lead Full-Stack Developer & UX Designer*

- 🐙 **GitHub**: [@aadityagautam07](https://github.com/aadityagautam07)
- 💼 **LinkedIn**: [Aaditya Gautam](https://www.linkedin.com/in/aadityagautam07/)
- 📸 **Instagram**: [@aadityagautam__](https://instagram.com/aadityagautam__)

---

## ✨ Features

- **📊 Comprehensive Dashboard**: Answers *"How am I doing today?"* with latest blood glucose status, 4 key daily metrics, interactive Recharts 7D/14D/30D/90D trend graph, and a daily self-care plan checklist.
- **🩸 Glucose Tracking**: Log and filter readings by context (*Fasting*, *Before Meal*, *After Meal*, *Bedtime*, *Random*) with instant target range checks and unit toggles (`mg/dL` and `mmol/L`).
- **💊 Medication Management**: Prescription cards displaying instructions, schedules, and active dose logging (*Taken*, *Skipped*, *Missed*).
- **🥗 Meals & Monthly Ration Inventory**:
  - Daily food diary tracking carbs and calories.
  - **Monthly Ration & Pantry Tracker**: Track household staple food supplies (Oats, Rice, Lentils, Nuts, Healthy Oils) with low-stock alerts.
  - **Ration-Based Meal Planner**: Pre-configured diabetic recipes matching in-stock rations with 1-click automatic ingredient deduction.
- **🏃 Physical Activity**: Activity logs and weekly active minutes Recharts bar chart with daily exercise benchmarks.
- **💡 Observational Health Insights**: Comparative trend summaries without making autonomous diagnoses.
- **🩺 Doctor Consultations & Telehealth**: Appointment scheduler for clinic check-ups and virtual visits.
- **📄 Printable Clinical Reports**: Export 7, 14, 30, or 90-day clinical summaries with estimated A1c and Time In Range % for endocrinologists.
- **🔐 Privacy & Dual-Mode Database**: Supports both live **MongoDB Atlas** and instant **zero-setup in-memory fallback** with pre-seeded 14-day demo data (*Eleanor Brooks*).

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router, Turbopack, React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Accessible dialogs, drawers, and form primitives
- **Icons**: Lucide React
- **Charts**: Recharts
- **Database**: MongoDB & Mongoose (with in-memory demo fallback)
- **Validation**: Zod & React Hook Form
- **Authentication**: Session cookies via `jose` (JWT) & `bcryptjs`

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/aadityagautam07/glucocare.git
cd glucocare
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env.local
```

*(Note: GlucoCare includes an automatic in-memory fallback, so you can run the app immediately even without a database configured!)*

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Click **"Explore as Demo Patient"** to test immediately.

---

## 🌐 Deploy to Vercel

The easiest way to deploy GlucoCare is with [Vercel](https://vercel.com):

1. Push this repository to your GitHub account.
2. Import the project in the [Vercel Dashboard](https://vercel.com/new).
3. Add the following Environment Variables in the project settings:
   - `AUTH_SECRET`: A secure random 256-bit string (e.g. `openssl rand -base64 32`)
   - `MONGODB_URI`: Your MongoDB Atlas connection string (optional; demo mode will activate if omitted)
4. Click **Deploy**!

---

## ⚖️ Medical Safety Disclaimer

GlucoCare is an organizational self-care tracking platform. It does not provide medical diagnoses, treatment plans, or autonomous medication/insulin dosage adjustments. Always consult your qualified healthcare professional regarding clinical decisions.

---

## 📄 License

Created by [Aaditya Gautam](https://github.com/aadityagautam07). Open for personal, educational, and healthcare exploration.
