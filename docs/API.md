# API Documentation

Complete API reference for Doors E-Commerce platform.

## Base URL

```
Development: http://localhost:3000
Production: https://yourdomain.com
```

## Authentication

Admin API endpoints require authentication via session cookies.

### Login

```http
POST /admin/login
Content-Type: application/x-www-form-urlencoded

username=admin&password=yourpassword
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful"
}
```

### Logout

```http
GET /admin/logout
```

**Response:** Redirects to `/admin/login`

---

## Public API

### Products

#### Get All Products

```http
GET /products?category=inner&page=1
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | Filter by category (`inner` or `main`) |
| page | number | Page number (default: 1) |
| search | string | Search query |

**Response:**
```json
{
  "products": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": {
        "en": "Modern Interior Door",
        "he": "דלת פנימית מודרנית"
      },
      "description": {
        "en": "Beautiful modern door",
        "he": "דלת מודרנית יפה"
      },
      "slug": {
        "en": "modern-interior-door",
        "he": "דלת-פנימית-מודרנית"
      },
      "category": "inner",
      "price": 1000,
      "images": ["/images/inner-doors/door1.jpg"],
      "thumbnail": "/images/inner-doors/door1-thumb.jpg",
      "colors": [
        {
          "name": "White",
          "hex": "#FFFFFF",
          "images": ["/images/inner-doors/door1-white.jpg"]
        }
      ],
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "currentPage": 1,
  "totalPages": 5,
  "totalProducts": 50
}
```

#### Get Single Product

```http
GET /products/:slug
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| slug | string | Product slug (language-specific) |

**Example:**
```http
GET /products/modern-interior-door
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": {
    "en": "Modern Interior Door",
    "he": "דלת פנימית מודרנית"
  },
  "description": {
    "en": "Beautiful modern door with...",
    "he": "דלת מודרנית יפה עם..."
  },
  "slug": {
    "en": "modern-interior-door",
    "he": "דלת-פנימית-מודרנית"
  },
  "category": "inner",
  "price": 1000,
  "stock": 10,
  "images": [
    "/images/inner-doors/door1.jpg",
    "/images/inner-doors/door1-2.jpg"
  ],
  "thumbnail": "/images/inner-doors/door1-thumb.jpg",
  "colors": [
    {
      "name": "White",
      "hex": "#FFFFFF",
      "images": ["/images/inner-doors/door1-white.jpg"]
    },
    {
      "name": "Black",
      "hex": "#000000",
      "images": ["/images/inner-doors/door1-black.jpg"]
    }
  ],
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

---

## Admin API

All admin endpoints require authentication. Include session cookie in requests.

### Products Management

#### Get All Products (Admin)

```http
GET /admin/api/products
```

**Response:**
```json
{
  "status": "success",
  "message": "Products fetched successfully",
  "data": {
    "products": [...],
    "total": 50
  }
}
```

#### Get Single Product (Admin)

```http
GET /admin/api/products/:id
```

**Response:**
```json
{
  "status": "success",
  "message": "Product fetched successfully",
  "data": {
    ...product object
  }
}
```

#### Create Product

```http
POST /admin/api/products
Content-Type: multipart/form-data
```

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | JSON string | Yes | `{"en": "Name", "he": "שם"}` |
| description | JSON string | Yes | `{"en": "Desc", "he": "תיאור"}` |
| category | string | Yes | `inner` or `main` |
| price | number | Yes | Product price |
| stock | number | No | Stock quantity (default: 0) |
| images | files | Yes | Product images (multiple) |
| thumbnail | file | No | Thumbnail image |
| colors | JSON string | No | Array of color objects |

**Color Object Format:**
```json
{
  "colors": [
    {
      "name": "White",
      "hex": "#FFFFFF"
    }
  ]
}
```

**Color Images:**
- Field names: `colorImages_0`, `colorImages_1`, etc.
- Each color can have multiple images

**Example Request:**
```javascript
const formData = new FormData();
formData.append('name', JSON.stringify({
  en: "Modern Door",
  he: "דלת מודרנית"
}));
formData.append('description', JSON.stringify({
  en: "Beautiful door",
  he: "דלת יפה"
}));
formData.append('category', 'inner');
formData.append('price', 1000);
formData.append('stock', 10);
formData.append('images', file1);
formData.append('images', file2);
formData.append('thumbnail', thumbnailFile);
formData.append('colors', JSON.stringify([
  { name: "White", hex: "#FFFFFF" },
  { name: "Black", hex: "#000000" }
]));
formData.append('colorImages_0', whiteColorImage1);
formData.append('colorImages_0', whiteColorImage2);
formData.append('colorImages_1', blackColorImage);

