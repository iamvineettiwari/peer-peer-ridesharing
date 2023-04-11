const { body, oneOf } = require("express-validator");
const { checkIfAccountIsValid } = require("../web3/index");
const User = require("../../models/User");

const handleRegistrationValidations = () => {
	return [
		body("name").exists().withMessage("Name is invalid"),
		body("phone")
			.isMobilePhone("en-IN")
			.bail()
			.custom(async (value) => {
				const user = User.find({
					phone: value,
				});
				if (user.count() > 0) {
					return Promise.reject("User already exists with provided phone");
				}

				return Promise.resolve(value);
			}),
		body("email").normalizeEmail().isEmail().withMessage("Email is invalid"),
		body("password").exists().withMessage("Password is required"),
		body("wallet")
			.exists()
			.withMessage("Wallet address is required")
			.bail()
			.custom((value) => {
				const isValidAddress = checkIfAccountIsValid(value);
				if (!isValidAddress) {
					return Promise.reject("Wallet address is not valid");
				}

				return Promise.resolve(value);
			}),
	];
};

const handleLoginValidations = () => {
	return [
		body("phone")
			.exists()
			.withMessage("Phone number is required")
			.bail()
			.isMobilePhone("en-IN"),
		body("password").exists().withMessage("Password is required"),
	];
};

module.exports = {
	handleRegistrationValidations,
	handleLoginValidations,
};
