const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const expressEjsLayouts = require('express-ejs-layouts');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const i18n = require('i18n');

// Import centralized settings
const settings = require('./config/settings');

// Import handlers and middlewares
const notFoundHandler = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const setLocals = require('./middlewares/locals');
const globalSettings = require('./middlewares/setting.middleware');
const { requireAuth } = require('./middlewares/auth.middleware');
const { generalLimiter } = require('./middlewares/rateLimiter');

// Configure i18n using centralized settings
i18n.configure({
  locales: settings.i18n.locales,
  directory: path.join(__dirname, './../locales'),
  defaultLocale: settings.i18n.defaultLocale,
  cookie: settings.i18n.cookie,
  autoReload: settings.i18n.autoReload,
  syncFiles: settings.i18n.syncFiles,
  updateFiles: settings.i18n.updateFiles,
  logErrorFn: function (msg) {
    logger.error('i18n error:', msg);
  },
  objectNotation: true,
});

const app = express();

// --- 1. Middlewares ---
// Security headers
app.use(
  helmet({
    contentSecurityPolicy: settings.security.contentSecurityPolicy,
  })
);
app.use(cors());

// Rate limiting - apply to all routes
app.use(generalLimiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan(settings.logging.format));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  '/admin-files',
  requireAuth,
  express.static(path.join(__dirname, 'protected_assets'))
);

// Cookie parser
app.use(cookieParser());

// i18n
app.use(i18n.init);

// Trust proxy for rate limiting and sessions
app.set('trust proxy', settings.server.trustProxy);

// Session configuration - MUST have SESSION_SECRET set
if (!settings.session.secret) {
  throw new Error('SESSION_SECRET must be set in environment variables');
}

app.use(
  session({
    secret: settings.session.secret,
    name: settings.session.name,
    resave: settings.session.resave,
    saveUninitialized: settings.session.saveUninitialized,
    cookie: settings.session.cookie,
    store: MongoStore.create({
      mongoUrl: settings.database.uri,
    }),
  })
);

// --- 2. View Engine Setup ---
app.set('view engine', 'ejs');
app.set('layout', 'layout/main');
app.use(expressEjsLayouts);
app.use(setLocals);

const homeRoutes = require('./routes/home.routes');
const productRoutes = require('./routes/product.routes');

// --- 3. Routes ---
app.use(require('./middlewares/lang'));
app.use(globalSettings);
app.use(rateLimiter);
app.use('/', require('./routes/meta.routes'));
app.use('/', require('./routes/lang.routes'));
app.use('/', homeRoutes);
app.use('/products', productRoutes);

// Admin routes
app.use('/admin', require('./routes/auth.routes'));
app.use('/admin', require('./routes/admin.routes'));
app.use('/admin', require('./routes/settings.routes'));

// --- 4. Error Handling ---
// 404 Handler
app.use(notFoundHandler);

// Global Error Handler (الوحيد)
app.use(errorHandler);

module.exports = app;
