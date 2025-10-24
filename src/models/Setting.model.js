const mongoose = require("mongoose");

const SettingSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: "Leviro" },
    email: { type: String, default: "info@yourdomain.com" },
    phone: { type: String, default: "+201234567890" },
    whatsapp: { type: String }, // optional
    social: {
      facebook: { type: String },
      instagram: { type: String },
      tiktok: { type: String },
      twitter: { type: String },
    },
    assets: {
      logo: { type: String }, // path/url
      favicon: { type: String },
      slider: [{ type: String }], // array of image paths
      innerDoorsImage: { type: String },
      outerDoorsImage: { type: String },
    },
    meta: {
      title: { type: String },
      description: { type: String },
    },
  },
  { collection: "settings", timestamps: true }
);

module.exports = mongoose.model("Setting", SettingSchema);
