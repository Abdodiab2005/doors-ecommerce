const router = require("express").Router();
const langController = require("../controllers/lang.controller");

router.get("/switch-lang/:lang", langController.changeLang);

module.exports = router;
