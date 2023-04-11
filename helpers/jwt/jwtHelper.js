const jwt = require("jsonwebtoken");

const createJWTToken = (data) => {
	const token = jwt.sign(data, process.env.ENCRYPTION_KEY);
	return token;
};

const verifyJWTToken = (token) => {
	const data = jwt.verify(token, process.env.ENCRYPTION_KEY);
	return data;
};

module.exports = { createJWTToken, verifyJWTToken };
