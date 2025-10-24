const Product = require("../models/Product.model");
const Settings = require("../models/Setting.model");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");

exports.renderLoginPage = (req, res) => {
  try {
    res.render("admin/login", {
      title: "Admin Login",
      layout: "layout/auth",
    });
  } catch (error) {
    logger.error("Error rendering login page:", error);
    new AppError("Error rendering login page", 500);
  }
};

exports.renderDashboardPage = async (req, res) => {
  try {
    const stats = {
      totalProducts: await Product.countDocuments(),
      innerCount: await Product.countDocuments({ type: "inner" }),
      mainCount: await Product.countDocuments({ type: "main" }),
      settingsUpdatedAt: await Settings.findOne().sort({ updatedAt: -1 })
        .updatedAt,
    };
    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      layout: "layout/admin",
      stats,
    });
  } catch (error) {
    logger.error("Error fetching dashboard stats:", error);
    new AppError("Error fetching dashboard stats", 500);
  }
};

exports.renderProductsPage = async (req, res) => {
  const limit = 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  try {
    const totalProductsCount = await Product.countDocuments();

    const products = await Product.find().skip(skip).limit(limit);
    const totalPages = Math.ceil(totalProductsCount / limit);

    res.render("admin/products", {
      title: "Admin Products",
      layout: "layout/admin",
      products,
      currentPage: page,
      totalPages,
      totalProducts: totalProductsCount,
    });
  } catch (error) {
    logger.error("Error fetching products:", error);
    new AppError("Error fetching products", 500);
  }
};

exports.renderSettingsPage = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    res.render("admin/settings", {
      title: "Admin Settings",
      layout: "layout/admin",
      settings,
    });
  } catch (error) {
    logger.error("Error fetching settings:", error);
    new AppError("Error fetching settings", 500);
  }
};

exports.logout = (req, res) => {
  try {
    req.session.destroy();
    res.clearCookie("admin");
    res.redirect("/admin/login");
  } catch (error) {
    logger.error("Error logging out:", error);
    new AppError("Error logging out", 500);
  }
};
