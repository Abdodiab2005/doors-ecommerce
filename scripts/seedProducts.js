const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { faker } = require("@faker-js/faker");
const connectDB = require("../src/config/db");
const Product = require("../src/models/Product.model");

dotenv.config();

function createRandomProduct() {
  const nameEn = faker.commerce.productName() + " Door";
  const nameHe = "דלת " + faker.commerce.productAdjective();
  const descEn = faker.commerce.productDescription();
  const descHe = "תיאור דלת: " + faker.commerce.productMaterial();

  // ألوان المنتج
  const colors = [];
  const colorCount = faker.number.int({ min: 1, max: 3 });
  for (let i = 0; i < colorCount; i++) {
    const colorName = faker.color.human();
    const colorHex = faker.color.rgb();
    const colorImages = [];
    const colorImgCount = faker.number.int({ min: 1, max: 2 });
    for (let j = 0; j < colorImgCount; j++) {
      colorImages.push(
        faker.image.url({
          category: "interiors",
          width: 640,
          height: 480,
        })
      );
    }
    colors.push({ name: colorName, hex: colorHex, images: colorImages });
  }

  // صور المنتج
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
    name: { en: nameEn, he: nameHe },
    description: { en: descEn, he: descHe },
    price: faker.number.float({ min: 1500, max: 10000, precision: 0.01 }),
    category: faker.helpers.arrayElement(["inner", "main"]),
    stock: faker.number.int({ min: 10, max: 150 }),
    images,
    colors,
  };
}

const seedDB = async () => {
  try {
    console.log("Connecting to database...");
    await connectDB();
    console.log("Database connected.");

    console.log("Deleting existing products...");
    await Product.deleteMany({});
    console.log("Products deleted.");

    console.log("Generating 50 new products...");
    const productsToSeed = Array.from({ length: 50 }, () =>
      createRandomProduct()
    );

    console.log("Inserting products into database...");
    await Product.insertMany(productsToSeed);
    console.log("✅ Database seeded successfully with 50 products!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit();
  }
};

seedDB();
