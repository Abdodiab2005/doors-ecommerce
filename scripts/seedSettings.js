const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("../src/config/db"); // [!!] اتأكد إن المسار صح
// [!!] استخدم اسم الموديل الجديد
const Settings = require("../src/models/Setting.model");

dotenv.config();

// [!!] الداتا الافتراضية (مطابقة للموديل الجديد)
const defaultSettings = {
  configIdentifier: "main_settings", // [!!] المفتاح
  logo: "/images/logo.jpg",
  favicon: "/images/favicon.ico",
  contactEmail: "info@doorshop.com",
  phoneNumber: "+02 123 456 7890",
  whatsappNumber: "+02 123 456 7890",
  social: {
    facebook: "https://facebook.com/doorshop",
    instagram: "https://instagram.com/doorshop",
    x_twitter: "https://x.com/doorshop",
    linkedin: "https://linkedin.com/company/doorshop",
  },
};

const seedSettings = async () => {
  try {
    console.log("Connecting to database...");
    await connectDB();
    console.log("Database connected.");

    console.log("Seeding/Updating default settings...");

    // [!!] هنا الشغل
    // بنستخدم "upsert" عشان نضمن إنه صف واحد بس
    await Settings.findOneAndUpdate(
      { configIdentifier: "main_settings" }, // Query: دور بده
      defaultSettings, // Data: حط الداتا دي
      // Options: لو ملقتهوش اعمله، ورجع الجديد
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log("✅ Default settings have been created/updated!");
  } catch (error) {
    console.error("❌ Error seeding settings:", error);
  } finally {
    mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit();
  }
};

// تشغيل الـ Seeder
seedSettings();
