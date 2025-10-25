const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("../src/config/db"); // [!!] اتأكد إن المسار صح
const Settings = require("../src/models/Setting.model"); // [!!] اتأكد إن المسار صح

dotenv.config();

// [!!] الداتا الافتراضية (مطابقة للـ Schema بالظبط)
const defaultSettings = {
  // الحقول الأساسية (مطابقة للـ Schema)
  siteName: "DoorShop", // بدلاً من "Leviro" الافتراضي
  email: "info@doorshop.com",
  phone: "+02 123 456 7890",
  whatsapp: "+02 123 456 7890",

  // الحقول المتشعبة (Nested)
  social: {
    facebook: "https://facebook.com/doorshop",
    instagram: "https://instagram.com/doorshop",
    twitter: "https://x.com/doorshop", // مطابق للـ Schema
    // tiktok هياخد القيمة الافتراضية (null/undefined)
  },
  assets: {
    logo: "/images/logo.jpg",
    favicon: "/images/favicon.ico",
    // 'slider', 'innerDoorsImage', 'outerDoorsImage' هياخدوا الافتراضي
  },
  meta: {
    title: "DoorShop - Quality Doors",
    description: "Find the best doors for your home.",
  },
};

const seedSettings = async () => {
  try {
    console.log("Connecting to database...");
    await connectDB();
    console.log("Database connected.");

    console.log("Seeding/Updating default settings...");

    // [!!] هنا التعديل
    // 1. استخدمنا query فاضي {} عشان نضمن إنه مستند واحد
    // 2. استخدمنا الكائن defaultSettings الصحيح
    await Settings.findOneAndUpdate(
      {}, // Query: ابحث عن أول مستند (الوحيد)
      defaultSettings, // Data: استخدم الداتا المطابقة للـ Schema
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
