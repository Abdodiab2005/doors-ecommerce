const mongoose = require('mongoose');
const slugify = require('slugify');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true, trim: true },
      he: { type: String, required: true, trim: true },
    },
    description: {
      en: { type: String, required: true, trim: true },
      he: { type: String, required: true, trim: true },
    },
    slug: {
      en: { type: String, unique: true, trim: true },
      he: { type: String, unique: true, trim: true },
    },

    category: {
      type: String,
      enum: ['inner', 'main'],
      required: true,
    },

    // for admin only
    stock: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },

    // images
    images: {
      type: [String],
      required: true,
    },
    thumbnail: {
      type: String,
    },
    colors: [
      {
        name: { type: String, required: true },
        hex: { type: String, required: true },
        images: { type: [String], default: [] },
      },
    ],
  },
  { timestamps: true }
);

ProductSchema.pre('save', async function (next) {
  if (this.slug?.en && this.slug?.he) return next();
  if (!this.isModified('name')) return next();

  const slugify = require('slugify');

  for (const lang of ['en', 'he']) {
    let baseSlug = slugify(this.name[lang], { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await mongoose.models.Product.exists({ [`slug.${lang}`]: slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    if (!this.slug) this.slug = {};
    this.slug[lang] = slug;
  }

  next();
});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
