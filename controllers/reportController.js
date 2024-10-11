const asyncHandler = require("express-async-handler");
const Teacher = require("../models/teacherModel");
const Subject = require("../models/subjectModel");
const Lecture = require("../models/lectureModel");

const getSubjects = asyncHandler(async (req, res) => {
	const teacher = await Teacher.findById(req.params.id).populate([
		{
			path: "subjects",
			select: "_id subjectCode name",
		},
	]);
	if (teacher) {
		const { subjects } = teacher;
		res.status(200).json({
			subjects,
		});
	} else {
		res.status(400);
		throw new Error("User Not Found");
	}
});

const getEncodings = asyncHandler(async (req, res) => {
	const subject = await Subject.findById(req.params.id).populate([
		{ path: "students", select: "studentId name faceData" },
	]);

	if (!subject) {
		res.status(404);
		throw new Error("Subject not found");
	}

	res.status(200).json(subject.students);
});

const createLecture = asyncHandler(async (req, res) => {
	const { subject, teacher, date, presentStudents } = req.body;

	if (!subject || !teacher || !date) {
		res.status(400);
		throw new Error("Please fill all fields");
	}

	const lecture = await Lecture.create({
		subject,
		teacher,
		date,
		presentStudents,
	});

	res.status(201).json(lecture);
});

module.exports = { getSubjects, getEncodings, createLecture };
