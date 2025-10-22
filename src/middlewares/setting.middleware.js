const Setting = require("../models/Setting.model");

module.exports = async (req, res, next) => {
  try {
    const settings = await Setting.findOne({
      configIdentifier: "main_settings",
    });
    res.locals.settings = settings || {}; // يبقى متاح في كل EJS
  } catch (err) {
    console.error("Error loading global settings:", err);
    res.locals.settings = {};
  }
  next();
};
