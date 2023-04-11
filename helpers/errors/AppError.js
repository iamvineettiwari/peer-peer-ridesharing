class AppError extends Error {
	constructor(message, status) {
		super(message);

		this.message =
			process.env.MODE === "PRODUCTION" ? "Something went wrong" : message;
		this.status = status;
	}
}

module.exports = AppError;
