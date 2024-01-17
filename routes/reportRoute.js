const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  createReport,
  getReports,
  getReport,
  updateReport,
} = require("../controllers/reportController");

router.post("/:id", protect, createReport);
router.get("/getreports/:id", protect, getReports);
router.get("/getreport/:id", protect, getReport);
router.patch("/:id", protect, updateReport);

module.exports = router;
