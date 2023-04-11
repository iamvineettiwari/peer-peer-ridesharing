const AppError = require("../../helpers/errors/AppError");
const User = require("../../models/User");
const bcrypt = require("bcrypt");
const { createJWTToken } = require("../../helpers/jwt/jwtHelper");

const registrationController = async (req, res, next) => {
	try {
		const { name, phone, email, password, wallet } = req.body;

		const hashedPassword = await bcrypt.hash(
			password,
			parseInt(process.env.SALT_ROUNDS)
		);

		const user = await User.create({
			name,
			phone,
			email,
			password: hashedPassword,
			wallet,
		});

		return res.status(201).json({
			success: true,
			message: "User created successfully !",
			data: user.toJSON(),
		});
	} catch (err) {
		next(new AppError(err.message, 500));
	}
};

const loginController = async (req, res, next) => {
	try {
		const { phone, password } = req.body;

		const user = await User.findOne({
			phone,
		});

		console.log(41, user);

		if (!user) {
			return res.status(401).json({
				success: false,
				message: "Invalid username or password !",
			});
		}

		const isPasswordSame = await bcrypt.compare(password, user.password);

		console.log(isPasswordSame, user);

		if (!isPasswordSame) {
			return res.status(401).json({
				success: false,
				message: "Invalid username or password !",
			});
		}

		const userData = user.toJSON();

		const token = createJWTToken(userData);

		return res.status(200).json({
			success: true,
			message: "Authentication successfull !",
			data: {
				token,
				userData,
			},
		});
	} catch (err) {
		next(new AppError(err.message, 500));
	}
};

module.exports = {
	registrationController,
	loginController,
};
