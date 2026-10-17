# Configuration & External Services Guide
## Exact Setup Requirements: MongoDB Atlas, SMTP Email, Auth Secrets & Vercel Deployment

**Document Version:** 2.0.0  
**Target:** Production-Grade Cloud Reliability  
**Author:** Lead Full-Stack Engineering Team  

---

### Table of Contents
1. [Required Action Items from the User](#1-required-action-items-from-the-user)
2. [Requirement 1: MongoDB Atlas Configuration (Critical)](#2-requirement-1-mongodb-atlas-configuration-critical)
   - [Step 1.1: Whitelist Vercel IP Range (`0.0.0.0/0`)](#step-11-whitelist-vercel-ip-range-00000)
   - [Step 1.2: Verify Database User Permissions](#step-12-verify-database-user-permissions)
   - [Step 1.3: Connection String Reference](#step-13-connection-string-reference)
3. [Requirement 2: SMTP Email Service Configuration](#3-requirement-2-smtp-email-service-configuration)
   - [Option A: Gmail SMTP with App Passwords](#option-a-gmail-smtp-with-app-passwords)
   - [Option B: Brevo / SendGrid / Resend (Free Cloud Relays)](#option-b-brevo--sendgrid--resend-free-cloud-relays)
   - [Option C: Mailtrap (Dev Testing)](#option-c-mailtrap-dev-testing)
4. [Requirement 3: Authentication & Encryption Keys](#4-requirement-3-authentication--encryption-keys)
5. [Requirement 4: Vercel Environment Variables Deployment Checklist](#5-requirement-4-vercel-environment-variables-deployment-checklist)
6. [Connection Diagnostic Script](#6-connection-diagnostic-script)

---

### 1. Required Action Items from the User

To enable full permanent data saving across all devices and sessions, here is the exact checklist of what is needed from you:

| Category | Requirement | Priority | Action Needed by You |
| :--- | :--- | :--- | :--- |
| **MongoDB Atlas** | Whitelist `0.0.0.0/0` in Atlas Network Access | **CRITICAL (Blocker)** | Log into [MongoDB Atlas](https://cloud.mongodb.com) $\to$ **Network Access** $\to$ **Add IP Address** $\to$ Select **Allow Access from Anywhere** (`0.0.0.0/0`). |
| **Vercel** | Add Environment Variables in Vercel Dashboard | **CRITICAL (Blocker)** | Copy `MONGODB_URI` and `AUTH_SECRET` into Vercel $\to$ **Project Settings** $\to$ **Environment Variables**. |
| **SMTP (Email)** | Provide SMTP credentials for password reset emails | **RECOMMENDED** | Supply Gmail App Password or Brevo/SendGrid SMTP credentials (if you want real emails delivered to your inbox). |
| **Admin Key** | Set `ADMIN_SETUP_KEY` | **OPTIONAL** | Define a master secret key (e.g. `glucocare-admin-2026`) to register admin accounts on demand. |

---

### 2. Requirement 1: MongoDB Atlas Configuration (Critical)

#### Step 1.1: Whitelist Vercel IP Range (`0.0.0.0/0`)
When we tested your Atlas cluster (`cluster0.4d2b2ng.mongodb.net`), the connection failed with:
> `Could not connect to any servers in your MongoDB Atlas cluster. One common reason is that you're trying to access the database from an IP that isn't whitelisted.`

Because **Vercel runs on AWS Lambda dynamic serverless IPs**, Vercel changes IP addresses on every request. **You must allow access from anywhere in Atlas**:

1. Log into your [MongoDB Atlas Console](https://cloud.mongodb.com/).
2. In the left navigation menu, under **Security**, click **Network Access**.
3. Click the green **+ Add IP Address** button.
4. Click **ALLOW ACCESS FROM ANYWHERE** (this enters `0.0.0.0/0`).
5. (Optional) In the comment field, enter: `Vercel Serverless & Production App`.
6. Click **Confirm**. Wait ~60 seconds for Atlas to apply the status to *"Active"*.

> **Security Note:** Your database remains protected by your strong username and password credentials (`aadityagautam06_db_user`). `0.0.0.0/0` is the standard industry requirement for all serverless Next.js deployments on Vercel.

#### Step 1.2: Verify Database User Permissions
1. Under **Security**, click **Database Access**.
2. Locate user `aadityagautam06_db_user`.
3. Ensure their privileges are set to:
   - `Read and write to any database` **OR**
   - Specific database privileges: `readWrite` on `glucocare`.

#### Step 1.3: Connection String Reference
Your configured connection string:
```env
MONGODB_URI=mongodb+srv://aadityagautam06_db_user:qGLl6xPuSgGAoqHa@cluster0.4d2b2ng.mongodb.net/glucocare?retryWrites=true&w=majority
```

---

### 3. Requirement 2: SMTP Email Service Configuration

If you want the "Forgot Password" feature to send actual emails to your Gmail/Outlook inbox with the 6-digit reset code, configure one of the following SMTP options:

#### Option A: Gmail SMTP with App Passwords (Easiest for Personal Setup)
1. Go to your [Google Account Security Settings](https://myaccount.google.com/security).
2. Enable **2-Step Verification** (if not already enabled).
3. Search for **"App passwords"** in the top search bar.
4. Enter an App name: `GlucoCare App` and click **Create**.
5. Google will display a 16-character code (e.g., `abcd efgh ijkl mnop`).
6. Set your environment variables:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-actual-email@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_FROM="GlucoCare Health Support" <your-actual-email@gmail.com>
```

#### Option B: Brevo / SendGrid / Resend (Free Cloud Relays)
For high deliverability without using personal Gmail:
```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-brevo-login-email
SMTP_PASS=your-brevo-smtp-key
SMTP_FROM="GlucoCare Support" <notifications@glucocare.health>
```

> **Fallback Mode:** If SMTP credentials are not provided, GlucoCare generates an automated **Ethereal test inbox**. The system outputs a clickable preview URL in the server logs so testing is never blocked.

---

### 4. Requirement 3: Authentication & Encryption Keys

The following cryptographic secrets secure your user sessions and passwords:

1. **`AUTH_SECRET`** (Pre-generated 256-bit Hex Key):
   ```env
   AUTH_SECRET=9a5dfaed7c90e23b0375a5ab3cd38bd6d5826805dccb1e98633432033f1ea076
   ```
   *Purpose:* Signs and verifies the 30-day `glucocare_session` JWT cookie with HS256 encryption.

2. **`ADMIN_SETUP_KEY`** (Master Admin Provisioning Key):
   ```env
   ADMIN_SETUP_KEY=glucocare-master-admin-2026
   ```
   *Purpose:* Allows creating an Administrator account from the `/register` page by typing this key into the "Admin Setup Key (Optional)" field.

---

### 5. Requirement 4: Vercel Environment Variables Deployment Checklist

To ensure your Vercel deployment persists all data to MongoDB Atlas, add these variables in your Vercel project settings:

1. Open your project on [Vercel](https://vercel.com/dashboard).
2. Go to **Settings** $\to$ **Environment Variables**.
3. Add the following key-value pairs (select **Production**, **Preview**, and **Development** for each):

| Variable Name | Example / Configured Value | Description |
| :--- | :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://aadityagautam06_db_user:qGLl6xPuSgGAoqHa@cluster0.4d2b2ng.mongodb.net/glucocare?retryWrites=true&w=majority` | MongoDB Atlas Cloud Connection String |
| `AUTH_SECRET` | `9a5dfaed7c90e23b0375a5ab3cd38bd6d5826805dccb1e98633432033f1ea076` | JWT Session Secret |
| `ADMIN_SETUP_KEY` | `glucocare-master-admin-2026` | Master Key to register Admin accounts |
| `NEXT_PUBLIC_APP_URL` | `https://your-vercel-domain.vercel.app` | Base Production Application Domain |
| `SMTP_HOST` | *(Optional: smtp.gmail.com)* | Outbound Email Server Host |
| `SMTP_PORT` | `587` | Outbound Email Server Port |
| `SMTP_USER` | *(Optional: your-email@gmail.com)* | Outbound Email Username |
| `SMTP_PASS` | *(Optional: 16-char app password)* | Outbound Email Password |
| `SMTP_FROM` | `"GlucoCare Support" <your-email@gmail.com>` | Display sender name and email |

4. After saving, trigger a **Redeploy** on Vercel so the environment variables take effect.

---

### 6. Connection Diagnostic Script

To verify that your MongoDB Atlas cluster is accessible and ready to save data, run this command in your project directory:

```bash
node -e "
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI || 'mongodb+srv://aadityagautam06_db_user:qGLl6xPuSgGAoqHa@cluster0.4d2b2ng.mongodb.net/glucocare?retryWrites=true&w=majority';
console.log('Connecting to MongoDB Atlas...');
mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => { console.log('✅ SUCCESS: MongoDB Atlas is connected and fully operational!'); process.exit(0); })
  .catch(err => { console.error('❌ FAILED:', err.message); process.exit(1); });
"
```
