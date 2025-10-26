const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const helmet = require("helmet");
const expressEjsLayouts = require("express-ejs-layouts");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");

// استيراد الـ Handlers من ملفاتهم
const notFoundHandler = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");
const setLocals = require("./middlewares/locals");
const globalSettings = require("./middlewares/setting.middleware");

const app = express();

// --- 1. Middlewares ---
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": [
          "'self'",
          "data:",
          "loremflickr.com",
          "via.placeholder.com",
          "picsum.photos",
          "fastly.picsum.photos",
          "blob:",
        ],
        "script-src": [
          "'self'",
          "'unsafe-inline'",
          "cdn.jsdelivr.net",
          "cdn.tailwindcss.com",
          "'unsafe-eval'",
        ],
        connectSrc: ["'self'", "https://cdn.jsdelivr.net"],
      },
    },
  })
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
console.log(process.env.MONGODB_URI);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "verysecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24, // يوم كامل
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
  })
);

// --- 2. View Engine Setup ---
app.set("view engine", "ejs");
app.set("layout", "layout/main");
app.use(expressEjsLayouts);
app.use(setLocals);

// --- 3. Routes ---
app.use(globalSettings);
app.use("/", require("./routes/home.routes"));
app.use("/products", require("./routes/product.routes"));
app.use("/admin", require("./routes/auth.routes"));
app.use("/admin", require("./routes/admin.routes"));
app.use("/admin", require("./routes/settings.routes"));

// --- 4. Error Handling ---
// 404 Handler
app.use(notFoundHandler);

// Global Error Handler (الوحيد)
app.use(errorHandler);

module.exports = app;
