const express = require("express");
const router = express.Router();
const {
	getSubjects,
	getEncodings,
	createLecture,
} = require("../controllers/reportController");

router.get("/getreports/:id", getSubjects);
router.get("/getreport/:id", getEncodings);
router.post("/createlecture/", createLecture);

module.exports = router;
