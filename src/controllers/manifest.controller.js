// src/controllers/manifest.controller.js
const Settings = require('../models/Setting.model');

exports.getManifest = async (req, res, next) => {
  try {
    const settings = await Settings.findOne();
    const lang = req.lang || 'en';

    const manifest = {
      name: settings?.siteName?.[lang] || 'Door Shop',
      short_name: settings?.siteName?.[lang] || 'Door Shop',
      description: settings?.meta?.description?.[lang] || '',
      start_url: '/',
      display: 'standalone',
      background_color: '#DED9D3',
      theme_color: '#000000',
      icons: [
        {
          src: settings?.assets?.icon192 || '/images/logo/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: settings?.assets?.icon512 || '/images/logo/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    };

    res.json(manifest);
  } catch (err) {
    next(err);
  }
};
