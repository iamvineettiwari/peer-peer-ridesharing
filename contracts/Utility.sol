// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

library Utility {
    uint256 constant private RATE = 15834487; // 1 ETH = 158344.87 INR 

    function convertPaiseToWei(uint256 amountInPaise) private pure returns (uint256) {
        return ((amountInPaise / 1000 * 1 ether) / RATE);
    }

    function calculateFare(uint256 baseInPaise, uint256 perKMInPaise, uint256 distanceInMeter) external pure returns(uint256) {
        return convertPaiseToWei((baseInPaise * 1000) + (perKMInPaise * distanceInMeter));
    }
    
    function compare(
        string memory a,
        string memory b
    ) public pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }
}
