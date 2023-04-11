// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

library Utility {
    function compare(
        string memory a,
        string memory b
    ) public pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }
}

struct Vehicle {
    address owner;
    string vehicleNo;
    uint totalSeats;
    uint availableSeats;
    bool isFree;
    bool isActive;
}

struct User {
    string phone;
    bool isDriver;
    bool isActive;
    address wallet;
}

contract UserManagementContract {
    address payable owner;

    User[] userList;
    mapping(address => User) users;
    mapping(address => Vehicle[]) vehicles;

    modifier isSameUser(address one, address two) {
        require(one == two, "Not authorized");
        _;
    }

    constructor() {
        owner = payable(msg.sender);
    }

    function getUsers() public view returns (User[] memory usersData) {
        return userList;
    }

    function getUserById(
        address userId
    ) external view returns (User memory userData) {
        User memory userDataTemp = users[userId];

        if (userDataTemp.wallet == address(0)) {
            revert("User not found");
        }

        return userDataTemp;
    }

    function addUser(
        string calldata phone,
        bool isDriver,
        address wallet
    ) external {
        User memory user = User(phone, isDriver, true, wallet);

        userList.push(user);
        users[wallet] = user;
    }

    function toggleUserStatus(address userId, bool isActive) external {
        if (users[userId].wallet == address(0)) {
            revert("User not found");
        }

        users[userId].isActive = isActive;

        for (uint i = 0; i < userList.length; i++) {
            if (userList[i].wallet == userId) {
                userList[i].isActive = isActive;
                break;
            }
        }
    }

    function toggleUserRole(address userId, bool isDriver) external {
        if (users[userId].wallet == address(0)) {
            revert("User not found");
        }

        users[userId].isDriver = isDriver;

        for (uint i = 0; i < userList.length; i++) {
            if (userList[i].wallet == userId) {
                userList[i].isDriver = isDriver;
                break;
            }
        }
    }

    function addVehicle(
        address user,
        string calldata vehicleNo,
        uint totalSeats,
        uint availableSeats
    ) external isSameUser(user, msg.sender) {
        if (users[user].wallet == address(0)) {
            revert("User not found");
        }

        Vehicle memory vehicle = Vehicle(
            user,
            vehicleNo,
            totalSeats,
            availableSeats,
            true,
            true
        );

        vehicles[user].push(vehicle);
    }

    function updateAvailableSeats(
        address user,
        string calldata vehicleNo,
        uint availableSeat
    ) external isSameUser(user, msg.sender) {
        for (uint i = 0; i < vehicles[user].length; i++) {
            if (
                vehicles[user][i].owner == user &&
                Utility.compare(vehicles[user][i].vehicleNo, vehicleNo)
            ) {
                vehicles[user][i].availableSeats = availableSeat;
                return;
            }
        }

        revert("Vehicle not found");
    }

    function toggleVehicleStatus(
        address user,
        string calldata vehicleNo,
        bool isActive
    ) external isSameUser(user, msg.sender) {
        for (uint i = 0; i < vehicles[user].length; i++) {
            if (
                vehicles[user][i].owner == user &&
                Utility.compare(vehicles[user][i].vehicleNo, vehicleNo)
            ) {
                vehicles[user][i].isActive = isActive;
                return;
            }
        }

        revert("Vehicle not found");
    }

    function toggleVehicleAvailability(
        address user,
        string calldata vehicleNo,
        bool isFree
    ) external isSameUser(user, msg.sender) {
        for (uint i = 0; i < vehicles[user].length; i++) {
            if (
                vehicles[user][i].owner == user &&
                Utility.compare(vehicles[user][i].vehicleNo, vehicleNo)
            ) {
                vehicles[user][i].isFree = isFree;
                return;
            }
        }

        revert("Vehicle not found");
    }

    function getVehicle(
        address user,
        string calldata vehicleNo
    ) external view returns (Vehicle memory vehicle) {
        for (uint i = 0; i < vehicles[user].length; i++) {
            if (
                vehicles[user][i].owner == user &&
                Utility.compare(vehicles[user][i].vehicleNo, vehicleNo)
            ) {
                return vehicles[user][i];
            }
        }

        revert("Vehicle not found");
    }

    function getVehicles(
        address user
    ) external view returns (Vehicle[] memory vehiclesData) {
        return vehicles[user];
    }
}
