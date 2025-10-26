function setLocals(req, res, next) {
  res.locals.title = "Doors Shop";
  res.locals.locale = req.getLocale();
  res.locals.__ = res.__;

  next();
}

module.exports = setLocals;
