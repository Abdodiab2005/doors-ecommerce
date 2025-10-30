const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema(
  {
    siteName: {
      en: String,
      he: String,
    },
    email: { type: String, default: 'info@yourdomain.com' },
    phone: { type: String, default: '+201234567890' },
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
      slider: { type: String }, // array of image paths
      innerDoorsImage: { type: String, default: '/images/inner.jpg' },
      outerDoorsImage: { type: String, default: '/images/outer.jpg' },
      icon16: { type: String },
      icon192: { type: String },
      icon512: { type: String },
    },
    meta: {
      description: {
        en: String,
        he: String,
      },
      keywords: { en: { type: String }, he: { type: String } },
      author: { en: { type: String }, he: { type: String } },
    },
  },
  { collection: 'settings', timestamps: true }
);

module.exports = mongoose.model('Setting', SettingSchema);
