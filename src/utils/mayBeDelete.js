const logger = require("./logger");
const path = require("path");
const fs = require("fs");

module.exports = function _maybeDeleteFile(relativePath) {
  try {
    if (!relativePath) return;
    const p = path.join(
      process.cwd(),
      "src",
      "public",
      relativePath.replace(/^\//, "")
    );
    if (fs.existsSync(p)) fs.unlinkSync(p);
  } catch (err) {
    logger.warn("Failed to delete file", err.message);
  }
};
