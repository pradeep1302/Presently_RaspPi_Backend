const mongoose = require("mongoose");

const appointmentSchema = mongoose.Schema(
  {
    date: {
      type: String,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
    currentSize: { type: Number, required: true, default: 0 },
    maxSize: { type: Number, required: [true, "Enter a max size"] },
    patient: [
      {
        aptNo: {
          type: Number,
          required: [true, "Apt No. Required"],
        },
        patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
        status: { type: String, required: true, default: "pending" },
      },
      {
        timestamps: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;
