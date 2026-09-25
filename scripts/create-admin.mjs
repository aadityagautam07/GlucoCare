import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Read .env.local or .env
function loadEnv() {
  const envPaths = [".env.local", ".env"];
  for (const envPath of envPaths) {
    const fullPath = path.resolve(process.cwd(), envPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      content.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const [key, ...rest] = trimmed.split("=");
          if (key && rest.length > 0) {
            const val = rest.join("=").replace(/(^["']|["']$)/g, "");
            process.env[key.trim()] = val.trim();
          }
        }
      });
    }
  }
}

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI;

const DEFAULT_ADMIN_PERMISSIONS = {
  canLogGlucose: true,
  canManageMedications: true,
  canLogMeals: true,
  canManageRation: true,
  canLogActivity: true,
  canManageAppointments: true,
  canViewReports: true,
  canExportData: true,
};

async function main() {
  const args = process.argv.slice(2);
  const email = (args[0] || process.env.ADMIN_EMAIL || "admin@glucocare.com").trim().toLowerCase();
  const password = args[1] || process.env.ADMIN_PASSWORD || "Admin@123456";
  const name = args[2] || process.env.ADMIN_NAME || "System Administrator";

  console.log("==========================================");
  console.log(" 🛡️  GlucoCare Administrator Account Setup");
  console.log("==========================================\n");
  console.log(`Email:    ${email}`);
  console.log(`Name:     ${name}`);
  console.log(`Password: ${"*".repeat(password.length)}\n`);

  if (!MONGODB_URI) {
    console.warn("⚠️  MONGODB_URI not found in environment or .env.local.");
    console.log("Tip: Ensure your MongoDB Atlas connection string is configured in .env.local.\n");
  } else {
    try {
      console.log("Connecting to MongoDB Atlas...");
      await mongoose.connect(MONGODB_URI);
      console.log("✓ Connected to MongoDB successfully.\n");

      const db = mongoose.connection.db;
      const usersCollection = db.collection("users");

      const existing = await usersCollection.findOne({ email });
      const passwordHash = await bcrypt.hash(password, 10);

      if (existing) {
        console.log(`Found existing user with email ${email}. Promoting to Administrator...`);
        await usersCollection.updateOne(
          { email },
          {
            $set: {
              role: "admin",
              status: "active",
              permissions: DEFAULT_ADMIN_PERMISSIONS,
              name: name || existing.name,
              passwordHash,
              updatedAt: new Date().toISOString(),
            },
          }
        );
        console.log(`\n🎉 User ${email} has been promoted to Administrator with full master rights!`);
      } else {
        console.log(`Creating new Administrator account for ${email}...`);
        const newAdminDoc = {
          id: "admin-" + Date.now(),
          name,
          email,
          role: "admin",
          status: "active",
          permissions: DEFAULT_ADMIN_PERMISSIONS,
          passwordHash,
          diabetesType: "Other",
          glucoseUnit: "mg/dL",
          targetRange: {
            fastingMin: 70,
            fastingMax: 130,
            postMealMax: 180,
          },
          notifications: {
            medicationReminders: true,
            glucoseReminders: true,
            appointmentReminders: true,
          },
          createdAt: new Date().toISOString(),
        };

        await usersCollection.insertOne(newAdminDoc);
        console.log(`\n🎉 Administrator account created successfully for ${email}!`);
      }

      await mongoose.disconnect();
    } catch (err) {
      console.warn("MongoDB Atlas Notice:", err.message);
    }
  }

  // Also persist to lib/admin-store.json for local/offline execution
  try {
    const adminStorePath = path.resolve(process.cwd(), "lib/admin-store.json");
    let localAdmins = [];
    if (fs.existsSync(adminStorePath)) {
      try {
        localAdmins = JSON.parse(fs.readFileSync(adminStorePath, "utf-8"));
      } catch {
        localAdmins = [];
      }
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const existingIndex = localAdmins.findIndex((a) => a.email.toLowerCase() === email);
    const adminRecord = {
      id: "admin-" + Date.now(),
      name,
      email,
      role: "admin",
      status: "active",
      permissions: DEFAULT_ADMIN_PERMISSIONS,
      passwordHash,
      diabetesType: "Other",
      glucoseUnit: "mg/dL",
      targetRange: {
        fastingMin: 70,
        fastingMax: 130,
        postMealMax: 180,
      },
      notifications: {
        medicationReminders: true,
        glucoseReminders: true,
        appointmentReminders: true,
      },
      createdAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      localAdmins[existingIndex] = { ...localAdmins[existingIndex], ...adminRecord };
    } else {
      localAdmins.push(adminRecord);
    }

    fs.writeFileSync(adminStorePath, JSON.stringify(localAdmins, null, 2));
    console.log("✓ Synchronized Administrator into local store (lib/admin-store.json)");
  } catch (e) {
    console.warn("Local admin sync notice:", e.message);
  }


  console.log("\n------------------------------------------");
  console.log("How to log in as Administrator:");
  console.log("1. Start app:     npm run dev");
  console.log("2. Open:          http://localhost:3000/login");
  console.log(`3. Credentials:   Email: ${email} | Password: ${password}`);
  console.log("4. Direct Portal: http://localhost:3000/admin");
  console.log("------------------------------------------\n");
}

main().catch(console.error);
