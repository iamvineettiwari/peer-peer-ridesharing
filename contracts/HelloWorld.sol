// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

contract HelloWorldContract {
    address public owner;
    uint public funds = 1000;

    constructor() {
        owner = msg.sender;
    }

    function getMessage() external pure returns (string memory) {
        return "Hello world";
    }

    function sayHello() public view returns (string memory) {
        string memory message = this.getMessage();
        return message;
    }

    receive() external payable {}
}
