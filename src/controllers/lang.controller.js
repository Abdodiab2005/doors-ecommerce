exports.changeLang = (req, res) => {
  const { lang } = req.params;
  const supportedLangs = ["en", "he"];
  if (supportedLangs.includes(lang)) {
    res.cookie("lang", lang, { maxAge: 1000 * 60 * 60 * 24 * 365 });
  }
  res.redirect("back");
};
