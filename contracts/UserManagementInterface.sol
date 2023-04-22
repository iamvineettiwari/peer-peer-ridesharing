// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19; 

struct User {
    string phone;
    bool isDriver;
    bool isActive;
    address wallet;
}

struct Vehicle {
    address owner;
    string vehicleNo;
    uint totalSeats;
    uint availableSeats;
    bool isActive;
}

interface UserManagementInterface {
    function getUsers() external view returns (User[] memory);
    function getUserById(address userId) external view returns (User memory);
    function addUser(string calldata phone, bool isDriver, address wallet) external;
    function toggleUserStatus(address userId, bool isActive) external;
    function toggleUserRole(address userId, bool isDriver) external;
    function addVehicle(string calldata vehicleNo, uint totalSeats, uint availableSeats) external;
    function updateAvailableSeats(address user, string calldata vehicleNo, uint availableSeat) external;
    function toggleVehicleStatus(address user, string calldata vehicleNo, bool isActive) external;
    function getVehicle(address user, string calldata vehicleNo) external view returns (Vehicle memory);
    function getVehicles(address user) external view returns (Vehicle[] memory);
}
