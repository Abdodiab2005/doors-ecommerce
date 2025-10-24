const path = require("path");
const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const base = path.join(
      __dirname,
      "..",
      "..",
      "public",
      "images",
      "settings"
    );
    fs.mkdirSync(base, { recursive: true });
    cb(null, base);
  },
  filename: function (req, file, cb) {
    const safe = file.originalname
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\.\-]/g, "");
    const name = `${Date.now()}-${safe}`;
    cb(null, name);
  },
});

// file filter (only images)
function fileFilter(req, file, cb) {
  const allowed = /jpeg|jpg|png|webp|svg|ico/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext.replace(".", ""))) cb(null, true);
  else cb(new Error("Only images allowed"), false);
}

const limits = {
  fileSize: 2 * 1024 * 1024, // 2MB per file (adjustable)
};

const upload = multer({ storage, fileFilter, limits });

module.exports = upload;
