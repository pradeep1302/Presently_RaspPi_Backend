const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const doctorSchema = mongoose.Schema(
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
    photo: {
      type: String,
      required: [true, "Please enter a photo"],
      default: "https://i.ibb.co/4pDNDk1/avatar.png",
    },
    phone: {
      type: String,
      required: [true, "Please enter a phone number"],
    },
    address: {
      type: String,
      required: [true, "Please enter your address"],
    },
    role: {
      type: String,
      required: true,
      default: "doctor",
    },
    bio: {
      type: String,
      maxLength: [250, "Bio must not be more than 250 characters"],
      required: [true, "Please enter your bio"],
    },
    patient: [{ type: mongoose.Schema.Types.ObjectId, ref: "Patient" }],
  },
  {
    timeStamps: true,
  }
);

doctorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

const Doctor = mongoose.model("Doctor", doctorSchema);
module.exports = Doctor;
