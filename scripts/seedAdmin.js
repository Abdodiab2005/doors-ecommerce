const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("../src/config/db"); // [!!] اتأكد إن المسار صح
// [!!] استخدم اسم الموديل الجديد
const Admin = require("../src/models/Admin.model");

dotenv.config();

// [!!] الداتا الافتراضية (مطابقة للموديل الجديد)
const AdminData = {
  username: process.env.ADMIN_USERNAME || "admin",
  password: process.env.ADMIN_PASSWORD || "Pass@123",
};

const seedAdmin = async () => {
  try {
    console.log("Connecting to database...");
    await connectDB();
    console.log("Database connected.");

    console.log("Seeding/Updating default Admin...");

    let admin = await Admin.findOne({ username: AdminData.username });

    if (admin) {
      // نحذف القديم وننشئ من جديد لضمان التشفير النضيف
      await Admin.deleteMany({});
    }

    await Admin.create(AdminData);

    console.log("✅ Default Admin have been created/updated!");
  } catch (error) {
    console.error("❌ Error seeding Admin:", error);
  } finally {
    mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit();
  }
};

// تشغيل الـ Seeder
seedAdmin();
