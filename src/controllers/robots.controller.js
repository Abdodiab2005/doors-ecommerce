// src/controllers/robots.controller.js
exports.getRobots = (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const content = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /admin/',
    '',
    `Sitemap: ${baseUrl}/sitemap.xml`,
  ].join('\n');

  res.type('text/plain').send(content);
};
