const Product = require("../models/Product.model");
const Settings = require("../models/Setting.model");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");
const { success } = require("../utils/response");
const _maybeDeleteFile = require("../utils/mayBeDelete");
const { invalidateCache } = require("../middlewares/cache");

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

    // فك JSON الخاص بالاسم والوصف لو مبعوت كسلسلة
    try {
      if (typeof name === "string") name = JSON.parse(name);
    } catch {
      console.warn("Invalid name JSON, keeping as string");
    }
    try {
      if (typeof description === "string")
        description = JSON.parse(description);
    } catch {
      console.warn("Invalid description JSON, keeping as string");
    }

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

    // === thumbnail ===
    let thumbnailFile = null;
    if (req.files && Array.isArray(req.files)) {
      thumbnailFile = req.files.find((f) => f.fieldname === "thumbnail");
    } else if (req.files && typeof req.files === "object") {
      for (const key in req.files) {
        const val = req.files[key];
        if (Array.isArray(val)) {
          const found = val.find((f) => f.fieldname === "thumbnail");
          if (found) thumbnailFile = found;
        }
      }
    }

    if (thumbnailFile) {
      productData.thumbnail = `/images/${subfolder}/${thumbnailFile.filename}`;
    }

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

    // Invalidate product cache
    await invalidateCache('*products*');

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
    let { name, description, price, category, stock, colors } = req.body;

    // 🔎 الحصول على المنتج الحالي
    const product = await Product.findById(req.params.id);
    if (!product) return next(new AppError("Product not found", 404));

    // 🧩 فك JSON للاسم والوصف لو جايين كـ string
    try {
      if (typeof name === "string") name = JSON.parse(name);
    } catch {
      name = product.name;
    }

    try {
      if (typeof description === "string")
        description = JSON.parse(description);
    } catch {
      description = product.description;
    }

    // 📂 تحديد مجلد الصور
    let subfolder = "other-products";
    if (category === "inner") subfolder = "inner-doors";
    else if (category === "main") subfolder = "main-doors";

    // 🧱 بيانات أساسية للتحديث
    const updateData = {
      name: name || product.name,
      description: description || product.description,
      price: price !== undefined ? Number(price) : product.price,
      category: category || product.category,
      stock: stock !== undefined ? Number(stock) : product.stock,
    };

    // 🖼️ Thumbnail logic
    let thumbnailFile = null;
    if (req.files && Array.isArray(req.files)) {
      thumbnailFile = req.files.find((f) => f.fieldname === "thumbnail");
    } else if (req.files && typeof req.files === "object") {
      for (const key in req.files) {
        const val = req.files[key];
        if (Array.isArray(val)) {
          const found = val.find((f) => f.fieldname === "thumbnail");
          if (found) thumbnailFile = found;
        }
      }
    }

    // 🗑️ لوجيك حذف/تحديث الـ Thumbnail
    if (thumbnailFile) {
      // إذا فيه ملف جديد، احذف القديم (لو موجود)
      if (product.thumbnail) {
        _maybeDeleteFile(product.thumbnail);
      }
      updateData.thumbnail = `/images/${subfolder}/${thumbnailFile.filename}`;
    } else if (req.body.thumbnailOld) {
      // لو مفيش ملف جديد، بس المستخدم أبقى على القديم
      updateData.thumbnail = req.body.thumbnailOld;
    } else {
      // لو مفيش ملف جديد، والمستخدم *حذف* القديم
      if (product.thumbnail) {
        _maybeDeleteFile(product.thumbnail);
      }
      updateData.thumbnail = "";
    }

    // 🖼️ الصور الرئيسية (main images)
    let imagesFinal = []; // الصور "القديمة" التي أبقى عليها المستخدم
    if (req.body.imagesOld) {
      try {
        imagesFinal = JSON.parse(req.body.imagesOld);
      } catch {
        imagesFinal = [];
      }
    }

    // 🗑️ لوجيك حذف الصور الرئيسية
    // نقارن الصور الأصلية بالصور التي أبقى عليها المستخدم
    const keptImagesSet = new Set(imagesFinal);
    const originalImages = product.images || [];
    for (const imgPath of originalImages) {
      if (!keptImagesSet.has(imgPath)) {
        // إذا الصورة الأصلية مش موجودة في "المُبقاة"، احذفها
        _maybeDeleteFile(imgPath);
      }
    }

    // الصور الجديدة المرفوعة
    const newImages = [];
    const allFiles = Array.isArray(req.files)
      ? req.files
      : Object.values(req.files || {}).flat();

    for (const file of allFiles) {
      if (file.fieldname === "images") {
        newImages.push(`/images/${subfolder}/${file.filename}`);
      }
    }

    // القائمة النهائية = المُبقاة + الجديدة
    updateData.images = [...imagesFinal, ...newImages];

    // 🎨 معالجة الألوان
    let parsedColors = []; // الألوان من الفورم (JSON)
    if (colors) {
      try {
        parsedColors = JSON.parse(colors);
      } catch {
        parsedColors = product.colors || [];
      }
    } else {
      parsedColors = product.colors || [];
    }

    const mergedColors = parsedColors.map((c, i) => {
      // الصور القديمة "المُبقاة" لهذا اللون
      let oldImages = [];
      if (req.body[`colorsOld_${i}`]) {
        try {
          oldImages = JSON.parse(req.body[`colorsOld_${i}`]);
        } catch {
          oldImages = [];
        }
      }

      // 🗑️ لوجيك حذف صور الألوان
      // هام: هذا يعتمد على أن ترتيب الألوان لم يتغير في الفورم
      const originalColor =
        product.colors && product.colors[i] ? product.colors[i] : null;
      const originalColorImages =
        originalColor && Array.isArray(originalColor.images)
          ? originalColor.images
          : [];
      const keptColorImagesSet = new Set(oldImages);

      for (const imgPath of originalColorImages) {
        if (!keptColorImagesSet.has(imgPath)) {
          _maybeDeleteFile(imgPath);
        }
      }

      // الصور الجديدة لهذا اللون
      const newColorImages = [];
      const colorFiles = Object.keys(req.files || {})
        .filter((key) => key === `colorImages_${i}`)
        .flatMap((key) => req.files[key]);

      if (colorFiles && colorFiles.length) {
        colorFiles.forEach((file) => {
          newColorImages.push(`/images/${subfolder}/${file.filename}`);
        });
      }

      return {
        name: c.name || product.colors[i]?.name || `Color ${i + 1}`,
        hex: c.hex || product.colors[i]?.hex || "#000000",
        images: [...oldImages, ...newColorImages], // القائمة النهائية = المُبقاة + الجديدة
      };
    });

    updateData.colors = mergedColors;

    // 💾 تنفيذ التحديث
    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    // Invalidate product cache
    await invalidateCache('*products*');

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

    // Invalidate product cache
    await invalidateCache('*products*');

    success(res, "Product deleted successfully", product);
  } catch (error) {
    console.error(error);
    return next(new AppError("Error deleting product", 500));
  }
};
