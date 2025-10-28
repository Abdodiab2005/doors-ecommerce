const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("../src/config/db");
const Setting = require("../src/models/Setting.model");

dotenv.config();

const defaultSettings = {
  siteName: {
    en: "DoorShop",
    he: "דורשופ",
  },
  email: "khalil.nawas143@gmail.com",
  phone: "0528800701",
  whatsapp: "+972528800701",
  social: {
    facebook: "https://facebook.com/doorshop",
    instagram: "https://instagram.com/doorshop",
    twitter: "https://x.com/doorshop",
    tiktok: "https://tiktok.com/@doorshop",
  },
  assets: {
    logo: "/images/logo.png",
    favicon: "/images/favicon.ico",
    slider: "/images/hero.jpg",
    innerDoorsImage: "/images/inner.jpg",
    outerDoorsImage: "/images/outdoor.jpeg",
  },
  meta: {
    title: {
      en: "DoorShop - Quality Doors",
      he: "דורשופ - דלתות איכות",
    },
    description: {
      en: "Find the best doors for your home.",
      he: "מצא את הדלתות הטובות ביותר לבית שלך.",
    },
    keyword: {
      en: "Doors, E-commerce shop, Doors shop, Doors store",
      he: "דלתות, חנות, חנות דלתות, חנות דלתות",
    },
    author: {
      en: "DoorShop",
      he: "דורשופ",
    },
  },
};

const seedSettings = async () => {
  try {
    console.log("Connecting to database...");
    await connectDB();
    console.log("Database connected.");

    console.log("Seeding/Updating default settings...");
    await Setting.findOneAndUpdate({}, defaultSettings, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });

    console.log("✅ Default settings have been created/updated!");
  } catch (error) {
    console.error("❌ Error seeding settings:", error);
  } finally {
    mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit();
  }
};

seedSettings();
