const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const Setting = require('../models/Setting.model');
const Admin = require('../models/Admin.model');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');
const { success } = require('../utils/response');
const _maybeDeleteFile = require('../utils/mayBeDelete');
const deepMerge = require('../utils/deepMerge');

const SETTINGS_ID_QUERY = {}; // we maintain single doc; can just use findOne

async function getSettingsPage(req, res, next) {
  try {
    let settings = await Setting.findOne(SETTINGS_ID_QUERY).lean();
    if (!settings) {
      settings = {}; // front-end will handle defaults
    }
    // if using EJS admin panel:
    return res.render('admin/settings', {
      layout: 'layout/admin',
      title: 'settings page',
      settings,
    });
  } catch (err) {
    logger.error(err);
    return next(new AppError('Server error', 500));
  }
}

async function apiGetSettings(req, res, next) {
  try {
    const settings = await Setting.findOne(SETTINGS_ID_QUERY).lean();
    return success(res, 'Settings fetched successfully', settings);
  } catch (err) {
    logger.error(err);
    return next(new AppError('Server error', 500));
  }
}

async function updateSettings(req, res, next) {
  try {
    const payload = req.body || {};
    const files = req.files || {};
    const currentDoc = await Setting.findOne(SETTINGS_ID_QUERY);
    const current = currentDoc ? currentDoc.toObject() : {};
    console.log('current', current);

    // === Handle social links ===
    payload.social = {
      facebook: payload.facebook || current.social?.facebook || '',
      instagram: payload.instagram || current.social?.instagram || '',
      tiktok: payload.tiktok || current.social?.tiktok || '',
      twitter: payload.twitter || current.social?.twitter || '',
    };

    delete payload.facebook;
    delete payload.instagram;
    delete payload.tiktok;
    delete payload.twitter;

    // === Handle siteName ===
    payload.siteName = {
      en: payload.siteName?.en || current.siteName?.en || '',
      he: payload.siteName?.he || current.siteName?.he || '',
    };

    // === Handle meta ===
    payload.meta = {
      description: {
        en: payload.metaDescription?.en || current.meta?.description?.en || '',
        he: payload.metaDescription?.he || current.meta?.description?.he || '',
      },
    };

    delete payload.metaDescription;

    // === Handle basic fields ===
    payload.email = payload.email || current.email || '';
    payload.phone = payload.phone || current.phone || '';
    payload.whatsapp = payload.whatsapp || current.whatsapp || '';

    // === File uploads ===
    payload.assets = { ...current.assets };

    const handleFile = (key, folder = 'images/other') => {
      console.log('key', key);
      if (files[key]?.[0]) {
        const uploadedFile = files[key][0];
        const targetFolder = path.join(process.cwd(), 'src/public', folder);

        // Create target directory if it doesn't exist
        if (!fs.existsSync(targetFolder))
          fs.mkdirSync(targetFolder, { recursive: true });

        // Move file from multer's upload location to target folder
        const oldPath = uploadedFile.path;
        const newFilePath = path.join(targetFolder, uploadedFile.filename);

        // Only move if source and destination are different
        if (oldPath !== newFilePath) {
          fs.renameSync(oldPath, newFilePath);
        }

        const newPath = `/${folder}/${uploadedFile.filename}`;
        console.log('New path: ', newPath);
        _maybeDeleteFile(current.assets?.[key]);
        payload.assets[key] = newPath;
      }
    };

    handleFile('logo', 'images/logo');
    handleFile('favicon', 'images/logo');
    handleFile('innerDoorsImage', 'images');
    handleFile('outerDoorsImage', 'images');
    handleFile('slider', 'images');

    // === auto-generate favicon & icons if logo uploaded ===
    if (files.logo?.[0]) {
      const logoFile = files.logo[0];
      const outputDir = path.join(process.cwd(), 'src/public/images/logo');

      if (!fs.existsSync(outputDir))
        fs.mkdirSync(outputDir, { recursive: true });

      const baseName = path.parse(logoFile.filename).name;
      const sizes = [192, 512, 32, 16];

      // Use the new path after the file has been moved by handleFile
      const movedLogoPath = path.join(outputDir, logoFile.filename);

      for (const size of sizes) {
        await sharp(movedLogoPath)
          .resize(size, size)
          .toFile(`${outputDir}/${baseName}-${size}x${size}.png`);
      }

      await sharp(movedLogoPath)
        .resize(64, 64)
        .toFile(`${outputDir}/favicon.ico`);

      // Save all generated icon paths
      payload.assets.favicon = `/images/logo/${baseName}-32x32.png`;
      payload.assets.icon192 = `/images/logo/${baseName}-192x192.png`;
      payload.assets.icon512 = `/images/logo/${baseName}-512x512.png`;
      payload.assets.icon16 = `/images/logo/${baseName}-16x16.png`;
    }

    // === merge manually and update ===
    const updatedData = {
      ...current,
      ...payload,
      social: { ...current.social, ...payload.social },
      meta: {
        title: { ...current.meta?.title, ...payload.meta?.title },
        description: {
          ...current.meta?.description,
          ...payload.meta?.description,
        },
      },
      siteName: { ...current.siteName, ...payload.siteName },
      assets: { ...current.assets, ...payload.assets },
    };

    console.log('updatedData', updatedData);

    const saved = await Setting.findOneAndUpdate(
      SETTINGS_ID_QUERY,
      { $set: updatedData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log('Saved data: ', saved);

    if (req.headers['content-type']?.includes('multipart/form-data')) {
      req.flash?.('success', 'Settings updated successfully');
      return res.redirect('/admin/settings');
    }

    return success(res, 'Settings updated successfully', saved);
  } catch (err) {
    logger.error(err);
    return next(new AppError('Server error', 500));
  }
}

async function resetToDefault(req, res, next) {
  try {
    // remove images (optional) and set to defaults
    const defaults = {
      siteName: 'Leviro',
      email: 'info@yourdomain.com',
      phone: '+201234567890',
      social: {},
      assets: {},
    };
    await Setting.findOneAndUpdate(SETTINGS_ID_QUERY, defaults, {
      upsert: true,
    });
    return success(res, 'Settings reset to default successfully');
  } catch (err) {
    logger.error(err);
    return next(new AppError('Server error', 500));
  }
}

// change admin password (assuming session admin exists)
async function changeAdminPassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!req.session?.admin?._id)
      return next(new AppError('Unauthorized', 401));

    const admin = await Admin.findById(req.session.admin._id);
    if (!admin) return next(new AppError('Admin not found', 404));

    const ok = await admin.comparePassword(currentPassword);
    if (!ok) return next(new AppError('Current password incorrect', 400));

    admin.password = newPassword;
    await admin.save();

    return success(res, 'Password changed successfully');
  } catch (err) {
    logger.error(err);
    return next(new AppError('Server error', 500));
  }
}

module.exports = {
  getSettingsPage,
  apiGetSettings,
  updateSettings,
  resetToDefault,
  changeAdminPassword,
};
