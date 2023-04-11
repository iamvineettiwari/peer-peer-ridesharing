const AppError = require("../../helpers/errors/AppError");
const { validationResult } = require("express-validator");

const validateInput = async (req, res, next) => {
	const errors = validationResult(req);

	if (errors.isEmpty()) {
		return next();
	}

	const extractedErrors = [];
	errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));

	next(new AppError(extractedErrors, 400));
};

module.exports = validateInput;
