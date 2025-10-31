# 🚪 Doors E-Commerce

A modern, multilingual e-commerce platform for selling interior and exterior doors. Built with Node.js, Express, MongoDB, and Tailwind CSS.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## ✨ Features

### 🛍️ E-Commerce Features
- **Product Catalog** - Browse interior and exterior doors with filters
- **Product Variants** - Multiple colors with associated images
- **Dynamic Pricing** - Real-time price and stock management
- **Image Gallery** - Multiple images per product with lightbox view
- **Search & Filter** - Fast product search and category filtering

### 🌍 Multilingual (i18n)
- **English & Hebrew** - Full RTL support for Hebrew
- **URL-based routing** - Clean URLs (`/en/products`, `/he/products`)
- **SEO-optimized** - Proper hreflang tags and language alternates
- **Cookie persistence** - Language preference saved

### 🔒 Security & Performance
- **Rate Limiting** - Prevents abuse and brute-force attacks
- **In-Memory Caching** - Fast responses with node-cache
- **Session Management** - Secure session handling with MongoDB
- **Input Validation** - Server-side validation with express-validator
- **CSP Headers** - Content Security Policy with Helmet.js

### 📱 Modern Web Standards
- **Progressive Web App (PWA)** - Installable on mobile devices
- **Service Workers** - Offline support and caching
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **SEO Optimized** - Structured data (JSON-LD) for rich snippets
- **Social Sharing** - Open Graph and Twitter Card support

### 👨‍💼 Admin Dashboard
- **Product Management** - Full CRUD operations
- **Settings Control** - Manage site settings, meta tags, and assets
- **Image Upload** - Drag-and-drop with multiple file support
- **Real-time Stats** - Dashboard with product counts and analytics
- **Color Variants** - Manage product colors and associated images

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB 6.0+
- Git

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/Abdodiab2005/doors-ecommerce.git
cd doors-ecommerce
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your settings
```

4. **Set up database:**
```bash
# Make sure MongoDB is running
npm run seed
```

5. **Build CSS:**
```bash
npm run build:css
```

6. **Start the application:**
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

7. **Access the application:**
- Frontend: http://localhost:3000
- Admin: http://localhost:3000/admin/login

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/doors-ecommerce

# Session (REQUIRED - use a strong random string!)
SESSION_SECRET=your-super-secret-random-string-here
SESSION_NAME=doors.sid
SESSION_MAX_AGE=86400000

# Cache (In-Memory)
CACHE_ENABLED=true
CACHE_DEFAULT_TTL=3600
CACHE_PRODUCTS_TTL=1800

# Internationalization
DEFAULT_LOCALE=he

# Site URL (for SEO and social sharing)
SITE_URL=http://localhost:3000

# Admin (for seeding)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

### Initial Setup

After configuration, seed the database with initial data:

```bash
npm run seed
```

This creates:
- Sample products (interior and exterior doors)
- Initial site settings
- Admin user account

---

## 📚 Usage

### For Users

1. **Browse Products:**
   - Visit `/products?category=inner` for interior doors
   - Visit `/products?category=main` for exterior doors

2. **Switch Language:**
   - Click language switcher in navigation
   - Or visit `/en` or `/he` directly

3. **View Product Details:**
   - Click on any product to see full details
   - Select color variants to see different images
   - Contact via phone, email, or WhatsApp

### For Administrators

1. **Login:**
   - Visit `/admin/login`
   - Use credentials from `.env` (ADMIN_USERNAME/ADMIN_PASSWORD)

2. **Manage Products:**
   - Navigate to Products section
   - Add, edit, or delete products
   - Upload images and manage colors
   - Set prices and stock levels

3. **Configure Settings:**
   - Update site name, logo, and favicon
   - Manage contact information
   - Set meta tags for SEO
   - Change admin password

---

## 🏗️ Architecture

### Project Structure

```
doors-ecommerce/
├── src/
│   ├── config/           # Configuration files
│   │   ├── db.js        # MongoDB connection
│   │   └── settings.js  # Centralized config
│   ├── controllers/      # Business logic
│   ├── middlewares/      # Express middlewares
│   │   ├── auth.middleware.js
│   │   ├── cache.js
│   │   ├── lang.js
│   │   └── rateLimiter.js
│   ├── models/          # Mongoose schemas
│   │   ├── Product.model.js
│   │   ├── Setting.model.js
│   │   └── Admin.model.js
│   ├── routes/          # Route definitions
│   ├── utils/           # Helper functions
│   ├── public/          # Static assets
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   └── app.js           # Express app configuration
├── views/               # EJS templates
│   ├── layout/          # Layout templates
│   ├── partials/        # Reusable components
│   └── admin/           # Admin pages
├── locales/             # i18n translations
├── scripts/             # Utility scripts
└── package.json
```

### Tech Stack

**Backend:**
- Node.js & Express - Server framework
- MongoDB & Mongoose - Database
- EJS - Templating engine
- i18n - Internationalization

**Frontend:**
- Tailwind CSS v4 - Utility-first CSS
- DaisyUI - Component library
- Alpine.js - Lightweight JavaScript framework
- Font Awesome - Icons

**Security & Performance:**
- Helmet.js - Security headers
- express-rate-limit - Rate limiting
- node-cache - In-memory caching
- bcrypt - Password hashing
- express-validator - Input validation

---

## 🎨 Development

### Available Scripts

```bash
# Development
npm run dev          # Start with nodemon (auto-reload)
npm start           # Start in production mode

