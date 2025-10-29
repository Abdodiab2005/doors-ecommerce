const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { faker } = require('@faker-js/faker');
const connectDB = require('../src/config/db');
const Product = require('../src/models/Product.model');
const slugify = require('slugify');

dotenv.config();

function makeSlug(name, suffix = '') {
  const hasHebrew = /[\u0590-\u05FF]/.test(name);

  let base = slugify(name, {
    lower: true,
    strict: true,
    locale: 'he',
    remove: /[*+~.()'"!:@]/g,
  });

  // لو كان الاسم بالعبرية والناتج فقدها، أو طلع قصير جدًا
  if ((hasHebrew && !/[\u0590-\u05FF]/.test(base)) || base.length < 2) {
    base = name
      .trim()
      .replace(/\s+/g, '-') // استبدل المسافات بـ -
      .replace(/[^\u0590-\u05FFa-zA-Z0-9-]/g, ''); // اسمح بالعبرية + اللاتيني
  }

  return suffix ? `${base}-${suffix}` : base;
}

function createRandomProduct() {
  const nameEn = faker.commerce.productName() + ' Door';
  const nameHe = 'דלת ' + faker.commerce.productAdjective();
  const descEn = faker.commerce.productDescription();
  const descHe = 'תיאור דלת: ' + faker.commerce.productMaterial();

  const randomSuffix = faker.string.alphanumeric(6).toLowerCase();

  const slugEn =
    slugify(nameEn, { lower: true, strict: true }) + '-' + randomSuffix;
  const slugHe = makeSlug(nameHe, randomSuffix);

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
          category: 'interiors',
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
        category: 'furniture',
        width: 1280,
        height: 720,
      })
    );
  }

  return {
    name: { en: nameEn, he: nameHe },
    slug: { en: slugEn, he: slugHe },

    description: { en: descEn, he: descHe },
    price: faker.number.float({ min: 1500, max: 10000, precision: 0.01 }),
    category: faker.helpers.arrayElement(['inner', 'main']),
    stock: faker.number.int({ min: 10, max: 150 }),
    images,
    colors,
  };
}

const seedDB = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected.');

    console.log('Deleting existing products...');
    await Product.deleteMany({});
    console.log('Products deleted.');

    console.log('Generating 50 new products...');
    const productsToSeed = Array.from({ length: 50 }, () =>
      createRandomProduct()
    );

    console.log('Inserting products into database...');
    await Product.insertMany(productsToSeed);
    console.log('✅ Database seeded successfully with 50 products!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit();
  }
};

seedDB();
