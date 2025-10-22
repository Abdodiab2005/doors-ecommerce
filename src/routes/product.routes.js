const router = require("express").Router();

router.get("/", (req, res) => {
  res.render("index", {
    layout: "layout/main",
    title: "Products",
    description: "Products Page",
  });
});

module.exports = router;
