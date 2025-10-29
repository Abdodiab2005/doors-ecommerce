const path = require('path');
const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // لو المسار خاص بالإعدادات
    if (req.originalUrl.includes('/settings')) {
      const base = path.join(__dirname, '..', 'public', 'images');
      fs.mkdirSync(base, { recursive: true });
      return cb(null, base);
    }

    // باقي الحالات (منتجات)
    const category = req.body.category;
    let subfolder = 'other-products';

    if (category === 'inner') subfolder = 'inner-doors';
    else if (category === 'main') subfolder = 'main-doors';

    const base = path.join(__dirname, '..', 'public', 'images', subfolder);
    fs.mkdirSync(base, { recursive: true });
    cb(null, base);
  },
  filename: function (req, file, cb) {
    const safe = file.originalname
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\.\-]/g, '');
    const name = `${Date.now()}-${safe}`;
    cb(null, name);
  },
});

// file filter (only images)
function fileFilter(req, file, cb) {
  const allowed = /jpeg|jpg|png|webp|svg|ico/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext.replace('.', ''))) cb(null, true);
  else cb(new Error('Only images allowed'), false);
}

const limits = {
  fileSize: 2 * 1024 * 1024,
};

const upload = multer({ storage, fileFilter, limits });

module.exports = upload;
