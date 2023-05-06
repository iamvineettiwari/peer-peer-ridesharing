const UserManagementContract = artifacts.require("UserManagementContract");

contract("UserManagementContract", async (accounts) => {
  let userManagementContract = await UserManagementContract.deployed();

  it("should add a driver and a normal user", async () => {
    const dphone = "1234567890";
    const isDriver = true;
    const dwallet = accounts[0];

    await userManagementContract.addUser(dphone, isDriver, dwallet);

    const duser = await userManagementContract.getUserById(dwallet);

    assert.equal(duser.phone, dphone);
    assert.equal(duser.isDriver, isDriver);
    assert.equal(duser.wallet, dwallet);
    assert.equal(duser.isActive, true);

    
    const uphone = "1234567890";
    const uisDriver = false;
    const uwallet = accounts[1];

    await userManagementContract.addUser(uphone, uisDriver, uwallet);

    const uuser = await userManagementContract.getUserById(uwallet);

    assert.equal(uuser.phone, uphone);
    assert.equal(uuser.isDriver, uisDriver);
    assert.equal(uuser.wallet, uwallet);
    assert.equal(uuser.isActive, true);

    const users = await userManagementContract.getUsers();

    assert.equal(users.length, 2);
  });

  it("should toggle user status", async () => {
    const wallet = accounts[0];

    let user = await userManagementContract.getUserById(wallet);
    assert.equal(user.isActive, true);

    await userManagementContract.toggleUserStatus(wallet, false);
    user = await userManagementContract.getUserById(wallet);
    assert.equal(user.isActive, false);

    await userManagementContract.toggleUserStatus(wallet, true);
    user = await userManagementContract.getUserById(wallet);
    assert.equal(user.isActive, true);

  });

  it("should toggle user role", async () => {
    const wallet = accounts[0];

    let user = await userManagementContract.getUserById(wallet);
    assert.equal(user.isDriver, true);

    await userManagementContract.toggleUserRole(wallet, false);

    user = await userManagementContract.getUserById(wallet);
    assert.equal(user.isDriver, false);
    
    await userManagementContract.toggleUserRole(wallet, true);
    user = await userManagementContract.getUserById(wallet);
    assert.equal(user.isDriver, true);
  });

  it("should add a vehicle", async () => {
    const wallet = accounts[0];
    const vehicleNo = "ABC123";
    const totalSeats = 4;
    const availableSeats = 2;

    let user = await userManagementContract.getUserById(wallet);

    await userManagementContract.addVehicle(vehicleNo, totalSeats, availableSeats);

    const vehicles = await userManagementContract.getVehicles(wallet);
    const vehicle = await userManagementContract.getVehicle(wallet, vehicleNo);

    assert.equal(vehicles.length, 1);
    assert.equal(vehicle.vehicleNo, vehicleNo);
    assert.equal(vehicle.totalSeats, totalSeats);
    assert.equal(vehicle.availableSeats, availableSeats);
    assert.equal(vehicle.isActive, true);
  });

  it("should update available seats", async () => {
    const vehicleNo = "ABC123";
    const totalSeats = 4;
    const availableSeats = 2;
    const newAvailableSeats = 1;

    await userManagementContract.addVehicle(vehicleNo, totalSeats, availableSeats);

    await userManagementContract.updateAvailableSeats(accounts[0], vehicleNo, newAvailableSeats);

    const vehicle = await userManagementContract.getVehicle(accounts[0], vehicleNo);

    assert.equal(vehicle.availableSeats, newAvailableSeats);
  });

  it("should toggle vehicle status", async () => {
    const vehicleNo = "ABC123";
    const totalSeats = 4;
    const availableSeats = 2;

    await userManagementContract.addVehicle(vehicleNo, totalSeats, availableSeats);

    let vehicle = await userManagementContract.getVehicle(accounts[0], vehicleNo);
    assert.equal(vehicle.isActive, true);

    await userManagementContract.toggleVehicleStatus(vehicleNo, false);

    vehicle = await userManagementContract.getVehicle(accounts[0], vehicleNo);
    assert.equal(vehicle.isActive, false);
  });

});