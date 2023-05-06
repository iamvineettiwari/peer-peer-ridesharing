// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import "./UserManagementInterface.sol";
import "./Utility.sol";

contract RideManagerContract {
    
    struct RideInfo {
        uint rideId;
        address driver;
        string startPoint;
        string endPoint;
        bool isStarted;
        bool isCompleted;
        uint256 baseChargeInPaise;
        uint256 perKMChargeInPaise;
        Vehicle vehicle;
    }

    struct RiderInfo {
        address rider;
        uint256 noOfPassengers;
        uint256 totalDistanceInMeter;
        uint256 fare;
        bool isAccepted;
        bool isCompleted;
    }

    struct RidePayload {
        RideInfo rideDetails;
        RiderInfo rideStatus;
    }


    UserManagementInterface umc;
    address payable public owner;
    
    uint256[] private rideIds; // rideId array
    mapping(uint => RiderInfo[]) riders; // rideId => riders
    mapping(address => uint[]) public rides; // driver => ridesId
    mapping(uint => RideInfo) public rideInfo; // rideId => rideInfo
    mapping(address => uint[]) public bookings; // riders => ridesId
    uint private rideIdCtr;

    constructor() {
        rideIdCtr = 0;
        owner = payable(msg.sender);
    }

    function setUmc(address umcAddress) external  {
        require(msg.sender == owner, "Only owner of contract can access");
        umc = UserManagementInterface(umcAddress);
    }

    function getRideId() private returns (uint) {
        return ++rideIdCtr;
    }

    function offerRide(
        string memory vehicleNo,
        string memory startPoint, 
        string memory endPoint,
        uint256 baseChargeInPaise,
        uint256 perKMChargeInPaise,
        uint256 initialPopulation
    ) external returns (RideInfo memory ride) {
        Vehicle memory vehicle = umc.getVehicle(msg.sender, vehicleNo);
        umc.updateAvailableSeats(msg.sender, vehicleNo, vehicle.totalSeats);

        if (vehicle.availableSeats < initialPopulation) {
            revert("Can not accomodate");
        }

        if (vehicle.owner == address(0)) {
            revert("Vehicle not found");
        }

        if (vehicle.isActive == false) {
            revert("Vehicle is not active");
        }
        
        umc.updateAvailableSeats(msg.sender, vehicleNo, vehicle.totalSeats - initialPopulation);

        uint rideId = getRideId();

        rideInfo[rideId] = RideInfo({
            rideId: rideId,
            driver: vehicle.owner,
            startPoint: startPoint,
            endPoint: endPoint,
            isStarted: false,
            isCompleted: false,
            baseChargeInPaise: baseChargeInPaise,
            perKMChargeInPaise: perKMChargeInPaise,
            vehicle: vehicle
        });
        rides[msg.sender].push(rideId);
        rideIds.push(rideId);

        return rideInfo[rideId];
    }

    function getOfferedRides() external view returns (RideInfo[] memory) {
        uint256[] memory offeredRideIds = rides[msg.sender];
        RideInfo[] memory offeredRides = new RideInfo[](offeredRideIds.length);

        for (uint i = 0; i < offeredRideIds.length; i++) {
            uint rideId = rideIds[i];
            offeredRides[i] = rideInfo[rideId];
        }

        return offeredRides;
    }

    function getAvaliableRides() external view returns (RideInfo[] memory) {
        uint counts = 0;

        for (uint i = 0; i < rideIds.length; i++) {
            uint rideId = rideIds[i];
            if (rideInfo[rideId].isStarted == false && rideInfo[rideId].isCompleted == false) {
                counts++;
            }
        }

        RideInfo[] memory avaliableRides = new RideInfo[](counts);
        uint256 item = 0;
        

        for (uint i = 0; i < rideIds.length; i++) {
            uint rideId = rideIds[i];
            if (rideInfo[rideId].isStarted == false && rideInfo[rideId].isCompleted == false) {
                avaliableRides[item++] = rideInfo[rideId];
            }
        }

        return avaliableRides;
    }

    function bookRide(uint256 rideId, uint256 noOfPassengers) external {
        for (uint i = 0; i < riders[rideId].length; i++) {
            if (riders[rideId][i].rider == msg.sender) {
                revert("Ride already booked");
            }
        }

        RideInfo memory ride = rideInfo[rideId];
        bool available = ride.vehicle.isActive && ride.isStarted == false && ride.isCompleted == false;
        bool canAccomadate = ride.vehicle.availableSeats >= noOfPassengers;

        User memory user = umc.getUserById(msg.sender);

        require(available == true, "Ride is not available");
        require(canAccomadate == true, "Ride can not be accomodated");
        require(user.isDriver == false, "Driver can not book ride");
        
        riders[rideId].push(RiderInfo(msg.sender, noOfPassengers, 0, 0, false, false));
        bookings[msg.sender].push(rideId);
    }

    function acceptRide(uint256 rideId, bool accept, address userId) external {
        if (!accept) {
            return;
        }
        
        RideInfo memory ride = rideInfo[rideId];

        if (ride.driver != msg.sender) {
            revert("Only driver can accept ride");
        }
        
        for (uint i = 0; i < riders[rideId].length; i++){
            if (riders[rideId][i].rider == userId) {
                riders[rideId][i].isAccepted = true;
                umc.updateAvailableSeats(msg.sender, ride.vehicle.vehicleNo, ride.vehicle.availableSeats - riders[rideId][i].noOfPassengers);
                break;
            }
        }
    }

    function startRide(uint256 rideId) external {
        RideInfo memory ride = rideInfo[rideId];

        if (ride.driver != msg.sender) {
            revert("Only driver can start ride");
        }

        rideInfo[rideId].isStarted = true;
    }

    function endRide(uint256 rideId) external {
        for (uint i = 0; i < riders[rideId].length; i++) {
            if (riders[rideId][i].isAccepted == true && riders[rideId][i].isCompleted == false) {
                revert("Please complete all rides before ending");
            }
        }

        RideInfo memory ride = rideInfo[rideId];

        if (ride.driver != msg.sender) {
            revert("Only driver can end ride");
        }

        rideInfo[rideId].isCompleted = true;
    }

    function updateRideDistance(uint256 rideId, uint256 distanceInMeter, address riderId) external {
        RideInfo memory ride = rideInfo[rideId];

        if (ride.driver != msg.sender) {
            revert("Only driver can end ride");
        }

        for (uint i = 0; i < riders[rideId].length; i++){
            if (riders[rideId][i].rider == riderId) {
                riders[rideId][i].totalDistanceInMeter = distanceInMeter;
                break;
            }
        }
    }

    function getRideFare(uint256 rideId) external view returns (uint256) {
        RideInfo memory ride = rideInfo[rideId];

        for (uint i = 0; i < riders[rideId].length; i++){
            if (riders[rideId][i].rider == msg.sender) {
                return Utility.calculateFare(ride.baseChargeInPaise, ride.perKMChargeInPaise, riders[rideId][i].totalDistanceInMeter);
            }
        }

        revert("Ride not found");
    }

    function endRideByUser(uint256 rideId) external payable {
        RideInfo memory ride = rideInfo[rideId];

        if (ride.driver == msg.sender) {
            revert("Driver can not end ride");
        }

        for (uint i = 0; i < riders[rideId].length; i++){
            if (riders[rideId][i].rider == msg.sender) {
                uint256 fare = Utility.calculateFare(ride.baseChargeInPaise, ride.perKMChargeInPaise, riders[rideId][i].totalDistanceInMeter);
                bool payment = payable(ride.driver).send(fare);

                if (payment) {
                    riders[rideId][i].isCompleted = true;
                    riders[rideId][i].fare = fare;
                    umc.updateAvailableSeats(ride.driver, ride.vehicle.vehicleNo, ride.vehicle.availableSeats + riders[rideId][i].noOfPassengers);
                } else {
                    revert("Payment failed");
                }
                break;
            }
        }
    }

    function getMyBookings() external view returns(RidePayload[] memory)  {
        uint256 bookingsLength = bookings[msg.sender].length;

        RidePayload[] memory rideData = new RidePayload[](bookingsLength);

        for (uint i = 0; i < bookingsLength; i++) {
            uint256 rideId = bookings[msg.sender][i];

            RideInfo memory curRideInfo = rideInfo[rideId];
            RiderInfo memory curRiderInfo;

            for (uint j = 0; j < riders[rideId].length; j++) {
                if (riders[rideId][j].rider == msg.sender) {
                    curRiderInfo = riders[rideId][j];
                    break;
                }
            }
            
            rideData[i] = RidePayload({
                rideDetails: curRideInfo,
                rideStatus: curRiderInfo
            });
        }

        return rideData;
    }
}