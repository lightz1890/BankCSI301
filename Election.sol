// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

struct Issue {
    bool open;
    mapping (address => bool) voted;
    mapping (address => uint) ballots;
    uint[] scores;
}

contract Election {
    address _admin;
    mapping (uint => Issue) _issues;
    uint _issueId;
    uint _min;
    uint _max;

    event StatueChange(uint indexed issueId, bool open);
    event Vote(uint indexed issueId, address voter, uint indexed option);

    constructor(uint min, uint max) {
        _admin = msg.sender;
        _min = min;
        _max = max;
    }

    modifier onlyAdmin {
        require(_admin == msg.sender, "Only Admin can call this function");
        _;
    }

    function open() public onlyAdmin {
        require(!_issues[_issueId].open, "Election Opening");

        _issueId++;
        _issues[_issueId].open = true;
        _issues[_issueId].scores = new uint[](_max+1);
        emit StatueChange(_issueId, true);
    }

    function close() public onlyAdmin {
        require(_issues[_issueId].open, "Election Closed");

        _issues[_issueId].open = false;
        emit StatueChange(_issueId,false);
    }

    function vote(uint option) public {
        require(_issues[_issueId].open, "Election Closed");
        require(!_issues[_issueId].voted[msg.sender], "You are voted");
        require(option >= _min && option <= _max, "Incorrect option");

        _issues[_issueId].scores[option]++;
        _issues[_issueId].voted[msg.sender] = true;
        _issues[_issueId].ballots[msg.sender] = option;
        emit Vote(_issueId, msg.sender, option);
    }

    function status() public view returns (bool open_) {
        return _issues[_issueId].open;
    }

    function ballots() public view returns (uint option) {
        require(_issues[_issueId].voted[msg.sender],"You are not voted");

        return _issues[_issueId].ballots[msg.sender];
    }
    
    function scores() public view returns (uint[] memory){
        return _issues[_issueId].scores;
    }

    /*function changeAdmin(address newAdmin) public onlyAdmin {
        _admin = newAdmin;
    }*/
}
