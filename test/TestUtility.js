const Utility = artifacts.require("Utility");
const { expect } = require("chai");

contract("Utility", () => {
  it("should correctly calculate the fare", async () => {
    const utility = await Utility.deployed();

    const baseInPaise = 5000000; // 50000 INR
    const perKMInPaise = 100000; // 1 INR
    const distanceInMeter = 10000; // 10 km
    const expectedWei = "378919759130813647"; // Expected result in wei

    const result = await utility.calculateFare(baseInPaise, perKMInPaise, distanceInMeter);

    expect(result.toString()).to.equal(expectedWei);
  });

  it("should correctly compare two strings", async () => {
    const utility = await Utility.deployed();

    const string1 = "hello world";
    const string2 = "hello world";

    const result = await utility.compare(string1, string2);

    expect(result).to.equal(true);
  });
});