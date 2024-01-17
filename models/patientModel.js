const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const patientSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    email: {
      type: String,
      required: [true, "Please add a email"],
      unique: true,
      trim: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minLength: [6, "Password must be upto 6 characters"],
    },
    phone: {
      type: String,
      required: [true, "Please add a phone number"],
    },
    address: {
      type: String,
      required: [true, "Please enter your address"],
    },
    dob: {
      type: String,
      required: [true, "Please enter your Date of Birth"],
    },
    role: {
      type: String,
      required: true,
      default: "patient",
    },
    doctor: [{ type: mongoose.Schema.Types.ObjectId, ref: "Doctor" }],
  },
  {
    timeStamps: true,
  }
);

patientSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

const Patient = mongoose.model("Patient", patientSchema);
module.exports = Patient;
