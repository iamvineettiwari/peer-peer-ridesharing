require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");

const AuthRouter = require("./routes/auth/index");
const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", AuthRouter);

// Handle errors
app.use(async (err, req, res, next) => {
	return res.status(err.status).json({
		error: true,
		message: err.message || "Something went wrong",
	});
});

const start = () => {
	mongoose
		.connect(process.env.MONGO_URL, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
		.then(() => {
			console.log(`Connected to database !`);

			app.listen(PORT, () => {
				console.log(`Listening on http://localhost:${PORT}`);
			});
		})
		.catch((err) => {
			console.log(`Error occured ` + err.message);
		});
};

start();
