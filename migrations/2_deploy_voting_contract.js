const VotingContract = artifacts.require("Voting")

module.exports = function (deployer) {
    deployer.deploy(VotingContract);
};