fetch('/admin/api/products', {
  method: 'POST',
  body: formData
});
```

**Response:**
```json
{
  "status": "success",
  "message": "Product created successfully",
  "data": {
    ...created product
  }
}
```

#### Update Product

```http
PUT /admin/api/products/:id
Content-Type: multipart/form-data
```

**Form Data:** Same as Create Product

**Response:**
```json
{
  "status": "success",
  "message": "Product updated successfully",
  "data": {
    ...updated product
  }
}
```

#### Delete Product

```http
DELETE /admin/api/products/:id
```

**Response:**
```json
{
  "status": "success",
  "message": "Product deleted successfully",
  "data": {
    ...deleted product
  }
}
```

---

### Settings Management

#### Get Settings

```http
GET /admin/settings
```

Returns the settings page (HTML).

#### Update General Settings

```http
POST /admin/settings/general
Content-Type: application/x-www-form-urlencoded
```

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| siteName_en | string | Yes | Site name (English) |
| siteName_he | string | Yes | Site name (Hebrew) |
| meta_description_en | string | No | Meta description (English) |
| meta_description_he | string | No | Meta description (Hebrew) |
| meta_keywords_en | string | No | Meta keywords (English) |
| meta_keywords_he | string | No | Meta keywords (Hebrew) |
| meta_author_en | string | No | Author name (English) |
| meta_author_he | string | No | Author name (Hebrew) |

**Response:** Redirect to `/admin/settings` with success message

#### Update Assets

```http
POST /admin/settings/assets
Content-Type: multipart/form-data
```

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| logo | file | No | Site logo |
| favicon | file | No | Favicon |
| icon16 | file | No | 16x16 icon |
| icon192 | file | No | 192x192 icon |
| icon512 | file | No | 512x512 icon |
| slider | files | No | Homepage slider images |
| innerDoorsImage | file | No | Category image (inner) |
| outerDoorsImage | file | No | Category image (outer) |

**Response:** Redirect to `/admin/settings` with success message

#### Update Contact Information

```http
POST /admin/settings/contact
Content-Type: application/x-www-form-urlencoded
```

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | No | Contact email |
| phone | string | No | Phone number |
| whatsapp | string | No | WhatsApp number |
| facebook | string | No | Facebook URL |
| instagram | string | No | Instagram URL |
| twitter | string | No | Twitter URL |
| tiktok | string | No | TikTok URL |

**Response:** Redirect to `/admin/settings` with success message

#### Change Admin Password

```http
POST /admin/settings/password
Content-Type: application/x-www-form-urlencoded
```

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| currentPassword | string | Yes | Current password |
| newPassword | string | Yes | New password |
| confirmPassword | string | Yes | Confirm new password |

**Response:** Redirect to `/admin/settings` with success message

---

## Error Responses

### Error Format

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Error message here",
  "stack": "Stack trace (only in development)"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests (Rate Limited) |
| 500 | Internal Server Error |

### Common Error Messages

**Authentication Errors:**
```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Authentication required"
}
```

**Validation Errors:**
```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**Rate Limit Error:**
```json
{
  "status": "error",
  "statusCode": 429,
  "message": "Too many requests, please try again after 15 minutes"
}
```

---

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| All routes | 100 requests | 15 minutes |
| POST /admin/login | 5 attempts | 15 minutes |
| /admin/api/* | 50 requests | 15 minutes |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

---

## Caching

### Cache Headers

Responses include cache headers when caching is enabled:

```
Cache-Control: max-age=1800
```

### Cache Invalidation

Cache is automatically invalidated when:
- Product is created
- Product is updated
- Product is deleted

---

## Pagination

### Query Parameters

```http
GET /products?page=1
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| page | 1 | Current page number |
| limit | 10 | Items per page |

### Response Format

```json
{
  "products": [...],
  "currentPage": 1,
  "totalPages": 10,
  "totalProducts": 100,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

---

## Webhooks (Coming Soon)

Future support for webhooks on:
- Product created
- Product updated
- Product deleted
- Order placed

---

## SDKs (Planned)

Future client libraries:
- JavaScript/Node.js
- PHP
- Python
- Ruby

---

## Support

For API support:
- Email: api@yourdomain.com
- GitHub Issues: [Report an issue](https://github.com/Abdodiab2005/doors-ecommerce/issues)

---

## Changelog

### v1.0.0 (2025-10-31)
- Initial API release
- Product CRUD operations
- Settings management
- Rate limiting
- Caching support

---

**Last Updated:** 2025-10-31
