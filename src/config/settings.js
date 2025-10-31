const i18n = require('i18n');

module.exports = {
  locale: {
    default: 'he',
    available: i18n.getLocales(),
    cookie: 'lang',
  },
  assets: {
    favicon: '/images/logo/favicon.ico',
    logo: '/images/logo/logo.png',
  },
  credentials: {
    ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Pass@123',
  },
};
