const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  createAppointment,
  updateStatus,
  startAppointment,
  getAppointmentsDoc,
  getAppointmentsPat,
  getDate,
} = require("../controllers/appointmentController");

router.post("/create/", protect, createAppointment);
router.post("/start/", protect, startAppointment);
router.post("/get-appointments/doctor/", protect, getAppointmentsDoc);
router.get("/get-appointments/patient/", protect, getAppointmentsPat);
router.post("/get-date/:id", protect, getDate);
router.patch("/update-status/:id", protect, updateStatus);

module.exports = router;
