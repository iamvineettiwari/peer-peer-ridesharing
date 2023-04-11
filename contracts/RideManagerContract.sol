// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import "./UserManagementContract.sol";

struct RideInfo {
    address payable rider;
    address payable driver;
    string startPoint;
    string endPoint;
    bytes32 baseCharge;
    bytes32 perKMCharge;
    bytes32 initialDistance;
    bytes32 finalDistance;
    bool isStarted;
    bool isCompleted;
    bool isConfirmedByRider;
    bool isConfirmedByDriver;
}

contract RideManagerContract {
    address payable public owner;

    constructor() {
        owner = payable(msg.sender);
    }
}
