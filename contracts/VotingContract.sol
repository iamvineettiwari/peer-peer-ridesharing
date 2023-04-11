// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

struct User {
    address id;
    string name;
    uint age;
}

contract Voting {
    address owner;
    bool isVotingActive;

    mapping(address => bool) voted;
    mapping(address => uint) public votes;

    mapping(address => uint) private contendersIdx;
    mapping(address => uint) private votersIdx;

    User[] public contendersStore;
    User[] public votersStore;

    uint maxVotesTillNow;
    address[] winners;

    constructor() {
        isVotingActive = true;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Only owner can perform this operation");
        _;
    }

    modifier above18(uint age) {
        require(age >= 18, "Age must be at least 18");
        _;
    }

    modifier checkIfVotingActive() {
        require(isVotingActive == true, "Voting has been closed");
        _;
    }

    modifier checkIfContenderParticipating(address contenderAdr) {
        uint idx = contendersIdx[contenderAdr];
        require(idx < votersStore.length);
        _;
    }

    modifier checkIfVoted() {
        require(voted[msg.sender] == false, "Already voted");
        _;
    }

    function registerToContend(
        string calldata name,
        uint age
    ) public above18(age) {
        contendersStore.push(User(msg.sender, name, age));
        contendersIdx[msg.sender] = contendersStore.length - 1;
    }

    function registerToVote(
        string calldata name,
        uint age
    ) public above18(age) {
        votersStore.push(User(msg.sender, name, age));
        votersIdx[msg.sender] = votersStore.length - 1;
        voted[msg.sender] = false;
    }

    function vote(
        address contenderAdr
    )
        public
        checkIfVotingActive
        checkIfVoted
        checkIfContenderParticipating(contenderAdr)
    {
        votes[contenderAdr] += 1;

        if (votes[contenderAdr] > maxVotesTillNow) {
            maxVotesTillNow = votes[contenderAdr];
            winners = [contenderAdr];
        } else if (votes[contenderAdr] == maxVotesTillNow) {
            winners.push(contenderAdr);
        }
    }

    function stopVoting() public onlyOwner {
        isVotingActive = false;
    }

    function getWinner() public view returns (User memory, uint) {
        if (winners.length == 0) {
            revert("Winner data not found");
        }

        if (winners.length == 1) {
            uint winnerIdx = contendersIdx[winners[0]];
            return (contendersStore[winnerIdx], maxVotesTillNow);
        }

        revert(
            string(
                abi.encodePacked(
                    "Tie between ",
                    string(abi.encodePacked(winners))
                )
            )
        );
    }

    function compare(
        string memory str1,
        string memory str2
    ) private pure returns (bool) {
        if (bytes(str1).length != bytes(str2).length) {
            return false;
        }
        return
            keccak256(abi.encodePacked(str1)) ==
            keccak256(abi.encodePacked(str2));
    }
}
