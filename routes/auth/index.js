const AuthRouter = require("express").Router();
const {
	handleRegistrationValidations,
	handleLoginValidations,
} = require("../../helpers/validations/auth");
const validateInput = require("../../middlewares/validations/validateInput");

const {
	registrationController,
	loginController,
} = require("../../controllers/auth/index");

AuthRouter.post(
	"/signup",
	handleRegistrationValidations(),
	validateInput,
	registrationController
);

AuthRouter.post(
	"/login",
	handleLoginValidations(),
	validateInput,
	loginController
);

module.exports = AuthRouter;
