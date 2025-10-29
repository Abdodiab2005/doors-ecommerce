// src/middlewares/lang.js
const i18n = require('i18n');
const langs = i18n.getLocales();
// Regex بيطابق /en أو /he (في أول المسار بس)
const langRegex = new RegExp(`^/(${langs.join('|')})(/|$)`);

module.exports = (req, res, next) => {
  const match = req.path.match(langRegex);
  // اللغة الحالية (من الكوكي لو موجودة، أو الافتراضية 'he')
  let langToSet = i18n.getLocale(req);

  if (match) {
    // --- 1. لقى لغة في المسار (e.g., /en/products) ---
    const langFromPath = match[1]; // 'en'
    langToSet = langFromPath;

    // (أهم خطوة) بنشيل اللغة من المسار عشان الراوتر يشوف مسار نضيف
    // /en/products -> /products
    // /en -> /
    req.url = req.url.replace(`/${langFromPath}`, '') || '/';
  } else if (req.query.lang && langs.includes(req.query.lang)) {
    // --- 2. لقى لغة في الكويري (e.g., /?lang=en) ---
    const langFromQuery = req.query.lang;
    langToSet = langFromQuery;

    // بنظبط الكوكي ونعمل redirect لمسار نضيف (من غير كويري)
    res.cookie('lang', langFromQuery, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    });
    return res.redirect(req.path); // redirect to '/'
  }

  // --- 3. بنثبت اللغة للطلب ده ---
  req.setLocale(langToSet);
  res.setLocale(langToSet); // عشان تشتغل في الـ Views (res.__)
  req.lang = langToSet; // عشان نستخدمها بسهولة في الكنترولر
  res.locals.lang = langToSet; // علشان نقدر نستخدمها في الـ EJS

  // بنظبط الكوكي لو كانت مختلفة (ده بيحصل مرة واحدة بس)
  if (req.cookies.lang !== langToSet) {
    res.cookie('lang', langToSet, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    });
  }

  next();
};
