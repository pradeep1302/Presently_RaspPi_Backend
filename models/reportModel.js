const mongoose = require("mongoose");

const reportSchema = mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Patient",
    },
    height: {
      type: Number,
    },
    weight: {
      type: Number,
    },
    minbloodpressure: {
      type: Number,
    },
    maxbloodpressure: {
      type: Number,
    },
    observation: {
      type: String,
      trim: true,
    },
    advice: {
      type: String,
      trim: true,
    },
    medicines: {
      type: String,
      trim: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Doctor",
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model("Report", reportSchema);
module.exports = Report;
