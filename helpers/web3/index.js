const web3 = require("web3");

const checkIfAccountIsValid = (account) => {
	return web3.utils.isAddress(account);
};

module.exports = {
	checkIfAccountIsValid,
};
