const asyncHandler = require("express-async-handler");
const Doctor = require("../models/doctorModel");
const Patient = require("../models/patientModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { fileSizeFormatter } = require("../utils/fileUpload");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};
const formatDate = (data) => {
  const date = new Date(Date.parse(data)).toLocaleDateString("en-GB");
  return date;
};
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address, bio, role, dob } = req.body;

  if (!name || !email || !password || !address) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }
  if (role != "doctor" && !dob) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be up to 6 characters");
  }

  const doctorExists = await Doctor.findOne({ email });
  const patientExists = await Patient.findOne({ email });
  if (doctorExists || patientExists) {
    res.status(400);
    throw new Error("Email has already been registered");
  }

  // Handle Image upload
  let fileData = {};
  if (req.file) {
    // Save image to cloudinary
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "MediBook App",
        resource_type: "image",
      });
    } catch (error) {
      res.status(500);
      throw new Error("Image could not be uploaded");
    }

    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }

  var ddata;
  if (role === "doctor") {
    ddata = await Doctor.create({
      name,
      email,
      password,
      address,
      phone,
      bio,
      photo: fileData.filePath,
    });
  }
  if (role === "patient") {
    ddata = await Patient.create({
      name,
      email,
      password,
      address,
      phone,
      dob: formatDate(dob),
    });
  }

  const token = generateToken(ddata._id);

  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400),
    sameSite: "none",
    secure: true,
  });

  if (ddata) {
    const {
      _id,
      name,
      email,
      photo,
      phone,
      bio,
      address,
      role,
      doctor,
      patient,
    } = ddata;
    res.status(201).json({
      _id,
      name,
      email,
      photo,
      phone,
      bio,
      address,
      role,
      doctor,
      patient,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;
  // Validate Request
  if (!email || !password) {
    res.status(400);
    throw new Error("Please enter both fields");
  }
  // Check if user exists
  role == "doctor"
    ? (user = await Doctor.findOne({ email }))
    : (user = await Patient.findOne({ email }));
  if (!user) {
    res.status(400);
    throw new Error("User not found for selected role, please signup");
  }
  // User exists, check if password is correct
  const passwordIsCorrect = await bcrypt.compare(password, user.password);
  //   Generate Token
  const token = generateToken(user._id);
  if (passwordIsCorrect) {
    // Send HTTP-only cookie
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // 1 day
      sameSite: "none",
      secure: true,
    });
  }
  if (user && passwordIsCorrect) {
    const {
      _id,
      name,
      email,
      photo,
      phone,
      bio,
      address,
      role,
      doctor,
      patient,
    } = user;
    res.status(200).json({
      _id,
      name,
      email,
      photo,
      phone,
      bio,
      address,
      role,
      doctor,
      patient,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
});

const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });
  return res.status(200).json({ message: "Successfully Logged Out" });
});

const getUser = asyncHandler(async (req, res) => {
  Role = req.user.role;
  Role == "doctor"
    ? (user = await Doctor.findById(req.user._id))
    : (user = await Patient.findById(req.user._id));

  if (user) {
    const {
      _id,
      name,
      email,
      photo,
      phone,
      bio,
      address,
      role,
      doctor,
      patient,
      dob,
    } = user;
    res.status(201).json({
      _id,
      name,
      email,
      photo,
      phone,
      bio,
      dob,
      address,
      role,
      doctor,
      patient,
    });
  } else {
    res.status(400);
    throw new Error("User Not Found");
  }
});

const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if (verified) {
    return res.json(true);
  }
  return res.json(false);
});

const updateUser = asyncHandler(async (req, res) => {
  Role = req.user.role;
  Role == "doctor"
    ? (user = await Doctor.findById(req.user._id))
    : (user = await Patient.findById(req.user._id));
  // Handle Image upload
  let fileData = {};
  if (req.file) {
    // Save image to cloudinary
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "MediBook App",
        resource_type: "image",
      });
    } catch (error) {
      res.status(500);
      throw new Error("Image could not be uploaded");
    }

    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }
  if (user) {
    const { _id, name, email, photo, phone, address, bio } = user;
    user.email = email;
    user.name = req.body.name || name;
    user.photo = req.body.photo || photo;
    user.phone = req.body.phone || phone;
    user.address = req.body.address || address;
    user.bio = req.body.bio || bio;
    user.photo = fileData.filePath || photo;

    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      photo: updatedUser.photo,
      phone: updatedUser.phone,
      address: updatedUser.address,
      role: updatedUser.role,
      bio: updatedUser.bio,
      patient: updatedUser.patient,
      doctor: updatedUser.doctor,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const changePassword = asyncHandler(async (req, res) => {
  Role = req.user.role;
  Role == "doctor"
    ? (user = await Doctor.findById(req.user._id))
    : (user = await Patient.findById(req.user._id));

  const { oldPassword, password } = req.body;

  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }

  if (!oldPassword || !password) {
    res.status(400);
    throw new Error("Please enter old and new password");
  }

  const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

  if (user && passwordIsCorrect) {
    user.password = password;
    await user.save();
    res.status(200).send("Password change successful");
  } else {
    res.status(400);
    throw new Error("Old Password is Incorrect");
  }
});

const getDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (doctor) {
    const { _id, name, email, photo, phone, bio, address, patient } = doctor;
    res.status(200).json({
      _id,
      name,
      email,
      photo,
      phone,
      bio,
      address,
      patient: patient.length,
    });
  } else {
    res.status(400);
    throw new Error("User Not Found");
  }
});

const getPatient = asyncHandler(async (req, res) => {
  var patient;
  if (req.user.role == "doctor") {
    patient = await Patient.findOne({
      _id: req.params.id,
      doctor: req.user._id,
    }).populate([{ path: "doctor", select: "_id name" }]);
  } else {
    patient = await Patient.findById(req.params.id).populate([
      { path: "doctor", select: "_id name" },
    ]);
  }
  if (patient) {
    const { _id, name, email, phone, address, dob, doctor } = patient;
    res.status(200).json({
      _id,
      name,
      email,
      phone,
      address,
      dob,
      doctor,
    });
  } else {
    res.status(401);
    throw new Error("Not Authorised");
  }
});

const getDoctors = asyncHandler(async (req, res) => {
  try {
    const doctor = await Doctor.find().select("_id name bio");
    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});
const getPatients = asyncHandler(async (req, res) => {
  if (req.user.role == "patient") {
    res.status(401);
    throw new Error("Not authorised");
  }
  const { patient } = await Doctor.findOne({
    _id: req.user._id,
  }).populate([
    { path: "patient", select: "_id name phone dob address email" },
  ]);
  res.status(200).json(patient);
});
module.exports = {
  registerUser,
  loginUser,
  logout,
  getUser,
  loginStatus,
  updateUser,
  changePassword,
  getDoctor,
  getPatient,
  getPatients,
  getDoctors,
};