# Database
npm run seed        # Seed database with initial data

# CSS
npm run build:css   # Build Tailwind CSS (minified)
npm run watch:css   # Watch and rebuild CSS on changes
```

### Code Style

This project uses:
- **Prettier** - Code formatting
- **ESLint** - Code linting (coming soon)

Format code:
```bash
npm run format      # Format all files with Prettier
```

### Adding New Features

1. Create a new branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes following the existing patterns:
   - Controllers for business logic
   - Middlewares for cross-cutting concerns
   - Routes for URL mapping
   - Models for data structures

3. Test your changes thoroughly

4. Commit with descriptive messages:
```bash
git commit -m "Add feature: description"
```

5. Push and create a pull request

---

## 🚀 Deployment

### Prerequisites for Production

- Node.js 18+ LTS
- MongoDB (Atlas or self-hosted)
- Domain with SSL certificate

### Environment Setup

1. **Set production environment:**
```env
NODE_ENV=production
SITE_URL=https://yourdomain.com
```

2. **Use strong secrets:**
```bash
# Generate a strong SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

3. **Configure MongoDB:**
   - Use MongoDB Atlas for managed hosting
   - Or set up a production MongoDB instance
   - Enable authentication and SSL

### Deployment Options

#### Option 1: Traditional VPS (Ubuntu/Debian)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone https://github.com/yourusername/doors-ecommerce.git
cd doors-ecommerce
npm install --production
npm run build:css

# Use PM2 for process management
npm install -g pm2
pm2 start index.js --name doors-ecommerce
pm2 startup
pm2 save
```

#### Option 2: Shared Hosting

This application is **optimized for shared hosting**:
- No Redis required (uses node-cache)
- Works with any Node.js hosting
- Minimal resource usage

Popular options:
- Hostinger Node.js Hosting
- A2 Hosting
- HostGator

#### Option 3: Platform as a Service

**Heroku:**
```bash
heroku create your-app-name
heroku addons:create mongolab:sandbox
git push heroku main
```

**Railway:**
1. Connect your GitHub repository
2. Add MongoDB database
3. Set environment variables
4. Deploy automatically on push

---

## 📖 API Documentation

### Admin API Endpoints

All admin API endpoints require authentication.

#### Products

**Get All Products**
```http
GET /admin/api/products
```

**Get Single Product**
```http
GET /admin/api/products/:id
```

**Create Product**
```http
POST /admin/api/products
Content-Type: multipart/form-data

{
  "name": {"en": "Door Name", "he": "שם דלת"},
  "description": {"en": "Description", "he": "תיאור"},
  "category": "inner",
  "price": 1000,
  "stock": 10,
  "images": [file, file],
  "thumbnail": file,
  "colors": [
    {
      "name": "White",
      "hex": "#FFFFFF",
      "images": [file, file]
    }
  ]
}
```

**Update Product**
```http
PUT /admin/api/products/:id
Content-Type: multipart/form-data
```

**Delete Product**
```http
DELETE /admin/api/products/:id
```

#### Rate Limiting

- **General routes:** 100 requests per 15 minutes
- **Login endpoint:** 5 attempts per 15 minutes
- **API endpoints:** 50 requests per 15 minutes

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Quick Contribution Guide

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Tailwind CSS** - For the amazing utility-first CSS framework
- **DaisyUI** - For beautiful UI components
- **MongoDB** - For the flexible database
- **Express.js** - For the robust web framework
- **Node.js Community** - For continuous support and packages

---

## 📞 Support

For support, email info@yourdomain.com or open an issue on GitHub.

---

## 🗺️ Roadmap

- [ ] Shopping cart functionality
- [ ] Customer accounts and authentication
- [ ] Order management system
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Product reviews and ratings
- [ ] Advanced analytics dashboard
- [ ] Multi-vendor support
- [ ] Mobile app (React Native)

---

## 📊 Project Status

**Current Version:** 1.0.0
**Status:** ✅ Production Ready
**Last Updated:** 2025-10-31

---

Made with ❤️ by [Leviro Inc.](https://github.com/Abdodiab2005)
