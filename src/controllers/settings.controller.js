const Setting = require("../models/Setting.model");
const Admin = require("../models/Admin.model");
const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");
const AppError = require("../utils/AppError");
const { success } = require("../utils/response");

const SETTINGS_ID_QUERY = {}; // we maintain single doc; can just use findOne

async function getSettingsPage(req, res, next) {
  try {
    let settings = await Setting.findOne(SETTINGS_ID_QUERY).lean();
    if (!settings) {
      settings = {}; // front-end will handle defaults
    }
    // if using EJS admin panel:
    return res.render("admin/settings", {
      layout: "layout/admin",
      title: "settings page",
      settings,
    });
  } catch (err) {
    logger.error(err);
    return next(new AppError("Server error", 500));
  }
}

async function apiGetSettings(req, res, next) {
  try {
    const settings = await Setting.findOne(SETTINGS_ID_QUERY).lean();
    return success(res, "Settings fetched successfully", settings);
  } catch (err) {
    logger.error(err);
    return next(new AppError("Server error", 500));
  }
}

/**
 * Update settings (text fields + file uploads)
 * expects multipart/form-data
 * files keys: logo, favicon, innerDoorsImage, outerDoorsImage, slider (array)
 */
async function updateSettings(req, res, next) {
  try {
    const payload = req.body || {};
    const files = req.files || {};

    const update = {
      siteName: payload.siteName,
      email: payload.email,
      phone: payload.phone,
      whatsapp: payload.whatsapp,
      social: {
        facebook: payload.facebook,
        instagram: payload.instagram,
        tiktok: payload.tiktok,
        twitter: payload.twitter,
      },
      baseUrl: payload.baseUrl,
      meta: {
        title: payload.metaTitle,
        description: payload.metaDescription,
      },
    };

    // merge existing assets if present
    const current = await Setting.findOne(SETTINGS_ID_QUERY);
    update.assets = current?.assets ? { ...current.assets } : {};

    // handle files
    if (files.logo && files.logo[0]) {
      update.assets.logo = `/images/settings/${files.logo[0].filename}`;
      // optionally delete old file
      _maybeDeleteFile(current?.assets?.logo);
    }
    if (files.favicon && files.favicon[0]) {
      update.assets.favicon = `/images/settings/${files.favicon[0].filename}`;
      _maybeDeleteFile(current?.assets?.favicon);
    }
    if (files.innerDoorsImage && files.innerDoorsImage[0]) {
      update.assets.innerDoorsImage = `/images/settings/${files.innerDoorsImage[0].filename}`;
      _maybeDeleteFile(current?.assets?.innerDoorsImage);
    }
    if (files.outerDoorsImage && files.outerDoorsImage[0]) {
      update.assets.outerDoorsImage = `/images/settings/${files.outerDoorsImage[0].filename}`;
      _maybeDeleteFile(current?.assets?.outerDoorsImage);
    }
    if (files.slider && Array.isArray(files.slider)) {
      // replace slider array (optional: append instead)
      update.assets.slider = files.slider.map(
        (f) => `/images/settings/${f.filename}`
      );
      // optionally delete old sliders
      if (current?.assets?.slider && Array.isArray(current.assets.slider)) {
        current.assets.slider.forEach((p) => _maybeDeleteFile(p));
      }
    }

    const opts = { upsert: true, new: true, setDefaultsOnInsert: true };
    const saved = await Setting.findOneAndUpdate(
      SETTINGS_ID_QUERY,
      update,
      opts
    );

    // if request from EJS form:
    if (
      req.headers["content-type"] &&
      req.headers["content-type"].includes("multipart/form-data")
    ) {
      req.flash?.("success", "Settings updated");
      return res.redirect("/admin/settings");
    }

    return success(res, "Settings updated successfully", saved);
  } catch (err) {
    logger.error(err);
    return next(new AppError("Server error", 500));
  }
}

async function resetToDefault(req, res, next) {
  try {
    // remove images (optional) and set to defaults
    const defaults = {
      siteName: "Leviro",
      email: "info@yourdomain.com",
      phone: "+201234567890",
      social: {},
      assets: {},
    };
    await Setting.findOneAndUpdate(SETTINGS_ID_QUERY, defaults, {
      upsert: true,
    });
    return success(res, "Settings reset to default successfully");
  } catch (err) {
    logger.error(err);
    return next(new AppError("Server error", 500));
  }
}

// change admin password (assuming session admin exists)
async function changeAdminPassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!req.session?.admin?._id)
      return next(new AppError("Unauthorized", 401));

    const admin = await Admin.findById(req.session.admin._id);
    if (!admin) return next(new AppError("Admin not found", 404));

    const ok = await admin.comparePassword(currentPassword);
    if (!ok) return next(new AppError("Current password incorrect", 400));

    admin.password = newPassword;
    await admin.save();

    return success(res, "Password changed successfully");
  } catch (err) {
    logger.error(err);
    return next(new AppError("Server error", 500));
  }
}

/* helper to delete old local files - accepts path like /images/settings/xxx.jpg */
function _maybeDeleteFile(relativePath) {
  try {
    if (!relativePath) return;
    const p = path.join(
      process.cwd(), // <-- أكثر أماناً
      "public",
      relativePath.replace(/^\//, "")
    );
    if (fs.existsSync(p)) fs.unlinkSync(p);
  } catch (err) {
    logger.warn("Failed to delete file", err.message);
  }
}

module.exports = {
  getSettingsPage,
  apiGetSettings,
  updateSettings,
  resetToDefault,
  changeAdminPassword,
};
