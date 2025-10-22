const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { faker } = require("@faker-js/faker");
const connectDB = require("../src/config/db"); // [!!] اتأكد إن ده المسار الصح لملف db.js
const Product = require("../src/models/Product.model"); // [!!] اتأكد إن ده المسار الصح للموديل

// تحميل متغيرات البيئة
dotenv.config();

/**
 * فانكشن بتولد منتج واحد عشوائي
 */
function createRandomProduct() {
  const productName = faker.commerce.productName() + " Door";

  // توليد ألوان عشوائية (من 1 لـ 3 ألوان)
  const colors = [];
  const colorCount = faker.number.int({ min: 1, max: 3 });
  for (let i = 0; i < colorCount; i++) {
    colors.push({
      name: faker.color.human(),
      hex: faker.color.rgb(),
      image: faker.image.url({
        category: "interiors",
        width: 640,
        height: 480,
      }),
    });
  }

  // توليد صور عشوائية (من 2 لـ 4 صور)
  const images = [];
  const imageCount = faker.number.int({ min: 2, max: 4 });
  for (let i = 0; i < imageCount; i++) {
    images.push(
      faker.image.url({
        category: "furniture",
        width: 1280,
        height: 720,
      })
    );
  }

  return {
    name: productName,
    description: faker.commerce.productDescription(),
    price: faker.number.float({ min: 1500, max: 10000, precision: 0.01 }),
    category: faker.helpers.arrayElement(["inner", "main"]), // بيختار واحدة من الـ enum
    stock: faker.number.int({ min: 10, max: 150 }),
    images: images,
    colors: colors,
  };
}

/**
 * الفانكشن الرئيسية للـ Seeder
 */
const seedDB = async () => {
  try {
    console.log("Connecting to database...");
    await connectDB();
    console.log("Database connected.");

    // 1. مسح كل المنتجات القديمة
    console.log("Deleting existing products...");
    await Product.deleteMany({});
    console.log("Products deleted.");

    // 2. توليد 50 منتج جديد
    console.log("Generating 50 new products...");
    const productsToSeed = [];
    for (let i = 0; i < 50; i++) {
      productsToSeed.push(createRandomProduct());
    }

    // 3. إضافة المنتجات الجديدة للداتابيز
    console.log("Inserting products into database...");
    await Product.insertMany(productsToSeed);
    console.log("✅ Database seeded successfully with 50 products!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    // 4. قفل الاتصال
    mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit();
  }
};

// تشغيل الـ Seeder
seedDB();
