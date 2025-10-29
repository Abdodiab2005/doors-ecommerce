// src/controllers/sitemap.controller.js
const Product = require("../models/Product.model");

exports.getSitemap = async (req, res, next) => {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const products = await Product.find();

    let urls = `
<url><loc>${baseUrl}/</loc><priority>1.0</priority></url>
<url><loc>${baseUrl}/category/inner</loc><priority>0.8</priority></url>
<url><loc>${baseUrl}/category/main</loc><priority>0.8</priority></url>
`;

    products.forEach((p) => {
      urls += `<url><loc>${baseUrl}/product/${p._id}</loc><priority>0.6</priority></url>\n`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    res.set("Content-Type", "application/xml");
    res.send(xml);
  } catch (err) {
    next(err);
  }
};
