const Product = require("../models/Product.model");
const Settings = require("../models/Setting.model");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");
const { success } = require("../utils/response");
const _maybeDeleteFile = require("../utils/mayBeDelete");

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
    const settingsDoc = await Settings.findOne().sort({ updatedAt: -1 });
    const stats = {
      totalProducts: await Product.countDocuments(),
      innerCount: await Product.countDocuments({ category: "inner" }),
      mainCount: await Product.countDocuments({ category: "main" }),
      settingsUpdatedAt: settingsDoc ? settingsDoc.updatedAt : null,
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
      req,
    });
  } catch (error) {
    logger.error("Error fetching products:", error);
    new AppError("Error fetching products", 500);
  }
};

exports.logout = async (req, res, next) => {
  try {
    req.session.destroy();
    res.clearCookie("admin");
    res.redirect("/admin/login");
  } catch (error) {
    logger.error("Error logging out:", error);
    new AppError("Error logging out", 500);
  }
};

// controller/product.controller.js
exports.createProduct = async (req, res, next) => {
  try {
    // استخرج الحقول الأساسية (غالباً هيكونوا strings من الفورم)
    let { name, description, price, category, stock, colors } = req.body;

    // تأكد من أنواع price / stock
    if (price !== undefined) price = Number(price);
    if (stock !== undefined) stock = Number(stock);

    // تحديد subfolder عشان نخزن المسارات
    let subfolder = "other-products";
    if (category === "inner") subfolder = "inner-doors";
    else if (category === "main") subfolder = "main-doors";

    const productData = {
      name,
      description,
      price,
      category,
      stock: stock || 0,
      images: [],
      colors: [],
    };

    // === معالجة colors ===
    // قد يجي colors كـ string (JSON) أو كـ array فعلي
    let parsedColors = [];
    if (colors) {
      if (typeof colors === "string") {
        try {
          parsedColors = JSON.parse(colors);
        } catch (err) {
          // لو parse فشل نفترض إن المستخدم بعت اسم لون واحد أو شيء غير متوقع
          // خليه فارغ عشان ما يكسر الـ schema
          parsedColors = [];
        }
      } else if (Array.isArray(colors)) {
        parsedColors = colors;
      } else {
        parsedColors = [];
      }
    }

    // نجهز parsedColors بحيث كل عنصر يحتوي على structure المتوقع
    parsedColors = parsedColors.map((c = {}, i) => ({
      name: c.name || `Color ${i + 1}`,
      hex: c.hex || "#000000",
      images: Array.isArray(c.images) ? c.images : [],
    }));

    // === تجهيز ملفات الـ req.files (تغطية لحالات multer المختلفة) ===
    let allFiles = [];
    if (Array.isArray(req.files)) {
      allFiles = req.files;
    } else if (req.files && typeof req.files === "object") {
      // multer.fields => object: { images: [...], colorImages_0: [...] }
      for (const key of Object.keys(req.files)) {
        const val = req.files[key];
        if (Array.isArray(val)) allFiles = allFiles.concat(val);
      }
    }

    // === حفظ مسارات الصور في الموديل ===
    const newImages = [];

    if (allFiles.length > 0) {
      for (const file of allFiles) {
        // افترضنا إن ملفاتك محفوظة في /public/images/<subfolder>/<filename>
        // وعدّل المسار لو تستخدم CDN أو storage آخر
        const filePath = `/images/${subfolder}/${file.filename}`;

        // متى نعتبرها صورة رئيسية؟
        // نفترض أن الحقل اللي بيوصل بالـ form لـ الصور الرئيسية اسمه 'images'
        // وحقول صور الألوان بتستخدم اسم زي 'colorImages_<index>'
        const field = file.fieldname || "";

        if (field === "images") {
          newImages.push(filePath);
        } else if (field.startsWith("colorImages_")) {
          // field example: "colorImages_0"
          const parts = field.split("_");
          const index = parseInt(parts[1], 10);
          if (Number.isNaN(index)) continue;

          if (!parsedColors[index]) {
            parsedColors[index] = {
              name: `Color ${index + 1}`,
              hex: "#000000",
              images: [],
            };
          }
          parsedColors[index].images = parsedColors[index].images || [];
          parsedColors[index].images.push(filePath);
        } else {
          // لو مش محدد، نضيفه للـ main images كـ fallback
          newImages.push(filePath);
        }
      }
    }

    // إذا فيه صور رئيسية جديدة - خزنهم
    productData.images = newImages.length > 0 ? newImages : [];

    // إذا parsedColors فاضي، خلي الموديل يقبل مصفوفة فارغة أو اتركه كما هو
    productData.colors = parsedColors;

    // === إنشاء المنتج ===
    const created = await Product.create(productData);

    // استجابة نجاح (تفترض وجود دالة success)
    return success(res, "Product created successfully", created);
  } catch (error) {
    // لوج مناسب وباس على الـ middleware لمعالجة الأخطاء
    console.error("Error creating product:", error);
    logger?.error?.("Error creating product:", error);

    // استخدم next مع AppError عشان middleware الخطأ يشتغل
    return next(new AppError("Error creating product", 500));
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, stock, colors } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return next(new AppError("Product not found", 404));

    let subfolder = "other-products";
    if (category === "inner") subfolder = "inner-doors";
    else if (category === "main") subfolder = "main-doors";

    const updateData = { name, description, price, category, stock };

    const newImages = [];
    let parsedColors = [];

    // ✅ نحاول نفك JSON الـ colors
    if (colors) {
      try {
        parsedColors = JSON.parse(colors);
      } catch {
        parsedColors = product.colors;
      }
    } else {
      parsedColors = product.colors;
    }

    // ✅ تجهيز الألوان قبل الدمج
    parsedColors = parsedColors.map((color, index) => ({
      name: color.name || product.colors[index]?.name || `Color ${index + 1}`,
      hex: color.hex || product.colors[index]?.hex || "#000000",
      images: Array.isArray(color.images)
        ? color.images.length
          ? color.images
          : product.colors[index]?.images || []
        : product.colors[index]?.images || [],
    }));

    // ✅ لو فيه صور جديدة
    const hasNewFiles = req.files && req.files.length > 0;

    if (hasNewFiles) {
      // 🧹 أولاً نحذف الصور القديمة كلها (main + colors)
      if (Array.isArray(product.images)) {
        product.images.forEach((imgPath) => _maybeDeleteFile(imgPath));
      }
      if (Array.isArray(product.colors)) {
        product.colors.forEach((color) => {
          if (Array.isArray(color.images)) {
            color.images.forEach((imgPath) => _maybeDeleteFile(imgPath));
          }
        });
      }

      // ✅ ثم نضيف الصور الجديدة
      for (const file of req.files) {
        const filePath = `/images/${subfolder}/${file.filename}`;

        if (file.fieldname === "images") {
          newImages.push(filePath);
        } else if (file.fieldname.startsWith("colorImages_")) {
          const index = parseInt(file.fieldname.split("_")[1]);
          if (!parsedColors[index]) {
            parsedColors[index] = {
              name: `Color ${index + 1}`,
              hex: "#000000",
              images: [],
            };
          }
          parsedColors[index].images.push(filePath);
        }
      }

      // ✅ الصور الرئيسية الجديدة
      updateData.images = newImages;
    } else {
      // مفيش صور جديدة → استخدم القديمة
      updateData.images = product.images;
    }

    // ✅ الألوان بعد الدمج النهائي
    updateData.colors = parsedColors;

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    success(res, "Product updated successfully", updated);
  } catch (error) {
    console.error("Error updating product:", error);
    return next(new AppError("Error updating product", 500));
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new AppError("Product not found", 404));
    success(res, "Product fetched successfully", product);
  } catch (error) {
    logger.error("Error fetching product:", error);
    return next(new AppError("Error fetching product", 500));
  }
};
// عرض كل المنتجات مع دعم الـ pagination
exports.getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

    const responseData = {
      products: products,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalProducts: totalProducts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };

    success(res, "Products fetched successfully", responseData);
  } catch (error) {
    logger.error(error);
    return next(new AppError("Error fetching products", 500));
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new AppError("Product not found", 404));

    // ✅ حذف الصور الأساسية
    if (Array.isArray(product.images)) {
      product.images.forEach((imgPath) => _maybeDeleteFile(imgPath));
    }

    // ✅ حذف صور الألوان
    if (Array.isArray(product.colors)) {
      product.colors.forEach((color) => {
        if (Array.isArray(color.images)) {
          color.images.forEach((imgPath) => _maybeDeleteFile(imgPath));
        }
      });
    }

    await product.deleteOne();

    success(res, "Product deleted successfully", product);
  } catch (error) {
    console.error(error);
    return next(new AppError("Error deleting product", 500));
  }
};
