// src/controllers/manifest.controller.js
const Settings = require('../models/Setting.model');

exports.getManifest = async (req, res, next) => {
  try {
    const settings = await Settings.findOne();

    const manifest = {
      name: settings?.siteName?.en,
      short_name: settings?.siteName?.en,
      description: settings?.meta?.description?.en,
      start_url: '/',
      display: 'standalone',
      background_color: '#DED9D3',
      theme_color: '#000000',
      icons: [
        {
          src: `/images/logo/${settings?.assets?.logo}-192x192.png`,
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: `/images/logo/${settings?.assets?.logo}-512x512.png`,
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
