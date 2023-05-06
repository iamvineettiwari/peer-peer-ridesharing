const RideManagerContract = artifacts.require('RideManagerContract');
const UserManagementContract = artifacts.require('UserManagementContract');
const Utility = artifacts.require('Utility');

contract('RideManagerContract', function (accounts) {
    let rideManagerInstance;
    let userManagementInstance;

    const owner = {
        phone: "9090909090",
        isDriver: false,
        wallet: accounts[0]
    }

    const driver = {
        phone: "9191919191",
        isDriver: true,
        wallet: accounts[1],
    }

    const rider = {
        phone: "8080808080",
        isDriver: false,
        wallet: accounts[2]
    }

    const vehicles = [{
        vehicleNo: "UP06T5612",
        totalSeats: 6,
        availableSeats: 4,
        startPoint: "VIT-AP",
        endPoint: "Vijayawada",
        baseChargeInPaise: 1500,
        perKMChargeInPaise: 2500,
        distanceInMeter: 16500,
        initalPopulation: 2,
        expectedFareInWei: 2699803283807047, //417.50 INR
    }]

    const offerRide = async() => {
        await rideManagerInstance.offerRide(
            vehicles[0].vehicleNo,
            vehicles[0].startPoint,
            vehicles[0].endPoint,
            vehicles[0].baseChargeInPaise,
            vehicles[0].perKMChargeInPaise,
            vehicles[0].initalPopulation,
            {
                from: driver.wallet
            }
        );
    }

    const bookRide = async() => {
        await rideManagerInstance.bookRide(
            1,
            2,
            {
                from: rider.wallet
            }
        );
    }

    const acceptRide = async() => {
        await rideManagerInstance.acceptRide(
            1,
            true,
            rider.wallet,
            {
                from: driver.wallet
            }
        );
    }

    const updateDistance = async() => {
        await rideManagerInstance.updateRideDistance(
            1, vehicles[0].distanceInMeter, rider.wallet,
            {
                from: driver.wallet
            }
        )
    }

    beforeEach(async function () {
        userManagementInstance = await UserManagementContract.new({ from: owner.wallet });
        rideManagerInstance = await RideManagerContract.new({ from: owner.wallet });
        await rideManagerInstance.setUmc(userManagementInstance.address, { from: owner.wallet });

        await userManagementInstance.addUser(owner.phone, owner.isDriver, owner.wallet);

        await userManagementInstance.addUser(driver.phone, driver.isDriver, driver.wallet);

        await userManagementInstance.addUser(rider.phone, rider.isDriver, rider.wallet);

        const users = await userManagementInstance.getUsers();
        assert.equal(users.length, 3);

        await userManagementInstance.addVehicle(
            vehicles[0].vehicleNo,
            vehicles[0].totalSeats,
            vehicles[0].availableSeats,
            {
                from: driver.wallet
            }
        )
    });

    it("env should be intialized correctly", async () => {
        const users = await userManagementInstance.getUsers();
        assert.equal(users.length, 3);

        const vehicle = await userManagementInstance.getVehicle(
            driver.wallet,
            vehicles[0].vehicleNo
        )

        assert.equal(vehicle.vehicleNo, vehicles[0].vehicleNo)
    });

    it("should not allow rider to offer ride", async () => {
        try {
            await rideManagerInstance.offerRide(
                vehicles[0].vehicleNo,
                vehicles[0].startPoint,
                vehicles[0].endPoint,
                vehicles[0].baseChargeInPaise,
                vehicles[0].perKMChargeInPaise,
                vehicles[0].initalPopulation,
                {
                    from: rider.wallet
                }
            );

            assert.fail("Expected revert not received");
          } catch (error) {
            assert(error.message.includes("Vehicle not found"), `Expected "Vehicle not found", got ${error} instead`);
          }
    });

    it("should allow driver to offer ride", async () => {
        await offerRide();

        const offeredRides = await rideManagerInstance.getOfferedRides({
            from: driver.wallet
        })

        assert.equal(offeredRides.length, 1);
        assert.equal(offeredRides[0].rideId, 1);
        assert.equal(offeredRides[0].startPoint, vehicles[0].startPoint)
    });

    it("should not allow driver to book ride", async () => {
        try {
            await offerRide();
            await rideManagerInstance.bookRide(
                1,
                2,
                {
                    from: driver.wallet
                }
            );

            assert.fail("Expected revert not received");
          } catch (error) {
            assert(error.message.includes("Driver can not book ride"), `Expected "Driver can not book ride", got ${error} instead`);
          }
    });
    
    it("should not allow rider to book ride, if population can not be accomodated", async () => {
        try {
            await offerRide();

            await rideManagerInstance.bookRide(
                1,
                7,
                {
                    from: rider.wallet
                }
            );

            assert.fail("Expected revert not received");
          } catch (error) {
            assert(error.message.includes("Ride can not be accomodated"), `Expected "Ride can not be accomodated", got ${error} instead`);
          }
    });
    
    it("should allow rider to book ride", async () => {
    
        await offerRide();
        await bookRide();

        const bookings = await rideManagerInstance.getMyBookings({
            from: rider.wallet
        });
        assert.equal(bookings.length, 1);
        assert.equal(bookings[0].rideDetails.rideId, 1);
        assert.equal(bookings[0].rideDetails.driver, driver.wallet);
        assert.equal(bookings[0].rideDetails.startPoint, vehicles[0].startPoint);
        assert.equal(bookings[0].rideDetails.isStarted, false);
        assert.equal(bookings[0].rideStatus.rider, rider.wallet);
        assert.equal(bookings[0].rideStatus.noOfPassengers, 2);
        assert.equal(bookings[0].rideStatus.isAccepted, false);
    });
    
    it("should not allow rider to accept ride", async () => {
        try {
            
            await offerRide();
            await bookRide();

            await rideManagerInstance.acceptRide(
                1,
                true,
                owner.wallet,
                {
                    from: rider.wallet
                }
            );

            assert.fail("Expected revert not received");
          } catch (error) {
            assert(error.message.includes("Only driver can accept ride"), `Expected "Only driver can accept ride", got ${error} instead`);
          }
    });

    it("should allow driver to accept ride", async () => {
        await offerRide();
        await bookRide();
        await acceptRide();

        const bookings = await rideManagerInstance.getMyBookings({
            from: rider.wallet
        });
        assert.equal(bookings[0].rideStatus.isAccepted, true);
    });

    it("should allow driver to update ride distance", async () => {
        await offerRide();
        await bookRide();
        await acceptRide();
        await updateDistance();

        const bookings = await rideManagerInstance.getMyBookings({
            from: rider.wallet
        });
        assert.equal(bookings[0].rideStatus.totalDistanceInMeter, 16500);
    });

    it("should calculated accurate fare for the ride", async () => {
        await offerRide();
        await bookRide();
        await acceptRide();
        await updateDistance();

        const fare = await rideManagerInstance.getRideFare(1, {
            from: rider.wallet
        });
        assert.equal(fare, vehicles[0].expectedFareInWei);
    });

    it("should not allow rider to end ride, if paid amount is less than total fare", async() => {
        try {
            await offerRide();
            await bookRide();
            await acceptRide();
            await updateDistance();

            const amount = web3.utils.toWei("1500000000", "wei");

            await rideManagerInstance.endRideByUser(1, 
                { from: rider.wallet, value: amount }
            );

            assert.fail("Transaction should have reverted");
        } catch (err) {
            assert(err.message.includes("Payment failed"), "Transaction should have reverted with 'Payment failed' message");
        }
    });

    if("should not allow driver to end ride, if it is not completed", async() => {
        try {
            await offerRide();
            await bookRide();
            await acceptRide();
            await updateDistance();

            await rideManagerInstance.endRide(1, {
                from: driver.wallet
            })

            assert.fail("Transaction should have reverted");
        } catch (err) {
            assert(err.message.include("Please complete all rides before ending"), "Transaction should have reverted with 'Please complete all rides before ending' message")
        }
    })

    it("should allow rider to end ride, if paid amount is correct", async() => {
        await offerRide();
        await bookRide();
        await acceptRide();
        await updateDistance();

        const fare =  await rideManagerInstance.getRideFare(1, {
            from: rider.wallet
        });

        const amount = web3.utils.toWei(fare, "wei");
        

        const bookingsPre = await rideManagerInstance.getMyBookings({
            from: rider.wallet
        });
        assert.equal(bookingsPre[0].rideStatus.isCompleted, false);

        await rideManagerInstance.endRideByUser(1, 
            { from: rider.wallet, value: amount }
        );

        const bookingsPost = await rideManagerInstance.getMyBookings({
            from: rider.wallet
        });
        assert.equal(bookingsPost[0].rideStatus.isCompleted, true);        
    });

    it("should allow driver to end ride, if it is completed", async() => {
        await offerRide();
        await bookRide();
        await acceptRide();
        await updateDistance();

        const vehicleInfoPre = await userManagementInstance.getVehicle(
            driver.wallet,
            vehicles[0].vehicleNo
        );

        assert.equal(vehicleInfoPre.availableSeats, vehicles[0].totalSeats - (vehicles[0].initalPopulation + 2))

        const fare =  await rideManagerInstance.getRideFare(1, {
            from: rider.wallet
        });

        const amount = web3.utils.toWei(fare, "wei");

        await rideManagerInstance.endRideByUser(1, 
            { from: rider.wallet, value: amount }
        );    

        await rideManagerInstance.endRide(1, {
            from: driver.wallet
        });

        const vehicleInfoPost = await userManagementInstance.getVehicle(
            driver.wallet,
            vehicles[0].vehicleNo
        );

        assert.equal(vehicleInfoPost.availableSeats - vehicles[0].initalPopulation, vehicles[0].availableSeats);
    });

});