// src/controllers/sitemap.controller.js
const Product = require('../models/Product.model');
const settings = require('../config/settings');

const createUrlEntry = (loc, priority, lastmod, alternates) => {
  const lastmodTag = lastmod ? `\n  <lastmod>${lastmod}</lastmod>` : '';
  const alternatesTag = alternates ? `\n${alternates}` : '';
  return `
<url>
  <loc>${loc}</loc>${alternatesTag}${lastmodTag}
  <priority>${priority}</priority>
</url>`;
};

exports.getSitemap = async (req, res, next) => {
  try {
    const langs = settings.i18n.locales;
    const primaryLang = settings.i18n.defaultLocale;
    const baseUrl = settings.domain;
    const urlEntries = [];

    // --- 1. الصفحات العامة (Static Pages) ---
    const staticPages = [
      { path: '/', priority: '1.0' }, // Home
      { path: '/products?category=inner', priority: '0.8' },
      { path: '/products?category=main', priority: '0.8' },
    ];

    staticPages.forEach((page) => {
      // المسار الأساسي (e.g., /en/products?category=main)
      const primaryPath = page.path === '/' ? '' : page.path;
      const loc = `${baseUrl}/${primaryLang}${primaryPath}`;

      // اللينكات البديلة
      const alternates = langs
        .map((lang) => {
          const langPath = page.path === '/' ? '' : page.path;
          return `  <xhtml:link rel="alternate" hreflang="${lang}" href="${baseUrl}/${lang}${langPath}"/>`;
        })
        .join('\n');

      urlEntries.push(createUrlEntry(loc, page.priority, null, alternates));
    });

    // --- 2. المنتجات الديناميكية ---
    const products = await Product.find().select('slug updatedAt').lean();

    products.forEach((p) => {
      if (!p.slug || !p.slug[primaryLang]) return;

      const loc = `${baseUrl}/${primaryLang}/products/${p.slug[primaryLang]}`;

      const alternates = langs
        .map((lang) => {
          if (p.slug[lang]) {
            return `  <xhtml:link rel="alternate" hreflang="${lang}" href="${baseUrl}/${lang}/products/${p.slug[lang]}"/>`;
          }
          return null;
        })
        .filter(Boolean)
        .join('\n');

      const lastmod = p.updatedAt?.toISOString().split('T')[0] || null;
      urlEntries.push(createUrlEntry(loc, '0.6', lastmod, alternates));
    });

    // --- 3. تجميع XML ---
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
${urlEntries.join('\n')}
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    next(err);
  }
};
