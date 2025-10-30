# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A multilingual (English/Hebrew) e-commerce web application for selling doors, built with Node.js, Express, EJS, MongoDB, and Tailwind CSS. The application features a public-facing storefront and a protected admin dashboard.

## Development Commands

```bash
# Install dependencies
npm install

# Development (with auto-reload)
npm run dev

# Production
npm start

# Seed database with initial data (products, settings, admin user)
npm run seed
```

## Architecture

### Application Structure

The application follows an MVC pattern with the following key components:

- **Entry Point**: `index.js` → loads environment, connects to DB, starts server
- **Application**: `src/app.js` → configures Express middleware, routes, view engine, error handling
- **Routes**: `src/routes/` → organized by domain (auth, admin, products, home, settings, meta, lang)
- **Controllers**: `src/controllers/` → business logic for each route
- **Models**: `src/models/` → Mongoose schemas (Product, Setting, Admin)
- **Middlewares**: `src/middlewares/` → authentication, language, pagination, validation, upload
- **Views**: `views/` → EJS templates with layouts (main, admin, auth) and partials
- **Public Assets**: `src/public/` → client-side JavaScript, CSS, images
- **Protected Admin Assets**: `src/protected_assets/` → admin-specific JavaScript files served only to authenticated users

### Key Technical Patterns

**Multilingual Support (i18n)**:
- Supported languages: English (`en`) and Hebrew (`he`) configured in `src/app.js:19-31`
- Language detection via URL path (`/en/products`), query param (`?lang=en`), or cookie
- Language middleware (`src/middlewares/lang.js`) strips language prefix from URLs for clean routing
- All user-facing content (product names, descriptions, slugs, meta tags) stored with both `en` and `he` fields
- Locale files in `/locales/` directory

**Authentication & Sessions**:
- Session-based authentication using `express-session` with MongoDB store (`connect-mongo`)
- Admin authentication middleware: `requireAuth` (protects routes), `redirectIfAuth` (prevents logged-in users from accessing login)
- Session data stored in MongoDB, configured in `src/app.js:72-86`
- Admin model in `src/models/Admin.model.js` with bcrypt password hashing
- Protected static files served via `/admin-files` route requiring authentication

**Product Management**:
- Products organized by category: `inner` (inner doors) or `main` (outer/main doors)
- Automatic slug generation in both languages using `slugify` with collision handling
- Products support multiple images, thumbnail, and color variants with associated images
- Image uploads organized by category into `/public/images/inner-doors/` or `/public/images/main-doors/`

**File Upload System** (`src/middlewares/upload.js`):
- Uses `multer` with disk storage
- Routes uploads to category-specific folders based on product category
- Settings-related uploads go to `/public/images/`
- File naming: `{timestamp}-{sanitized-filename}`
- Accepts: jpeg, jpg, png, webp, svg, ico (max 2MB per file)
- Admin product endpoints support dynamic color image fields (`colorImages_0` through `colorImages_9`)

**Global Settings Middleware** (`src/middlewares/setting.middleware.js`):
- Loads single Settings document from database on every request
- Makes settings available via `res.locals.settings` in all EJS templates
- Settings include: site name, contact info, social links, assets (logo, favicon, slider), and meta tags

**Error Handling**:
- Custom `AppError` class in `src/utils/AppError.js`
- Global error handler in `src/middlewares/errorHandler.js`
- 404 handler in `src/middlewares/notFound.js`
- Winston logger for error logging (`src/utils/logger.js`)

**View Rendering**:
- Uses `express-ejs-layouts` with default layout: `layout/main`
- Three layouts: `main` (public), `admin` (dashboard), `auth` (login)
- Partials organized by domain in `views/partials/` (header, footer, admin components)
- Local variables set via `src/middlewares/locals.js` for global template access

### Route Organization

**Public Routes**:
- Home: `/` → `src/routes/home.routes.js`
- Products: `/products` → `src/routes/product.routes.js`
- Language switching: `/` → `src/routes/lang.routes.js`
- Meta routes: manifest, sitemap, robots → `src/routes/meta.routes.js`

**Admin Routes** (all prefixed with `/admin`):
- Authentication: `/admin/login`, `/admin/logout` → `src/routes/auth.routes.js`
- Dashboard & Products: `/admin/dashboard`, `/admin/products` → `src/routes/admin.routes.js`
- Settings: `/admin/settings` → `src/routes/settings.routes.js`
- API endpoints: `/admin/api/products` (CRUD operations)

### Database Models

**Product** (`src/models/Product.model.js`):
- Multilingual fields: `name`, `description`, `slug` (both `en` and `he`)
- Category: `inner` or `main`
- Price, stock (admin only)
- Images array, thumbnail
- Colors array with name, hex, and images
- Pre-save hook auto-generates unique slugs for both languages

**Setting** (`src/models/Setting.model.js`):
- Single document collection (singleton pattern)
- Multilingual: siteName, meta description, keywords, author
- Contact: email, phone, whatsapp, social media links
- Assets: logo, favicon, slider, category images

**Admin** (`src/models/Admin.model.js`):
- Username and password (hashed with bcrypt)
- Pre-save hook for password hashing
- `comparePassword` method for login verification

### Environment Configuration

Required `.env` variables:
- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `SESSION_SECRET` - Express session secret key
- `ADMIN_USERNAME` - Initial admin username for seeding
- `ADMIN_PASSWORD` - Initial admin password for seeding

### Seeding Scripts

Located in `scripts/` directory:
- `seedProducts.js` - Creates sample products
- `seedSettings.js` - Creates initial site settings
- `seedAdmin.js` - Creates admin user from environment variables

Run all seeds: `npm run seed`

### Security Features

- Helmet.js for security headers with CSP configured for TailwindCSS CDN
- CORS enabled
- Express rate limiting
- bcrypt for password hashing
- Session cookies with httpOnly flag
- Input validation using `express-validator`
- File upload restrictions (type and size)

### Important Implementation Notes

1. **Language URL Pattern**: When adding new routes, ensure they work with the language middleware that strips `/en` or `/he` prefixes
2. **Multilingual Content**: All user-facing content must include both `en` and `he` fields
3. **Image Paths**: Product images are stored relative to `/public/images/` - use category-specific folders
4. **Admin Authentication**: All admin routes must use `requireAuth` middleware
5. **Settings Access**: Settings are globally available in templates via `res.locals.settings`
6. **Slug Uniqueness**: Product model handles slug collision automatically - don't manually manage slugs
7. **Color Uploads**: When handling color variant images, fields are named `colorImages_0` through `colorImages_9` in form data
