const asyncHandler = require("express-async-handler");
const Report = require("../models/reportModel");

const createReport = asyncHandler(async (req, res) => {
  if (req.user.role != "doctor") {
    res.status(401);
    throw new Error("Not authorised");
  }
  const {
    observation,
    advice,
    medicines,
    minbloodpressure,
    maxbloodpressure,
    weight,
    height,
  } = req.body;

  if (!observation && !advice && !medicines) {
    res.status(400);
    throw new Error("Please fill atleast one field");
  }

  const report = await Report.create({
    patient: req.params.id,
    date: new Date(),
    minbloodpressure,
    maxbloodpressure,
    weight,
    height,
    observation,
    advice,
    medicines,
    doctor: req.user._id,
  });

  res.status(201).json(report);
});

const getReports = asyncHandler(async (req, res) => {
  if (req.user.role == "doctor") {
    const reports = await Report.find({
      patient: req.params.id,
      doctor: req.user._id,
    })
      .populate([
        { path: "patient", select: "_id name phone dob" },
        { path: "doctor", select: "_id name email phone address bio" },
      ])
      .sort("-createdAt");
    res.status(200).json(reports);
  } else {
    const reports = await Report.find({
      patient: req.params.id,
    })
      .populate([
        { path: "patient", select: "_id name phone dob" },
        { path: "doctor", select: "_id name email phone address bio" },
      ])
      .sort("-createdAt");
    res.status(200).json(reports);
  }
});

const getReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id).populate([
    { path: "patient", select: "_id name phone dob" },
    { path: "doctor", select: "_id name email phone address bio" },
  ]);
  if (!report) {
    res.status(404);
    throw new Error("Report not found");
  }
  if (
    req.user.role != "doctor" &&
    report.patient._id.toString() != req.user._id.toString()
  ) {
    res.status(401);
    throw new Error("User not authorized");
  }
  res.status(200).json(report);
});

const updateReport = asyncHandler(async (req, res) => {
  if (req.user.role != "doctor") {
    res.status(401);
    throw new Error("User not authorized");
  }
  const { id } = req.params;
  const report = await Report.findById(id);
  if (!report) {
    res.status(404);
    throw new Error("Report not found");
  }
  var current = new Date();
  if (Math.abs(report.date - current) > 86400000) {
    res.status(401);
    throw new Error("Can't be updated after 24 hrs");
  }
  const {
    height,
    weight,
    maxbloodpressure,
    minbloodpressure,
    observation,
    advice,
    medicines,
  } = req.body;
  const updatedReport = await Report.findByIdAndUpdate(
    { _id: id },
    {
      observation,
      advice,
      medicines,
      height,
      weight,
      maxbloodpressure,
      minbloodpressure,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json(updatedReport);
});

module.exports = { createReport, getReports, getReport, updateReport };
