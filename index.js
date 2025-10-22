const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const app = require("./src/app");
const logger = require("./src/utils/logger");

dotenv.config();

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () =>
    logger.info(`🚀 Server running on http://localhost:${PORT}`)
  );
});
