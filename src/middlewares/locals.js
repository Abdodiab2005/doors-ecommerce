function setLocals(req, res, next) {
  res.locals.title = 'Doors Shop';
  res.locals.locale = req.getLocale();
  res.locals.__ = res.__;

  res.locals.req = {
    protocol: req.protocol,
    host: req.get('host'), // ✅ هنا خزّن القيمة مش الـ function
    url: req.originalUrl,
    path: req.path,
  };

  next();
}

module.exports = setLocals;
