const router = require("express").Router();

router.get("/", (req, res) => {
  res.render("index", {
    layout: "layout/main",
    title: "Home",
    description: "Home Page",
  });
});

module.exports = router;
