const mongoose = require("mongoose");

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
    category: {
      type: String,
      enum: ["inner", "main"],
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

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
