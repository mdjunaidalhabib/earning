/**
 * Run with: npm run seed
 *
 * Creates a default admin account from DEFAULT_ADMIN_EMAIL /
 * DEFAULT_ADMIN_PASSWORD in .env, if one doesn't already exist. Safe to
 * run multiple times — it will skip creation if the admin already exists,
 * and will not downgrade an existing admin.
 */
const connectDB = require("../config/db");
const env = require("../config/env");
const User = require("../models/User");

async function seedAdmin() {
  if (!env.DEFAULT_ADMIN_EMAIL || !env.DEFAULT_ADMIN_PASSWORD) {
    console.error(
      "❌ DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD must be set in .env to run the seeder."
    );
    process.exit(1);
  }

  await connectDB();

  const existingAdmin = await User.findOne({ email: env.DEFAULT_ADMIN_EMAIL });

  if (existingAdmin) {
    console.log(`ℹ️  Admin account already exists: ${env.DEFAULT_ADMIN_EMAIL}`);
    console.log(`   Current role: ${existingAdmin.role}`);
    process.exit(0);
  }

  const admin = await User.create({
    name: "Platform Admin",
    email: env.DEFAULT_ADMIN_EMAIL,
    password: env.DEFAULT_ADMIN_PASSWORD,
    role: "admin",
    isVerified: true,
    isActive: true,
  });

  console.log("✅ Default admin account created successfully:");
  console.log(`   Email:    ${admin.email}`);
  console.log(`   Password: ${env.DEFAULT_ADMIN_PASSWORD}`);
  console.log("   ⚠️  Log in and change this password immediately.");

  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("❌ Seeding failed:", err.message);
  process.exit(1);
});
