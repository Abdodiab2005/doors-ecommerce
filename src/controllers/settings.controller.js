const Setting = require('../models/Setting.model');
const Admin = require('../models/Admin.model');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');
const { success } = require('../utils/response');
const _maybeDeleteFile = require('../utils/mayBeDelete');

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
    const current =
      (await Setting.findOne(SETTINGS_ID_QUERY))?.toObject() || {};

    // convert flat form fields to proper structure
    if (
      payload.facebook ||
      payload.instagram ||
      payload.tiktok ||
      payload.twitter
    ) {
      payload.social = {
        facebook: payload.facebook,
        instagram: payload.instagram,
        tiktok: payload.tiktok,
        twitter: payload.twitter,
      };
      delete payload.facebook;
      delete payload.instagram;
      delete payload.tiktok;
      delete payload.twitter;
    }

    if (payload.metaDescription) {
      payload.meta = {
        description: payload.metaDescription,
      };
      delete payload.metaDescription;
    }

    // handle file uploads
    payload.assets = { ...current.assets };
    const handleFile = (key, folder = 'images') => {
      if (files[key]?.[0]) {
        const newPath = `/${folder}/${files[key][0].filename}`;
        _maybeDeleteFile(current.assets?.[key]);
        payload.assets[key] = newPath;
      }
    };

    handleFile('logo');
    handleFile('favicon');
    handleFile('innerDoorsImage');
    handleFile('outerDoorsImage');
    handleFile('slider');

    // deep merge to preserve old fields
    function deepMerge(target, source) {
      for (const key in source) {
        if (
          source[key] &&
          typeof source[key] === 'object' &&
          !Array.isArray(source[key])
        ) {
          target[key] = deepMerge(target[key] || {}, source[key]);
        } else if (source[key] !== undefined && source[key] !== '') {
          target[key] = source[key];
        }
      }
      return target;
    }

    const updatedData = deepMerge(current, payload);

    const saved = await Setting.findOneAndUpdate(
      SETTINGS_ID_QUERY,
      updatedData,
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

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
