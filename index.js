const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const iotRoute = require("./routes/iotRoute");
const errorHandler = require("./middleware/errorMiddleware");
const dotenv = require("dotenv").config();
const path = require("path");
const Student = require("./models/studentModel");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

const corsOptions = {
	origin: ["http://localhost:3000", "https://medibook-app.vercel.app"],
	credentials: true,
	optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/", iotRoute);

app.get("/", (req, res) => {
	res.send("Home Page");
});

app.use(errorHandler);
const PORT = process.env.PORT || 5000;
mongoose
	.connect(process.env.MONGO_URI)
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});
	})
	.catch((err) => {
		console.log(err);
	});
