const router = require("express").Router();
const settingsCtrl = require("../controllers/settings.controller");
const upload = require("../middlewares/upload");
// const { requireAuth } = require("../middlewares/auth.middleware");
const {
  settingsValidationRules,
  checkValidation,
} = require("../middlewares/settings.validator");

// PRE: ensure admin authenticated
// router.use(requireAuth);

// render admin page
router.get("/settings", settingsCtrl.getSettingsPage);

// API - get settings JSON
router.get("/api/settings", settingsCtrl.apiGetSettings);

// Update settings (multipart)
// fields: logo, favicon, innerDoorsImage, outerDoorsImage, slider (multiple)
const cpUpload = upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "favicon", maxCount: 1 },
  { name: "innerDoorsImage", maxCount: 1 },
  { name: "outerDoorsImage", maxCount: 1 },
  { name: "slider", maxCount: 6 },
]);

router.post(
  "/settings",
  cpUpload,
  settingsValidationRules,
  checkValidation,
  settingsCtrl.updateSettings
);

// reset defaults
router.post("/settings/reset", settingsCtrl.resetToDefault);

// change admin password
router.post("/settings/change-password", settingsCtrl.changeAdminPassword);

module.exports = router;
