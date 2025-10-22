const Product = require("../models/Product.model");
const logger = require("../utils/logger");
const AppError = require("../utils/AppError");

exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return next(new AppError("Product not found", 404));

    res.render("product", {
      title: product.name,
      layout: "layout/main",
      description: product.description,
      product,
    });
  } catch (error) {
    logger.error("Error fetching product:", error);
    next(new AppError("Error fetching product", 500));
  }
};

exports.getAllProducts = async (req, res, next) => {
  try {
    const { page, limit, skip } = req.pagination;
    const { category } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    const [products, total] = await Promise.all([
      Product.find(filter).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    const title = category ? `${category} Products` : "All Products";
    const description = category
      ? `Browse ${category} products`
      : "All Products";

    res.render("products", {
      layout: "layout/main",
      title: title,
      description: description,
      products,
      currentPage: page,
      totalPages,
      currentCategory: category || null,
    });
  } catch (error) {
    logger.error("Error fetching products:", error);
    next(new AppError("Error fetching products", 500));
  }
};
