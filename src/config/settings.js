// src/config/settings.js
// Centralized configuration for the application

module.exports = {
  // Domain Configuration
  domain: process.env.SITE_URL,

  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    trustProxy: 1,
  },

  // Database Configuration
  database: {
    uri: process.env.MONGODB_URI,
    options: {
      // Add any mongoose connection options here if needed
    },
  },

  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET,
    name: process.env.SESSION_NAME || 'doors.sid',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000', 10), // 24 hours default
      sameSite: 'lax',
    },
  },

  // Internationalization (i18n)
  i18n: {
    locales: ['en', 'he'],
    defaultLocale: process.env.DEFAULT_LOCALE || 'he',
    cookie: 'lang',
    cookieMaxAge: 180 * 24 * 60 * 60 * 1000, // 180 days
    autoReload: process.env.NODE_ENV === 'development',
    syncFiles: false,
    updateFiles: false,
  },

  // Rate Limiting
  rateLimit: {
    // General rate limiting for all routes
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 500, // limit each IP to 500 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    },
    // Strict rate limiting for login
    login: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 login attempts per windowMs
      message: 'Too many login attempts, please try again after 15 minutes.',
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: true, // Don't count successful logins
    },
    // Rate limiting for API endpoints
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 500, // limit each IP to 500 API requests per windowMs
      message: 'Too many API requests, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    },
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '2097152', 10), // 2MB default
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/svg+xml',
      'image/x-icon',
    ],
    allowedExtensions: ['jpeg', 'jpg', 'png', 'webp', 'svg', 'ico'],
  },

  // Cache Configuration (In-Memory using node-cache)
  cache: {
    enabled: process.env.CACHE_ENABLED === 'true',
    defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '3600', 10), // 1 hour in seconds
    products: {
      ttl: parseInt(process.env.CACHE_PRODUCTS_TTL || '1800', 10), // 30 minutes in seconds
    },
    settings: {
      ttl: parseInt(process.env.CACHE_SETTINGS_TTL || '86400', 10), // 24 hours in seconds
    },
  },

  // Security Headers (Helmet)
  security: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'loremflickr.com',
          'via.placeholder.com',
          'picsum.photos',
          'fastly.picsum.photos',
        ],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'cdn.jsdelivr.net',
          'cdn.tailwindcss.com',
          'cdnjs.cloudflare.com', // أضف ده
        ],
        connectSrc: ["'self'", 'https://cdn.jsdelivr.net'],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'cdn.jsdelivr.net',
          'cdn.tailwindcss.com',
          'cdnjs.cloudflare.com',
        ],
        frameSrc: ["'none'"], // يمنع iframes
        upgradeInsecureRequests: [], // يجبر كل الروابط تكون https
      },
    },
  },

  // Admin Seeding
  admin: {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
  },
};
