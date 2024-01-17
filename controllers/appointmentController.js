const asyncHandler = require("express-async-handler");
const Report = require("../models/reportModel");
const Appointment = require("../models/appointmentModel");
const Doctor = require("../models/doctorModel");
const Patient = require("../models/patientModel");

const formatDate = (data) => {
  const date = new Date(Date.parse(data)).toLocaleDateString("en-GB");
  return date;
};

const createAppointment = asyncHandler(async (req, res) => {
  if (req.user.role != "patient") {
    res.status(401);
    throw new Error("Not authorised");
  }
  const { date, doctor } = req.body;

  const dateData = new Date(Date.parse(date)).toLocaleDateString("en-GB");

  if (!date || !doctor) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const patId = req.user._id;

  const appointment = await Appointment.find({
    date: dateData,
    doctor,
    "patient.patient": req.user._id,
  });
  if (appointment.length != 0) {
    res.status(201);
    throw new Error("Appoint already booked");
  } else {
    const appointment = await Appointment.findOne({
      date: dateData,
      doctor,
    });
    const { _id, currentSize, maxSize } = appointment;
    if (currentSize + 1 <= maxSize) {
      var data1, data2;
      const exists1 = await Doctor.findOne({ _id: doctor, patient: patId });
      if (!exists1) {
        data1 = await Doctor.findByIdAndUpdate(
          doctor,
          {
            $push: { patient: patId },
          },
          { new: true }
        );
      }
      const exists2 = await Patient.findOne({ _id: patId, doctor });
      if (!exists2) {
        data2 = await Patient.findByIdAndUpdate(
          patId,
          {
            $push: { doctor: doctor },
          },
          { new: true }
        );
      }
      if ((data1 && data2) || (exists1 && exists2)) {
        const data = await Appointment.findByIdAndUpdate(
          _id,
          {
            currentSize: currentSize + 1,
            $push: { patient: { aptNo: currentSize + 1, patient: patId } },
          },
          { new: true }
        );
        if (data) res.status(201).json(true);
        else {
          res.status(201);
          throw new Error("An error occured");
        }
      } else {
        res.status(201);
        throw new Error("An error occured");
      }
    } else {
      res.status(201);
      throw new Error("Appointment limit reached");
    }
  }
});

const startAppointment = asyncHandler(async (req, res) => {
  if (req.user.role != "doctor") {
    res.status(401);
    throw new Error("Not authorised");
  }

  const { date, maxSize } = req.body;

  if (!date || !maxSize) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const appointment = await Appointment.findOne({
    date: formatDate(date),
    doctor: req.user._id,
  });
  if (!appointment) {
    const appointment = await Appointment.create({
      date: formatDate(date),
      maxSize,
      doctor: req.user._id,
    });
    res.status(200).json(appointment);
  } else {
    if (maxSize <= appointment.currentSize) {
      res.status(401);
      throw new Error("Cannot Change");
    } else {
      const updatedapt = await Appointment.findByIdAndUpdate(
        appointment._id,
        { maxSize },
        { new: true }
      );
      res.status(200).json(updatedapt);
    }
  }
});

const getAppointmentsDoc = asyncHandler(async (req, res) => {
  if (req.user.role != "doctor") {
    res.status(401);
    throw new Error("Not authorised");
  }
  const { date } = req.body;

  const appointments = await Appointment.findOne({
    date: formatDate(date),
    doctor: req.user._id,
  })
    .populate([{ path: "patient.patient", select: "_id name phone dob email" }])
    .sort("-createdAt");
  if (appointments) res.status(200).json(appointments.patient);
  else res.status(200).json([]);
});

const getAppointmentsPat = asyncHandler(async (req, res) => {
  if (req.user.role != "patient") {
    res.status(401);
    throw new Error("Not authorised");
  }
  const appointments = await Appointment.find(
    {
      "patient.patient": req.user._id,
    },
    {
      "patient.$": 1,
    }
  )
    .populate([{ path: "doctor", select: "_id name email phone address bio" }])
    .sort("-patient.updatedAt")
    .select("date doctor");
  res.status(200).json(appointments);
});

const updateStatus = asyncHandler(async (req, res) => {
  if (req.user.role != "doctor") {
    res.status(401);
    throw new Error("User not authorized");
  }

  const { id } = req.params;

  const { status } = req.body;
  const updated = await Appointment.findOneAndUpdate(
    { "patient._id": id },
    {
      $set: { "patient.$.status": status },
    },
    { new: true }
  );
  res.status(200).json(updated);
});
const getDate = asyncHandler(async (req, res) => {
  const dates = await Appointment.findOne({
    doctor: req.params.id,
    date: formatDate(req.body.date),
  }).select("date maxSize currentSize");
  res.status(200).json(dates);
});

module.exports = {
  createAppointment,
  startAppointment,
  getAppointmentsDoc,
  getAppointmentsPat,
  updateStatus,
  getDate,
};
