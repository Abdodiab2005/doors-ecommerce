function setLocals(req, res, next) {
  res.locals.title = "Doors Shop";
  next();
}

module.exports = setLocals;
