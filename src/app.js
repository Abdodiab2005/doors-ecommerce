const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const helmet = require("helmet");
const expressEjsLayouts = require("express-ejs-layouts");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
const i18n = require("i18n");

// استيراد الـ Handlers من ملفاتهم
const notFoundHandler = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");
const setLocals = require("./middlewares/locals");
const globalSettings = require("./middlewares/setting.middleware");

i18n.configure({
  locales: ["en", "he"],
  directory: path.join(__dirname, "./../locales"),
  defaultLocale: "en",
  cookie: "lang", // optional
  autoReload: true,
  syncFiles: false,
  updateFiles: false,
  logErrorFn: function (msg) {
    console.error("i18n error:", msg);
  },
  objectNotation: true,
});

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
app.use(i18n.init);

app.set("trust proxy", 1); // لازم قبل تعريف الـ session

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
const langs = i18n.getLocales();

const homeRoutes = require("./routes/home.routes");
const productRoutes = require("./routes/product.routes");

// --- 3. Routes ---
app.use(require("./middlewares/lang"));
app.use(globalSettings);
app.use("/", require("./routes/meta.routes"));
app.use("/", require("./routes/lang.routes"));
app.use("/", homeRoutes);
app.use("/products", productRoutes);

// Admin routes
app.use("/admin", require("./routes/auth.routes"));
app.use("/admin", require("./routes/admin.routes"));
app.use("/admin", require("./routes/settings.routes"));

langs.forEach((lang) => {
  app.use(`/${lang}`, homeRoutes);
  app.use(`/${lang}/products`, productRoutes);
});

// --- 4. Error Handling ---
// 404 Handler
app.use(notFoundHandler);

// Global Error Handler (الوحيد)
app.use(errorHandler);

module.exports = app;
