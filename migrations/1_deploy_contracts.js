var UserManagement = artifacts.require("UserManagementContract.sol");
var RideManagement = artifacts.require("RideManagerContract.sol");
var Utility = artifacts.require("Utility.sol");

module.exports = function(deployer) {
  deployer.deploy(Utility);
  deployer.link(Utility, UserManagement);
  deployer.link(Utility, RideManagement);
  deployer.deploy(UserManagement);
  deployer.deploy(RideManagement);
};