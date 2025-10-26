// src/routes/meta.routes.js
const express = require("express");
const router = express.Router();

const manifestController = require("../controllers/manifest.controller");
const sitemapController = require("../controllers/sitemap.controller");
const robotsController = require("../controllers/robots.controller");

router.get("/manifest.json", manifestController.getManifest);
router.get("/sitemap.xml", sitemapController.getSitemap);
router.get("/robots.txt", robotsController.getRobots);

module.exports = router;
