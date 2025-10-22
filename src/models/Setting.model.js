const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema(
  {
    configIdentifier: {
      type: String,
      default: "main_settings",
      unique: true,
      index: true,
    },
    logo: {
      type: String,
      required: true,
      default: "/images/logo-default.png",
    },
    favicon: {
      type: String,
      required: true,
      default: "/images/favicon.ico",
    },
    contactEmail: {
      type: String,
      required: true,
      default: "info@doorshop.com",
    },
    phoneNumber: {
      type: String,
      required: true,
      default: "+02123456789",
    },
    whatsappNumber: {
      type: String,
      required: true,
      default: "+02123456789",
    },

    socialMedia: {
      facebook: { type: String, default: "https://facebook.com" },
      instagram: { type: String, default: "https://instagram.com" },
      x_twitter: { type: String, default: "https://x.com" },
      linkedin: { type: String, default: "https://linkedin.com" },
    },
  },
  { timestamps: true }
);

const Settings = mongoose.model("Settings", SettingsSchema);

module.exports = Settings;
