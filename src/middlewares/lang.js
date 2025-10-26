// src/middlewares/langMiddleware.js
module.exports = (req, res, next) => {
  const supportedLangs = ["en", "he"];
  let lang = req.cookies.lang;

  // لو الرابط فيه prefix للّغة
  const urlLang = req.path.split("/")[1];
  if (supportedLangs.includes(urlLang)) {
    lang = urlLang;
    res.cookie("lang", lang, { maxAge: 1000 * 60 * 60 * 24 * 30 }); // 30 يوم
    // شيل الـ prefix من المسار قبل ما يوصل للـ route الفعلي
    req.url = req.url.replace(`/${lang}`, "");
  }

  // لو مفيش كوكي، خليها en كافتراضي
  if (!lang) lang = "en";

  req.lang = lang;
  res.locals.lang = lang; // علشان نقدر نستخدمها في الـ EJS
  next();
};
