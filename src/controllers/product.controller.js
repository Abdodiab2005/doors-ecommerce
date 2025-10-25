const Product = require("../models/Product.model");
const logger = require("../utils/logger");
const AppError = require("../utils/AppError");
const { success } = require("../utils/response");

function escapeRegex(string) {
  // $& تعني "كل النص الذي تطابق"
  // هذا الكود يجد أي حرف خاص بالـ regex ويضع قبله \
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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
    const { category, q } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(filter).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    let title = "All Products";
    let description = "All Products";

    if (category) {
      title = `${category} Products`;
      description = `Browse ${category} products`;
    }

    if (q) {
      title = `Search results for: "${q}"`;
      description = `Showing products matching "${q}"`;
    }

    if (category && q) {
      title = `Search for "${q}" in ${category}`;
    }

    const categories = [
      {
        name: "All",
        url: "/products",
      },
      {
        name: "inner",
        url: "/products?category=inner",
      },
      {
        name: "main",
        url: "/products?category=main",
      },
    ];

    res.render("products", {
      layout: "layout/main",
      title: title,
      description: description,
      products,
      currentPage: page,
      totalPages,
      currentCategory: category || null,
      categories,
      searchQuery: q || null,
    });
  } catch (error) {
    logger.error("Error fetching products:", error);
    next(new AppError("Error fetching products", 500));
  }
};

exports.getSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (typeof q !== "string") {
      return success(res, "Invalid search query", []);
    }

    // 2. التحقق من الطول (اختياري ولكنه جيد)
    if (q.length > 100) {
      // لا تسمح بكلمات بحث طويلة جداً
      return success(res, "Search query is too long", []);
    }

    const queryTerm = q.trim();

    if (!queryTerm) {
      return success(res, "No suggestions found", []);
    }

    const sanitizedQuery = escapeRegex(queryTerm);

    const products = await Product.find({
      name: { $regex: sanitizedQuery, $options: "i" },
    })
      .select("name _id")
      .limit(10);

    return success(res, "Suggestions fetched successfully", products);
  } catch (error) {
    logger.error("Error fetching suggestions:", error);
    return next(new AppError("Error fetching suggestions", 500));
  }
};
