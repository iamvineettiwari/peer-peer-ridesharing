var HelloWorldContract = artifacts.require("HelloWorldContract");

module.exports = function(deployer) {
  // deployment steps
  deployer.deploy(HelloWorldContract);
};