// src/config/settings.js
// Centralized configuration for the application

module.exports = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    trustProxy: true,
  },

  // Database Configuration
  database: {
    uri: process.env.MONGODB_URI,
    options: {
      // Add any mongoose connection options here if needed
    },
  },

  // Redis Configuration (for caching and sessions)
  redis: {
    enabled: process.env.REDIS_ENABLED === 'true',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    ttl: parseInt(process.env.REDIS_TTL || '3600', 10), // 1 hour default
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
    cookieMaxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    autoReload: process.env.NODE_ENV === 'development',
    syncFiles: false,
    updateFiles: false,
  },

  // Rate Limiting
  rateLimit: {
    // General rate limiting for all routes
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
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
      max: 50, // limit each IP to 50 API requests per windowMs
      message: 'Too many API requests, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    },
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '2097152', 10), // 2MB default
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml', 'image/x-icon'],
    allowedExtensions: ['jpeg', 'jpg', 'png', 'webp', 'svg', 'ico'],
  },

  // Cache Configuration
  cache: {
    enabled: process.env.CACHE_ENABLED === 'true',
    defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '3600', 10), // 1 hour
    products: {
      ttl: parseInt(process.env.CACHE_PRODUCTS_TTL || '1800', 10), // 30 minutes
    },
    settings: {
      ttl: parseInt(process.env.CACHE_SETTINGS_TTL || '86400', 10), // 24 hours
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
        ],
        connectSrc: ["'self'", 'https://cdn.jsdelivr.net'],
        styleSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net', 'cdn.tailwindcss.com'],
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
