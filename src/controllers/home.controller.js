exports.renderHome = (req, res) => {
  const lang = req.lang;

  res.render('index', {
    layout: 'layout/main',
    title:
      res?.locals?.settings?.siteName[lang] +
      ' | ' +
      res.locals?.__('index.home_page'),
    description:
      res?.locals?.settings?.meta?.description[lang] || 'Doors e-commerce',
    keywords: res?.locals?.settings?.meta?.keywords[lang] || '',
    author: res?.locals?.settings?.meta?.author[lang] || '',
    siteName: res?.locals?.settings?.siteName[lang] || '',
    lang,
  });
};
