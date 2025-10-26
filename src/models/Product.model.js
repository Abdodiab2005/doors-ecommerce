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

    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ["inner", "main"],
      required: true,
    },

    stock: {
      type: Number,
      default: 0,
    },

    images: {
      type: [String],
      required: true,
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
