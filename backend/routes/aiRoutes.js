const express = require("express");
const multer = require("multer");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  chatWithGemini,
  generateReportInsights,
  categorizeTransaction,
  scanReceipt,
} = require("../controllers/aiController");

const {
  saveReceiptScan,
  getReceiptScans,
  updateReceiptScan,
  deleteReceiptScan,
} = require("../controllers/receiptController");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Only JPEG, PNG, WEBP, HEIC, and HEIF receipt images are allowed.")
      );
    }

    cb(null, true);
  },
});

router.post("/chat", protect, chatWithGemini);
router.post("/report-insights", protect, generateReportInsights);
router.post("/categorize", protect, categorizeTransaction);

router.post(
  "/scan-receipt",
  protect,
  upload.single("receipt"),
  scanReceipt
);

router.post("/receipts", protect, saveReceiptScan);
router.get("/receipts", protect, getReceiptScans);
router.put("/receipts/:id", protect, updateReceiptScan);
router.delete("/receipts/:id", protect, deleteReceiptScan);

module.exports = router;